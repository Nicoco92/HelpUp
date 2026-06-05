import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { UserSkill } from './entities/user-skill.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { KycStatus } from './enums/kyc-status.enum';
import { Role } from './enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillsRepository: Repository<UserSkill>,
    @InjectRepository(KycDocument)
    private kycDocumentRepository: Repository<KycDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['skills', 'skills.skill'],
    });
  }

  /**
   * Get a public profile (no sensitive data like passwordHash).
   */
  async getPublicProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['skills', 'skills.skill'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.defaultAddress !== undefined) user.defaultAddress = dto.defaultAddress;
    if (dto.profilePictureUrl !== undefined) user.profilePictureUrl = dto.profilePictureUrl;

    return this.usersRepository.save(user);
  }

  async updateLocation(
    userId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        location: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`,
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async updatePushToken(userId: string, token: string): Promise<void> {
    await this.usersRepository.update(userId, { expoPushToken: token });
  }

  // --- Skills ---

  async getAllSkills(): Promise<Skill[]> {
    return this.skillsRepository.find({ order: { name: 'ASC' } });
  }

  async setUserSkills(userId: string, skillIds: string[]): Promise<UserSkill[]> {
    // Remove existing skills
    await this.userSkillsRepository.delete({ user: { id: userId } });

    // Add new skills
    const userSkills = skillIds.map((skillId) =>
      this.userSkillsRepository.create({
        user: { id: userId } as User,
        skill: { id: skillId } as Skill,
      }),
    );

    return this.userSkillsRepository.save(userSkills);
  }

  // --- KYC ---

  async submitKycDocument(
    userId: string,
    documentType: string,
    documentUrl: string,
  ): Promise<KycDocument> {
    const doc = this.kycDocumentRepository.create({
      user: { id: userId } as User,
      documentType,
      documentUrl,
      status: KycStatus.PENDING,
    });

    const saved = await this.kycDocumentRepository.save(doc);

    // Update user KYC status to PENDING
    await this.usersRepository.update(userId, {
      kycStatus: KycStatus.PENDING,
    });

    return saved;
  }

  /**
   * Admin-only: approve or reject KYC document.
   */
  async reviewKycDocument(
    documentId: string,
    approved: boolean,
    rejectionReason?: string,
  ): Promise<KycDocument> {
    const doc = await this.kycDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });
    if (!doc) {
      throw new NotFoundException('KYC document not found');
    }

    doc.status = approved ? KycStatus.APPROVED : KycStatus.REJECTED;
    doc.rejectionReason = rejectionReason || null as unknown as string;

    const saved = await this.kycDocumentRepository.save(doc);

    // Update user KYC status
    if (approved) {
      await this.usersRepository.update(doc.user.id, {
        kycStatus: KycStatus.APPROVED,
      });
    } else {
      await this.usersRepository.update(doc.user.id, {
        kycStatus: KycStatus.REJECTED,
      });
    }

    return saved;
  }

  async getUserKycDocuments(userId: string): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Generate a unique referral code for a user.
   */
  async generateReferralCode(userId: string): Promise<string> {
    const code = `HELPUP-${userId.substring(0, 8).toUpperCase()}`;
    await this.usersRepository.update(userId, { referralCode: code });
    return code;
  }
}
