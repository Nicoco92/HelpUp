import { PaymentMethod } from '../enums/payment-method.enum';
export declare class CreateMissionDto {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    lat: number;
    lng: number;
    address?: string;
    scheduledAt?: string;
    estimatedDurationMinutes?: number;
    paymentMethod?: PaymentMethod;
}
