import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';
export declare class Review {
    id: string;
    mission: Mission;
    author: User;
    target: User;
    rating: number;
    comment: string;
    createdAt: Date;
}
