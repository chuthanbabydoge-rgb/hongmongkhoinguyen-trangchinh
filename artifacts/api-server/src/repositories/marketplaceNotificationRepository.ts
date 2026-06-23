// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceNotificationRepository
//
// Stores per-user notifications for marketplace events.
// Table: marketplace_notifications
//   id UUID PK, user_id UUID, type TEXT, title TEXT, message TEXT,
//   is_read BOOLEAN DEFAULT false, metadata JSONB, created_at TIMESTAMPTZ
// ─────────────────────────────────────────────────────────────────────────────

// ─── Notification types ───────────────────────────────────────────────────────

export type NotificationType =
  | "LISTING_CREATED"
  | "LISTING_SOLD"
  | "LISTING_CANCELLED"
  | "AUCTION_CREATED"
  | "AUCTION_CANCELLED"
  | "AUCTION_WON"
  | "AUCTION_LOST"
  | "AUCTION_ENDED_NO_BIDS"
  | "BID_PLACED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_SENT"
  | "PRICE_DROP";

// ─── Domain model ─────────────────────────────────────────────────────────────

export interface MarketplaceNotification {
  id:        string;
  userId:    string;
  type:      NotificationType;
  title:     string;
  message:   string;
  isRead:    boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Create input ─────────────────────────────────────────────────────────────

export type CreateNotificationInput = Omit<MarketplaceNotification, "id" | "createdAt" | "isRead">;

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplaceNotificationRepository {
  create(input: CreateNotificationInput): Promise<MarketplaceNotification>;
  getByUserId(userId: string, limit?: number, offset?: number): Promise<{ data: MarketplaceNotification[]; total: number }>;
  getUnreadByUserId(userId: string): Promise<MarketplaceNotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string): Promise<MarketplaceNotification | null>;
  markAllAsRead(userId: string): Promise<number>;
  delete(id: string): Promise<boolean>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockMarketplaceNotificationRepository implements IMarketplaceNotificationRepository {
  private store: MarketplaceNotification[] = [];

  async create(input: CreateNotificationInput): Promise<MarketplaceNotification> {
    const notif: MarketplaceNotification = {
      id:        crypto.randomUUID(),
      isRead:    false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.store.push(notif);
    return notif;
  }

  async getByUserId(userId: string, limit = 50, offset = 0): Promise<{ data: MarketplaceNotification[]; total: number }> {
    const filtered = [...this.store]
      .filter(n => n.userId === userId)
      .reverse();
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async getUnreadByUserId(userId: string): Promise<MarketplaceNotification[]> {
    return [...this.store]
      .filter(n => n.userId === userId && !n.isRead)
      .reverse();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.store.filter(n => n.userId === userId && !n.isRead).length;
  }

  async markAsRead(id: string): Promise<MarketplaceNotification | null> {
    const notif = this.store.find(n => n.id === id);
    if (!notif) return null;
    notif.isRead = true;
    return { ...notif };
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notif of this.store) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        count++;
      }
    }
    return count;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    return true;
  }
}
