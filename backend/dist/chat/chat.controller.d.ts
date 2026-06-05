import { ChatService } from './chat.service';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyRooms(req: RequestWithUser): Promise<import("./entities/chat-room.entity").ChatRoom[]>;
    getRoom(id: string): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getRoomByMission(missionId: string): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getMessages(id: string, req: RequestWithUser, limit?: number, before?: string): Promise<import("./entities/message.entity").Message[]>;
}
export {};
