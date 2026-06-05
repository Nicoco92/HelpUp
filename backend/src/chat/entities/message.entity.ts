import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';
import { MessageType } from '../enums/message-type.enum';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatRoom, (cr) => cr.messages, { onDelete: 'CASCADE' })
  chatRoom: ChatRoom;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @CreateDateColumn()
  createdAt: Date;
}
