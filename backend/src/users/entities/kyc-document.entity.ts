import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { KycStatus } from '../enums/kyc-status.enum';

@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.kycDocuments, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  documentType: string; // "id_card_front", "id_card_back", "passport"

  @Column()
  documentUrl: string; // S3 URL — access restricted to ADMIN role only

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  status: KycStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
