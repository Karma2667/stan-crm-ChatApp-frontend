import { apiClient } from './http';
import { ChatMessage, Chat, Auth } from '@/types/chat';
import { apiPath } from '@/config';

export const api = {
  async fetchChats(auth: Auth): Promise<Chat[]> {
    const res = await apiClient.get(apiPath('/conversations'), {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    return res.data;
  },

  async fetchMessages(chatId: number, auth: Auth): Promise<ChatMessage[]> {
    const res = await apiClient.get(apiPath(`/conversations/${chatId}/messages`), {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    return res.data;
  },

  // Теперь replyTo — это объект ChatMessage
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
    return res.data;
  },

  async updateMessage(chatId: number, messageId: string, newText: string, auth: Auth): Promise<ChatMessage> {
    const res = await apiClient.put(
      apiPath(`/conversations/${chatId}/messages/${messageId}`),
      { content: newText },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    return res.data;
  },

  async deleteMessage(chatId: number, messageId: string, auth: Auth): Promise<void> {
    await apiClient.delete(apiPath(`/conversations/${chatId}/messages/${messageId}`), {
      headers: { Authorization: `Bearer ${auth.token}` }
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
        Authorization: `Bearer ${auth.token}`
      }
    });
    return res.data;
  }
};
