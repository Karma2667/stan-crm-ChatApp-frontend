// src/components/ChatWindow/ForwardChatModal.tsx
import React from 'react';
import { Chat } from '@/types/chat';

interface ForwardChatModalProps {
  chats: Chat[];
  getRandomColor: (name: string) => string;
  onSelect: (chatId: number) => void;
  onClose: () => void;
}

const ForwardChatModal: React.FC<ForwardChatModalProps> = ({ chats, getRandomColor, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-80 max-w-full z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Выберите чат</h3>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {chats.map(chat => (
            <div key={chat.id} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3" onClick={()=>onSelect(chat.id)}>
              {chat.avatar ? <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-full"/> :
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRandomColor(chat.name)}`}>
                <span className="text-white font-semibold">{chat.name.charAt(0).toUpperCase()}</span>
              </div>}
              <span className="text-gray-800 dark:text-white">{chat.name}</span>
            </div>
          ))}
        </div>
        <button className="w-full p-3 text-center text-white bg-red-500 hover:bg-red-600" onClick={onClose}>Отменить</button>
      </div>
    </div>
  );
};

export default ForwardChatModal;
