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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('missions')
@ApiBearerAuth()
@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  // --- Categories ---

  @ApiOperation({ summary: 'Get all mission categories' })
  @ApiResponse({ status: 200, description: 'Return all mission categories.' })
  @Get('categories')
  async getCategories() {
    return this.missionsService.findAllCategories();
  }

  // --- CRUD ---

  @ApiOperation({ summary: 'Create a new mission' })
  @ApiResponse({ status: 201, description: 'The mission has been successfully created.' })
  @Post()
  @Roles(Role.CLIENT)
  async create(
    @Body() createMissionDto: CreateMissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.missionsService.create(createMissionDto, req.user);
  }

  @ApiOperation({ summary: 'Get all missions' })
  @ApiResponse({ status: 200, description: 'Return all missions.' })
  @Get()
  async findAll(@Query('status') status?: MissionStatus) {
    return this.missionsService.findAll(status);
  }

  @ApiOperation({ summary: 'Get published missions' })
  @ApiResponse({ status: 200, description: 'Return published missions.' })
  @Get('published')
  async findPublished() {
    return this.missionsService.findPublished();
  }

  @ApiOperation({ summary: 'Get missions created by the current client' })
  @ApiResponse({ status: 200, description: 'Return missions of the client.' })
  @Get('my')
  async findMyMissions(@Req() req: RequestWithUser) {
    return this.missionsService.findByClient(req.user.id);
  }

  @ApiOperation({ summary: 'Find nearby missions' })
  @ApiResponse({ status: 200, description: 'Return nearby missions.' })
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

  @ApiOperation({ summary: 'Get a mission by ID' })
  @ApiResponse({ status: 200, description: 'Return the mission.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.missionsService.findById(id);
  }

  // --- State Machine ---

  @ApiOperation({ summary: 'Publish a mission' })
  @ApiResponse({ status: 200, description: 'The mission has been published.' })
  @Patch(':id/publish')
  @Roles(Role.CLIENT)
  async publish(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.PUBLISHED,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Start a mission' })
  @ApiResponse({ status: 200, description: 'The mission has been marked as in-progress.' })
  @Patch(':id/start')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async start(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.IN_PROGRESS,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Complete a mission' })
  @ApiResponse({ status: 200, description: 'The mission has been marked as completed.' })
  @Patch(':id/complete')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async complete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.missionsService.transitionStatus(
      id,
      MissionStatus.COMPLETED,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Cancel a mission' })
  @ApiResponse({ status: 200, description: 'The mission has been cancelled.' })
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

  @ApiOperation({ summary: 'Apply to a mission' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully.' })
  @Post(':id/apply')
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async apply(
    @Param('id') id: string,
    @Body('coverMessage') coverMessage: string,
    @Req() req: RequestWithUser,
  ) {
    return this.missionsService.apply(id, req.user, coverMessage);
  }

  @ApiOperation({ summary: 'Get applications for a mission' })
  @ApiResponse({ status: 200, description: 'Return all applications for the mission.' })
  @Get(':id/applications')
  @Roles(Role.CLIENT)
  async getApplications(@Param('id') id: string) {
    return this.missionsService.getApplications(id);
  }

  @ApiOperation({ summary: 'Accept an application for a mission' })
  @ApiResponse({ status: 201, description: 'Application accepted successfully.' })
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
