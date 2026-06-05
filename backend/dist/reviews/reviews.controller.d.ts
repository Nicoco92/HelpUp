import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, req: RequestWithUser): Promise<import("./entities/review.entity").Review>;
    getReviewsForUser(userId: string, limit?: number, offset?: number): Promise<{
        reviews: import("./entities/review.entity").Review[];
        total: number;
    }>;
    getReviewsForMission(missionId: string): Promise<import("./entities/review.entity").Review[]>;
    getReviewStatus(missionId: string): Promise<{
        bothReviewed: boolean;
    }>;
}
export {};
