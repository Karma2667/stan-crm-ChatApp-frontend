// src/components/ChatWindow.tsx
import { useState, useEffect, useRef } from "react";
import { ChatMessage, Auth } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { api } from "@/api/chatService"; // импорт api

interface ChatWindowProps {
  chatId: number;
  auth: Auth;
  webSocket: {
    connect: () => void;
    disconnect: () => void;
    subscribe: (callback: (msg: ChatMessage & { chatId: number }) => void) => void;
    send: (data: { chatId: number; content: string }) => void;
  };
}

const ChatWindow = ({ chatId, auth, webSocket }: ChatWindowProps) => {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages[chatId] || [];

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      text: input,
      author: auth.username,
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
      status: "sent",
    };

    // Локально добавляем сообщение в zustand
    addMessage(chatId, msg);

    try {
      // Отправляем на сервер через API
      await api.sendMessage(chatId, input, auth);
      // Если нужно, можно обновить статус сообщения на "sent"
    } catch (err) {
      console.error("Ошибка отправки сообщения:", err);
      // Здесь можно обновить статус сообщения на "error"
    }

    // Отправляем через WebSocket (для реального времени другим клиентам)
    webSocket.send({ chatId, content: input });

    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-800"
      >
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm p-2 rounded ${
              msg.author === auth.username
                ? "bg-blue-100 dark:bg-blue-700 self-end"
                : "bg-gray-200 dark:bg-gray-700 self-start"
            }`}
          >
            <strong>{msg.author}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-300 dark:border-gray-700 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-2 py-1 mr-2 dark:bg-gray-900 dark:border-gray-600"
          placeholder="Напишите сообщение..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
