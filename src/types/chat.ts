export interface Auth {
  token: string;
  userId: number;
  username: string;
  email: string;
  avatar_url?: string;
  online: boolean;
}

// src/types/chat.ts
export interface ChatMessage {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isRead: boolean;
  status: string;
  attachments?: any[];
  replyTo?: string; // вместо replyToId
}

export interface Chat {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: ChatMessage;
  lastMessageTime: string; // обязательно
  unreadCount: number;
  isGroup: boolean;
}

