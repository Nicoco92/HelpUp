import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { MessageType } from './enums/message-type.enum';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
export declare class ChatService {
    private chatRoomRepository;
    private participantRepository;
    private messageRepository;
    constructor(chatRoomRepository: Repository<ChatRoom>, participantRepository: Repository<ChatParticipant>, messageRepository: Repository<Message>);
    createRoomForMission(mission: Mission, client: User, provider: User): Promise<ChatRoom>;
    findRoomById(roomId: string): Promise<ChatRoom>;
    findRoomByMission(missionId: string): Promise<ChatRoom>;
    findUserRooms(userId: string): Promise<ChatRoom[]>;
    sendMessage(chatRoomId: string, senderId: string, content: string, type?: MessageType): Promise<Message>;
    getMessages(chatRoomId: string, userId: string, limit?: number, beforeId?: string): Promise<Message[]>;
    markAsRead(chatRoomId: string, userId: string): Promise<void>;
}
