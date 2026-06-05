import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
export declare class NotificationsService {
    private notificationRepository;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>);
    sendPushNotification(user: User, title: string, body: string, data?: Record<string, string>): Promise<Notification>;
    sendBulkPushNotifications(users: User[], title: string, body: string, data?: Record<string, string>): Promise<void>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    private sendExpoNotification;
    private sendExpoBulkNotifications;
}
