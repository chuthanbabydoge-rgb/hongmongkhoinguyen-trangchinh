import { and, eq, desc, lt, ilike, or, isNotNull } from "drizzle-orm";
import {
  db,
  mailsTable,
  mailAttachmentsTable,
  mailClaimLogsTable,
  mailLabelsTable,
  mailUserLabelsTable,
} from "@workspace/db";
import type { IMailRepository } from "../mailRepository.js";
import type {
  Mail,
  MailAttachment,
  MailLabel,
  MailClaimLog,
  CreateMailInput,
  MailFilter,
} from "../../models/mail.js";

function rowToAttachment(row: typeof mailAttachmentsTable.$inferSelect): MailAttachment {
  return {
    id:        row.id,
    mailId:    row.mailId,
    type:      row.type as MailAttachment["type"],
    label:     row.label,
    amount:    row.amount ?? undefined,
    itemId:    row.itemId ?? undefined,
    itemData:  row.itemData as Record<string, unknown> | undefined,
    claimed:   row.claimed,
    claimedAt: row.claimedAt?.toISOString() ?? undefined,
  };
}

function rowToMail(
  row: typeof mailsTable.$inferSelect,
  attachments: MailAttachment[] = [],
): Mail {
  return {
    id:          row.id,
    userId:      row.userId,
    senderId:    row.senderId ?? undefined,
    senderName:  row.senderName,
    type:        row.type as Mail["type"],
    status:      row.status as Mail["status"],
    subject:     row.subject,
    body:        row.body,
    expiresAt:   row.expiresAt?.toISOString() ?? undefined,
    readAt:      row.readAt?.toISOString() ?? undefined,
    claimedAt:   row.claimedAt?.toISOString() ?? undefined,
    archivedAt:  row.archivedAt?.toISOString() ?? undefined,
    metadata:    row.metadata as Record<string, unknown> | undefined,
    attachments,
    createdAt:   row.createdAt.toISOString(),
    updatedAt:   row.updatedAt.toISOString(),
  };
}

async function attachAttachments(mails: (typeof mailsTable.$inferSelect)[]): Promise<Mail[]> {
  if (mails.length === 0) return [];
  const mailIds = mails.map((m) => m.id);
  const allAttachments = mailIds.length === 1
    ? await db.select().from(mailAttachmentsTable).where(eq(mailAttachmentsTable.mailId, mailIds[0]!))
    : await db.select().from(mailAttachmentsTable).where(
        or(...mailIds.map((id) => eq(mailAttachmentsTable.mailId, id)))
      );
  const byMailId = new Map<string, MailAttachment[]>();
  for (const a of allAttachments) {
    const list = byMailId.get(a.mailId) ?? [];
    list.push(rowToAttachment(a));
    byMailId.set(a.mailId, list);
  }
  return mails.map((m) => rowToMail(m, byMailId.get(m.id) ?? []));
}

export class DrizzleMailRepository implements IMailRepository {
  async create(input: CreateMailInput): Promise<Mail> {
    const id  = crypto.randomUUID();
    const now = new Date();

    const [inserted] = await db
      .insert(mailsTable)
      .values({
        id,
        userId:     input.userId,
        senderId:   input.senderId ?? null,
        senderName: input.senderName ?? "Universe System",
        type:       input.type,
        status:     "UNREAD",
        subject:    input.subject,
        body:       input.body,
        expiresAt:  input.expiresAt ? new Date(input.expiresAt) : null,
        metadata:   input.metadata ?? null,
        createdAt:  now,
        updatedAt:  now,
      })
      .returning();

    const attachmentRows: (typeof mailAttachmentsTable.$inferSelect)[] = [];
    if (input.attachments && input.attachments.length > 0) {
      const vals = input.attachments.map((a) => ({
        id:       crypto.randomUUID(),
        mailId:   id,
        type:     a.type,
        label:    a.label,
        amount:   a.amount ?? null,
        itemId:   a.itemId ?? null,
        itemData: a.itemData ?? null,
        claimed:  false,
        claimedAt: null,
      }));
      const rows = await db.insert(mailAttachmentsTable).values(vals).returning();
      attachmentRows.push(...rows);
    }

    return rowToMail(inserted!, attachmentRows.map(rowToAttachment));
  }

