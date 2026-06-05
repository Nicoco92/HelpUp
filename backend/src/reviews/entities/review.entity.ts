import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  mission: Mission;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => User, { eager: true })
  target: User;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
