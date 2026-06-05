import { User } from '../../users/entities/user.entity';
export declare class Notification {
    id: string;
    user: User;
    title: string;
    body: string;
    data: string;
    isRead: boolean;
    createdAt: Date;
}
