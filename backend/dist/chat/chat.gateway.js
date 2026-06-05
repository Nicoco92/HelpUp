"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const message_type_enum_1 = require("./enums/message-type.enum");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    connectedUsers = new Map();
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            this.logger.log(`User ${userId} disconnected`);
        }
    }
    async handleJoinRoom(client, payload) {
        const { chatRoomId, userId } = payload;
        this.connectedUsers.set(client.id, userId);
        await client.join(chatRoomId);
        await this.chatService.markAsRead(chatRoomId, userId);
        client.to(chatRoomId).emit('user_joined', { userId, chatRoomId });
        this.logger.log(`User ${userId} joined room ${chatRoomId}`);
    }
    async handleLeaveRoom(client, payload) {
        const { chatRoomId, userId } = payload;
        await client.leave(chatRoomId);
        client.to(chatRoomId).emit('user_left', { userId, chatRoomId });
    }
    async handleSendMessage(client, payload) {
        const { chatRoomId, senderId, content, type } = payload;
        try {
            const message = await this.chatService.sendMessage(chatRoomId, senderId, content, type || message_type_enum_1.MessageType.TEXT);
            this.server.to(chatRoomId).emit('new_message', {
                id: message.id,
                chatRoomId,
                sender: message.sender,
                content: message.content,
                type: message.type,
                createdAt: message.createdAt,
            });
        }
        catch (error) {
            client.emit('error', {
                message: error instanceof Error ? error.message : 'Failed to send message',
            });
        }
    }
    handleTyping(client, payload) {
        const { chatRoomId, userId, isTyping } = payload;
        client.to(chatRoomId).emit('typing', { userId, isTyping });
    }
    async handleMarkRead(client, payload) {
        const { chatRoomId, userId } = payload;
        await this.chatService.markAsRead(chatRoomId, userId);
        client.to(chatRoomId).emit('messages_read', { userId, chatRoomId, readAt: new Date() });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map