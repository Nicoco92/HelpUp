import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { MissionApplication } from './entities/mission-application.entity';
import { MissionCategory } from './entities/mission-category.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { User } from '../users/entities/user.entity';
import { MissionStatus } from './enums/mission-status.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { Role } from '../users/enums/role.enum';

/**
 * State machine: allowed transitions for mission status.
 * Maps each status to the set of statuses it can transition to.
 */
const ALLOWED_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  [MissionStatus.DRAFT]: [MissionStatus.PUBLISHED, MissionStatus.CANCELLED],
  [MissionStatus.PUBLISHED]: [MissionStatus.PENDING_VALIDATION, MissionStatus.CANCELLED],
  [MissionStatus.PENDING_VALIDATION]: [MissionStatus.ASSIGNED, MissionStatus.CANCELLED],
  [MissionStatus.ASSIGNED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
  [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED],
  [MissionStatus.COMPLETED]: [MissionStatus.PAID],
  [MissionStatus.PAID]: [],
  [MissionStatus.CANCELLED]: [],
};

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private missionsRepository: Repository<Mission>,
    @InjectRepository(MissionApplication)
    private applicationsRepository: Repository<MissionApplication>,
    @InjectRepository(MissionCategory)
    private categoriesRepository: Repository<MissionCategory>,
  ) {}

  // --- Categories ---

  async findAllCategories(): Promise<MissionCategory[]> {
    return this.categoriesRepository.find();
  }

  // --- Mission CRUD ---

  async create(
    createMissionDto: CreateMissionDto,
    client: User,
  ): Promise<Mission> {
    const category = await this.categoriesRepository.findOne({
      where: { id: createMissionDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
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
      status: MissionStatus.DRAFT,
    });

    return this.missionsRepository.save(mission);
  }

  async findById(id: string): Promise<Mission> {
    const mission = await this.missionsRepository.findOne({
      where: { id },
      relations: ['applications', 'applications.provider', 'category', 'client', 'provider'],
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  async findAll(status?: MissionStatus): Promise<Mission[]> {
    const where = status ? { status } : {};
    return this.missionsRepository.find({
      where,
      relations: ['category', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: string): Promise<Mission[]> {
    return this.missionsRepository.find({
      where: { client: { id: clientId } },
      relations: ['category', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublished(): Promise<Mission[]> {
    return this.missionsRepository.find({
      where: { status: In([MissionStatus.PUBLISHED, MissionStatus.PENDING_VALIDATION]) },
      relations: ['category', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- Geolocation (PostGIS) ---

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<Mission[]> {
    return this.missionsRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.category', 'category')
      .leftJoinAndSelect('mission.client', 'client')
      .where('mission.status IN (:...statuses)', {
        statuses: [MissionStatus.PUBLISHED, MissionStatus.PENDING_VALIDATION],
      })
      .andWhere(
        `ST_DWithin(
          mission.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        {
          lng,
          lat,
          radius: radiusKm * 1000, // Convert km to meters
        },
      )
      .orderBy('mission.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find nearby providers for a mission location (used for push notifications).
   */
  async findNearbyProviders(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<User[]> {
    const result = await this.missionsRepository.manager
      .createQueryBuilder(User, 'user')
      .where('user.role IN (:...roles)', {
        roles: [Role.PROVIDER, Role.PREMIUM_PROVIDER],
      })
      .andWhere('user."accountStatus" = :status', { status: 'ACTIVE' })
      .andWhere('user.location IS NOT NULL')
      .andWhere(
        `ST_DWithin(
          user.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        { lng, lat, radius: radiusKm * 1000 },
      )
      .orderBy(
        `CASE WHEN user.role = 'PREMIUM_PROVIDER' THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('user."averageRating"', 'DESC')
      .getMany();

    return result;
  }

  // --- State Machine ---

  private validateTransition(
    currentStatus: MissionStatus,
    newStatus: MissionStatus,
  ): void {
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async transitionStatus(
    missionId: string,
    newStatus: MissionStatus,
    userId: string,
  ): Promise<Mission> {
    const mission = await this.findById(missionId);

    this.validateTransition(mission.status, newStatus);

    // Authorization checks based on transition
    switch (newStatus) {
      case MissionStatus.PUBLISHED:
      case MissionStatus.CANCELLED:
        if (mission.client.id !== userId) {
          throw new ForbiddenException('Only the client can perform this action');
        }
        break;
      case MissionStatus.IN_PROGRESS:
      case MissionStatus.COMPLETED:
        if (!mission.provider || mission.provider.id !== userId) {
          throw new ForbiddenException('Only the assigned provider can perform this action');
        }
        break;
      default:
        break;
    }

    mission.status = newStatus;
    return this.missionsRepository.save(mission);
  }

  // --- Applications ---

  async apply(
    missionId: string,
    provider: User,
    coverMessage?: string,
  ): Promise<MissionApplication> {
    const mission = await this.missionsRepository.findOne({
      where: { id: missionId },
    });
    if (
      !mission ||
      (mission.status !== MissionStatus.PUBLISHED &&
        mission.status !== MissionStatus.PENDING_VALIDATION)
    ) {
      throw new NotFoundException('Mission not found or not open for applications');
    }

    // Check if provider already applied
    const existing = await this.applicationsRepository.findOne({
      where: {
        mission: { id: missionId },
        provider: { id: provider.id },
      },
    });
    if (existing) {
      throw new BadRequestException('You have already applied to this mission');
    }

    const application = this.applicationsRepository.create({
      mission,
      provider,
      coverMessage,
    });

    const saved = await this.applicationsRepository.save(application);

    // Auto-transition to PENDING_VALIDATION on first application
    if (mission.status === MissionStatus.PUBLISHED) {
      mission.status = MissionStatus.PENDING_VALIDATION;
      await this.missionsRepository.save(mission);
    }

    return saved;
  }

  async getApplications(missionId: string): Promise<MissionApplication[]> {
    return this.applicationsRepository.find({
      where: { mission: { id: missionId } },
      relations: ['provider'],
      order: { createdAt: 'ASC' },
    });
  }

  async acceptApplication(
    missionId: string,
    applicationId: string,
    client: User,
  ): Promise<Mission> {
    const mission = await this.missionsRepository.findOne({
      where: { id: missionId },
      relations: ['client'],
    });
    if (!mission || mission.client.id !== client.id) {
      throw new ForbiddenException('Not authorized');
    }

    if (mission.status !== MissionStatus.PENDING_VALIDATION) {
      throw new BadRequestException(
        'Mission must be in PENDING_VALIDATION status to accept applications',
      );
    }

    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['provider'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Accept the chosen application
    application.status = ApplicationStatus.ACCEPTED;
    await this.applicationsRepository.save(application);

    // Reject all other applications
    await this.applicationsRepository
      .createQueryBuilder()
      .update(MissionApplication)
      .set({ status: ApplicationStatus.REJECTED })
      .where('missionId = :missionId', { missionId })
      .andWhere('id != :applicationId', { applicationId })
      .andWhere('status = :pending', { pending: ApplicationStatus.PENDING })
      .execute();

    // Assign provider and transition to ASSIGNED
    mission.provider = application.provider;
    mission.status = MissionStatus.ASSIGNED;

    return this.missionsRepository.save(mission);
  }
}
