import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Stripe = require('stripe');
import { Transaction } from './entities/transaction.entity';
import { Subscription } from './entities/subscription.entity';
import { Referral } from './entities/referral.entity';
import { TransactionStatus } from './enums/transaction-status.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { PaymentMethod } from '../missions/enums/payment-method.enum';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { MissionStatus } from '../missions/enums/mission-status.enum';
import { Role } from '../users/enums/role.enum';

const DEFAULT_COMMISSION_RATE = 0.15; // 15%

@Injectable()
export class PaymentsService {
  private stripe: InstanceType<typeof Stripe>;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {
    const secret = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(secret);
  }

  // =====================
  // PAYMENT FLOW
  // =====================

  /**
   * Step 1: Create a payment hold (authorization) when client selects a provider.
   * For STRIPE payment: full amount hold
   * For ON_SITE payment: commission-only hold
   */
  async createPaymentHold(
    mission: Mission,
    client: User,
    provider: User,
  ): Promise<Transaction> {
    const commissionRate = DEFAULT_COMMISSION_RATE;
    const totalAmount = Number(mission.price);
    const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100;
    const providerAmount = totalAmount - commissionAmount;

    // Determine hold amount based on payment method
    const holdAmount =
      mission.paymentMethod === PaymentMethod.STRIPE
        ? totalAmount
        : commissionAmount; // ON_SITE: only hold the commission

    let stripePaymentIntentId: string | undefined;

    // Create Stripe PaymentIntent with manual capture (hold)
    if (client.stripeCustomerId) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(holdAmount * 100), // Stripe uses cents
          currency: 'eur',
          customer: client.stripeCustomerId,
          capture_method: 'manual', // Hold, don't capture yet
          metadata: {
            missionId: mission.id,
            paymentMethod: mission.paymentMethod,
            commissionRate: commissionRate.toString(),
          },
        });
        stripePaymentIntentId = paymentIntent.id;
      } catch (error) {
        this.logger.error(`Stripe hold failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        throw new BadRequestException('Payment hold failed');
      }
    }

    const transaction = this.transactionRepository.create({
      mission,
      client,
      provider,
      totalAmount,
      commissionAmount,
      providerAmount,
      commissionRate,
      paymentMethod: mission.paymentMethod,
      status: TransactionStatus.HOLD,
      stripePaymentIntentId,
    });

    return this.transactionRepository.save(transaction);
  }

  /**
   * Step 2: Capture the payment after mission completion.
   */
  async capturePayment(missionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { mission: { id: missionId } },
      relations: ['mission', 'provider'],
    });

    if (!transaction) {
      throw new BadRequestException('No transaction found for this mission');
    }

    if (transaction.status !== TransactionStatus.HOLD) {
      throw new BadRequestException('Transaction is not in HOLD status');
    }

    if (transaction.stripePaymentIntentId) {
      try {
        // Capture the payment
        await this.stripe.paymentIntents.capture(transaction.stripePaymentIntentId);

        // For STRIPE payments, transfer to provider via Stripe Connect
        if (
          transaction.paymentMethod === PaymentMethod.STRIPE &&
          transaction.provider.stripeAccountId
        ) {
          const transfer = await this.stripe.transfers.create({
            amount: Math.round(Number(transaction.providerAmount) * 100),
            currency: 'eur',
            destination: transaction.provider.stripeAccountId,
            metadata: { missionId },
          });
          transaction.stripeTransferId = transfer.id;
        }
      } catch (error) {
        this.logger.error(`Stripe capture failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        transaction.status = TransactionStatus.FAILED;
        await this.transactionRepository.save(transaction);
        throw new BadRequestException('Payment capture failed');
      }
    }

    transaction.status =
      transaction.paymentMethod === PaymentMethod.ON_SITE
        ? TransactionStatus.COMMISSION_ONLY
        : TransactionStatus.CAPTURED;

    const saved = await this.transactionRepository.save(transaction);

    // Update mission status to PAID
    await this.missionRepository.update(missionId, {
      status: MissionStatus.PAID,
    });

    // Increment provider's completed missions
    await this.userRepository.increment(
      { id: transaction.provider.id },
      'completedMissions',
      1,
    );

    return saved;
  }

  /**
   * Get client_secret for frontend to confirm payment.
   */
  async getPaymentIntentClientSecret(missionId: string): Promise<string> {
    const transaction = await this.transactionRepository.findOne({
      where: { mission: { id: missionId } },
    });
    if (!transaction || !transaction.stripePaymentIntentId) {
      throw new BadRequestException('No payment intent found');
    }

    const pi = await this.stripe.paymentIntents.retrieve(
      transaction.stripePaymentIntentId,
    );
    return pi.client_secret || '';
  }

  // =====================
  // STRIPE CONNECT ONBOARDING
  // =====================

  /**
   * Create a Stripe Connect account for a provider.
   */
  async createConnectAccount(user: User): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: { userId: user.id },
      capabilities: {
        transfers: { requested: true },
      },
    });

    await this.userRepository.update(user.id, {
      stripeAccountId: account.id,
    });

    // Generate onboarding link
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get<string>('APP_URL') || 'http://localhost:3000'}/stripe/refresh`,
      return_url: `${this.configService.get<string>('APP_URL') || 'http://localhost:3000'}/stripe/return`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Create a Stripe Customer for a client.
   */
  async createCustomer(user: User): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: { userId: user.id },
    });

    await this.userRepository.update(user.id, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  // =====================
  // WEBHOOKS
  // =====================

  async handleWebhook(
    signature: string,
    body: Buffer,
  ): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    if (!webhookSecret) {
      throw new Error('Stripe Webhook Secret not configured');
    }

    let event: { type: string; data: { object: Record<string, unknown> } };

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret) as unknown as { type: string; data: { object: Record<string, unknown> } };
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown'}`,
      );
      throw err;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        this.logger.warn(`PaymentIntent ${failedIntent.id} failed`);
        // Update transaction status
        await this.transactionRepository.update(
          { stripePaymentIntentId: failedIntent.id as string },
          { status: TransactionStatus.FAILED },
        );
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await this.handleSubscriptionUpdate(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        await this.handleSubscriptionCancelled(deletedSub);
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  // =====================
  // PREMIUM SUBSCRIPTIONS
  // =====================

  /**
   * Create a Stripe subscription for Premium.
   */
  async createPremiumSubscription(
    user: User,
    priceId: string,
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    if (!user.stripeCustomerId) {
      throw new BadRequestException('User has no Stripe customer ID');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId: user.id },
    });

    // Save subscription in our DB
    const dbSubscription = this.subscriptionRepository.create({
      user,
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: subscription.id,
      startDate: new Date(((subscription as unknown as { current_period_start: number }).current_period_start) * 1000),
      endDate: new Date(((subscription as unknown as { current_period_end: number }).current_period_end) * 1000),
      fromReferral: false,
    });
    await this.subscriptionRepository.save(dbSubscription);

    // Upgrade user role
    await this.userRepository.update(user.id, {
      role: Role.PREMIUM_PROVIDER,
    });

    const invoice = subscription.latest_invoice as unknown as Record<string, unknown>;
    const paymentIntent = invoice.payment_intent as unknown as Record<string, unknown>;

    return {
      subscriptionId: subscription.id,
      clientSecret: (paymentIntent.client_secret as string) || '',
    };
  }

  /**
   * Grant a free Premium month via referral.
   */
  async grantReferralPremium(userId: string): Promise<Subscription> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = this.subscriptionRepository.create({
      user: { id: userId } as User,
      status: SubscriptionStatus.TRIAL,
      startDate: now,
      endDate,
      fromReferral: true,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    // Upgrade user role
    await this.userRepository.update(userId, {
      role: Role.PREMIUM_PROVIDER,
    });

    return saved;
  }

  // =====================
  // REFERRAL SYSTEM
  // =====================

  async processReferral(referralCode: string, newUser: User): Promise<void> {
    const referrer = await this.userRepository.findOne({
      where: { referralCode },
    });
    if (!referrer) {
      this.logger.warn(`Invalid referral code: ${referralCode}`);
      return;
    }

    const referral = this.referralRepository.create({
      referrer,
      referee: newUser,
    });
    await this.referralRepository.save(referral);

    // Grant free month to the new user (referee)
    await this.grantReferralPremium(newUser.id);

    // Check if referrer should also get a free month
    const referralCount = await this.referralRepository.count({
      where: { referrer: { id: referrer.id } },
    });

    // Every 3 referrals, grant the referrer a free Premium month
    if (referralCount % 3 === 0) {
      await this.grantReferralPremium(referrer.id);
      await this.referralRepository.update(
        { referrer: { id: referrer.id }, rewardClaimed: false },
        { rewardClaimed: true },
      );
    }
  }

  // =====================
  // WEBHOOK HANDLERS (private)
  // =====================

  private async handleSubscriptionUpdate(
    stripeSubscription: Record<string, unknown>,
  ): Promise<void> {
    const dbSub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id as string },
      relations: ['user'],
    });
    if (dbSub) {
      dbSub.status =
        (stripeSubscription.status as string) === 'active'
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.CANCELLED;
      dbSub.endDate = new Date((stripeSubscription.current_period_end as number) * 1000);
      await this.subscriptionRepository.save(dbSub);
    }
  }

  private async handleSubscriptionCancelled(
    stripeSubscription: Record<string, unknown>,
  ): Promise<void> {
    const dbSub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id as string },
      relations: ['user'],
    });
    if (dbSub) {
      dbSub.status = SubscriptionStatus.CANCELLED;
      await this.subscriptionRepository.save(dbSub);

      // Downgrade user role if no active subscriptions remain
      const activeSubs = await this.subscriptionRepository.count({
        where: {
          user: { id: dbSub.user.id },
          status: SubscriptionStatus.ACTIVE,
        },
      });
      if (activeSubs === 0) {
        await this.userRepository.update(dbSub.user.id, {
          role: Role.PROVIDER,
        });
      }
    }
  }

  async getTransactionByMission(missionId: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { mission: { id: missionId } },
      relations: ['mission', 'client', 'provider'],
    });
  }
}
