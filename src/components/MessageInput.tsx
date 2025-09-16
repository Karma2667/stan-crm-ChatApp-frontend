// src/components/ChatWindow/MessageInput.tsx
import React from 'react';
import { ChatMessage as MessageType, Auth } from '@/types/chat';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  messageText: string;
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
  editingMessage: MessageType | null;
  setEditingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  replyingTo: MessageType | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<MessageType | null>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  chatId: number;
  auth: Auth;
  api: {
    sendMessage: (
      chatId: number,
      text: string,
      auth: Auth,
      replyTo?: MessageType
    ) => Promise<MessageType>;
    sendAttachment: (
      chatId: number,
      file: File,
      auth: Auth,
      text?: string,
      replyTo?: MessageType
    ) => Promise<MessageType>;
  };
  addMessage: (msg: MessageType) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  editingMessage,
  setEditingMessage,
  replyingTo,
  setReplyingTo,
  fileInputRef,
  chatId,
  auth,
  api,
  addMessage
}) => {

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой!');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Неподдерживаемый тип файла!');
      return;
    }

    try {
      const msg = await api.sendAttachment(
        chatId,
        file,
        auth,
        messageText || undefined,
        replyingTo || undefined
      );
      addMessage(msg);
      setMessageText('');
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !editingMessage) return;

    try {
      if (editingMessage) {
        // редактирование сообщения
        editingMessage.text = messageText;
        setEditingMessage(null);
      } else {
        // отправка нового сообщения
        const msg = await api.sendMessage(chatId, messageText, auth, replyingTo || undefined);
        addMessage(msg);
      }
      setMessageText('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {editingMessage && (
          <div className="flex items-center justify-between px-2 py-1 bg-yellow-100 dark:bg-yellow-700 rounded">
            <span className="text-sm text-black dark:text-white truncate">
              Редактирование: {editingMessage.text}
            </span>
            <button
              type="button"
              onClick={() => setEditingMessage(null)}
              className="text-xs text-red-600 hover:underline dark:text-red-300"
            >
              Отмена
            </button>
          </div>
        )}

        {replyingTo && (
          <div className="flex items-center justify-between px-2 py-1 bg-blue-100 dark:bg-blue-700 rounded">
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
          <EmojiPicker onSelect={(emoji: string) => setMessageText(prev => prev + emoji)} />
          <input
            type="text"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
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
    </div>
  );
};

export default MessageInput;
