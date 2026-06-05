import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  referrer: User;

  @ManyToOne(() => User)
  referee: User;

  @Column({ type: 'boolean', default: false })
  rewardClaimed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
