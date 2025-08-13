import { ChatMessage as MessageType } from '@/types/chat';

interface ChatMessageProps {
  message: MessageType;
  isOwnMessage: boolean; // Определяет, сообщение от текущего пользователя или нет
}

function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={`flex flex-col mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {message.timestamp} {message.author}
      </span>
    </div>
  );
}

export default ChatMessage;