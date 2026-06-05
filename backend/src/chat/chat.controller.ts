import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async getMyRooms(@Req() req: RequestWithUser) {
    return this.chatService.findUserRooms(req.user.id);
  }

  @Get('rooms/:id')
  async getRoom(@Param('id') id: string) {
    return this.chatService.findRoomById(id);
  }

  @Get('rooms/mission/:missionId')
  async getRoomByMission(@Param('missionId') missionId: string) {
    return this.chatService.findRoomByMission(missionId);
  }

  @Get('rooms/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(
      id,
      req.user.id,
      limit ? Number(limit) : 50,
      before,
    );
  }
}
