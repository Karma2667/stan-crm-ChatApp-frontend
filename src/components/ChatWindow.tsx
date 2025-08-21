// src/components/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Auth, Chat, ChatMessage as MessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import { api } from '@/api';

interface ChatWindowProps {
  chatId: number | undefined;
  goBack?: () => void;
  auth: Auth;
}

function ChatWindow({ chatId, goBack, auth }: ChatWindowProps) {
  const { chats, messages, removeMessage, editMessageText, addMessage, forwardMessage } = useChatStore();
  const currentChat = chats.find((chat: Chat) => chat.id === chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [selectChatForForward, setSelectChatForForward] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatId]);

  const getMessageById = (id: string) => {
    if (!chatId) return undefined;
    return messages[chatId]?.find((msg) => msg.id === id);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!chatId) return;
    try {
      await api.deleteMessage(chatId, messageId, auth);
      removeMessage(chatId, messageId);
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
    if (!editingMessage || !chatId) return;
    try {
      await api.updateMessage(chatId, editingMessage.id, messageText, auth);
      editMessageText(chatId, editingMessage.id, messageText);
      setEditingMessage(null);
      setMessageText('');
    } catch (err) {
      console.error('Ошибка редактирования сообщения:', err);
    }
  };

  const handleReplyMessage = (message: MessageType) => {
    setReplyingTo(message);
  };

  const handleForwardMessage = (messageId: string) => {
    setForwardingMessageId(messageId);
    setSelectChatForForward(true);
  };

  const handleSelectForwardChat = (targetChatId: number) => {
    if (!forwardingMessageId) return;
    forwardMessage(forwardingMessageId, targetChatId);
    setForwardingMessageId(null);
    setSelectChatForForward(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !messageText.trim()) return;

    try {
      const newMsg = await api.sendMessage(chatId, messageText, auth, replyingTo || undefined);
      addMessage(chatId, newMsg);
      setMessageText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой! Максимальный размер: 10 МБ');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Неподдерживаемый тип файла! Разрешены: PNG, JPEG, GIF, PDF');
      return;
    }

    try {
      const newMsg = await api.sendAttachment(chatId, file, auth, messageText || undefined, replyingTo || undefined);
      addMessage(chatId, newMsg);
      setMessageText('');
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Ошибка отправки файла:', err);
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
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Заголовок чата */}
      {chatId && currentChat && (
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

      {/* Сообщения */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 128px - 64px)' }}>
        {chatId ? (
          messages[chatId]?.length > 0 ? (
            <>
              {messages[chatId].map((message: MessageType, index: number) => (
                <ChatMessage
                  key={`${chatId}-${message.id}-${index}`}
                  message={message}
                  isOwnMessage={message.author === 'Ты'}
                  onDelete={handleDeleteMessage}
                  onEdit={handleEditMessage}
                  onReply={handleReplyMessage}
                  onPin={(msg) => setPinnedMessage(msg)}
                  onForward={handleForwardMessage}
                  getMessageById={getMessageById}
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

      {/* Красивое модальное окно выбора чата */}
      {selectChatForForward && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectChatForForward(false)} />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-80 max-w-full z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Выберите чат</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {chats
                .filter((c) => c.id !== chatId)
                .map((chat) => (
                  <div
                    key={chat.id}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                    onClick={() => handleSelectForwardChat(chat.id)}
                  >
                    {chat.avatar ? (
                      <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRandomColor(chat.name)}`}>
                        <span className="text-white font-semibold">{chat.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-gray-800 dark:text-white">{chat.name}</span>
                  </div>
                ))}
            </div>
            <button
              className="w-full p-3 text-center text-white bg-red-500 hover:bg-red-600"
              onClick={() => setSelectChatForForward(false)}
            >
              Отменить
            </button>
          </div>
        </div>
      )}

      {/* Поле ввода */}
      {chatId && (
        <form
          onSubmit={editingMessage ? handleUpdateMessageSubmit : handleSendMessage}
          className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:static"
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

          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2 py-1 bg-blue-100 dark:bg-blue-700 rounded">
              <span className="text-sm text-black dark:text-white truncate">
                Ответ на: {replyingTo.text}
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-xs text-red-600 hover:underline dark:text-red-300"
              >
                Убрать
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

            <EmojiPicker onSelect={(emoji) => setMessageText((prev) => prev + emoji)} />

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
