export interface Auth {
  token: string;
  userId: number;
}

export interface Chat {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  author: string;
  attachment?: {
    url: string; // URL вложения (например, из API или mock)
    type: string; // MIME-тип, например, "image/png", "application/pdf"
    name: string; // Имя файла
  };
}