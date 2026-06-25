import { EventEmitter } from "node:events";

export type MailEventType =
  | "MAIL_CREATED"
  | "MAIL_READ"
  | "MAIL_CLAIMED"
  | "MAIL_ARCHIVED"
  | "MAIL_DELETED"
  | "MAIL_UNREAD_COUNT";

export interface MailEvent {
  type:      MailEventType;
  timestamp: string;
  userId:    string;
  data:      Record<string, unknown>;
}

class MailEventBus extends EventEmitter {
  private static readonly CHANNEL = "mail:event";

  publish(event: MailEvent): void {
    this.emit(MailEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: MailEvent) => void): () => void {
    this.on(MailEventBus.CHANNEL, handler);
    return () => this.off(MailEventBus.CHANNEL, handler);
  }
}

export const mailEventBus = new MailEventBus();
