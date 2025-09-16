// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  online?: boolean;
  last_seen_at?: string | null;
}

export const useProfile = () => {
  const navigate = useNavigate();
  const { user, accessToken, refresh, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🔹 Загружаем профиль
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
        setAvatarPreview(uploadRes.data.url || avatarPreview);
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

    try {
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

  // 🔹 Удаление аватара
  const handleRemoveAvatar = async () => {
    if (!profile || !accessToken) return;

    try {
      const body = { user: { username: profile.username, remove_avatar: true } };

      await axios.patch("/api/v1/users/profile", body, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setProfile(prev => prev ? { ...prev, avatar_url: null } : prev);
      setAvatarPreview(null);
      setAvatarFile(null);
      setMessage("✅ Аватар удалён!");
    } catch (err: any) {
      console.error("Ошибка при удалении аватара:", err);
      setMessage(err.response?.data?.message || "Ошибка удаления аватара");
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

  return {
    profile,
    avatarPreview,
    message,
    setProfile,
    setMessage,
    handleAvatarChange,
    handleSaveProfile,
    handleRemoveAvatar, // <-- добавили
    requestPasswordReset,
    handleLogout,
  };
};
