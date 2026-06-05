import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @Req() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: RequestWithUser) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }
}
