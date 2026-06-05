import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageType } from './enums/message-type.enum';
interface TypingPayload {
    chatRoomId: string;
    userId: string;
    isTyping: boolean;
}
interface SendMessagePayload {
    chatRoomId: string;
    senderId: string;
    content: string;
    type?: MessageType;
}
interface JoinRoomPayload {
    chatRoomId: string;
    userId: string;
}
interface MarkReadPayload {
    chatRoomId: string;
    userId: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, payload: JoinRoomPayload): Promise<void>;
    handleLeaveRoom(client: Socket, payload: JoinRoomPayload): Promise<void>;
    handleSendMessage(client: Socket, payload: SendMessagePayload): Promise<void>;
    handleTyping(client: Socket, payload: TypingPayload): void;
    handleMarkRead(client: Socket, payload: MarkReadPayload): Promise<void>;
}
export {};
