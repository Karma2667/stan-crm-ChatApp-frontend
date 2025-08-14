import { Link } from 'react-router-dom';
import ChatList from './ChatList';
import { Chat, ChatMessage as MessageType, Auth } from '@/types/chat';
import { useChatStore } from '@/store/useChatStore';
import { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';

interface ChatAppProps {
  api: {
    fetchChats: (auth: Auth) => Promise<Chat[]>;
    fetchMessages: (chatId: number, auth: Auth) => Promise<MessageType[]>;
    sendMessage: (chatId: number, text: string, auth: Auth) => Promise<void>;
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
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    api.fetchChats(auth).then((data) => setChats(data));
  }, [api, auth]);

  useEffect(() => {
    webSocket.connect(auth);
    return () => webSocket.disconnect();
  }, [webSocket, auth]);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    console.log(`Выбран чат: ${chatId}`);
    if (window.innerWidth < 768) {
      setIsChatListVisible(false);
    }
    const updatedChats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
  };

  const handleGoBack = () => {
    setIsChatListVisible(true);
    setActiveChatId(undefined);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeChatId && messageText.trim()) {
      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: messageText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Ты',
      };
      addMessage(activeChatId, newMessage.text, newMessage.author);
      api.sendMessage(activeChatId, messageText.trim(), auth).then(() => {
        const updatedChats = chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                lastMessage: messageText.trim(),
                lastMessageTime: newMessage.timestamp,
              }
            : chat
        );
        setChats(updatedChats);
        setMessageText('');
      }).catch((error) => {
        console.error('Ошибка отправки:', error);
        addMessage(activeChatId, '', '');
      });
    }
  };

  const handleSendAttachment = (file: File) => {
    if (activeChatId) {
      const text = messageText.trim();
      api.sendAttachment(activeChatId, file, auth, text || undefined).then((newMessage) => {
        addMessage(activeChatId, newMessage.text || '', newMessage.author, newMessage.attachment);
        const lastMessage = newMessage.attachment
          ? `Вложение: ${newMessage.attachment.name}`
          : newMessage.text;
        const updatedChats = chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                lastMessage,
                lastMessageTime: newMessage.timestamp,
              }
            : chat
        );
        setChats(updatedChats);
        setMessageText(''); // Сброс текста после отправки
      }).catch((error) => {
        console.error('Ошибка отправки вложения:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
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

      <div className="flex flex-1 mt-16 w-full">
        <aside
          className={`md:hidden w-full bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
            isChatListVisible ? 'block' : 'hidden'
          }`}
        >
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
          />
        </aside>
        <aside className="hidden md:block md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
          />
        </aside>

        <main
          className={`md:hidden flex-1 flex-col bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)] ${
            isChatListVisible ? 'hidden' : 'block'
          }`}
        >
          <ChatWindow
            goBack={handleGoBack}
            api={api}
            auth={auth}
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
          />
        </main>
        <main className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
          <ChatWindow
            api={api}
            auth={auth}
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
          />
        </main>
      </div>
    </div>
  );
}

export default ChatApp;