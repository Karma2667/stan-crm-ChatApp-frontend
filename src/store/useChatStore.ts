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

export const useChatStore = create<ChatStore>((set, get) => {
  // Загрузка состояния из localStorage
  const savedState = localStorage.getItem('chatStore');
  let initialState: Partial<ChatStore> = {};
  try {
    initialState = savedState ? JSON.parse(savedState) : {};
  } catch (err) {
    console.warn('Не удалось прочитать chatStore из localStorage', err);
  }

  // Начальные чаты
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

  // Начальные сообщения
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

  const initialChatsState: Chat[] = Array.isArray(initialState.chats) ? initialState.chats : initialChats;
  const initialMessagesState: Record<number, MessageType[]> = initialState.messages || initialMessages;
  const initialActiveChatId: number | undefined = initialState.activeChatId;
  const initialAuthState: Auth = initialState.auth || { token: 'test-token', userId: 1 };

  const saveToLocalStorage = (state: Partial<ChatStore>) => {
    const currentState = get();
    const newState = {
      chats: state.chats ?? currentState.chats,
      activeChatId: state.activeChatId ?? currentState.activeChatId,
      messages: state.messages ?? currentState.messages,
      auth: state.auth ?? currentState.auth,
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

    addMessage: (chatId, message) =>
      set((state) => {
        const existingMessages = state.messages[chatId] || [];
        const filteredMessages = existingMessages.filter(msg => msg.id !== message.id);

        const updatedMessages = {
          ...state.messages,
          [chatId]: [...filteredMessages, message],
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

    forwardMessage: (messageId, targetChatId) =>
      set((state) => {
        // Ищем исходное сообщение и чат
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

        const updatedMessages = {
          ...state.messages,
          [targetChatId]: [...(state.messages[targetChatId] || []), newMessage],
        };

        const newState = { messages: updatedMessages };
        saveToLocalStorage(newState);
        return newState;
      }),
  };
});
