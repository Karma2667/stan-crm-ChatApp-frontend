// src/pages/ChatPage.tsx
import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { ChatMessage, Auth } from "@/types/chat";
import ChatList from "@/components/ChatListWithSearch";
import ChatWindow from "@/components/ChatWindow";

interface ChatPageProps {
  auth: Auth;
  webSocket: {
    connect: () => void;
    disconnect: () => void;
    subscribe: (callback: (msg: ChatMessage & { chatId: number }) => void) => void;
    send: (data: { chatId: number; content: string }) => void;
  };
}

const ChatPage = ({ auth, webSocket }: ChatPageProps) => {
  const { chats, activeChatId, setActiveChatId, addMessage } = useChatStore();

  // Подключение WebSocket
  useEffect(() => {
    webSocket.connect();

    const handleIncomingMessage = (msg: ChatMessage & { chatId: number }) => {
      addMessage(msg.chatId, msg);
    };

    webSocket.subscribe(handleIncomingMessage);

    return () => {
      webSocket.disconnect();
    };
  }, [webSocket, addMessage]);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-1 mt-16 w-full overflow-hidden">
        <aside className="hidden md:block md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            accessToken={auth.token} // <- добавляем токен сюда
          />

        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChatId ? (
            <ChatWindow
              chatId={activeChatId}
              auth={auth}
              webSocket={webSocket}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Выберите чат, чтобы начать общение
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;