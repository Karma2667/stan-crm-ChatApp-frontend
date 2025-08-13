import { create } from 'zustand';
import { Chat, ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid'; // Импортируем uuid для уникальных ID

interface ChatStore {
  chats: Chat[];
  activeChatId: number | undefined;
  messages: Record<number, ChatMessage[]>; // Словарь сообщений по chatId
  setChats: (chats: Chat[]) => void;
  setActiveChatId: (chatId: number | undefined) => void;
  addMessage: (chatId: number, text: string, author: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => {
  // Загружаем данные из localStorage при инициализации
  const savedState = localStorage.getItem('chatStore');
  const initialState = savedState ? JSON.parse(savedState) : {};

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

  // Начальные сообщения для каждого чата
  const initialMessages: Record<number, ChatMessage[]> = {
    1: [
      { id: uuidv4(), text: 'Привет! Как дела?', timestamp: '10:30', author: 'Иван' },
      { id: uuidv4(), text: 'Хорошо, а у тебя?', timestamp: '10:32', author: 'Ты' },
    ],
    2: [
      { id: uuidv4(), text: 'Встреча в 15:00', timestamp: '09:45', author: 'Аня' },
      { id: uuidv4(), text: 'Ок, буду!', timestamp: '09:47', author: 'Ты' },
    ],
  };

  // Инициализация состояния с учетом сохраненных данных
  const initialChatsState = initialState.chats || initialChats;
  const initialMessagesState = initialState.messages || initialMessages;
  const initialActiveChatId = initialState.activeChatId;

  // Функция сохранения полного состояния в localStorage
  const saveToLocalStorage = (state: Partial<ChatStore>) => {
    const currentState = get(); // Получаем текущее состояние
    const newState = {
      chats: state.chats || currentState.chats,
      activeChatId: state.activeChatId || currentState.activeChatId,
      messages: state.messages || currentState.messages,
    };
    localStorage.setItem('chatStore', JSON.stringify(newState));
  };

  return {
    chats: initialChatsState,
    activeChatId: initialActiveChatId,
    messages: initialMessagesState,
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
    addMessage: (chatId, text, author) =>
      set((state) => {
        const newMessage: ChatMessage = {
          id: uuidv4(), // Уникальный ID как строка
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author,
        };
        const updatedMessages = {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), newMessage],
        };
        const newState = { messages: updatedMessages };
        saveToLocalStorage(newState);
        return newState;
      }),
  };
});