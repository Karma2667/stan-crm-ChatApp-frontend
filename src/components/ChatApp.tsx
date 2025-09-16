// src/components/ChatApp.tsx
import { Link } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { Chat, ChatMessage as MessageType, Auth } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";

interface ApiProps {
  fetchChats: (auth: Auth) => Promise<Chat[]>;
  fetchMessages: (chatId: number, auth: Auth) => Promise<MessageType[]>;
  sendMessage: (
    chatId: number,
    text: string,
    auth: Auth,
    replyTo?: MessageType
  ) => Promise<MessageType>;
  updateMessage: (
    chatId: number,
    messageId: string,
    text: string,
    auth: Auth
  ) => Promise<MessageType>;
  deleteMessage: (
    chatId: number,
    messageId: string,
    auth: Auth
  ) => Promise<void>;
  sendAttachment: (
    chatId: number,
    file: File,
    auth: Auth,
    text?: string,
    replyTo?: MessageType
  ) => Promise<MessageType>;
}

interface WebSocketProps {
  connect: (auth: Auth) => void;
  disconnect: () => void;
  subscribe: (
    callback: (data: MessageType & { chatId: number }) => void
  ) => void;
  send: (data: { chatId: number; content: string }) => void;
}

interface ChatAppProps {
  api: ApiProps;
  webSocket: WebSocketProps;
  auth: Auth;
}

function ChatApp({ api, webSocket, auth }: ChatAppProps) {
  const { chats, activeChatId, setChats, setActiveChatId } = useChatStore();

  // Загрузка чатов при старте
  useEffect(() => {
    api.fetchChats(auth).then(setChats).catch(console.error);
  }, [api, auth, setChats]);

  // Подключение WebSocket
  useEffect(() => {
    webSocket.connect(auth);

    const callback = (msg: MessageType & { chatId: number }) => {
      const updatedChats = chats.map((chat) =>
        chat.id === msg.chatId
          ? {
              ...chat,
              lastMessage: msg,
              unreadCount: (chat.unreadCount || 0) + 1,
            }
          : chat
      );
      setChats(updatedChats);
    };

    webSocket.subscribe(callback);

    return () => webSocket.disconnect();
  }, [webSocket, auth, chats, setChats]);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);

    const updatedChats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-black dark:text-white">
            CRM-Чат
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
            >
              Профиль
            </Link>
            <Link
              to="/"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
            >
              На главную
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 mt-16 w-full overflow-hidden">
        {/* ChatList для десктопа */}
        <aside className="hidden md:block md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
          />
        </aside>

        {/* ChatList + ChatWindow для мобильных */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChatId ? (
            <ChatWindow chatId={activeChatId} auth={auth} api={api} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Выберите чат, чтобы начать общение
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
