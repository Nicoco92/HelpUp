import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { Subscription } from './entities/subscription.entity';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
export declare class PaymentsService {
    private configService;
    private transactionRepository;
    private subscriptionRepository;
    private referralRepository;
    private userRepository;
    private missionRepository;
    private stripe;
    private readonly logger;
    constructor(configService: ConfigService, transactionRepository: Repository<Transaction>, subscriptionRepository: Repository<Subscription>, referralRepository: Repository<Referral>, userRepository: Repository<User>, missionRepository: Repository<Mission>);
    createPaymentHold(mission: Mission, client: User, provider: User): Promise<Transaction>;
    capturePayment(missionId: string): Promise<Transaction>;
    getPaymentIntentClientSecret(missionId: string): Promise<string>;
    createConnectAccount(user: User): Promise<string>;
    createCustomer(user: User): Promise<string>;
    handleWebhook(signature: string, body: Buffer): Promise<void>;
    createPremiumSubscription(user: User, priceId: string): Promise<{
        subscriptionId: string;
        clientSecret: string;
    }>;
    grantReferralPremium(userId: string): Promise<Subscription>;
    processReferral(referralCode: string, newUser: User): Promise<void>;
    private handleSubscriptionUpdate;
    private handleSubscriptionCancelled;
    getTransactionByMission(missionId: string): Promise<Transaction | null>;
}
