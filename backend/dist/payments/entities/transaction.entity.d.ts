import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { PaymentMethod } from '../../missions/enums/payment-method.enum';
export declare class Transaction {
    id: string;
    mission: Mission;
    client: User;
    provider: User;
    totalAmount: number;
    commissionAmount: number;
    providerAmount: number;
    commissionRate: number;
    paymentMethod: PaymentMethod;
    status: TransactionStatus;
    stripePaymentIntentId: string;
    stripeTransferId: string;
    createdAt: Date;
    updatedAt: Date;
}
