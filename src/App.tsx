import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatApp from './components/ChatApp';
import { v4 as uuidv4 } from 'uuid';

const mockApi = {
  fetchChats: async (auth: { token: string; userId: number }) => [
    { id: 1, name: 'Тестовый пользователь 1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1', lastMessage: 'Привет!', lastMessageTime: '10:30', unreadCount: 2, isGroup: false },
    { id: 2, name: 'Групповой чат', lastMessage: 'Встреча?', lastMessageTime: '09:45', unreadCount: 0, isGroup: true },
  ],
  fetchMessages: async (chatId: number, auth: { token: string; userId: number }) => [
    { id: uuidv4(), text: 'Привет!', timestamp: '10:30', author: 'Иван' },
    { id: uuidv4(), text: 'Хорошо!', timestamp: '10:32', author: 'Ты' },
  ],
  sendMessage: async (chatId: number, text: string, auth: { token: string; userId: number }) => {
    console.log(`Отправлено: ${text} в чат ${chatId} с ${auth.token}`);
  },
};

class MockWebSocket {
  connect(auth: { token: string; userId: number }) {
    console.log('WebSocket connected with', auth);
  }
  disconnect() {}
  subscribe(callback: (data: { id: string; text: string; timestamp: string; author: string }) => void) {}
  send(data: { chatId: number; content: string }) {}
}

const mockWebSocket = new MockWebSocket();

function App() {
  const auth = { token: 'test-token', userId: 1 };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatApp api={mockApi} webSocket={mockWebSocket} auth={auth} />} />
        <Route path="/" element={<div><a href="/chat">Перейти в чат</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;