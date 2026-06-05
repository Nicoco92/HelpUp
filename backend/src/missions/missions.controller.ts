import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { MissionStatus } from './enums/mission-status.enum';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  // --- Categories ---

  @Get('categories')
  async getCategories() {
    return this.missionsService.findAllCategories();
  }

  // --- CRUD ---

  @Post()
  @Roles(Role.CLIENT)
  async create(
    @Body() createMissionDto: CreateMissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.missionsService.create(createMissionDto, req.user);
  }

  @Get()
  async findAll(@Query('status') status?: MissionStatus) {
    return this.missionsService.findAll(status);
  }

  @Get('published')
  async findPublished() {
    return this.missionsService.findPublished();
  }

  @Get('my')
  async findMyMissions(@Req() req: RequestWithUser) {
    return this.missionsService.findByClient(req.user.id);
  }

  @Get('nearby')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.missionsService.findNearby(
      Number(lat),
      Number(lng),
      Number(radius) || 10,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.missionsService.findById(id);
  }

  // --- State Machine ---

  @Patch(':id/publish')
  @Roles(Role.CLIENT)
  async publish(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.PUBLISHED,
      req.user.id,
    );
  }

  @Patch(':id/start')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async start(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.IN_PROGRESS,
      req.user.id,
    );
  }

  @Patch(':id/complete')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async complete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.COMPLETED,
      req.user.id,
    );
  }

  @Patch(':id/cancel')
  @Roles(Role.CLIENT, Role.ADMIN)
  async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.CANCELLED,
      req.user.id,
    );
  }

  // --- Applications ---

  @Post(':id/apply')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async apply(
    @Param('id') id: string,
    @Body('coverMessage') coverMessage: string,
    @Req() req: RequestWithUser,
  ) {
    return this.missionsService.apply(id, req.user, coverMessage);
  }

  @Get(':id/applications')
  @Roles(Role.CLIENT)
  async getApplications(@Param('id') id: string) {
    return this.missionsService.getApplications(id);
  }

  @Post(':id/applications/:appId/accept')
  @Roles(Role.CLIENT)
  async acceptApplication(
    @Param('id') id: string,
    @Param('appId') appId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.missionsService.acceptApplication(id, appId, req.user);
  }
}