  async findById(id: string): Promise<Mail | null> {
    const [row] = await db.select().from(mailsTable).where(eq(mailsTable.id, id));
    if (!row) return null;
    const [mail] = await attachAttachments([row]);
    return mail ?? null;
  }

  async findByUserId(userId: string, filter?: MailFilter): Promise<Mail[]> {
    const limit = filter?.limit ?? 50;
    const conditions = [
      eq(mailsTable.userId, userId),
    ];

    if (filter?.type) conditions.push(eq(mailsTable.type, filter.type));
    if (filter?.status) {
      conditions.push(eq(mailsTable.status, filter.status));
    } else {
      conditions.push(
        or(
          eq(mailsTable.status, "UNREAD"),
          eq(mailsTable.status, "READ"),
          eq(mailsTable.status, "CLAIMED"),
        )!
      );
    }
    if (filter?.search) {
      conditions.push(
        or(
          ilike(mailsTable.subject, `%${filter.search}%`),
          ilike(mailsTable.body, `%${filter.search}%`),
        )!
      );
    }
    if (filter?.cursor) {
      conditions.push(lt(mailsTable.createdAt, new Date(filter.cursor)));
    }

    let query = db
      .select()
      .from(mailsTable)
      .where(and(...conditions))
      .orderBy(desc(mailsTable.createdAt))
      .limit(limit);

    if (filter?.labelId) {
      const labelledMailIds = await db
        .select({ mailId: mailUserLabelsTable.mailId })
        .from(mailUserLabelsTable)
        .where(
          and(
            eq(mailUserLabelsTable.userId, userId),
            eq(mailUserLabelsTable.labelId, filter.labelId),
          )
        );
      const ids = labelledMailIds.map((r) => r.mailId);
      if (ids.length === 0) return [];
      query = db
        .select()
        .from(mailsTable)
        .where(and(...conditions, or(...ids.map((id) => eq(mailsTable.id, id)))!))
        .orderBy(desc(mailsTable.createdAt))
        .limit(limit) as typeof query;
    }

    if (filter?.hasAttachment) {
      const mailsWithAttachments = await db
        .selectDistinct({ mailId: mailAttachmentsTable.mailId })
        .from(mailAttachmentsTable);
      const ids = mailsWithAttachments.map((r) => r.mailId);
      if (ids.length === 0) return [];
      query = db
        .select()
        .from(mailsTable)
        .where(and(...conditions, or(...ids.map((id) => eq(mailsTable.id, id)))!))
        .orderBy(desc(mailsTable.createdAt))
        .limit(limit) as typeof query;
    }

    const rows = await query;
    return attachAttachments(rows);
  }

  async findUnread(userId: string): Promise<Mail[]> {
    const rows = await db
      .select()
      .from(mailsTable)
      .where(and(eq(mailsTable.userId, userId), eq(mailsTable.status, "UNREAD")))
      .orderBy(desc(mailsTable.createdAt));
    return attachAttachments(rows);
  }

  async countUnread(userId: string): Promise<number> {
    const rows = await db
      .select()
      .from(mailsTable)
      .where(and(eq(mailsTable.userId, userId), eq(mailsTable.status, "UNREAD")));
    return rows.length;
  }

  async markRead(id: string, userId: string): Promise<Mail | null> {
    const now = new Date();
    const [updated] = await db
      .update(mailsTable)
      .set({ status: "READ", readAt: now, updatedAt: now })
      .where(and(eq(mailsTable.id, id), eq(mailsTable.userId, userId), eq(mailsTable.status, "UNREAD")))
      .returning();
    if (!updated) return null;
    const [mail] = await attachAttachments([updated]);
    return mail ?? null;
  }

