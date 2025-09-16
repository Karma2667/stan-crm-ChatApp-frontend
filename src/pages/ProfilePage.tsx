import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  online?: boolean;
  last_seen_at?: string | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, refresh, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🔹 Загрузка профиля
  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get<UserProfile>("/api/v1/users/current", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProfile(res.data);
        setAvatarPreview(res.data.avatar_url || null);
      } catch (err: any) {
        console.error("Ошибка загрузки профиля:", err);
        if (err.response?.status === 401) {
          try {
            await refresh();
            fetchProfile();
          } catch {
            setMessage("⚠️ Не удалось обновить токен. Войдите снова.");
            logout();
            navigate("/login", { replace: true });
          }
        } else {
          setMessage("⚠️ Не удалось загрузить профиль");
        }
      }
    };

    fetchProfile();
  }, [user, accessToken, refresh, navigate, logout]);

  // 🔹 Изменение аватара
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 🔹 Сохранение профиля
  const handleSaveProfile = async () => {
    if (!profile || !accessToken) return;

    try {
      let avatarData: any = undefined;

      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append("file", avatarFile);

          const uploadRes = await axios.post("/api/v1/attachments/upload", formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          });

          avatarData = {
            id: uploadRes.data.id,
            storage: uploadRes.data.storage,
            metadata: uploadRes.data.metadata,
          };
        } catch (uploadErr) {
          console.warn("⚠️ Не удалось загрузить аватар. PATCH пойдёт только с username.", uploadErr);
          setMessage("⚠️ Не удалось загрузить аватар. Сохраняем только имя пользователя.");
        }
      }

      const body: any = { user: { username: profile.username } };
      if (avatarData) {
        body.user.avatar = avatarData;
        body.user.remove_avatar = false;
      }

      const res = await axios.patch("/api/v1/users/profile", body, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setProfile(prev => prev ? { ...prev, ...res.data } : prev);
      setAvatarPreview(res.data.avatar_url || avatarPreview);
      setMessage("✅ Профиль обновлён!");
    } catch (err: any) {
      console.error("Ошибка обновления профиля:", err);
      setMessage(err.response?.data?.message || "Ошибка обновления");
    }
  };

  // 🔹 Запрос на сброс пароля
  const requestPasswordReset = async () => {
    if (!profile?.email) return;

    try {
      await axios.post("/api/v1/auth/request_password_reset", {
        auth: { email: profile.email },
      });
      setMessage("📧 Письмо для смены пароля отправлено на почту!");
    } catch (err: any) {
      console.error("Ошибка при сбросе пароля:", err);
      setMessage(err.response?.data?.message || "Ошибка при запросе смены пароля");
    }
  };

  // 🔹 Логаут
  const handleLogout = async () => {
    try {
      if (accessToken) {
        await axios.delete("/api/v1/auth/logout", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch {}
    logout();
    navigate("/login", { replace: true });
  };

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
            value={profile.username || ""}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Email"
            value={profile.email || ""}
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
