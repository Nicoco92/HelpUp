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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const Stripe = require("stripe");
const transaction_entity_1 = require("./entities/transaction.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const referral_entity_1 = require("./entities/referral.entity");
const transaction_status_enum_1 = require("./enums/transaction-status.enum");
const subscription_status_enum_1 = require("./enums/subscription-status.enum");
const payment_method_enum_1 = require("../missions/enums/payment-method.enum");
const user_entity_1 = require("../users/entities/user.entity");
const mission_entity_1 = require("../missions/entities/mission.entity");
const mission_status_enum_1 = require("../missions/enums/mission-status.enum");
const role_enum_1 = require("../users/enums/role.enum");
const DEFAULT_COMMISSION_RATE = 0.15;
let PaymentsService = PaymentsService_1 = class PaymentsService {
    configService;
    transactionRepository;
    subscriptionRepository;
    referralRepository;
    userRepository;
    missionRepository;
    stripe;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(configService, transactionRepository, subscriptionRepository, referralRepository, userRepository, missionRepository) {
        this.configService = configService;
        this.transactionRepository = transactionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
        this.missionRepository = missionRepository;
        const secret = this.configService.get('STRIPE_SECRET_KEY') || '';
        this.stripe = new Stripe(secret);
    }
    async createPaymentHold(mission, client, provider) {
        const commissionRate = DEFAULT_COMMISSION_RATE;
        const totalAmount = Number(mission.price);
        const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100;
        const providerAmount = totalAmount - commissionAmount;
        const holdAmount = mission.paymentMethod === payment_method_enum_1.PaymentMethod.STRIPE
            ? totalAmount
            : commissionAmount;
        let stripePaymentIntentId;
        if (client.stripeCustomerId) {
            try {
                const paymentIntent = await this.stripe.paymentIntents.create({
                    amount: Math.round(holdAmount * 100),
                    currency: 'eur',
                    customer: client.stripeCustomerId,
                    capture_method: 'manual',
                    metadata: {
                        missionId: mission.id,
                        paymentMethod: mission.paymentMethod,
                        commissionRate: commissionRate.toString(),
                    },
                });
                stripePaymentIntentId = paymentIntent.id;
            }
            catch (error) {
                this.logger.error(`Stripe hold failed: ${error instanceof Error ? error.message : 'Unknown'}`);
                throw new common_1.BadRequestException('Payment hold failed');
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
            status: transaction_status_enum_1.TransactionStatus.HOLD,
            stripePaymentIntentId,
        });
        return this.transactionRepository.save(transaction);
    }
    async capturePayment(missionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { mission: { id: missionId } },
            relations: ['mission', 'provider'],
        });
        if (!transaction) {
            throw new common_1.BadRequestException('No transaction found for this mission');
        }
        if (transaction.status !== transaction_status_enum_1.TransactionStatus.HOLD) {
            throw new common_1.BadRequestException('Transaction is not in HOLD status');
        }
        if (transaction.stripePaymentIntentId) {
            try {
                await this.stripe.paymentIntents.capture(transaction.stripePaymentIntentId);
                if (transaction.paymentMethod === payment_method_enum_1.PaymentMethod.STRIPE &&
                    transaction.provider.stripeAccountId) {
                    const transfer = await this.stripe.transfers.create({
                        amount: Math.round(Number(transaction.providerAmount) * 100),
                        currency: 'eur',
                        destination: transaction.provider.stripeAccountId,
                        metadata: { missionId },
                    });
                    transaction.stripeTransferId = transfer.id;
                }
            }
            catch (error) {
                this.logger.error(`Stripe capture failed: ${error instanceof Error ? error.message : 'Unknown'}`);
                transaction.status = transaction_status_enum_1.TransactionStatus.FAILED;
                await this.transactionRepository.save(transaction);
                throw new common_1.BadRequestException('Payment capture failed');
            }
        }
        transaction.status =
            transaction.paymentMethod === payment_method_enum_1.PaymentMethod.ON_SITE
                ? transaction_status_enum_1.TransactionStatus.COMMISSION_ONLY
                : transaction_status_enum_1.TransactionStatus.CAPTURED;
        const saved = await this.transactionRepository.save(transaction);
        await this.missionRepository.update(missionId, {
            status: mission_status_enum_1.MissionStatus.PAID,
        });
        await this.userRepository.increment({ id: transaction.provider.id }, 'completedMissions', 1);
        return saved;
    }
    async getPaymentIntentClientSecret(missionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { mission: { id: missionId } },
        });
        if (!transaction || !transaction.stripePaymentIntentId) {
            throw new common_1.BadRequestException('No payment intent found');
        }
        const pi = await this.stripe.paymentIntents.retrieve(transaction.stripePaymentIntentId);
        return pi.client_secret || '';
    }
    async createConnectAccount(user) {
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
        const accountLink = await this.stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${this.configService.get('APP_URL') || 'http://localhost:3000'}/stripe/refresh`,
            return_url: `${this.configService.get('APP_URL') || 'http://localhost:3000'}/stripe/return`,
            type: 'account_onboarding',
        });
        return accountLink.url;
    }
    async createCustomer(user) {
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
    async handleWebhook(signature, body) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
        if (!webhookSecret) {
            throw new Error('Stripe Webhook Secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown'}`);
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
                await this.transactionRepository.update({ stripePaymentIntentId: failedIntent.id }, { status: transaction_status_enum_1.TransactionStatus.FAILED });
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
    async createPremiumSubscription(user, priceId) {
        if (!user.stripeCustomerId) {
            throw new common_1.BadRequestException('User has no Stripe customer ID');
        }
        const subscription = await this.stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
            metadata: { userId: user.id },
        });
        const dbSubscription = this.subscriptionRepository.create({
            user,
            status: subscription_status_enum_1.SubscriptionStatus.ACTIVE,
            stripeSubscriptionId: subscription.id,
            startDate: new Date((subscription.current_period_start) * 1000),
            endDate: new Date((subscription.current_period_end) * 1000),
            fromReferral: false,
        });
        await this.subscriptionRepository.save(dbSubscription);
        await this.userRepository.update(user.id, {
            role: role_enum_1.Role.PREMIUM_PROVIDER,
        });
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice.payment_intent;
        return {
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret || '',
        };
    }
    async grantReferralPremium(userId) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        const subscription = this.subscriptionRepository.create({
            user: { id: userId },
            status: subscription_status_enum_1.SubscriptionStatus.TRIAL,
            startDate: now,
            endDate,
            fromReferral: true,
        });
        const saved = await this.subscriptionRepository.save(subscription);
        await this.userRepository.update(userId, {
            role: role_enum_1.Role.PREMIUM_PROVIDER,
        });
        return saved;
    }
    async processReferral(referralCode, newUser) {
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
        await this.grantReferralPremium(newUser.id);
        const referralCount = await this.referralRepository.count({
            where: { referrer: { id: referrer.id } },
        });
        if (referralCount % 3 === 0) {
            await this.grantReferralPremium(referrer.id);
            await this.referralRepository.update({ referrer: { id: referrer.id }, rewardClaimed: false }, { rewardClaimed: true });
        }
    }
    async handleSubscriptionUpdate(stripeSubscription) {
        const dbSub = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id },
            relations: ['user'],
        });
        if (dbSub) {
            dbSub.status =
                stripeSubscription.status === 'active'
                    ? subscription_status_enum_1.SubscriptionStatus.ACTIVE
                    : subscription_status_enum_1.SubscriptionStatus.CANCELLED;
            dbSub.endDate = new Date(stripeSubscription.current_period_end * 1000);
            await this.subscriptionRepository.save(dbSub);
        }
    }
    async handleSubscriptionCancelled(stripeSubscription) {
        const dbSub = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id },
            relations: ['user'],
        });
        if (dbSub) {
            dbSub.status = subscription_status_enum_1.SubscriptionStatus.CANCELLED;
            await this.subscriptionRepository.save(dbSub);
            const activeSubs = await this.subscriptionRepository.count({
                where: {
                    user: { id: dbSub.user.id },
                    status: subscription_status_enum_1.SubscriptionStatus.ACTIVE,
                },
            });
            if (activeSubs === 0) {
                await this.userRepository.update(dbSub.user.id, {
                    role: role_enum_1.Role.PROVIDER,
                });
            }
        }
    }
    async getTransactionByMission(missionId) {
        return this.transactionRepository.findOne({
            where: { mission: { id: missionId } },
            relations: ['mission', 'client', 'provider'],
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(3, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map