import { Link } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { Chat, ChatMessage as MessageType, Auth } from '@/types/chat';
import { useChatStore } from '@/store/useChatStore';
import { useEffect, useState } from 'react';

interface ChatAppProps {
  api: {
    fetchChats: (auth: Auth) => Promise<Chat[]>;
    fetchMessages: (chatId: number, auth: Auth) => Promise<MessageType[]>;
    sendMessage: (chatId: number, text: string, auth: Auth) => Promise<MessageType>;
    deleteMessage: (chatId: number, messageId: string, auth: Auth) => Promise<void>;
    sendAttachment: (chatId: number, file: File, auth: Auth, text?: string) => Promise<MessageType>;
  };
  webSocket: {
    connect: (auth: Auth) => void;
    disconnect: () => void;
    subscribe: (callback: (data: MessageType) => void) => void;
    send: (data: { chatId: number; content: string }) => void;
  };
  auth: Auth;
}

function ChatApp({ api, webSocket, auth }: ChatAppProps) {
  const { chats, activeChatId, setChats, setActiveChatId, addMessage } = useChatStore();
  const [isChatListVisible, setIsChatListVisible] = useState(true);

  // Загрузка чатов при старте
  useEffect(() => {
    api.fetchChats(auth).then((data) => setChats(data));
  }, [api, auth, setChats]);

  // Подключение WebSocket
  useEffect(() => {
    webSocket.connect(auth);
    return () => webSocket.disconnect();
  }, [webSocket, auth]);

  // Выбор чата
  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 768) setIsChatListVisible(false);

    const updatedChats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
  };

  // Возврат к списку чатов
  const handleGoBack = () => {
    setIsChatListVisible(true);
    setActiveChatId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-black dark:text-white">CRM-Чат</h1>
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
          >
            На главную
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 mt-16 w-full">
        {/* Список чатов */}
        <aside
          className={`md:hidden w-full bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
            isChatListVisible ? 'block' : 'hidden'
          }`}
        >
          <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={handleSelectChat} />
        </aside>
        <aside className="hidden md:block md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={handleSelectChat} />
        </aside>

        {/* ChatWindow */}
        <main
          className={`md:hidden flex-1 flex-col bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)] ${
            isChatListVisible ? 'hidden' : 'block'
          }`}
        >
          {activeChatId && (
            <ChatWindow
              chatId={activeChatId}
              auth={auth}
              goBack={handleGoBack}
            />
          )}
        </main>
        <main className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
          {activeChatId && (
            <ChatWindow
              chatId={activeChatId}
              auth={auth}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default ChatApp;
