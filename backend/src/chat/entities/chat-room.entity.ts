import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Mission)
  @JoinColumn()
  mission: Mission;

  @OneToMany(() => ChatParticipant, (cp) => cp.chatRoom, { cascade: true, eager: true })
  participants: ChatParticipant[];

  @OneToMany(() => Message, (m) => m.chatRoom)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
