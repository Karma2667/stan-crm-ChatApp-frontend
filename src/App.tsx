// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import ChatPage from "@/pages/ChatPage";
import { useAuthStore } from "./store/useAuthStore";
import { subscribeToChat } from "./services/cable";
import { api } from "./api/chatService";
import { Auth } from "./types/chat";

function App() {
  const { user, accessToken, refresh, setAuth, loading } = useAuthStore();
  const [auth, setLocalAuth] = useState<Auth | null>(null);

  useEffect(() => {
    if (user && accessToken) {
      setLocalAuth({
        token: accessToken,
        userId: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url || undefined,
        online: user.online || false,
      });
    } else {
      setLocalAuth(null);
    }
  }, [user, accessToken]);

  useEffect(() => {
    let isMounted = true;

    const tryRefresh = async () => {
      if (accessToken && user) return;

      try {
        await refresh();
      } catch {
        if (isMounted) setAuth(null);
      }
    };

    tryRefresh();
    return () => { isMounted = false; };
  }, [accessToken, user, refresh, setAuth]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const realWebSocket = auth ? {
    connect: () => console.log("WS connected with", auth.username),
    disconnect: () => console.log("WS disconnected"),
    subscribe: (callback: (msg: any) => void) =>
      subscribeToChat(1, callback, auth.token),
    send: (data: { chatId: number; content: string }) =>
      api.sendMessage(data.chatId, data.content, auth).then(msg => console.log("Sent message:", msg)),
  } : undefined;

  return (
    <>
      {auth && <Header username={auth.username} avatar={auth.avatar_url} online={auth.online} />}
      <Routes>
        <Route path="/" element={auth ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={auth && realWebSocket ? (
          <ChatPage auth={auth} webSocket={realWebSocket} />
        ) : <Navigate to="/login" />} />
        <Route path="/profile" element={auth ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={auth ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
