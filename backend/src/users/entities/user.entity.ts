import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { KycStatus } from '../enums/kyc-status.enum';
import { AccountStatus } from '../enums/account-status.enum';
import { UserSkill } from './user-skill.entity';
import { KycDocument } from './kyc-document.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  // --- Provider Profile ---
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  profilePictureUrl: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_SUBMITTED,
  })
  kycStatus: KycStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  completedMissions: number;

  // --- Geolocation ---
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: object;

  @Column({ nullable: true })
  defaultAddress: string;

  // --- Stripe ---
  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  // --- Referral ---
  @Column({ unique: true, nullable: true })
  referralCode: string;

  // --- Expo Push Notifications ---
  @Column({ nullable: true })
  expoPushToken: string;

  // --- Relations ---
  @OneToMany(() => UserSkill, (us) => us.user, { cascade: true })
  skills: UserSkill[];

  @OneToMany(() => KycDocument, (kyc) => kyc.user, { cascade: true })
  kycDocuments: KycDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
