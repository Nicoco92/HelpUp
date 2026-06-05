import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';
export declare class ChatParticipant {
    id: string;
    chatRoom: ChatRoom;
    user: User;
    lastReadAt: Date;
}
