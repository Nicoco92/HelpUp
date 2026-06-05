import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MissionCategory } from './missions/entities/mission-category.entity';
import { Skill } from './users/entities/skill.entity';
export declare class SeedService implements OnModuleInit {
    private categoryRepository;
    private skillRepository;
    private readonly logger;
    constructor(categoryRepository: Repository<MissionCategory>, skillRepository: Repository<Skill>);
    onModuleInit(): Promise<void>;
    private seedCategories;
    private seedSkills;
}
