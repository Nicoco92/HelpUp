import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private reviewRepository;
    private missionRepository;
    private userRepository;
    constructor(reviewRepository: Repository<Review>, missionRepository: Repository<Mission>, userRepository: Repository<User>);
    createReview(dto: CreateReviewDto, authorId: string): Promise<Review>;
    private updateUserRating;
    getReviewsForUser(userId: string, limit?: number, offset?: number): Promise<{
        reviews: Review[];
        total: number;
    }>;
    getReviewsForMission(missionId: string): Promise<Review[]>;
    hasBothReviewed(missionId: string): Promise<boolean>;
}
