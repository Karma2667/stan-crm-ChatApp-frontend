// Определение типа чата
export interface Chat {
  id: number;
  name: string;
  avatar?: string; // Optional: URL аватарки
  lastMessage?: string; // Optional: Текст последнего сообщения
  lastMessageTime?: string; // Optional: Время последнего сообщения (например, "10:30")
  unreadCount?: number; // Optional: Количество непрочитанных сообщений
  isGroup?: boolean; // Optional: Групповой чат или нет
  participants?: { id: number; name: string }[]; // Для групп (опционально)
}

// Определение типа сообщения
export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

// Новый тип для аутентификации
export interface Auth {
  token: string; // Токен авторизации (например, JWT или Bearer token)
  userId: number; // Идентификатор текущего пользователя
}