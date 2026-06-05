import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from './mission.entity';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('mission_applications')
export class MissionApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, (m) => m.applications, { onDelete: 'CASCADE' })
  mission: Mission;

  @ManyToOne(() => User, { eager: true })
  provider: User;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
