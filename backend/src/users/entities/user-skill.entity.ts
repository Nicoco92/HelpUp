import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Skill } from './skill.entity';

@Entity('user_skills')
export class UserSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.skills, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Skill, (s) => s.userSkills, { eager: true, onDelete: 'CASCADE' })
  skill: Skill;
}
