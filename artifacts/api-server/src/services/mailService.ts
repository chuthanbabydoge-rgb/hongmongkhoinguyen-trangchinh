import type { IMailRepository } from "../repositories/mailRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { UserReputationService } from "./userReputationService.js";
import type {
  Mail,
  MailLabel,
  CreateMailInput,
  MailFilter,
} from "../models/mail.js";
import { mailEventBus } from "../realtime/mailEventBus.js";
import { questEventBus } from "../realtime/questEventBus.js";
import { logger } from "../lib/logger.js";

export class MailNotFoundError extends Error {
  constructor(id: string) { super(`Mail không tìm thấy: ${id}`); }
}
export class MailUnauthorizedError extends Error {
  constructor() { super("Không có quyền truy cập mail này."); }
}
export class AttachmentAlreadyClaimedError extends Error {
  constructor() { super("Phần thưởng này đã được nhận rồi."); }
}
export class AttachmentNotFoundError extends Error {
  constructor() { super("Attachment không tìm thấy."); }
}

export class MailService {
  constructor(
    private readonly repo: IMailRepository,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly userReputationService: UserReputationService,
  ) {}

  async getMail(userId: string, filter?: MailFilter): Promise<Mail[]> {
    return this.repo.findByUserId(userId, filter);
  }

