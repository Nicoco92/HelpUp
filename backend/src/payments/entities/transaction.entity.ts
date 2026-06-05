import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { PaymentMethod } from '../../missions/enums/payment-method.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Mission)
  @JoinColumn()
  mission: Mission;

  @ManyToOne(() => User)
  client: User;

  @ManyToOne(() => User)
  provider: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  commissionAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  providerAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.HOLD,
  })
  status: TransactionStatus;

  // --- Stripe IDs ---
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeTransferId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
