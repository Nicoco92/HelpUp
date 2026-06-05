import { User } from '../../users/entities/user.entity';
export declare class Referral {
    id: string;
    referrer: User;
    referee: User;
    rewardClaimed: boolean;
    createdAt: Date;
}
