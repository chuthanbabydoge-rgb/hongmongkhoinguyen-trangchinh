export type MailType =
  | "SYSTEM"
  | "QUEST"
  | "MARKETPLACE"
  | "WALLET"
  | "SOCIAL"
  | "GUILD"
  | "EVENT"
  | "COMPENSATION"
  | "GIFT"
  | "ADMIN";

export type MailStatus = "UNREAD" | "READ" | "CLAIMED" | "ARCHIVED" | "DELETED";

export type MailAttachmentType =
  | "CREDITS"
  | "COINS"
  | "TOKENS"
  | "REWARD_POINTS"
  | "INVENTORY_ITEM"
  | "PET"
  | "TICKET"
  | "NFT"
  | "WORLD_ASSET"
  | "GUILD_REWARD"
  | "QUEST_REWARD"
  | "ACHIEVEMENT_REWARD";

export interface MailAttachment {
  id:        string;
  mailId:    string;
  type:      MailAttachmentType;
  label:     string;
  amount?:   number;
  itemId?:   string;
  itemData?: Record<string, unknown>;
  claimed:   boolean;
  claimedAt?: string;
}

export interface Mail {
  id:          string;
  userId:      string;
  senderId?:   string;
  senderName:  string;
  type:        MailType;
  status:      MailStatus;
  subject:     string;
  body:        string;
  expiresAt?:  string;
  readAt?:     string;
  claimedAt?:  string;
  archivedAt?: string;
  metadata?:   Record<string, unknown>;
  attachments: MailAttachment[];
  createdAt:   string;
  updatedAt:   string;
}

export interface MailLabel {
  id:        string;
  userId:    string;
  name:      string;
  color:     string;
  createdAt: string;
}

export interface MailTemplate {
  id:        string;
  slug:      string;
  type:      MailType;
  subject:   string;
  body:      string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMailInput {
  userId:      string;
  senderId?:   string;
  senderName?: string;
  type:        MailType;
  subject:     string;
  body:        string;
  expiresAt?:  string;
  metadata?:   Record<string, unknown>;
  attachments?: Array<{
    type:      MailAttachmentType;
    label:     string;
    amount?:   number;
    itemId?:   string;
    itemData?: Record<string, unknown>;
  }>;
}

export interface MailFilter {
  type?:       MailType;
  status?:     MailStatus;
  labelId?:    string;
  sender?:     string;
  search?:     string;
  hasAttachment?: boolean;
  cursor?:     string;
  limit?:      number;
}

export interface MailClaimLog {
  id:           string;
  mailId:       string;
  attachmentId: string;
  userId:       string;
  claimedAt:    string;
  result?:      Record<string, unknown>;
}