  async getUnread(userId: string): Promise<Mail[]> {
    return this.repo.findUnread(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.countUnread(userId);
  }

  async getById(id: string, userId: string): Promise<Mail> {
    const mail = await this.repo.findById(id);
    if (!mail) throw new MailNotFoundError(id);
    if (mail.userId !== userId) throw new MailUnauthorizedError();
    return mail;
  }

  async sendMail(input: CreateMailInput): Promise<Mail> {
    const mail = await this.repo.create(input);

    mailEventBus.publish({
      type:      "MAIL_CREATED",
      timestamp: new Date().toISOString(),
      userId:    mail.userId,
      data:      { mail },
    });

    this.notificationsService.fire(
      mail.userId,
      "system",
      `📬 Thư mới: ${mail.subject}`,
      `Bạn có thư mới từ ${mail.senderName}.`,
    );

    this.activitiesService.fire({
      userId:      mail.userId,
      type:        "mail",
      title:       "Nhận thư mới",
      description: mail.subject,
      metadata:    { mailId: mail.id, mailType: mail.type },
      sourceApp:   "universe-hub",
    });

    return mail;
  }

  async markRead(id: string, userId: string): Promise<Mail> {
    const mail = await this.repo.markRead(id, userId);
    if (!mail) {
      const existing = await this.repo.findById(id);
      if (!existing) throw new MailNotFoundError(id);
      if (existing.userId !== userId) throw new MailUnauthorizedError();
      return existing;
    }

    mailEventBus.publish({
      type:      "MAIL_READ",
      timestamp: new Date().toISOString(),
      userId,
      data:      { mailId: id },
    });

    this.activitiesService.fire({
      userId:      userId,
      type:        "mail",
      title:       "Đọc thư",
      description: mail.subject,
      metadata:    { mailId: id },
      sourceApp:   "universe-hub",
    });

    return mail;
  }

  async markAllRead(userId: string): Promise<number> {
    const count = await this.repo.markAllRead(userId);

    if (count > 0) {
      mailEventBus.publish({
        type:      "MAIL_READ",
        timestamp: new Date().toISOString(),
        userId,
        data:      { all: true, count },
      });
    }

    return count;
  }

  async claimAttachments(mailId: string, userId: string): Promise<Mail> {
    const mail = await this.repo.findById(mailId);
    if (!mail) throw new MailNotFoundError(mailId);
    if (mail.userId !== userId) throw new MailUnauthorizedError();

    const unclaimedAttachments = mail.attachments.filter((a) => !a.claimed);
    if (unclaimedAttachments.length === 0) throw new AttachmentAlreadyClaimedError();

    const claimResults: Record<string, unknown>[] = [];

    for (const attachment of unclaimedAttachments) {
      try {
        const result = this.processAttachmentClaim(attachment);
        await this.repo.claimAttachment(attachment.id, userId, result);
        claimResults.push({ attachmentId: attachment.id, ...result });
      } catch (err) {
        logger.error({ err, attachmentId: attachment.id }, "Claim attachment thất bại");
      }
    }

    const updated = await this.repo.markClaimed(mailId, userId);
    if (!updated) throw new MailNotFoundError(mailId);

    mailEventBus.publish({
      type:      "MAIL_CLAIMED",
      timestamp: new Date().toISOString(),
      userId,
      data:      { mailId, results: claimResults },
    });

    this.activitiesService.fire({
      userId:      userId,
      type:        "mail",
      title:       "Nhận thưởng từ thư",
      description: mail.subject,
      metadata:    { mailId, results: claimResults },
      sourceApp:   "universe-hub",
    });

    this.notificationsService.fire(
      userId,
      "reward",
      "🎁 Nhận thưởng thành công",
      `Bạn đã nhận phần thưởng từ: ${mail.subject}`,
    );

    this.userReputationService.fire(userId, "QUEST_COMPLETED");

    questEventBus.publish({ userId, type: "MAIL_CLAIMED", metadata: { mailId } });

    return updated;
  }

  private processAttachmentClaim(
    attachment: { type: string; amount?: number; itemId?: string },
  ): Record<string, unknown> {
    switch (attachment.type) {
      case "CREDITS":
        return { type: "CREDITS", amount: attachment.amount ?? 0, status: "applied" };
      case "COINS":
        return { type: "COINS", amount: attachment.amount ?? 0, status: "applied" };
      case "TOKENS":
        return { type: "TOKENS", amount: attachment.amount ?? 0, status: "applied" };
      case "REWARD_POINTS":
        return { type: "REWARD_POINTS", amount: attachment.amount ?? 0, status: "applied" };
      case "INVENTORY_ITEM":
        return { type: "INVENTORY_ITEM", itemId: attachment.itemId, status: "applied" };
      default:
        return { type: attachment.type, status: "applied" };
    }
  }

  async archiveMail(id: string, userId: string): Promise<Mail> {
    const mail = await this.repo.markArchived(id, userId);
    if (!mail) {
      const existing = await this.repo.findById(id);
      if (!existing) throw new MailNotFoundError(id);
      if (existing.userId !== userId) throw new MailUnauthorizedError();
      throw new MailNotFoundError(id);
    }

    mailEventBus.publish({
      type:      "MAIL_ARCHIVED",
      timestamp: new Date().toISOString(),
      userId,
      data:      { mailId: id },
    });

    this.activitiesService.fire({
      userId:      userId,
      type:        "mail",
      title:       "Lưu trữ thư",
      description: mail.subject,
      metadata:    { mailId: id },
      sourceApp:   "universe-hub",
    });

    return mail;
  }

  async deleteMail(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new MailNotFoundError(id);
    if (existing.userId !== userId) throw new MailUnauthorizedError();

    await this.repo.softDelete(id, userId);

    mailEventBus.publish({
      type:      "MAIL_DELETED",
      timestamp: new Date().toISOString(),
      userId,
      data:      { mailId: id },
    });
  }

  async getLabels(userId: string): Promise<MailLabel[]> {
    return this.repo.getLabels(userId);
  }

  async createLabel(userId: string, name: string, color: string): Promise<MailLabel> {
    return this.repo.createLabel(userId, name, color);
  }

  async sendSystemBroadcast(
    userIds: string[],
    subject: string,
    body: string,
    attachments?: CreateMailInput["attachments"],
  ): Promise<Mail[]> {
    const mails: Mail[] = [];
    for (const userId of userIds) {
      const mail = await this.sendMail({
        userId,
        senderName: "Universe System",
        type: "ADMIN",
        subject,
        body,
        attachments,
      });
      mails.push(mail);
    }
    return mails;
  }

  async getDashboard(userId: string): Promise<{
    unreadCount: number;
    claimableCount: number;
    recentMails: Mail[];
  }> {
    const [allMails, unreadCount] = await Promise.all([
      this.repo.findByUserId(userId, { limit: 10 }),
      this.repo.countUnread(userId),
    ]);

    const claimableCount = allMails.filter(
      (m) => m.attachments.some((a) => !a.claimed) && m.status !== "DELETED",
    ).length;

    return { unreadCount, claimableCount, recentMails: allMails };
  }
}
