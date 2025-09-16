// src/store/useChatStore.ts
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

  addMessage: (chatId: number, message: MessageType) => void;
  removeMessage: (chatId: number, messageId: string) => void;
  editMessageText: (chatId: number, messageId: string, newText: string) => void;
  forwardMessage: (messageId: string, targetChatId: number) => void;
}

// Начальные данные
const initialChats: Chat[] = [
  {
    id: 1,
    name: 'Тестовый пользователь 1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    lastMessage: {
      id: uuidv4(),
      text: 'Привет! Как дела?',
      author: 'Иван',
      timestamp: '10:30',
      isRead: true,
      status: 'read',
    },
    lastMessageTime: '10:30',
    unreadCount: 2,
    isGroup: false,
  },
  {
    id: 2,
    name: 'Групповой чат',
    lastMessage: {
      id: uuidv4(),
      text: 'Встреча в 15:00',
      author: 'Аня',
      timestamp: '09:45',
      isRead: true,
      status: 'read',
    },
    lastMessageTime: '09:45',
    unreadCount: 0,
    isGroup: true,
  },
];

const initialMessages: Record<number, MessageType[]> = {
  1: [
    { id: uuidv4(), text: 'Привет! Как дела?', timestamp: '10:30', author: 'Иван', isRead: true, status: 'read' },
    { id: uuidv4(), text: 'Хорошо, а у тебя?', timestamp: '10:32', author: 'Ты', isRead: false, status: 'sent' },
  ],
  2: [
    { id: uuidv4(), text: 'Встреча в 15:00', timestamp: '09:45', author: 'Аня', isRead: true, status: 'read' },
    { id: uuidv4(), text: 'Ок, буду!', timestamp: '09:47', author: 'Ты', isRead: false, status: 'sent' },
  ],
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: initialChats,
  activeChatId: undefined,
  messages: initialMessages,
  auth: { token: 'test-token', userId: 1 },

  setChats: (chats) => set({ chats }),
  setActiveChatId: (activeChatId) => set({ activeChatId }),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: [...(state.messages[chatId] || []), message] },
    })),

  removeMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.filter((msg) => msg.id !== messageId) || [],
      },
    })),

  editMessageText: (chatId, messageId, newText) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.map((msg) =>
          msg.id === messageId ? { ...msg, text: newText } : msg
        ) || [],
      },
    })),

  forwardMessage: (messageId, targetChatId) =>
    set((state) => {
      const sourceChatId = Number(
        Object.keys(state.messages).find((chatId) =>
          state.messages[Number(chatId)].some((msg) => msg.id === messageId)
        )
      );
      if (!sourceChatId) return state;

      const originalMessage = state.messages[sourceChatId].find((msg) => msg.id === messageId);
      if (!originalMessage) return state;

      const newMessage: MessageType = {
        ...originalMessage,
        id: uuidv4(),
        author: 'Ты',
        timestamp: new Date().toLocaleTimeString(),
        isRead: false,
        status: 'sent',
        forwardedFromId: originalMessage.id,
        forwardedFromChatId: sourceChatId,
      };

      return {
        messages: { ...state.messages, [targetChatId]: [...(state.messages[targetChatId] || []), newMessage] },
      };
    }),
}));
