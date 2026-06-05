import { NotificationsService } from './notifications.service';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(req: RequestWithUser, limit?: number, offset?: number): Promise<{
        notifications: import("./entities/notification.entity").Notification[];
        total: number;
    }>;
    markAsRead(id: string, req: RequestWithUser): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: RequestWithUser): Promise<{
        success: boolean;
    }>;
}
export {};
