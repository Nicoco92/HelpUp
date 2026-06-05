import { User } from './user.entity';
import { KycStatus } from '../enums/kyc-status.enum';
export declare class KycDocument {
    id: string;
    user: User;
    documentType: string;
    documentUrl: string;
    status: KycStatus;
    rejectionReason: string;
    createdAt: Date;
    updatedAt: Date;
}
