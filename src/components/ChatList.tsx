import { Chat } from '@/types/chat';

interface ChatListProps {
  chats: Chat[];
  activeChatId?: number;
  onSelectChat: (chatId: number) => void;
}

function ChatList({ chats, activeChatId, onSelectChat }: ChatListProps) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {chats.map((chat) => (
        <li
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
            activeChatId === chat.id ? 'bg-gray-200 dark:bg-gray-600' : ''
          } ${chat.unreadCount && chat.unreadCount > 0 ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
        >
          <div className="flex items-center">
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getRandomColor(chat.name)} mr-3`}
              >
                <span className="text-white font-semibold text-lg">{chat.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-black dark:text-white">{chat.name}</div>
              {chat.lastMessage && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</div>
              )}
            </div>
            {chat.unreadCount && chat.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
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

export default ChatList;