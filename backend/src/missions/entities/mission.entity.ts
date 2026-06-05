import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MissionStatus } from '../enums/mission-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { MissionCategory } from './mission-category.entity';
import { MissionApplication } from './mission-application.entity';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => MissionCategory, { eager: true })
  category: MissionCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.STRIPE,
  })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => User, { eager: true })
  client: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  provider: User;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.DRAFT,
  })
  status: MissionStatus;

  // --- Location ---
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: object;

  @Column({ nullable: true })
  address: string;

  // --- Scheduling ---
  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDurationMinutes: number;

  // --- Relations ---
  @OneToMany(() => MissionApplication, (a) => a.mission, { cascade: true })
  applications: MissionApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
