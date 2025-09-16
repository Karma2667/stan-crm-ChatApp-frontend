import React from 'react';
import { ChatMessage as MessageType } from '@/types/chat';

interface PinnedMessageProps {
  message: MessageType;
  onUnpin: () => void;
}

const PinnedMessage: React.FC<PinnedMessageProps> = ({ message, onUnpin }) => {
  return (
    <div className="sticky top-16 z-10 bg-yellow-100 dark:bg-yellow-600 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="text-sm truncate max-w-[90%]">
          <strong>Закреплено:</strong> {message.text || 'Вложение'}
        </div>
        <button
          onClick={onUnpin}
          className="text-xs text-red-600 dark:text-red-200 hover:underline"
        >
          Открепить
        </button>
      </div>
    </div>
  );
};

export default PinnedMessage;
