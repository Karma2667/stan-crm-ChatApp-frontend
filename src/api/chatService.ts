// src/api/chatService.ts
import { apiClient } from './http';
import { ChatMessage, Chat, Auth } from '@/types/chat';
import { apiPath } from '@/config';

interface Pagination {
  page: number;
  items: number;
  total_pages: number;
  total_count: number;
}

interface ConversationsResponse {
  conversations: any[];
  meta: { pagination: Pagination };
}

export const api = {
  // 🔹 Список диалогов (с пагинацией)
  async fetchChats(auth: Auth, page = 1, items = 20): Promise<{ chats: Chat[]; pagination: Pagination }> {
    const res = await apiClient.get<ConversationsResponse>(apiPath('/conversations'), {
      headers: { Authorization: `Bearer ${auth.token}` },
      params: { page, items },
    });

    const chats: Chat[] = res.data.conversations.map((c: any) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar_url || undefined,
      lastMessage: c.last_message
        ? {
            id: c.last_message.id.toString(),
            text: c.last_message.content,
            author: c.last_message.user?.username || 'Unknown',
            timestamp: c.last_message.created_at,
            isRead: c.last_message.is_read,
            status: 'sent' as const,
            forwardedFromId: c.last_message.forwarded_from_id,
            forwardedFromChatId: c.last_message.forwarded_from_chat_id,
          }
        : undefined, // <- теперь просто undefined
      lastMessageTime: c.last_message?.created_at || '',
      unreadCount: c.unread_count || 0,
      isGroup: c.is_group || false,
    }));

    return { chats, pagination: res.data.meta.pagination };
  },

  // 🔹 Создание диалога
  async createChat(auth: Auth, type: 'private_chat' | 'group_chat', userIds: number[], name?: string): Promise<Chat> {
    const body: any = { conversation: { conversation_type: type, user_ids: userIds } };
    if (type === 'group_chat' && name) body.conversation.name = name;

    const res = await apiClient.post(apiPath('/conversations'), body, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    return {
      id: res.data.id,
      name: res.data.name,
      avatar: res.data.avatar_url,
      lastMessage: undefined, // новый чат без сообщений
      lastMessageTime: '',
      unreadCount: 0,
      isGroup: type === 'group_chat',
    };
  },

  // 🔹 Детали диалога
  async fetchChatDetails(chatId: number, auth: Auth): Promise<Chat> {
    const res = await apiClient.get(apiPath(`/conversations/${chatId}`), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    const c = res.data;
    return {
      id: c.id,
      name: c.name,
      avatar: c.avatar_url,
      lastMessage: c.last_message
        ? {
            id: c.last_message.id.toString(),
            text: c.last_message.content,
            author: c.last_message.user?.username || 'Unknown',
            timestamp: c.last_message.created_at,
            isRead: c.last_message.is_read,
            status: 'sent' as const,
            forwardedFromId: c.last_message.forwarded_from_id,
            forwardedFromChatId: c.last_message.forwarded_from_chat_id,
          }
        : undefined,
      lastMessageTime: c.last_message?.created_at || '',
      unreadCount: c.unread_count || 0,
      isGroup: c.is_group || false,
    };
  },

  // 🔹 Удаление диалога
  async deleteChat(chatId: number, auth: Auth): Promise<void> {
    await apiClient.delete(apiPath(`/conversations/${chatId}`), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
  },

  // 🔹 Переименование диалога
  async renameChat(chatId: number, newName: string, auth: Auth): Promise<{ success: boolean; name: string }> {
    const res = await apiClient.patch(
      apiPath(`/conversations/${chatId}/rename`),
      { name: newName },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    return { success: res.data.success, name: res.data.name };
  },

  // 🔹 Получение сообщений диалога
  async fetchMessages(chatId: number, auth: Auth): Promise<ChatMessage[]> {
    const res = await apiClient.get(apiPath(`/conversations/${chatId}/messages`), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    return res.data.map((m: any) => ({
      id: m.id.toString(),
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    }));
  },

  // 🔹 Отправка сообщения
  async sendMessage(chatId: number, text: string, auth: Auth, replyToId?: string): Promise<ChatMessage> {
    const res = await apiClient.post(
      apiPath(`/conversations/${chatId}/messages`),
      { content: text, replyToId },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    const m = res.data;
    return {
      id: m.id.toString(),
      text: m.content,
      author: m.author_name,
      timestamp: m.timestamp,
      isRead: m.is_read,
      status: m.status,
      forwardedFromId: m.forwarded_from_id,
      forwardedFromChatId: m.forwarded_from_chat_id,
    };
  },

  // 🔹 Остальные методы updateMessage, deleteMessage, sendAttachment оставляем как есть
};
