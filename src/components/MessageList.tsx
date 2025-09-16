// src/components/ChatWindow/MessageList.tsx
import React from 'react';
import { ChatMessage as MessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';

interface MessageListProps {
  chatId: number;
  messages: MessageType[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>; // <-- исправлено
  getMessageById: (id: string) => MessageType | undefined;
  onDelete: (id: string) => void;
  onEdit: (msg: MessageType) => void;
  onReply: (msg: MessageType) => void;
  onPin: (msg: MessageType) => void;
  onForward: (id: string) => void;
}


const MessageList: React.FC<MessageListProps> = ({
  chatId, messages, messagesEndRef, getMessageById, onDelete, onEdit, onReply, onPin, onForward
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
      {messages?.length > 0 ? (
        <>
          <div ref={messagesEndRef} />
          {messages.slice().reverse().map((msg, index) => (
            <ChatMessage
              key={`${chatId}-${msg.id}-${index}`}
              message={msg}
              isOwnMessage={msg.author === 'Ты'}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              onPin={onPin}
              onForward={onForward}
              getMessageById={getMessageById}
            />
          ))}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Сообщений пока нет</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
