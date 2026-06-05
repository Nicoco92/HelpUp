import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { Request } from 'express';
import { User } from './entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- Profile ---

  @Get('me')
  async getMyProfile(@Req() req: RequestWithUser) {
    return this.usersService.getPublicProfile(req.user.id);
  }

  @Patch('me')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // --- Location ---

  @Patch('me/location')
  async updateLocation(
    @Req() req: RequestWithUser,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    await this.usersService.updateLocation(req.user.id, lat, lng);
    return { success: true };
  }

  // --- Push Token ---

  @Patch('me/push-token')
  async updatePushToken(
    @Req() req: RequestWithUser,
    @Body('token') token: string,
  ) {
    await this.usersService.updatePushToken(req.user.id, token);
    return { success: true };
  }

  // --- Skills ---

  @Get('skills')
  async getAllSkills() {
    return this.usersService.getAllSkills();
  }

  @Post('me/skills')
  async setMySkills(
    @Req() req: RequestWithUser,
    @Body('skillIds') skillIds: string[],
  ) {
    return this.usersService.setUserSkills(req.user.id, skillIds);
  }

  // --- KYC ---

  @Post('me/kyc')
  @UseGuards(RolesGuard)
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async submitKyc(
    @Req() req: RequestWithUser,
    @Body('documentType') documentType: string,
    @Body('documentUrl') documentUrl: string,
  ) {
    return this.usersService.submitKycDocument(
      req.user.id,
      documentType,
      documentUrl,
    );
  }

  @Get('me/kyc')
  async getMyKycDocuments(@Req() req: RequestWithUser) {
    return this.usersService.getUserKycDocuments(req.user.id);
  }

  // --- KYC Admin Review ---
  @Patch('kyc/:documentId/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async reviewKyc(
    @Param('documentId') documentId: string,
    @Body('approved') approved: boolean,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.usersService.reviewKycDocument(
      documentId,
      approved,
      rejectionReason,
    );
  }

  // --- Referral ---

  @Post('me/referral-code')
  async generateReferralCode(@Req() req: RequestWithUser) {
    const code = await this.usersService.generateReferralCode(req.user.id);
    return { referralCode: code };
  }
}
