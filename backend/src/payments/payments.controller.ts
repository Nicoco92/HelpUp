import {
  Controller,
  Post,
  Get,
  Req,
  Param,
  Body,
  Headers,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- Webhook (no auth) ---
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Raw body is missing for webhook verification');
    }

    await this.paymentsService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }

  // --- Stripe Connect Onboarding ---
  @Post('connect/onboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async createConnectAccount(@Req() req: RequestWithUser) {
    const url = await this.paymentsService.createConnectAccount(req.user);
    return { onboardingUrl: url };
  }

  // --- Stripe Customer ---
  @Post('customer/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async createCustomer(@Req() req: RequestWithUser) {
    const customerId = await this.paymentsService.createCustomer(req.user);
    return { customerId };
  }

  // --- Payment intent client secret ---
  @Get('mission/:missionId/client-secret')
  @UseGuards(JwtAuthGuard)
  async getClientSecret(@Param('missionId') missionId: string) {
    const clientSecret = await this.paymentsService.getPaymentIntentClientSecret(missionId);
    return { clientSecret };
  }

  // --- Capture payment ---
  @Post('mission/:missionId/capture')
  @UseGuards(JwtAuthGuard)
  async capturePayment(@Param('missionId') missionId: string) {
    return this.paymentsService.capturePayment(missionId);
  }

  // --- Transaction info ---
  @Get('mission/:missionId/transaction')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('missionId') missionId: string) {
    return this.paymentsService.getTransactionByMission(missionId);
  }

  // --- Premium Subscription ---
  @Post('premium/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async subscribePremium(
    @Req() req: RequestWithUser,
    @Body('priceId') priceId: string,
  ) {
    return this.paymentsService.createPremiumSubscription(req.user, priceId);
  }
}
