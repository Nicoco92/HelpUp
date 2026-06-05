'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, UserCircle2 } from 'lucide-react';
import { initSocket, disconnectSocket, getSocket } from '@/services/socket';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;
  const currentUser = useAuthStore(state => state.user);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = initSocket();
    socket.connect();

    socket.emit('joinMission', { missionId });

    socket.on('message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('previousMessages', (msgs: Message[]) => {
      setMessages(msgs);
    });

    return () => {
      socket.off('message');
      socket.off('previousMessages');
      disconnectSocket();
    };
  }, [missionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socket = getSocket();
    socket.emit('sendMessage', {
      missionId,
      content: newMessage,
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 max-w-4xl mx-auto w-full border-x border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-10">
        <button onClick={() => router.back()} className="mr-4 text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mr-3">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Discussion Mission</h2>
            <p className="text-xs text-green-500 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
              En ligne
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        <div className="text-center my-4">
          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aujourd'hui</span>
        </div>
        
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 font-bold ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-full px-5 py-3 text-sm transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-transform hover:scale-105 shadow-md disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
