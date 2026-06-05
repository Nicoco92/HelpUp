import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';
import { MessageType } from '../enums/message-type.enum';
export declare class Message {
    id: string;
    chatRoom: ChatRoom;
    sender: User;
    content: string;
    type: MessageType;
    createdAt: Date;
}
