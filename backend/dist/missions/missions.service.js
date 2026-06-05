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
exports.MissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("./entities/mission.entity");
const mission_application_entity_1 = require("./entities/mission-application.entity");
const mission_category_entity_1 = require("./entities/mission-category.entity");
const user_entity_1 = require("../users/entities/user.entity");
const mission_status_enum_1 = require("./enums/mission-status.enum");
const application_status_enum_1 = require("./enums/application-status.enum");
const role_enum_1 = require("../users/enums/role.enum");
const ALLOWED_TRANSITIONS = {
    [mission_status_enum_1.MissionStatus.DRAFT]: [mission_status_enum_1.MissionStatus.PUBLISHED, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.PUBLISHED]: [mission_status_enum_1.MissionStatus.PENDING_VALIDATION, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.PENDING_VALIDATION]: [mission_status_enum_1.MissionStatus.ASSIGNED, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.ASSIGNED]: [mission_status_enum_1.MissionStatus.IN_PROGRESS, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.IN_PROGRESS]: [mission_status_enum_1.MissionStatus.COMPLETED, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.COMPLETED]: [mission_status_enum_1.MissionStatus.PAID],
    [mission_status_enum_1.MissionStatus.PAID]: [],
    [mission_status_enum_1.MissionStatus.CANCELLED]: [],
};
let MissionsService = class MissionsService {
    missionsRepository;
    applicationsRepository;
    categoriesRepository;
    constructor(missionsRepository, applicationsRepository, categoriesRepository) {
        this.missionsRepository = missionsRepository;
        this.applicationsRepository = applicationsRepository;
        this.categoriesRepository = categoriesRepository;
    }
    async findAllCategories() {
        return this.categoriesRepository.find();
    }
    async create(createMissionDto, client) {
        const category = await this.categoriesRepository.findOne({
            where: { id: createMissionDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const wktLocation = `POINT(${createMissionDto.lng} ${createMissionDto.lat})`;
        const mission = this.missionsRepository.create({
            title: createMissionDto.title,
            description: createMissionDto.description,
            price: createMissionDto.price,
            category,
            client,
            location: () => `ST_SetSRID(ST_GeomFromText('${wktLocation}'), 4326)`,
            address: createMissionDto.address,
            scheduledAt: createMissionDto.scheduledAt
                ? new Date(createMissionDto.scheduledAt)
                : undefined,
            estimatedDurationMinutes: createMissionDto.estimatedDurationMinutes,
            paymentMethod: createMissionDto.paymentMethod,
            status: mission_status_enum_1.MissionStatus.DRAFT,
        });
        return this.missionsRepository.save(mission);
    }
    async findById(id) {
        const mission = await this.missionsRepository.findOne({
            where: { id },
            relations: ['applications', 'applications.provider', 'category', 'client', 'provider'],
        });
        if (!mission) {
            throw new common_1.NotFoundException('Mission not found');
        }
        return mission;
    }
    async findAll(status) {
        const where = status ? { status } : {};
        return this.missionsRepository.find({
            where,
            relations: ['category', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByClient(clientId) {
        return this.missionsRepository.find({
            where: { client: { id: clientId } },
            relations: ['category', 'provider'],
            order: { createdAt: 'DESC' },
        });
    }
    async findPublished() {
        return this.missionsRepository.find({
            where: { status: (0, typeorm_2.In)([mission_status_enum_1.MissionStatus.PUBLISHED, mission_status_enum_1.MissionStatus.PENDING_VALIDATION]) },
            relations: ['category', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findNearby(lat, lng, radiusKm) {
        return this.missionsRepository
            .createQueryBuilder('mission')
            .leftJoinAndSelect('mission.category', 'category')
            .leftJoinAndSelect('mission.client', 'client')
            .where('mission.status IN (:...statuses)', {
            statuses: [mission_status_enum_1.MissionStatus.PUBLISHED, mission_status_enum_1.MissionStatus.PENDING_VALIDATION],
        })
            .andWhere(`ST_DWithin(
          mission.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`, {
            lng,
            lat,
            radius: radiusKm * 1000,
        })
            .orderBy('mission.createdAt', 'DESC')
            .getMany();
    }
    async findNearbyProviders(lat, lng, radiusKm) {
        const result = await this.missionsRepository.manager
            .createQueryBuilder(user_entity_1.User, 'user')
            .where('user.role IN (:...roles)', {
            roles: [role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER],
        })
            .andWhere('user."accountStatus" = :status', { status: 'ACTIVE' })
            .andWhere('user.location IS NOT NULL')
            .andWhere(`ST_DWithin(
          user.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`, { lng, lat, radius: radiusKm * 1000 })
            .orderBy(`CASE WHEN user.role = 'PREMIUM_PROVIDER' THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('user."averageRating"', 'DESC')
            .getMany();
        return result;
    }
    validateTransition(currentStatus, newStatus) {
        const allowed = ALLOWED_TRANSITIONS[currentStatus];
        if (!allowed || !allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
    async transitionStatus(missionId, newStatus, userId) {
        const mission = await this.findById(missionId);
        this.validateTransition(mission.status, newStatus);
        switch (newStatus) {
            case mission_status_enum_1.MissionStatus.PUBLISHED:
            case mission_status_enum_1.MissionStatus.CANCELLED:
                if (mission.client.id !== userId) {
                    throw new common_1.ForbiddenException('Only the client can perform this action');
                }
                break;
            case mission_status_enum_1.MissionStatus.IN_PROGRESS:
            case mission_status_enum_1.MissionStatus.COMPLETED:
                if (!mission.provider || mission.provider.id !== userId) {
                    throw new common_1.ForbiddenException('Only the assigned provider can perform this action');
                }
                break;
            default:
                break;
        }
        mission.status = newStatus;
        return this.missionsRepository.save(mission);
    }
    async apply(missionId, provider, coverMessage) {
        const mission = await this.missionsRepository.findOne({
            where: { id: missionId },
        });
        if (!mission ||
            (mission.status !== mission_status_enum_1.MissionStatus.PUBLISHED &&
                mission.status !== mission_status_enum_1.MissionStatus.PENDING_VALIDATION)) {
            throw new common_1.NotFoundException('Mission not found or not open for applications');
        }
        const existing = await this.applicationsRepository.findOne({
            where: {
                mission: { id: missionId },
                provider: { id: provider.id },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already applied to this mission');
        }
        const application = this.applicationsRepository.create({
            mission,
            provider,
            coverMessage,
        });
        const saved = await this.applicationsRepository.save(application);
        if (mission.status === mission_status_enum_1.MissionStatus.PUBLISHED) {
            mission.status = mission_status_enum_1.MissionStatus.PENDING_VALIDATION;
            await this.missionsRepository.save(mission);
        }
        return saved;
    }
    async getApplications(missionId) {
        return this.applicationsRepository.find({
            where: { mission: { id: missionId } },
            relations: ['provider'],
            order: { createdAt: 'ASC' },
        });
    }
    async acceptApplication(missionId, applicationId, client) {
        const mission = await this.missionsRepository.findOne({
            where: { id: missionId },
            relations: ['client'],
        });
        if (!mission || mission.client.id !== client.id) {
            throw new common_1.ForbiddenException('Not authorized');
        }
        if (mission.status !== mission_status_enum_1.MissionStatus.PENDING_VALIDATION) {
            throw new common_1.BadRequestException('Mission must be in PENDING_VALIDATION status to accept applications');
        }
        const application = await this.applicationsRepository.findOne({
            where: { id: applicationId },
            relations: ['provider'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        application.status = application_status_enum_1.ApplicationStatus.ACCEPTED;
        await this.applicationsRepository.save(application);
        await this.applicationsRepository
            .createQueryBuilder()
            .update(mission_application_entity_1.MissionApplication)
            .set({ status: application_status_enum_1.ApplicationStatus.REJECTED })
            .where('missionId = :missionId', { missionId })
            .andWhere('id != :applicationId', { applicationId })
            .andWhere('status = :pending', { pending: application_status_enum_1.ApplicationStatus.PENDING })
            .execute();
        mission.provider = application.provider;
        mission.status = mission_status_enum_1.MissionStatus.ASSIGNED;
        return this.missionsRepository.save(mission);
    }
};
exports.MissionsService = MissionsService;
exports.MissionsService = MissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_application_entity_1.MissionApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(mission_category_entity_1.MissionCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MissionsService);
//# sourceMappingURL=missions.service.js.map