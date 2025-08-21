import { ChatMessage as MessageType, Auth } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export const api = {
  async fetchMessages(chatId: number): Promise<MessageType[]> {
    if (chatId === 1) {
      return Promise.resolve([
        {
          id: uuidv4(),
          author: 'Иван',
          text: 'Привет!',
          timestamp: '12:00',
          isRead: true,
          status: 'read'
        },
        {
          id: uuidv4(),
          author: 'Ты',
          text: 'Привет, как дела?',
          timestamp: '12:01',
          isRead: false,
          status: 'sent'
        }
      ]);
    }
    if (chatId === 2) {
      return Promise.resolve([
        {
          id: uuidv4(),
          author: 'Аня',
          text: 'Встреча в 15:00',
          timestamp: '09:45',
          isRead: true,
          status: 'read'
        },
        {
          id: uuidv4(),
          author: 'Ты',
          text: 'Ок, буду!',
          timestamp: '09:47',
          isRead: false,
          status: 'sent'
        }
      ]);
    }
    return Promise.resolve([]);
  },

  async sendMessage(
    chatId: number,
    text: string,
    auth: Auth,
    replyTo?: MessageType
  ): Promise<MessageType> {
    return Promise.resolve({
      id: uuidv4(),
      author: auth.userId === 1 ? 'Ты' : 'User',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      status: 'sent',
      replyTo: replyTo?.id
    });
  },

  async updateMessage(
    _chatId: number,
    _messageId: string,
    _newText: string,
    _auth: Auth
  ): Promise<void> {
    return Promise.resolve();
  },

  async deleteMessage(
    _chatId: number,
    _messageId: string,
    _auth: Auth
  ): Promise<void> {
    return Promise.resolve();
  },

  async sendAttachment(
    chatId: number,
    file: File,
    auth: Auth,
    text?: string,
    replyTo?: MessageType
  ): Promise<MessageType> {
    return Promise.resolve({
      id: uuidv4(),
      author: auth.userId === 1 ? 'Ты' : 'User',
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      status: 'sent',
      replyTo: replyTo?.id,
      attachment: {
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name
      }
    });
  }
};
