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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- Webhook (no auth) ---
  @ApiOperation({ summary: 'Stripe Webhook Endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
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
  @ApiOperation({ summary: 'Generate a Stripe Connect onboarding link for a provider' })
  @ApiResponse({ status: 201, description: 'Return the onboarding URL.' })
  @Post('connect/onboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER, Role.PREMIUM_PROVIDER)
  async generateOnboardingLink(@Req() req: RequestWithUser) {
    const url = await this.paymentsService.generateOnboardingLink(req.user);
    return { onboardingUrl: url };
  }

  // --- Stripe Customer ---
  @ApiOperation({ summary: 'Create a Stripe Customer for a client' })
  @ApiResponse({ status: 201, description: 'Return the Stripe Customer ID.' })
  @Post('customer/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  async createCustomer(@Req() req: RequestWithUser) {
    const customerId = await this.paymentsService.createCustomer(req.user);
    return { customerId };
  }

  // --- Payment intent client secret ---
  @ApiOperation({ summary: 'Get Stripe PaymentIntent client secret' })
  @ApiResponse({ status: 200, description: 'Return the client secret.' })
  @Get('mission/:missionId/client-secret')
  @UseGuards(JwtAuthGuard)
  async getClientSecret(@Param('missionId') missionId: string) {
    const clientSecret = await this.paymentsService.getPaymentIntentClientSecret(missionId);
    return { clientSecret };
  }

  // --- Capture payment ---
  @ApiOperation({ summary: 'Capture funds and transfer to provider after mission completion' })
  @ApiResponse({ status: 201, description: 'Payment captured successfully.' })
  @Post('mission/:missionId/capture')
  @UseGuards(JwtAuthGuard)
  async capturePayment(@Param('missionId') missionId: string) {
    return this.paymentsService.captureAndTransfer(missionId);
  }

  // --- Transaction info ---
  @ApiOperation({ summary: 'Get transaction details for a mission' })
  @ApiResponse({ status: 200, description: 'Return transaction details.' })
  @Get('mission/:missionId/transaction')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('missionId') missionId: string) {
    return this.paymentsService.getTransactionByMission(missionId);
  }

  // --- Premium Subscription ---
  @ApiOperation({ summary: 'Subscribe to Premium' })
  @ApiResponse({ status: 201, description: 'Return the subscription ID and client secret.' })
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
