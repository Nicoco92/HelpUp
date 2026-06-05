import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_participants')
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatRoom, (cr) => cr.participants, { onDelete: 'CASCADE' })
  chatRoom: ChatRoom;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'timestamptz', nullable: true })
  lastReadAt: Date;
}
