export type NotificationType = "reward" | "transaction" | "system" | "social" | "marketplace" | "quest";

export interface Notification {
  id:        string;
  userId:    string;
  type:      NotificationType;
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

export interface INotificationsRepository {
  getByUserId(userId: string, type?: NotificationType, unreadOnly?: boolean): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  create(n: Notification): Promise<Notification>;
  markRead(id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}

export class InMemoryNotificationsRepository implements INotificationsRepository {
  private items: Notification[] = [];

  async getByUserId(userId: string, type?: NotificationType, unreadOnly = false): Promise<Notification[]> {
    let results = this.items.filter(n => n.userId === userId);
    if (type) results = results.filter(n => n.type === type);
    if (unreadOnly) results = results.filter(n => !n.isRead);
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.items.filter(n => n.userId === userId && !n.isRead).length;
  }

  async create(n: Notification): Promise<Notification> {
    this.items.unshift(n);
    return n;
  }

  async markRead(id: string): Promise<void> {
    const n = this.items.find(x => x.id === id);
    if (n) n.isRead = true;
  }

  async markAllRead(userId: string): Promise<void> {
    this.items.filter(n => n.userId === userId).forEach(n => { n.isRead = true; });
  }

  async deleteById(id: string): Promise<void> {
    this.items = this.items.filter(n => n.id !== id);
  }
}
