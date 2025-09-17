// src/api/chatService.ts
import { apiClient } from './http';
import { ChatMessage, Chat, Auth } from '@/types/chat';
import { apiPath } from '@/config';

export const api = {
  async fetchChats(auth: Auth): Promise<Chat[]> {
    const res = await apiClient.get(apiPath('/conversations'), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    // Маппим данные под наш интерфейс Chat
    return res.data.conversations.map((c: any) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar_url || undefined,
      lastMessage: {
        id: c.last_message.id,
        text: c.last_message.content,
        author: c.last_message.author_name,
        timestamp: c.last_message.timestamp,
        isRead: c.last_message.is_read,
        status: c.last_message.status,
        forwardedFromId: c.last_message.forwarded_from_id,
        forwardedFromChatId: c.last_message.forwarded_from_chat_id,
      },
      lastMessageTime: c.last_message.timestamp,
      unreadCount: c.unread_count || 0,
      isGroup: c.is_group,
    }));
  },

  async fetchMessages(chatId: number, auth: Auth): Promise<ChatMessage[]> {
    const res = await apiClient.get(apiPath(`/conversations/${chatId}/messages`), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    return res.data.map((m: any) => ({
      id: m.id,
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    }));
  },

  async sendMessage(
    chatId: number,
    text: string,
    auth: Auth,
    replyTo?: ChatMessage
  ): Promise<ChatMessage> {
    const res = await apiClient.post(
      apiPath(`/conversations/${chatId}/messages`),
      { content: text, replyToId: replyTo?.id },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    const m = res.data;
    return {
      id: m.id,
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    };
  },

  async updateMessage(
    chatId: number,
    messageId: string,
    newText: string,
    auth: Auth
  ): Promise<ChatMessage> {
    const res = await apiClient.put(
      apiPath(`/conversations/${chatId}/messages/${messageId}`),
      { content: newText },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    const m = res.data;
    return {
      id: m.id,
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    };
  },

  async deleteMessage(chatId: number, messageId: string, auth: Auth): Promise<void> {
    await apiClient.delete(apiPath(`/conversations/${chatId}/messages/${messageId}`), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
  },

  async sendAttachment(
    chatId: number,
    file: File,
    auth: Auth,
    text?: string,
    replyTo?: ChatMessage
  ): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('content', text);
    if (replyTo) formData.append('replyToId', replyTo.id);

    const res = await apiClient.post(apiPath(`/conversations/${chatId}/messages/attachment`), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const m = res.data;
    return {
      id: m.id,
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    };
  },
};
