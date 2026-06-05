import { User } from '../../users/entities/user.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
export declare class Subscription {
    id: string;
    user: User;
    status: SubscriptionStatus;
    stripeSubscriptionId: string;
    startDate: Date;
    endDate: Date;
    fromReferral: boolean;
    createdAt: Date;
    updatedAt: Date;
}
