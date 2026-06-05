import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Send push notification via Expo and persist in DB.
   */
  async sendPushNotification(
    user: User,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<Notification> {
    // Persist notification in DB
    const notification = this.notificationRepository.create({
      user,
      title,
      body,
      data: data ? JSON.stringify(data) : undefined,
    });
    const saved = await this.notificationRepository.save(notification);

    // Send via Expo Push API if user has a push token
    if (user.expoPushToken) {
      await this.sendExpoNotification({
        to: user.expoPushToken,
        title,
        body,
        data,
      });
    }

    return saved;
  }

  /**
   * Send push notifications to multiple users.
   */
  async sendBulkPushNotifications(
    users: User[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const notifications = users.map((user) =>
      this.notificationRepository.create({
        user,
        title,
        body,
        data: data ? JSON.stringify(data) : undefined,
      }),
    );
    await this.notificationRepository.save(notifications);

    // Send via Expo Push API
    const messages: ExpoPushMessage[] = users
      .filter((u) => u.expoPushToken)
      .map((u) => ({
        to: u.expoPushToken as string,
        title,
        body,
        data,
      }));

    if (messages.length > 0) {
      await this.sendExpoBulkNotifications(messages);
    }
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { notifications, total };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, user: { id: userId } },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  // --- Expo Push API ---

  private async sendExpoNotification(message: ExpoPushMessage): Promise<void> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        this.logger.error(`Expo push failed: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`Expo push error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async sendExpoBulkNotifications(messages: ExpoPushMessage[]): Promise<void> {
    try {
      // Expo recommends batches of 100
      const batchSize = 100;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          this.logger.error(`Expo bulk push failed: ${response.statusText}`);
        }
      }
    } catch (error) {
      this.logger.error(`Expo bulk push error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
