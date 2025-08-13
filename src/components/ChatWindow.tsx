import { useChatStore } from '@/store/useChatStore';
import ChatMessageComponent from './ChatMessage';
import { useState } from 'react';
import { Auth } from '@/types/chat';

interface ChatWindowProps {
  goBack?: () => void;
  api: {
    sendMessage: (chatId: number, text: string, auth: Auth) => Promise<void>;
  };
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

function ChatWindow({ goBack, api, messageText, setMessageText, onSendMessage }: ChatWindowProps) {
  const { activeChatId, chats, messages } = useChatStore();
  const currentChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {activeChatId && currentChat && (
        <div className="flex items-center h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={goBack}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← Назад
          </button>
          {currentChat.avatar ? (
            <img src={currentChat.avatar} alt={currentChat.name} className="w-12 h-12 rounded-full ml-2 mr-3" />
          ) : (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${getRandomColor(currentChat.name)} ml-2 mr-3`}
            >
              <span className="text-white font-semibold text-xl">{currentChat.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h2 className="text-xl font-semibold text-black dark:text-white flex-1">{currentChat.name}</h2>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        {activeChatId ? (
          messages[activeChatId]?.length > 0 ? (
            messages[activeChatId].map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                isOwnMessage={message.author === 'Ты'}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Сообщений пока нет</p>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Выберите чат для начала общения</p>
          </div>
        )}
      </div>

      {activeChatId && (
        <form
          onSubmit={onSendMessage}
          className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 md:static"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Напишите сообщение..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const getRandomColor = (name: string) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default ChatWindow;