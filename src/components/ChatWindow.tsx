import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Auth, Chat, ChatMessage as MessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';

interface ChatWindowProps {
  goBack?: () => void;
  api: {
    sendMessage: (chatId: number, text: string, auth: Auth) => Promise<void>;
    deleteMessage: (chatId: number, messageId: string, auth: Auth) => Promise<void>;
    updateMessage: (chatId: number, messageId: string, text: string, auth: Auth) => Promise<void>;
    sendAttachment: (chatId: number, file: File, auth: Auth, text?: string) => Promise<MessageType>;
  };
  auth: Auth;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onSendAttachment: (file: File) => void;
}

function ChatWindow({ goBack, api, auth, messageText, setMessageText, onSendMessage, onSendAttachment }: ChatWindowProps) {
  const { activeChatId, chats, messages, removeMessage, editMessageText } = useChatStore();
  const currentChat = chats.find((chat: Chat) => chat.id === activeChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId) return;
    try {
      await api.deleteMessage(activeChatId, messageId, auth);
      removeMessage(activeChatId, messageId);
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error);
    }
  };

  const handleEditMessage = (message: MessageType) => {
    setEditingMessage(message);
    setMessageText(message.text || '');
  };

  const handleUpdateMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage || !activeChatId) return;

    try {
      await api.updateMessage(activeChatId, editingMessage.id, messageText, auth);
      editMessageText(activeChatId, editingMessage.id, messageText);
      setEditingMessage(null);
      setMessageText('');
    } catch (err) {
      console.error('Ошибка редактирования сообщения:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getRandomColor = (name: string): string => {
    const colors = ['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500','bg-pink-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {activeChatId && currentChat && (
        <div className="flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center h-16 px-2">
            <button
              onClick={goBack}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ← Назад
            </button>
            {currentChat.avatar ? (
              <img src={currentChat.avatar} alt={currentChat.name} className="w-12 h-12 rounded-full ml-2 mr-3" />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRandomColor(currentChat.name)} ml-2 mr-3`}>
                <span className="text-white font-semibold text-xl">{currentChat.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <h2 className="text-xl font-semibold text-black dark:text-white flex-1">{currentChat.name}</h2>
          </div>

          {pinnedMessage && (
            <div className="flex items-center justify-between px-4 py-2 bg-yellow-100 dark:bg-yellow-600">
              <div className="text-sm truncate max-w-[80%]">
                <strong>Закреплено:</strong> {pinnedMessage.text || 'Вложение'}
              </div>
              <button
                onClick={() => setPinnedMessage(null)}
                className="text-xs text-red-600 dark:text-red-200 hover:underline"
              >
                Открепить
              </button>
            </div>
          )}
        </div>
      )}

      <div 
        className="flex-1 p-4 overflow-y-auto"
        style={{ 
          maxHeight: 'calc(100vh - 128px - 64px)',
          paddingBottom: editingMessage ? '120px' : '0' 
        }}
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
                  onEdit={handleEditMessage}
                  onPin={(msg) => setPinnedMessage(msg)}
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
          onSubmit={editingMessage ? handleUpdateMessageSubmit : onSendMessage}
          className={`p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 
            ${editingMessage ? 'fixed bottom-0 left-0 right-0 z-10' : 'md:static'}`}
        >
          {editingMessage && (
            <div className="flex items-center justify-between mb-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-700 rounded">
              <span className="text-sm text-black dark:text-white truncate">
                Редактирование: {editingMessage.text}
              </span>
              <button
                type="button"
                onClick={() => { setEditingMessage(null); setMessageText(''); }}
                className="text-xs text-red-600 hover:underline dark:text-red-300"
              >
                Отмена
              </button>
            </div>
          )}

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

            <EmojiPicker onSelect={(emoji) => setMessageText(messageText + emoji)} />

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={editingMessage ? 'Редактируйте сообщение...' : 'Напишите сообщение...'}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editingMessage ? 'Сохранить' : 'Отправить'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ChatWindow;
