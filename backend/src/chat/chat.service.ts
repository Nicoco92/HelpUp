import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { MessageType } from './enums/message-type.enum';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private participantRepository: Repository<ChatParticipant>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  /**
   * Create a chat room for an assigned mission.
   * Called automatically when a mission transitions to ASSIGNED.
   */
  async createRoomForMission(mission: Mission, client: User, provider: User): Promise<ChatRoom> {
    // Check if room already exists
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

    // Add both participants
    const clientParticipant = this.participantRepository.create({
      chatRoom: savedRoom,
      user: client,
    });
    const providerParticipant = this.participantRepository.create({
      chatRoom: savedRoom,
      user: provider,
    });
    await this.participantRepository.save([clientParticipant, providerParticipant]);

    // Send system message
    await this.sendMessage(
      savedRoom.id,
      client.id,
      'La mission a été assignée. Vous pouvez maintenant discuter des détails.',
      MessageType.SYSTEM,
    );

    return this.chatRoomRepository.findOne({
      where: { id: savedRoom.id },
      relations: ['participants', 'participants.user', 'mission'],
    }) as Promise<ChatRoom>;
  }

  async findRoomById(roomId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants', 'participants.user', 'mission'],
    });
    if (!room) {
      throw new NotFoundException('Chat room not found');
    }
    return room;
  }

  async findRoomByMission(missionId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { mission: { id: missionId } },
      relations: ['participants', 'participants.user'],
    });
    if (!room) {
      throw new NotFoundException('Chat room not found for this mission');
    }
    return room;
  }

  async findUserRooms(userId: string): Promise<ChatRoom[]> {
    const participants = await this.participantRepository.find({
      where: { user: { id: userId } },
      relations: ['chatRoom', 'chatRoom.mission', 'chatRoom.participants', 'chatRoom.participants.user'],
    });
    return participants.map((p) => p.chatRoom);
  }

  async sendMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
  ): Promise<Message> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants', 'participants.user'],
    });
    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // Verify sender is a participant (unless system message)
    if (type !== MessageType.SYSTEM) {
      const isParticipant = chatRoom.participants.some(
        (p) => p.user.id === senderId,
      );
      if (!isParticipant) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    const message = this.messageRepository.create({
      chatRoom,
      sender: { id: senderId } as User,
      content,
      type,
    });

    return this.messageRepository.save(message);
  }

  async getMessages(
    chatRoomId: string,
    userId: string,
    limit: number = 50,
    beforeId?: string,
  ): Promise<Message[]> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants', 'participants.user'],
    });
    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const isParticipant = chatRoom.participants.some(
      (p) => p.user.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
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
    return messages.reverse(); // Return in chronological order
  }

  /**
   * Mark messages as read up to now.
   */
  async markAsRead(chatRoomId: string, userId: string): Promise<void> {
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
}
