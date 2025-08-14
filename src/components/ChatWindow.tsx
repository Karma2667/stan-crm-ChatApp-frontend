import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Auth, Chat, ChatMessage as MessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  goBack?: () => void;
  api: {
    sendMessage: (chatId: number, text: string, auth: Auth) => Promise<void>;
    deleteMessage: (chatId: number, messageId: string, auth: Auth) => Promise<void>;
    sendAttachment: (chatId: number, file: File, auth: Auth, text?: string) => Promise<MessageType>;
  };
  auth: Auth;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onSendAttachment: (file: File) => void;
}

function ChatWindow({ goBack, api, auth, messageText, setMessageText, onSendMessage, onSendAttachment }: ChatWindowProps) {
  const { activeChatId, chats, messages, removeMessage } = useChatStore();
  const currentChat = chats.find((chat: Chat) => chat.id === activeChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const handleDeleteMessage = async (messageId: string) => {
    if (activeChatId) {
      console.log(`Attempting to delete message with id: ${messageId}`); // Отладочный лог
      try {
        await api.deleteMessage(activeChatId, messageId, auth);
        removeMessage(activeChatId, messageId);
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой! Максимальный размер: 10 МБ');
        return;
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый тип файла! Разрешены: PNG, JPEG, GIF, PDF');
        return;
      }
      onSendAttachment(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getRandomColor = (name: string): string => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

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

      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 128px - 64px)' }}
      >
        {activeChatId ? (
          messages[activeChatId]?.length > 0 ? (
            <>
              {messages[activeChatId].map((message: MessageType) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.author === 'Ты'}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Сообщений пока нет</p>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Выберите чат для начала общения</p>
          </div>
        )}
      </div>

      {activeChatId && (
        <form
          onSubmit={onSendMessage}
          className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 md:static"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Прикрепить файл"
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/gif,application/pdf"
              className="hidden"
            />
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
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ChatWindow;