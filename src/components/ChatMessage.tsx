import { useState, useEffect, useRef } from 'react';
import { ChatMessage as MessageType } from '@/types/chat';

interface ChatMessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  onDelete?: (messageId: string) => void;
}

function ChatMessage({ message, isOwnMessage, onDelete }: ChatMessageProps) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOwnMessage) {
      e.preventDefault();
      const menuWidth = 150;
      const menuHeight = 50;
      const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth : e.clientX;
      const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight : e.clientY;
      setContextMenuPosition({ x, y });
      setIsContextMenuOpen(true);
    }
  };

  const handleDelete = () => {
    if (onDelete && isOwnMessage) {
      console.log(`Deleting message with id: ${message.id}`); // Отладочный лог
      onDelete(message.id);
      setIsContextMenuOpen(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setIsContextMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isContextMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isContextMenuOpen]);

  const renderAttachment = () => {
    if (!message.attachment) return null;
    const { url, type, name } = message.attachment;
    if (type.startsWith('image/')) {
      return (
        <img
          src={url}
          alt={name}
          className="max-w-[200px] mt-2 rounded-lg cursor-pointer"
          onClick={() => window.open(url, '_blank')}
        />
      );
    }
    return (
      <a
        href={url}
        download={name}
        className={`mt-2 flex items-center ${isOwnMessage ? 'text-white hover:text-gray-200 dark:hover:text-gray-200' : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 7h-2v4H9V7H7l5-5 5 5h-2v6H7v-2h6V7z" />
        </svg>
        {name}
      </a>
    );
  };

  const hasTextOrNonImageAttachment = message.text || (message.attachment && !message.attachment.type.startsWith('image/'));

  return (
    <div className={`flex flex-col mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      {hasTextOrNonImageAttachment && (
        <div
          className={`max-w-[70%] p-3 rounded-lg flex flex-col ${
            isOwnMessage
              ? 'bg-blue-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onContextMenu={handleContextMenu}
        >
          {message.text && <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-black dark:text-white'}`}>{message.text}</p>}
          {message.attachment && !message.attachment.type.startsWith('image/') && renderAttachment()}
        </div>
      )}
      {message.attachment && message.attachment.type.startsWith('image/') && renderAttachment()}
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {message.timestamp} {message.author}
      </span>
      {isContextMenuOpen && isOwnMessage && (
        <div
          ref={contextMenuRef}
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Удалить
          </button>
          {/* Будущие опции: */}
          {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Ответить</button> */}
          {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Копировать</button> */}
          {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Редактировать</button> */}
          {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Переслать</button> */}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;