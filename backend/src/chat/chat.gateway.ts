import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    const { chatRoomId, userId } = payload;

    // Store user-socket mapping
    this.connectedUsers.set(client.id, userId);

    // Join the Socket.io room
    await client.join(chatRoomId);

    // Mark messages as read
    await this.chatService.markAsRead(chatRoomId, userId);

    // Notify other participants
    client.to(chatRoomId).emit('user_joined', { userId, chatRoomId });

    this.logger.log(`User ${userId} joined room ${chatRoomId}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    const { chatRoomId, userId } = payload;
    await client.leave(chatRoomId);
    client.to(chatRoomId).emit('user_left', { userId, chatRoomId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const { chatRoomId, senderId, content, type } = payload;

    try {
      const message = await this.chatService.sendMessage(
        chatRoomId,
        senderId,
        content,
        type || MessageType.TEXT,
      );

      // Broadcast to all participants in the room (including sender)
      this.server.to(chatRoomId).emit('new_message', {
        id: message.id,
        chatRoomId,
        sender: message.sender,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      });
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const { chatRoomId, userId, isTyping } = payload;
    client.to(chatRoomId).emit('typing', { userId, isTyping });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarkReadPayload,
  ): Promise<void> {
    const { chatRoomId, userId } = payload;
    await this.chatService.markAsRead(chatRoomId, userId);

    // Notify other participants about read status
    client.to(chatRoomId).emit('messages_read', { userId, chatRoomId, readAt: new Date() });
  }
}
