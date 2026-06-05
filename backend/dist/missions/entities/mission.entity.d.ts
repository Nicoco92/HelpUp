import { User } from '../../users/entities/user.entity';
import { MissionStatus } from '../enums/mission-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { MissionCategory } from './mission-category.entity';
import { MissionApplication } from './mission-application.entity';
export declare class Mission {
    id: string;
    title: string;
    description: string;
    category: MissionCategory;
    price: number;
    paymentMethod: PaymentMethod;
    client: User;
    provider: User;
    status: MissionStatus;
    location: object;
    address: string;
    scheduledAt: Date;
    estimatedDurationMinutes: number;
    applications: MissionApplication[];
    createdAt: Date;
    updatedAt: Date;
}
