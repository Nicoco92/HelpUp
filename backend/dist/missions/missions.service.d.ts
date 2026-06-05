import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { MissionApplication } from './entities/mission-application.entity';
import { MissionCategory } from './entities/mission-category.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { User } from '../users/entities/user.entity';
import { MissionStatus } from './enums/mission-status.enum';
export declare class MissionsService {
    private missionsRepository;
    private applicationsRepository;
    private categoriesRepository;
    constructor(missionsRepository: Repository<Mission>, applicationsRepository: Repository<MissionApplication>, categoriesRepository: Repository<MissionCategory>);
    findAllCategories(): Promise<MissionCategory[]>;
    create(createMissionDto: CreateMissionDto, client: User): Promise<Mission>;
    findById(id: string): Promise<Mission>;
    findAll(status?: MissionStatus): Promise<Mission[]>;
    findByClient(clientId: string): Promise<Mission[]>;
    findPublished(): Promise<Mission[]>;
    findNearby(lat: number, lng: number, radiusKm: number): Promise<Mission[]>;
    findNearbyProviders(lat: number, lng: number, radiusKm: number): Promise<User[]>;
    private validateTransition;
    transitionStatus(missionId: string, newStatus: MissionStatus, userId: string): Promise<Mission>;
    apply(missionId: string, provider: User, coverMessage?: string): Promise<MissionApplication>;
    getApplications(missionId: string): Promise<MissionApplication[]>;
    acceptApplication(missionId: string, applicationId: string, client: User): Promise<Mission>;
}
