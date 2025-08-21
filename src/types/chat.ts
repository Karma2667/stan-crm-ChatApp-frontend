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

export interface Attachment {
  url: string;
  type: string;
  name: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  replyTo?: string;
  attachment?: Attachment;
  isRead: boolean;
  status: MessageStatus;
  forwardedFromId?: string;   // ID оригинального сообщения
  forwardedFromChatId?: number; 
}
