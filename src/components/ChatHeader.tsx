
import React from 'react';
import { Chat } from '@/types/chat';

interface ChatHeaderProps {
  chat: Chat;
  goBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, goBack }) => {
  const getRandomColor = (name: string) => {
    const colors = ['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500','bg-pink-500'];
    let hash = 0;
    for(let i=0;i<name.length;i++){hash=name.charCodeAt(i)+((hash<<5)-hash);}
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex items-center h-16 px-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 flex-shrink-0">
      {goBack && (
        <button
          onClick={goBack}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Назад
        </button>
      )}

      {chat.avatar ? (
        <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full ml-2 mr-3" />
      ) : (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRandomColor(chat.name)} ml-2 mr-3`}>
          <span className="text-white font-semibold text-xl">{chat.name.charAt(0).toUpperCase()}</span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-black dark:text-white flex-1">{chat.name}</h2>
    </div>
  );
};

export default ChatHeader;
