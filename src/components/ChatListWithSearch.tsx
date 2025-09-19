import React, { useState, useEffect } from "react";
import { Chat } from "@/types/chat";
import axios from "axios";

interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  online: boolean;
  last_seen_at: string;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId?: number;
  onSelectChat: (chatId: number) => void;
  accessToken: string; // токен для прокси
}

const ChatListWithSearch: React.FC<ChatListProps> = ({ chats, activeChatId, onSelectChat, accessToken }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Поиск с debounce через прокси
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const exclude_ids = chats.map(c => c.id); // исключаем текущие чаты
        const response = await axios.get("http://localhost:3001/api/users/search", {
          params: { q: query, "exclude_ids[]": exclude_ids },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("Search response:", response.data);

        // Берем массив users из объекта ответа
        setSearchResults(response.data.users || []);
      } catch (err) {
        console.error("Ошибка поиска пользователей:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, chats, accessToken]);

  return (
    <div className="p-2">
      {/* Поисковая строка */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск пользователей..."
        className="w-full mb-2 px-3 py-2 border rounded dark:bg-gray-900 dark:border-gray-700"
      />

      {/* Результаты поиска */}
      {loading && <div className="text-xs text-gray-500 mb-2">Поиск...</div>}
      {searchResults.length > 0 && (
        <ul className="mb-2 space-y-1">
          {searchResults.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              onClick={() => console.log("Открыть чат с пользователем:", user)}
            >
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 text-sm">
                <div className="font-medium">{user.username}</div>
                <div className="text-gray-400">{user.email}</div>
              </div>
              <div className="text-xs text-gray-500">
                {user.online ? "Онлайн" : `Был(а): ${new Date(user.last_seen_at).toLocaleString()}`}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Список чатов */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700 
              ${activeChatId === chat.id ? "bg-gray-200 dark:bg-gray-600" : ""} 
              ${chat.unreadCount && chat.unreadCount > 0 ? "bg-blue-100 dark:bg-blue-900" : ""}`}
          >
            <div className="flex items-center">
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full mr-3" />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getRandomColor(
                    chat.name
                  )} mr-3`}
                >
                  <span className="text-white font-semibold text-lg">
                    {chat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-black dark:text-white">{chat.name}</div>
                {chat.lastMessage && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {typeof chat.lastMessage === "string" ? chat.lastMessage : chat.lastMessage.text}
                  </div>
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
    </div>
  );
};

const getRandomColor = (name: string) => {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default ChatListWithSearch;