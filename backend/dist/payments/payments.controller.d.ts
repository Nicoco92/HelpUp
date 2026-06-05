import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { User } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    handleWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    createConnectAccount(req: RequestWithUser): Promise<{
        onboardingUrl: string;
    }>;
    createCustomer(req: RequestWithUser): Promise<{
        customerId: string;
    }>;
    getClientSecret(missionId: string): Promise<{
        clientSecret: string;
    }>;
    capturePayment(missionId: string): Promise<import("./entities/transaction.entity").Transaction>;
    getTransaction(missionId: string): Promise<import("./entities/transaction.entity").Transaction | null>;
    subscribePremium(req: RequestWithUser, priceId: string): Promise<{
        subscriptionId: string;
        clientSecret: string;
    }>;
}
export {};
