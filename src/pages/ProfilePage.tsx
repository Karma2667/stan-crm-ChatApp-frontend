// src/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/http";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [online, setOnline] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🔹 Загружаем профиль
  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/v1/users/current", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setUsername(res.data.username);
        setEmail(res.data.email);
        setAvatarPreview(res.data.avatar_url || null);
        setOnline(res.data.online);
        setLastSeenAt(res.data.last_seen_at);
      } catch (err: any) {
        console.error("Ошибка загрузки профиля:", err);
        setMessage("⚠️ Не удалось загрузить профиль");
      }
    };

    fetchProfile();
  }, [user, accessToken, navigate]);

  // 🔹 Изменение аватара
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 🔹 Сохранение профиля
  const handleSaveProfile = async () => {
    if (!accessToken) return;

    try {
      // Обновляем username
      await apiClient.put(
        "/v1/users/current",
        { username },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Если есть новый аватар — отправляем
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        await apiClient.post("/v1/users/current/avatar", formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMessage("✅ Профиль обновлён!");
    } catch (err: any) {
      console.error("Ошибка обновления профиля:", err);
      setMessage(err.response?.data?.message || "Ошибка обновления");
    }
  };

  // 🔹 Логаут
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">Мой профиль</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Назад
          </button>
        </div>

        {/* Аватар */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
                {username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <label className="mt-3 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Загрузить аватар
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && handleAvatarChange(e.target.files[0])}
            />
          </label>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-3 h-3 rounded-full ${online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Последний раз в сети: {lastSeenAt ? new Date(lastSeenAt).toLocaleString() : "—"}
          </p>
        </div>

        {/* Инпуты */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Email"
            value={email}
            disabled
            className="w-1/2 px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
        >
          Сохранить изменения
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Выйти
        </button>

        {message && <p className="text-center text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}
