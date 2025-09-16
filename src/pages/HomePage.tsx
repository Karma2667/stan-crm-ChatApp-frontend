// src/pages/HomePage.tsx
import { useAuthStore } from "@/store/useAuthStore";
import Header from "../components/Header";

export default function HomePage() {
  const { getAppAuth } = useAuthStore();
  const auth = getAppAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Шапка */}
      <Header
        username={auth?.username || "Гость"}
        avatar={auth?.avatar || undefined} // ✅ Преобразуем null в undefined
        online={auth?.online ?? false}
      />

      {/* Контент */}
      <main className="pt-20 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Добро пожаловать в CRM-Чат 🚀
        </h1>
      </main>
    </div>
  );
}