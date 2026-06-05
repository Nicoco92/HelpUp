import { Mission } from '../../missions/entities/mission.entity';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';
export declare class ChatRoom {
    id: string;
    mission: Mission;
    participants: ChatParticipant[];
    messages: Message[];
    createdAt: Date;
}
