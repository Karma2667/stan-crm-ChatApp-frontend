import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ChatApp from "./components/ChatApp";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage"; // <-- импорт без пропса
import Header from "./components/Header";
import { useAuthStore } from "./store/useAuthStore";
import { subscribeToChat } from "./services/cable";
import { api } from "./api/chatService";

function App() {
  const { getAppAuth, refresh, loading, setAuth } = useAuthStore();
  const auth = getAppAuth();

  useEffect(() => {
    // При загрузке пытаемся обновить токен
    if (auth?.refreshToken) {
      refresh().catch(() => setAuth(null));
    }
  }, [auth, refresh, setAuth]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const realWebSocket = auth
    ? {
        connect: () => console.log("WS connected with", auth.username),
        disconnect: () => console.log("WS disconnected"),
        subscribe: (callback: (msg: any) => void) => subscribeToChat(1, callback, auth.token),
        send: (data: { chatId: number; content: string }) =>
          api.sendMessage(data.chatId, data.content, auth).then((msg) => console.log("Sent message:", msg)),
      }
    : null;

  return (
    <>
      {auth && <Header username={auth.username} avatar={auth.avatar || undefined} online={auth.online} />}

      <Routes>
        <Route path="/" element={auth ? <HomePage /> : <Navigate to="/login" />} />
        <Route
          path="/chat"
          element={auth && realWebSocket ? <ChatApp auth={auth} api={api} webSocket={realWebSocket} /> : <Navigate to="/login" />}
        />
        <Route path="/profile" element={auth ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={auth ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
