import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionStatus } from './enums/mission-status.enum';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class MissionsController {
    private readonly missionsService;
    constructor(missionsService: MissionsService);
    getCategories(): Promise<import("./entities/mission-category.entity").MissionCategory[]>;
    create(createMissionDto: CreateMissionDto, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
    findAll(status?: MissionStatus): Promise<import("./entities/mission.entity").Mission[]>;
    findPublished(): Promise<import("./entities/mission.entity").Mission[]>;
    findMyMissions(req: RequestWithUser): Promise<import("./entities/mission.entity").Mission[]>;
    findNearby(lat: number, lng: number, radius?: number): Promise<import("./entities/mission.entity").Mission[]>;
    findById(id: string): Promise<import("./entities/mission.entity").Mission>;
    publish(id: string, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
    start(id: string, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
    complete(id: string, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
    cancel(id: string, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
    apply(id: string, coverMessage: string, req: RequestWithUser): Promise<import("./entities/mission-application.entity").MissionApplication>;
    getApplications(id: string): Promise<import("./entities/mission-application.entity").MissionApplication[]>;
    acceptApplication(id: string, appId: string, req: RequestWithUser): Promise<import("./entities/mission.entity").Mission>;
}
export {};
