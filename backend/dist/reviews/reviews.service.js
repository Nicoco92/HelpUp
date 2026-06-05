"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const user_entity_1 = require("../users/entities/user.entity");
const mission_entity_1 = require("../missions/entities/mission.entity");
const mission_status_enum_1 = require("../missions/enums/mission-status.enum");
const account_status_enum_1 = require("../users/enums/account-status.enum");
const SUSPENSION_THRESHOLD_RATING = 2.0;
const SUSPENSION_MIN_REVIEWS = 5;
let ReviewsService = class ReviewsService {
    reviewRepository;
    missionRepository;
    userRepository;
    constructor(reviewRepository, missionRepository, userRepository) {
        this.reviewRepository = reviewRepository;
        this.missionRepository = missionRepository;
        this.userRepository = userRepository;
    }
    async createReview(dto, authorId) {
        const mission = await this.missionRepository.findOne({
            where: { id: dto.missionId },
            relations: ['client', 'provider'],
        });
        if (!mission) {
            throw new common_1.NotFoundException('Mission not found');
        }
        if (mission.status !== mission_status_enum_1.MissionStatus.COMPLETED &&
            mission.status !== mission_status_enum_1.MissionStatus.PAID) {
            throw new common_1.BadRequestException('Mission must be completed to leave a review');
        }
        let targetId;
        if (mission.client.id === authorId) {
            if (!mission.provider) {
                throw new common_1.BadRequestException('No provider assigned to this mission');
            }
            targetId = mission.provider.id;
        }
        else if (mission.provider && mission.provider.id === authorId) {
            targetId = mission.client.id;
        }
        else {
            throw new common_1.ForbiddenException('You are not part of this mission');
        }
        const existing = await this.reviewRepository.findOne({
            where: {
                mission: { id: dto.missionId },
                author: { id: authorId },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already reviewed this mission');
        }
        const review = this.reviewRepository.create({
            mission: { id: dto.missionId },
            author: { id: authorId },
            target: { id: targetId },
            rating: dto.rating,
            comment: dto.comment,
        });
        const saved = await this.reviewRepository.save(review);
        await this.updateUserRating(targetId);
        return saved;
    }
    async updateUserRating(userId) {
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
        if (totalReviews >= SUSPENSION_MIN_REVIEWS &&
            averageRating < SUSPENSION_THRESHOLD_RATING) {
            await this.userRepository.update(userId, {
                accountStatus: account_status_enum_1.AccountStatus.SUSPENDED,
            });
        }
    }
    async getReviewsForUser(userId, limit = 20, offset = 0) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { target: { id: userId } },
            relations: ['author', 'mission'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { reviews, total };
    }
    async getReviewsForMission(missionId) {
        return this.reviewRepository.find({
            where: { mission: { id: missionId } },
            relations: ['author', 'target'],
            order: { createdAt: 'ASC' },
        });
    }
    async hasBothReviewed(missionId) {
        const count = await this.reviewRepository.count({
            where: { mission: { id: missionId } },
        });
        return count >= 2;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map