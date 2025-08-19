import ChatApp from './components/ChatApp';
import { Auth } from './types/chat';  // убрал Chat и MessageType
import { v4 as uuidv4 } from 'uuid';

const mockApi = {
  fetchChats: (_auth: Auth) =>
    Promise.resolve([
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
    ]),

  fetchMessages: (_chatId: number, _auth: Auth) =>
    Promise.resolve([
      { id: '1', text: 'Привет! Как дела?', timestamp: '10:30', author: 'Иван' },
      { id: '2', text: 'Хорошо, а у тебя?', timestamp: '10:32', author: 'Ты' },
    ]),

  sendMessage: (_chatId: number, text: string, _auth: Auth) => {
    console.log(`Отправлено: ${text} в чат ${_chatId}`);
    return Promise.resolve();
  },

  deleteMessage: (_chatId: number, _messageId: string, _auth: Auth) => {
    console.log(`Mock deleteMessage: chatId=${_chatId}, messageId=${_messageId}`);
    return Promise.resolve();
  },

  updateMessage: (_chatId: number, _messageId: string, text: string, _auth: Auth) => {
    console.log(`Mock updateMessage: chatId=${_chatId}, messageId=${_messageId}, newText="${text}"`);
    return Promise.resolve();
  },

  sendAttachment: (_chatId: number, file: File, _auth: Auth, text?: string) => {
    console.log(`Mock sendAttachment: chatId=${_chatId}, file=${file.name}, type=${file.type}, text=${text || ''}`);
    const mockUrl = URL.createObjectURL(file); // Временный URL, исчезает после обновления страницы
    return Promise.resolve({
      id: uuidv4(),
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Ты',
      attachment: {
        url: mockUrl,
        type: file.type,
        name: file.name,
      },
    });
  },
};

const mockWebSocket = {
  connect: (auth: Auth) => console.log('WebSocket connected with', auth),
  disconnect: () => console.log('WebSocket disconnected'),
  subscribe: () => console.log('WebSocket subscribed'), // убрал неиспользуемый аргумент
  send: (data: { chatId: number; content: string }) => console.log('WebSocket send:', data),
};

const mockAuth: Auth = { token: 'test-token', userId: 1 };

function App() {
  return (
    <ChatApp api={mockApi} webSocket={mockWebSocket} auth={mockAuth} />
  );
}

export default App;
