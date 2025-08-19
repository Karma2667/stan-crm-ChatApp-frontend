import { create } from 'zustand';
import { Chat, ChatMessage as MessageType, Auth } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
  chats: Chat[];
  activeChatId: number | undefined;
  messages: Record<number, MessageType[]>;
  auth: Auth;
  setChats: (chats: Chat[]) => void;
  setActiveChatId: (chatId: number | undefined) => void;
  addMessage: (chatId: number, text: string, author: string, attachment?: MessageType['attachment']) => void;
  removeMessage: (chatId: number, messageId: string) => void;
  editMessageText: (chatId: number, messageId: string, newText: string) => void; // Новый метод
}

export const useChatStore = create<ChatStore>((set, get) => {
  const savedState = localStorage.getItem('chatStore');
  const initialState = savedState ? JSON.parse(savedState) : {};

  const initialChats: Chat[] = [
    {
      id: 1,
      name: 'Тестовый пользователь 1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
      lastMessage: 'Привет! Как дела?',
      lastMessageTime: '10:30',
      unreadCount: 2,
      isGroup: false,
    },
    {
      id: 2,
      name: 'Групповой чат',
      lastMessage: 'Встреча в 15:00',
      lastMessageTime: '09:45',
      unreadCount: 0,
      isGroup: true,
    },
  ];

  const initialMessages: Record<number, MessageType[]> = {
    1: [
      { id: uuidv4(), text: 'Привет! Как дела?', timestamp: '10:30', author: 'Иван' },
      { id: uuidv4(), text: 'Хорошо, а у тебя?', timestamp: '10:32', author: 'Ты' },
    ],
    2: [
      { id: uuidv4(), text: 'Встреча в 15:00', timestamp: '09:45', author: 'Аня' },
      { id: uuidv4(), text: 'Ок, буду!', timestamp: '09:47', author: 'Ты' },
    ],
  };

  const initialChatsState = initialState.chats || initialChats;
  const initialMessagesState = initialState.messages || initialMessages;
  const initialActiveChatId = initialState.activeChatId;
  const initialAuthState = initialState.auth || {};

  const saveToLocalStorage = (state: Partial<ChatStore>) => {
    const currentState = get();
    const newState = {
      chats: state.chats || currentState.chats,
      activeChatId: state.activeChatId || currentState.activeChatId,
      messages: state.messages || currentState.messages,
      auth: state.auth || currentState.auth,
    };
    localStorage.setItem('chatStore', JSON.stringify(newState));
  };

  return {
    chats: initialChatsState,
    activeChatId: initialActiveChatId,
    messages: initialMessagesState,
    auth: initialAuthState,

    setChats: (chats) =>
      set(() => {
        const newState = { chats };
        saveToLocalStorage(newState);
        return newState;
      }),

    setActiveChatId: (activeChatId) =>
      set(() => {
        const newState = { activeChatId };
        saveToLocalStorage(newState);
        return newState;
      }),

    addMessage: (chatId, text, author, attachment) =>
      set((state) => {
        const newMessage: MessageType = {
          id: uuidv4(),
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author,
          attachment,
        };
        const updatedMessages = {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), newMessage],
        };
        const newState = { messages: updatedMessages };
        saveToLocalStorage(newState);
        return newState;
      }),

    removeMessage: (chatId, messageId) =>
      set((state) => {
        const updatedMessages = {
          ...state.messages,
          [chatId]: state.messages[chatId]?.filter((msg) => msg.id !== messageId) || [],
        };
        const newState = { messages: updatedMessages };
        saveToLocalStorage(newState);
        return newState;
      }),

    editMessageText: (chatId, messageId, newText) =>
      set((state) => {
        const updatedMessages = {
          ...state.messages,
          [chatId]: state.messages[chatId]?.map((msg) =>
            msg.id === messageId ? { ...msg, text: newText } : msg
          ) || [],
        };
        const newState = { messages: updatedMessages };
        saveToLocalStorage(newState);
        return newState;
      }),
  };
});
