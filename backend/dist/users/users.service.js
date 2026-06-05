"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const skill_entity_1 = require("./entities/skill.entity");
const user_skill_entity_1 = require("./entities/user-skill.entity");
const kyc_document_entity_1 = require("./entities/kyc-document.entity");
const kyc_status_enum_1 = require("./enums/kyc-status.enum");
let UsersService = class UsersService {
    usersRepository;
    skillsRepository;
    userSkillsRepository;
    kycDocumentRepository;
    constructor(usersRepository, skillsRepository, userSkillsRepository, kycDocumentRepository) {
        this.usersRepository = usersRepository;
        this.skillsRepository = skillsRepository;
        this.userSkillsRepository = userSkillsRepository;
        this.kycDocumentRepository = kycDocumentRepository;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async findById(id) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['skills', 'skills.skill'],
        });
    }
    async getPublicProfile(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['skills', 'skills.skill'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash: _, ...profile } = user;
        return profile;
    }
    async updateProfile(userId, dto) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.bio !== undefined)
            user.bio = dto.bio;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        if (dto.defaultAddress !== undefined)
            user.defaultAddress = dto.defaultAddress;
        if (dto.profilePictureUrl !== undefined)
            user.profilePictureUrl = dto.profilePictureUrl;
        return this.usersRepository.save(user);
    }
    async updateLocation(userId, lat, lng) {
        await this.usersRepository
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({
            location: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`,
        })
            .where('id = :id', { id: userId })
            .execute();
    }
    async updatePushToken(userId, token) {
        await this.usersRepository.update(userId, { expoPushToken: token });
    }
    async getAllSkills() {
        return this.skillsRepository.find({ order: { name: 'ASC' } });
    }
    async setUserSkills(userId, skillIds) {
        await this.userSkillsRepository.delete({ user: { id: userId } });
        const userSkills = skillIds.map((skillId) => this.userSkillsRepository.create({
            user: { id: userId },
            skill: { id: skillId },
        }));
        return this.userSkillsRepository.save(userSkills);
    }
    async submitKycDocument(userId, documentType, documentUrl) {
        const doc = this.kycDocumentRepository.create({
            user: { id: userId },
            documentType,
            documentUrl,
            status: kyc_status_enum_1.KycStatus.PENDING,
        });
        const saved = await this.kycDocumentRepository.save(doc);
        await this.usersRepository.update(userId, {
            kycStatus: kyc_status_enum_1.KycStatus.PENDING,
        });
        return saved;
    }
    async reviewKycDocument(documentId, approved, rejectionReason) {
        const doc = await this.kycDocumentRepository.findOne({
            where: { id: documentId },
            relations: ['user'],
        });
        if (!doc) {
            throw new common_1.NotFoundException('KYC document not found');
        }
        doc.status = approved ? kyc_status_enum_1.KycStatus.APPROVED : kyc_status_enum_1.KycStatus.REJECTED;
        doc.rejectionReason = rejectionReason || null;
        const saved = await this.kycDocumentRepository.save(doc);
        if (approved) {
            await this.usersRepository.update(doc.user.id, {
                kycStatus: kyc_status_enum_1.KycStatus.APPROVED,
            });
        }
        else {
            await this.usersRepository.update(doc.user.id, {
                kycStatus: kyc_status_enum_1.KycStatus.REJECTED,
            });
        }
        return saved;
    }
    async getUserKycDocuments(userId) {
        return this.kycDocumentRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }
    async generateReferralCode(userId) {
        const code = `HELPUP-${userId.substring(0, 8).toUpperCase()}`;
        await this.usersRepository.update(userId, { referralCode: code });
        return code;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __param(2, (0, typeorm_1.InjectRepository)(user_skill_entity_1.UserSkill)),
    __param(3, (0, typeorm_1.InjectRepository)(kyc_document_entity_1.KycDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map