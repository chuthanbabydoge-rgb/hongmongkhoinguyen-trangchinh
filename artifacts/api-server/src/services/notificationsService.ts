import type { INotificationsRepository, Notification, NotificationType } from "../repositories/notificationsRepository";

export class NotificationsService {
  constructor(private readonly repo: INotificationsRepository) {}

  async getNotifications(userId: string, type?: NotificationType, unreadOnly = false): Promise<Notification[]> {
    return this.repo.getByUserId(userId, type, unreadOnly);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.repo.create({
      id:        crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      isRead:    false,
      createdAt: new Date().toISOString(),
    });
  }

  fire(userId: string, type: NotificationType, title: string, message: string): void {
    this.createNotification(userId, type, title, message).catch(() => {});
  }

  async markRead(id: string): Promise<void> {
    return this.repo.markRead(id);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.repo.markAllRead(userId);
  }

  async deleteNotification(id: string): Promise<void> {
    return this.repo.deleteById(id);
  }
}
