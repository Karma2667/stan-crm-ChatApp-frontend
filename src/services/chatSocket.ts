// src/services/chatSocket.ts
import { createConsumer } from "@rails/actioncable";
import { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";

let cable: ReturnType<typeof createConsumer> | null = null;
const subscriptions: Record<number, any> = {}; // chatId -> subscription

/**
 * 🔹 Создаём WebSocket соединение один раз
 */
export const connectSocket = (token: string) => {
  if (!token) return;
  if (cable) return; // уже подключено

  const url = `/cable?token=${token}`;
  console.log("[WebSocket] Connecting to:", url);
  cable = createConsumer(url);
};

/**
 * 🔹 Подписка на один чат
 */
export const subscribeToChat = (chatId: number) => {
  if (!cable) return null;
  if (subscriptions[chatId]) return subscriptions[chatId];

  const sub = cable.subscriptions.create(
    { channel: "ChatChannel", chat_id: chatId },
    {
      connected() {
        console.log(`[WebSocket] Connected to ChatChannel, chat_id: ${chatId}`);
      },
      disconnected() {
        console.log(`[WebSocket] Disconnected from ChatChannel, chat_id: ${chatId}`);
      },
      received(data: any) {
        console.log(`[WebSocket] Received message for chat ${chatId}:`, data);
        handleIncomingMessage(chatId, data);
      },
      sendMessage(payload: any) {
        this.perform("send_message", payload);
      },
    }
  );

  subscriptions[chatId] = sub;
  return sub;
};

/**
 * 🔹 Обработка входящего сообщения
 */
const handleIncomingMessage = (chatId: number, data: any) => {
  const store = useChatStore.getState();

  if (data.type === "message_created" && data.payload) {
    const msg: ChatMessage = {
      id: data.payload.id.toString(),
      text: data.payload.content,
      author: data.payload.user.username,
      timestamp: data.payload.created_at,
      isRead: chatId === store.activeChatId,
      status: "sent",
      forwardedFromId: data.payload.replied_to_id || undefined,
      forwardedFromChatId: undefined,
    };

    store.addMessage(chatId, msg);
  }
};

/**
 * 🔹 Отправка сообщения через WebSocket
 */
export const sendMessageWS = (chatId: number, text: string) => {
  const sub = subscriptions[chatId];
  if (!sub) return;

  sub.sendMessage({ content: text });
};

/**
 * 🔹 Подписка на все текущие чаты
 */
export const subscribeToAllChats = () => {
  const store = useChatStore.getState();
  store.chats.forEach(chat => subscribeToChat(chat.id));
};
