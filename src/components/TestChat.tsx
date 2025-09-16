// src/components/TestChat.tsx
import { useEffect, useState } from 'react';
import { api } from '@/api/chatService';
import { ChatMessage, Auth } from '@/types/chat';

// Твой реальный токен с бекенда
const realAuth: Auth = {
  token: 'eyJraWQiOiJkZWZhdWx0Ii...', // вставь сюда свой токен
  userId: 1
};

export default function TestChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.fetchMessages(1, realAuth); // передаем auth
        setMessages(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке сообщений');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Загрузка сообщений...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h2>Тест чата</h2>
      {messages.length === 0 ? (
        <div>Сообщений пока нет</div>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.author}:</strong> {msg.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
