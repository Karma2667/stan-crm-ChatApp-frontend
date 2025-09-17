// src/pages/HomePage.tsx
import { useAuthStore } from "@/store/useAuthStore";
import Header from "../components/Header";

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <Header
        username={user?.username || "Гость"}
        avatar={user?.avatar_url || undefined}
        online={user?.online ?? false}
      />

      <main className="pt-20 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Добро пожаловать в CRM-Чат 🚀
        </h1>
      </main>
    </div>
  );
}
