import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionCategory } from './missions/entities/mission-category.entity';
import { Skill } from './users/entities/skill.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(MissionCategory)
    private categoryRepository: Repository<MissionCategory>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedCategories();
    await this.seedSkills();
  }

  private async seedCategories(): Promise<void> {
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

  private async seedSkills(): Promise<void> {
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
}
