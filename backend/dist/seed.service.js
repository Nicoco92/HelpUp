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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_category_entity_1 = require("./missions/entities/mission-category.entity");
const skill_entity_1 = require("./users/entities/skill.entity");
let SeedService = SeedService_1 = class SeedService {
    categoryRepository;
    skillRepository;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(categoryRepository, skillRepository) {
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }
    async onModuleInit() {
        await this.seedCategories();
        await this.seedSkills();
    }
    async seedCategories() {
        const categories = [
            { name: 'Déménagement', icon: 'truck', description: 'Aide au déménagement et transport de meubles' },
            { name: 'Courses', icon: 'shopping-cart', description: 'Faire les courses au supermarché ou en magasin' },
            { name: 'Bricolage', icon: 'tool', description: 'Petits travaux de bricolage et réparations' },
            { name: 'Jardinage', icon: 'leaf', description: 'Entretien de jardin, tonte, taille de haies' },
            { name: 'Garde d\'enfants', icon: 'baby', description: 'Babysitting et garde d\'enfants à domicile' },
            { name: 'Ménage', icon: 'home', description: 'Nettoyage et entretien de la maison' },
            { name: 'Repassage', icon: 'shirt', description: 'Repassage et entretien du linge' },
            { name: 'Aide aux devoirs', icon: 'book', description: 'Soutien scolaire et aide aux devoirs' },
            { name: 'Promenade d\'animaux', icon: 'paw', description: 'Promenade et garde d\'animaux de compagnie' },
            { name: 'Livraison', icon: 'package', description: 'Livraison de colis et courses urgentes' },
            { name: 'Informatique', icon: 'monitor', description: 'Aide informatique et dépannage' },
            { name: 'Autre', icon: 'more-horizontal', description: 'Autres services et missions diverses' },
        ];
        for (const cat of categories) {
            const existing = await this.categoryRepository.findOne({
                where: { name: cat.name },
            });
            if (!existing) {
                await this.categoryRepository.save(this.categoryRepository.create(cat));
                this.logger.log(`Seeded category: ${cat.name}`);
            }
        }
    }
    async seedSkills() {
        const skills = [
            { name: 'Bricolage', icon: 'tool', description: 'Réparations et petits travaux manuels' },
            { name: 'Jardinage', icon: 'leaf', description: 'Entretien d\'espaces verts' },
            { name: 'Cuisine', icon: 'chef-hat', description: 'Préparation de repas' },
            { name: 'Conduite', icon: 'car', description: 'Permis de conduire et véhicule' },
            { name: 'Informatique', icon: 'monitor', description: 'Maîtrise des outils informatiques' },
            { name: 'Langues', icon: 'globe', description: 'Maîtrise de langues étrangères' },
            { name: 'Ménage', icon: 'sparkles', description: 'Nettoyage et entretien' },
            { name: 'Garde d\'enfants', icon: 'baby', description: 'Expérience avec les enfants' },
            { name: 'Animaux', icon: 'paw', description: 'Expérience avec les animaux' },
            { name: 'Sport', icon: 'dumbbell', description: 'Coaching sportif et aide physique' },
            { name: 'Peinture', icon: 'paintbrush', description: 'Peinture intérieure et extérieure' },
            { name: 'Déménagement', icon: 'truck', description: 'Port de charges lourdes' },
        ];
        for (const skill of skills) {
            const existing = await this.skillRepository.findOne({
                where: { name: skill.name },
            });
            if (!existing) {
                await this.skillRepository.save(this.skillRepository.create(skill));
                this.logger.log(`Seeded skill: ${skill.name}`);
            }
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_category_entity_1.MissionCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map