  async markAllRead(userId: string): Promise<number> {
    const now = new Date();
    const result = await db
      .update(mailsTable)
      .set({ status: "READ", readAt: now, updatedAt: now })
      .where(and(eq(mailsTable.userId, userId), eq(mailsTable.status, "UNREAD")))
      .returning();
    return result.length;
  }

  async markClaimed(id: string, userId: string): Promise<Mail | null> {
    const now = new Date();
    const [updated] = await db
      .update(mailsTable)
      .set({ status: "CLAIMED", claimedAt: now, updatedAt: now })
      .where(and(eq(mailsTable.id, id), eq(mailsTable.userId, userId)))
      .returning();
    if (!updated) return null;
    const [mail] = await attachAttachments([updated]);
    return mail ?? null;
  }

  async markArchived(id: string, userId: string): Promise<Mail | null> {
    const now = new Date();
    const [updated] = await db
      .update(mailsTable)
      .set({ status: "ARCHIVED", archivedAt: now, updatedAt: now })
      .where(and(eq(mailsTable.id, id), eq(mailsTable.userId, userId)))
      .returning();
    if (!updated) return null;
    const [mail] = await attachAttachments([updated]);
    return mail ?? null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const now = new Date();
    const result = await db
      .update(mailsTable)
      .set({ status: "DELETED", updatedAt: now })
      .where(and(eq(mailsTable.id, id), eq(mailsTable.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async claimAttachment(
    attachmentId: string,
    userId: string,
    result?: Record<string, unknown>,
  ): Promise<MailAttachment | null> {
    const now = new Date();
    const [updated] = await db
      .update(mailAttachmentsTable)
      .set({ claimed: true, claimedAt: now })
      .where(
        and(
          eq(mailAttachmentsTable.id, attachmentId),
          eq(mailAttachmentsTable.claimed, false),
        )
      )
      .returning();
    if (!updated) return null;
    await this.logClaim({ mailId: updated.mailId, attachmentId, userId, result });
    return rowToAttachment(updated);
  }

  async getAttachment(attachmentId: string): Promise<MailAttachment | null> {
    const [row] = await db
      .select()
      .from(mailAttachmentsTable)
      .where(eq(mailAttachmentsTable.id, attachmentId));
    return row ? rowToAttachment(row) : null;
  }

  async createLabel(userId: string, name: string, color: string): Promise<MailLabel> {
    const [inserted] = await db
      .insert(mailLabelsTable)
      .values({ id: crypto.randomUUID(), userId, name, color, createdAt: new Date() })
      .returning();
    return {
      id:        inserted!.id,
      userId:    inserted!.userId,
      name:      inserted!.name,
      color:     inserted!.color,
      createdAt: inserted!.createdAt.toISOString(),
    };
  }

  async getLabels(userId: string): Promise<MailLabel[]> {
    const rows = await db
      .select()
      .from(mailLabelsTable)
      .where(eq(mailLabelsTable.userId, userId))
      .orderBy(mailLabelsTable.name);
    return rows.map((r) => ({
      id:        r.id,
      userId:    r.userId,
      name:      r.name,
      color:     r.color,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async logClaim(log: Omit<MailClaimLog, "id" | "claimedAt">): Promise<MailClaimLog> {
    const [inserted] = await db
      .insert(mailClaimLogsTable)
      .values({
        id:           crypto.randomUUID(),
        mailId:       log.mailId,
        attachmentId: log.attachmentId,
        userId:       log.userId,
        claimedAt:    new Date(),
        result:       log.result ?? null,
      })
      .returning();
    return {
      id:           inserted!.id,
      mailId:       inserted!.mailId,
      attachmentId: inserted!.attachmentId,
      userId:       inserted!.userId,
      claimedAt:    inserted!.claimedAt.toISOString(),
      result:       inserted!.result as Record<string, unknown> | undefined,
    };
  }
}
