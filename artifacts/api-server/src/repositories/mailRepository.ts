import type {
  Mail,
  MailLabel,
  MailAttachment,
  MailClaimLog,
  CreateMailInput,
  MailFilter,
} from "../models/mail.js";

export type { Mail, MailLabel, MailAttachment, MailClaimLog, CreateMailInput, MailFilter };

export interface IMailRepository {
  create(input: CreateMailInput): Promise<Mail>;
  findById(id: string): Promise<Mail | null>;
  findByUserId(userId: string, filter?: MailFilter): Promise<Mail[]>;
  findUnread(userId: string): Promise<Mail[]>;
  countUnread(userId: string): Promise<number>;

  markRead(id: string, userId: string): Promise<Mail | null>;
  markAllRead(userId: string): Promise<number>;
  markClaimed(id: string, userId: string): Promise<Mail | null>;
  markArchived(id: string, userId: string): Promise<Mail | null>;
  softDelete(id: string, userId: string): Promise<boolean>;

  claimAttachment(attachmentId: string, userId: string, result?: Record<string, unknown>): Promise<MailAttachment | null>;
  getAttachment(attachmentId: string): Promise<MailAttachment | null>;

  createLabel(userId: string, name: string, color: string): Promise<MailLabel>;
  getLabels(userId: string): Promise<MailLabel[]>;

  logClaim(log: Omit<MailClaimLog, "id" | "claimedAt">): Promise<MailClaimLog>;
}
