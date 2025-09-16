import { createConsumer } from "@rails/actioncable";

export const createCable = (token: string) => {
  const url = `/cable?token=${token}`;
  console.log("[WebSocket] Connecting to:", url);
  return createConsumer(url);
};

export function subscribeToChat(chatId: number, onMessage: (msg: any) => void, token: string) {
  if (!token) {
    console.error("[WebSocket] No token provided for subscription");
    return null;
  }
  const cable = createCable(token);
  const sub: any = cable.subscriptions.create(
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
        onMessage(data);
      },
      sendMessage(payload: any) {
        console.log(`[WebSocket] Sending message to chat ${chatId}:`, payload);
        this.perform("receive", payload);
      },
    }
  );
  return sub;
}