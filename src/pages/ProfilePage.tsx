import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
  const {
    profile,
    avatarPreview,
    message,
    handleAvatarChange,
    handleSaveProfile,
    requestPasswordReset,
    handleLogout,
    setProfile,
    handleRemoveAvatar,
  } = useProfile();

  // 🔹 Логика HTTP ping для онлайн-статуса
  useEffect(() => {
  let isMounted = true;
  let lastPingTime = Date.now();

  const pingPresence = async () => {
    try {
      const res = await axios.post("/api/v1/users/ping", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (!isMounted) return;

      lastPingTime = Date.now();
      setProfile(prev => prev ? { ...prev, online: res.data.online, last_seen_at: res.data.last_seen_at } : prev);
    } catch (err) {
      console.error("Ошибка ping:", err);
    }
  };

  pingPresence(); // первый пинг сразу

  const interval = setInterval(() => {
    // если прошло больше 35 секунд с последнего пинга — считаем offline
    const now = Date.now();
    setProfile(prev => prev ? { 
      ...prev, 
      online: now - lastPingTime <= 35_000 ? prev.online : false 
    } : prev);

    pingPresence();
  }, 25_000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, []);

  if (!profile) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">Мой профиль</h1>
          <button
            onClick={() => history.back()}
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
                {profile.username ? profile.username.charAt(0).toUpperCase() : "?"}
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

          {profile.avatar_url && (
            <button
              onClick={handleRemoveAvatar}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mt-2"
            >
              Удалить аватар
            </button>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-3 h-3 rounded-full ${profile.online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {profile.online ? "Online" : "Offline"}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Последний раз в сети: {profile.last_seen_at ? new Date(profile.last_seen_at).toLocaleString() : "—"}
          </p>
        </div>


        {/* Инпуты */}
        <div className="flex flex-col gap-2 mb-6">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={profile?.username || ""}
            onChange={(e) => setProfile(profile ? { ...profile, username: e.target.value } : null)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Email"
            value={profile?.email || ""}
            disabled
            className="px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          Сохранить изменения
        </button>

        <button
          onClick={requestPasswordReset}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Запросить смену пароля (письмо)
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
