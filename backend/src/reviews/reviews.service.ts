import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { MissionStatus } from '../missions/enums/mission-status.enum';
import { AccountStatus } from '../users/enums/account-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';

// Threshold for automatic suspension
const SUSPENSION_THRESHOLD_RATING = 2.0;
const SUSPENSION_MIN_REVIEWS = 5;

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createReview(
    dto: CreateReviewDto,
    authorId: string,
  ): Promise<Review> {
    const mission = await this.missionRepository.findOne({
      where: { id: dto.missionId },
      relations: ['client', 'provider'],
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Mission must be COMPLETED or PAID to leave a review
    if (
      mission.status !== MissionStatus.COMPLETED &&
      mission.status !== MissionStatus.PAID
    ) {
      throw new BadRequestException('Mission must be completed to leave a review');
    }

    // Determine target based on author
    let targetId: string;
    if (mission.client.id === authorId) {
      // Client reviews the provider
      if (!mission.provider) {
        throw new BadRequestException('No provider assigned to this mission');
      }
      targetId = mission.provider.id;
    } else if (mission.provider && mission.provider.id === authorId) {
      // Provider reviews the client
      targetId = mission.client.id;
    } else {
      throw new ForbiddenException('You are not part of this mission');
    }

    // Check if review already exists from this author for this mission
    const existing = await this.reviewRepository.findOne({
      where: {
        mission: { id: dto.missionId },
        author: { id: authorId },
      },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this mission');
    }

    const review = this.reviewRepository.create({
      mission: { id: dto.missionId } as Mission,
      author: { id: authorId } as User,
      target: { id: targetId } as User,
      rating: dto.rating,
      comment: dto.comment,
    });

    const saved = await this.reviewRepository.save(review);

    // Update target's average rating
    await this.updateUserRating(targetId);

    return saved;
  }

  /**
   * Recalculate and update the average rating for a user.
   * Also checks for automatic suspension if rating drops below threshold.
   */
  private async updateUserRating(userId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.targetId = :userId', { userId })
      .getRawOne();

    const averageRating = parseFloat(result.avg) || 0;
    const totalReviews = parseInt(result.count, 10) || 0;

    await this.userRepository.update(userId, {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews,
    });

    // Auto-suspension for consistently bad ratings
    if (
      totalReviews >= SUSPENSION_MIN_REVIEWS &&
      averageRating < SUSPENSION_THRESHOLD_RATING
    ) {
      await this.userRepository.update(userId, {
        accountStatus: AccountStatus.SUSPENDED,
      });
    }
  }

  async getReviewsForUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { target: { id: userId } },
      relations: ['author', 'mission'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { reviews, total };
  }

  async getReviewsForMission(missionId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { mission: { id: missionId } },
      relations: ['author', 'target'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Check if both parties have reviewed a mission.
   */
  async hasBothReviewed(missionId: string): Promise<boolean> {
    const count = await this.reviewRepository.count({
      where: { mission: { id: missionId } },
    });
    return count >= 2;
  }
}
