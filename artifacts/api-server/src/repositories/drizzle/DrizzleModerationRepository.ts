import { eq, desc, sql } from "drizzle-orm";
import { db, marketplaceModerationActionsTable, marketplaceSellerStatusTable, marketplaceListingsTable, marketplaceAuctionsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IModerationRepository, ModerationAction, SellerModerationStatus, SellerStatusValue, ReportedItem } from "../marketplaceModerationRepository";

function rowToAction(row: typeof marketplaceModerationActionsTable.$inferSelect): ModerationAction {
  return {
    id:         row.id,
    adminId:    row.adminId,
    action:     row.action as ModerationAction["action"],
    targetType: row.targetType as ModerationAction["targetType"],
    targetId:   row.targetId,
    reason:     row.reason,
    createdAt:  typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleModerationRepository implements IModerationRepository {
  async addAction(input: Omit<ModerationAction, "id" | "createdAt">): Promise<ModerationAction> {
    const [inserted] = await db
      .insert(marketplaceModerationActionsTable)
      .values({ id: randomUUID(), ...input, createdAt: new Date().toISOString() })
      .returning();
    return rowToAction(inserted!);
  }

  async getActions(limit = 50): Promise<ModerationAction[]> {
    const rows = await db
      .select()
      .from(marketplaceModerationActionsTable)
      .orderBy(desc(marketplaceModerationActionsTable.createdAt))
      .limit(limit);
    return rows.map(rowToAction);
  }

  async getSellerStatus(userId: string): Promise<SellerModerationStatus | null> {
    const rows = await db
      .select()
      .from(marketplaceSellerStatusTable)
      .where(eq(marketplaceSellerStatusTable.userId, userId))
      .limit(1);
    if (!rows[0]) return null;
    return {
      userId:    rows[0].userId,
      status:    rows[0].status as SellerStatusValue,
      updatedAt: typeof rows[0].updatedAt === "string" ? rows[0].updatedAt : new Date(rows[0].updatedAt).toISOString(),
    };
  }

  async setSellerStatus(userId: string, status: SellerStatusValue): Promise<SellerModerationStatus> {
    const now = new Date().toISOString();
    const [result] = await db
      .insert(marketplaceSellerStatusTable)
      .values({ userId, status, updatedAt: now })
      .onConflictDoUpdate({ target: marketplaceSellerStatusTable.userId, set: { status, updatedAt: now } })
      .returning();
    return { userId: result!.userId, status: result!.status as SellerStatusValue, updatedAt: typeof result!.updatedAt === "string" ? result!.updatedAt : new Date(result!.updatedAt).toISOString() };
  }

  async countSellers(status: SellerStatusValue): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceSellerStatusTable)
      .where(eq(marketplaceSellerStatusTable.status, status));
    return row?.count ?? 0;
  }

  async getReported(): Promise<ReportedItem[]> {
    const listings = await db
      .select({ id: marketplaceListingsTable.id, createdAt: marketplaceListingsTable.createdAt })
      .from(marketplaceListingsTable)
      .where(eq(marketplaceListingsTable.status, "cancelled"))
      .limit(20);
    return listings.map(l => ({
      id:         l.id,
      targetType: "listing" as const,
      targetId:   l.id,
      reason:     "cancelled",
      createdAt:  typeof l.createdAt === "string" ? l.createdAt : new Date(l.createdAt).toISOString(),
    }));
  }

  async countReported(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceListingsTable)
      .where(eq(marketplaceListingsTable.status, "cancelled"));
    return row?.count ?? 0;
  }
}
