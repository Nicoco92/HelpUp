import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request } from 'express';
import { User } from './entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(req: RequestWithUser): Promise<Omit<User, "passwordHash">>;
    updateProfile(req: RequestWithUser, dto: UpdateProfileDto): Promise<User>;
    getPublicProfile(id: string): Promise<Omit<User, "passwordHash">>;
    updateLocation(req: RequestWithUser, lat: number, lng: number): Promise<{
        success: boolean;
    }>;
    updatePushToken(req: RequestWithUser, token: string): Promise<{
        success: boolean;
    }>;
    getAllSkills(): Promise<import("./entities/skill.entity").Skill[]>;
    setMySkills(req: RequestWithUser, skillIds: string[]): Promise<import("./entities/user-skill.entity").UserSkill[]>;
    submitKyc(req: RequestWithUser, documentType: string, documentUrl: string): Promise<import("./entities/kyc-document.entity").KycDocument>;
    getMyKycDocuments(req: RequestWithUser): Promise<import("./entities/kyc-document.entity").KycDocument[]>;
    reviewKyc(documentId: string, approved: boolean, rejectionReason?: string): Promise<import("./entities/kyc-document.entity").KycDocument>;
    generateReferralCode(req: RequestWithUser): Promise<{
        referralCode: string;
    }>;
}
export {};
