import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reviewsService.createReview(dto, req.user.id);
  }

  @Get('user/:userId')
  async getReviewsForUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.reviewsService.getReviewsForUser(
      userId,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get('mission/:missionId')
  async getReviewsForMission(@Param('missionId') missionId: string) {
    return this.reviewsService.getReviewsForMission(missionId);
  }

  @Get('mission/:missionId/status')
  async getReviewStatus(@Param('missionId') missionId: string) {
    const bothReviewed = await this.reviewsService.hasBothReviewed(missionId);
    return { bothReviewed };
  }
}
