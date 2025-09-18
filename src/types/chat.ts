  export interface Auth {
    token: string;
    userId: number;
    username: string;
    email: string;
    avatar_url?: string;
    online: boolean;
  }

  export interface ChatMessage {
    id: string;
    text: string;
    timestamp: string;
    author: string;
    isRead: boolean;
    status: 'sent' | 'read' | 'delivered';
    forwardedFromId?: string;
    forwardedFromChatId?: number;
  }

// src/types/chat.ts
export interface Chat {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: ChatMessage; // <- сделано опциональным
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
}

