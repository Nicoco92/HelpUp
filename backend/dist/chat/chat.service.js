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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const chat_participant_entity_1 = require("./entities/chat-participant.entity");
const message_entity_1 = require("./entities/message.entity");
const message_type_enum_1 = require("./enums/message-type.enum");
let ChatService = class ChatService {
    chatRoomRepository;
    participantRepository;
    messageRepository;
    constructor(chatRoomRepository, participantRepository, messageRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
    }
    async createRoomForMission(mission, client, provider) {
        const existing = await this.chatRoomRepository.findOne({
            where: { mission: { id: mission.id } },
        });
        if (existing) {
            return existing;
        }
        const chatRoom = this.chatRoomRepository.create({
            mission,
        });
        const savedRoom = await this.chatRoomRepository.save(chatRoom);
        const clientParticipant = this.participantRepository.create({
            chatRoom: savedRoom,
            user: client,
        });
        const providerParticipant = this.participantRepository.create({
            chatRoom: savedRoom,
            user: provider,
        });
        await this.participantRepository.save([clientParticipant, providerParticipant]);
        await this.sendMessage(savedRoom.id, client.id, 'La mission a été assignée. Vous pouvez maintenant discuter des détails.', message_type_enum_1.MessageType.SYSTEM);
        return this.chatRoomRepository.findOne({
            where: { id: savedRoom.id },
            relations: ['participants', 'participants.user', 'mission'],
        });
    }
    async findRoomById(roomId) {
        const room = await this.chatRoomRepository.findOne({
            where: { id: roomId },
            relations: ['participants', 'participants.user', 'mission'],
        });
        if (!room) {
            throw new common_1.NotFoundException('Chat room not found');
        }
        return room;
    }
    async findRoomByMission(missionId) {
        const room = await this.chatRoomRepository.findOne({
            where: { mission: { id: missionId } },
            relations: ['participants', 'participants.user'],
        });
        if (!room) {
            throw new common_1.NotFoundException('Chat room not found for this mission');
        }
        return room;
    }
    async findUserRooms(userId) {
        const participants = await this.participantRepository.find({
            where: { user: { id: userId } },
            relations: ['chatRoom', 'chatRoom.mission', 'chatRoom.participants', 'chatRoom.participants.user'],
        });
        return participants.map((p) => p.chatRoom);
    }
    async sendMessage(chatRoomId, senderId, content, type = message_type_enum_1.MessageType.TEXT) {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ['participants', 'participants.user'],
        });
        if (!chatRoom) {
            throw new common_1.NotFoundException('Chat room not found');
        }
        if (type !== message_type_enum_1.MessageType.SYSTEM) {
            const isParticipant = chatRoom.participants.some((p) => p.user.id === senderId);
            if (!isParticipant) {
                throw new common_1.ForbiddenException('You are not a participant of this chat');
            }
        }
        const message = this.messageRepository.create({
            chatRoom,
            sender: { id: senderId },
            content,
            type,
        });
        return this.messageRepository.save(message);
    }
    async getMessages(chatRoomId, userId, limit = 50, beforeId) {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ['participants', 'participants.user'],
        });
        if (!chatRoom) {
            throw new common_1.NotFoundException('Chat room not found');
        }
        const isParticipant = chatRoom.participants.some((p) => p.user.id === userId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not a participant of this chat');
        }
        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.chatRoomId = :chatRoomId', { chatRoomId })
            .orderBy('message.createdAt', 'DESC')
            .take(limit);
        if (beforeId) {
            const beforeMessage = await this.messageRepository.findOne({
                where: { id: beforeId },
            });
            if (beforeMessage) {
                queryBuilder.andWhere('message.createdAt < :before', {
                    before: beforeMessage.createdAt,
                });
            }
        }
        const messages = await queryBuilder.getMany();
        return messages.reverse();
    }
    async markAsRead(chatRoomId, userId) {
        const participant = await this.participantRepository.findOne({
            where: {
                chatRoom: { id: chatRoomId },
                user: { id: userId },
            },
        });
        if (participant) {
            participant.lastReadAt = new Date();
            await this.participantRepository.save(participant);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map