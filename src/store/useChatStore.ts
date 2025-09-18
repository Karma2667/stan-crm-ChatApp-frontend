// src/store/useChatStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Chat, ChatMessage, Auth } from '@/types/chat';
import { subscribeToChat } from '@/services/chatSocket';

interface ChatStore {
  chats: Chat[];
  activeChatId?: number;
  messages: Record<number, ChatMessage[]>;
  auth: Auth;

  setChats: (chats: Chat[]) => void;
  setActiveChatId: (chatId?: number) => void;
  addMessage: (chatId: number, message: ChatMessage) => void;
  removeMessage: (chatId: number, messageId: string) => void;
  editMessageText: (chatId: number, messageId: string, newText: string) => void;
  forwardMessage: (messageId: string, targetChatId: number) => void;
  subscribeToActiveChat: () => void;
}

const initialChats: Chat[] = [];
const initialMessages: Record<number, ChatMessage[]> = {};

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: initialChats,
  activeChatId: undefined,
  messages: initialMessages,
  auth: {
    token: '',
    userId: 0,
    username: '',
    email: '',
    avatar_url: '',
    online: false,
  },

  setChats: (chats) => set({ chats }),

  setActiveChatId: (activeChatId) => {
    const state = get();
    const updatedChats = state.chats.map((chat) =>
      chat.id === activeChatId ? { ...chat, unreadCount: 0 } : chat
    );
    set({ activeChatId, chats: updatedChats });
  },

  addMessage: (chatId, message) => {
    const state = get();

    const updatedMessages = {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    };

    const updatedChats = state.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            lastMessage: message,
            lastMessageTime: message.timestamp,
            unreadCount:
              chat.id === state.activeChatId ? chat.unreadCount : (chat.unreadCount || 0) + 1,
          }
        : chat
    );

    set({ messages: updatedMessages, chats: updatedChats });
  },

  editMessageText: (chatId, messageId, newText) => {
    const state = get();
    const updatedMessages = {
      ...state.messages,
      [chatId]: state.messages[chatId]?.map((msg) =>
        msg.id === messageId ? { ...msg, text: newText } : msg
      ) || [],
    };

    const updatedChats = state.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            lastMessage:
              chat.lastMessage?.id === messageId
                ? { ...chat.lastMessage, text: newText }
                : chat.lastMessage,
          }
        : chat
    );

    set({ messages: updatedMessages, chats: updatedChats });
  },

  removeMessage: (chatId, messageId) => {
    const state = get();
    const updatedMessages = {
      ...state.messages,
      [chatId]: state.messages[chatId]?.filter((msg) => msg.id !== messageId) || [],
    };

    const lastMessage = updatedMessages[chatId]?.[updatedMessages[chatId].length - 1];

    const updatedChats = state.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            lastMessage: lastMessage || undefined,
            lastMessageTime: lastMessage?.timestamp || '',
          }
        : chat
    );

    set({ messages: updatedMessages, chats: updatedChats });
  },

  forwardMessage: (messageId, targetChatId) => {
    const state = get();
    const sourceChatId = Number(
      Object.keys(state.messages).find((chatId) =>
        state.messages[Number(chatId)].some((msg) => msg.id === messageId)
      )
    );
    if (!sourceChatId) return;

    const originalMessage = state.messages[sourceChatId].find((msg) => msg.id === messageId);
    if (!originalMessage) return;

    const newMessage: ChatMessage = {
      ...originalMessage,
      id: uuidv4(),
      author: state.auth.username,
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sent',
      forwardedFromId: originalMessage.id,
      forwardedFromChatId: sourceChatId,
    };

    const updatedMessages = {
      ...state.messages,
      [targetChatId]: [...(state.messages[targetChatId] || []), newMessage],
    };

    const updatedChats = state.chats.map((chat) =>
      chat.id === targetChatId
        ? { ...chat, lastMessage: newMessage, lastMessageTime: newMessage.timestamp }
        : chat
    );

    set({ messages: updatedMessages, chats: updatedChats });
  },

  subscribeToActiveChat: () => {
    const state = get();
    const chatId = state.activeChatId;
    if (!chatId) return;

    // Теперь подписка только с chatId
    subscribeToChat(chatId);
  },
}));
