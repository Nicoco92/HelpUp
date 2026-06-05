import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { UserSkill } from './entities/user-skill.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private usersRepository;
    private skillsRepository;
    private userSkillsRepository;
    private kycDocumentRepository;
    constructor(usersRepository: Repository<User>, skillsRepository: Repository<Skill>, userSkillsRepository: Repository<UserSkill>, kycDocumentRepository: Repository<KycDocument>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    getPublicProfile(userId: string): Promise<Omit<User, 'passwordHash'>>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>;
    updateLocation(userId: string, lat: number, lng: number): Promise<void>;
    updatePushToken(userId: string, token: string): Promise<void>;
    getAllSkills(): Promise<Skill[]>;
    setUserSkills(userId: string, skillIds: string[]): Promise<UserSkill[]>;
    submitKycDocument(userId: string, documentType: string, documentUrl: string): Promise<KycDocument>;
    reviewKycDocument(documentId: string, approved: boolean, rejectionReason?: string): Promise<KycDocument>;
    getUserKycDocuments(userId: string): Promise<KycDocument[]>;
    generateReferralCode(userId: string): Promise<string>;
}
