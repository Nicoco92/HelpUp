import { User } from '../../users/entities/user.entity';
import { Mission } from './mission.entity';
import { ApplicationStatus } from '../enums/application-status.enum';
export declare class MissionApplication {
    id: string;
    mission: Mission;
    provider: User;
    status: ApplicationStatus;
    coverMessage: string;
    createdAt: Date;
}
