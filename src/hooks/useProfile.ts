// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/http";
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
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🔹 Загрузка профиля
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiClient.get<UserProfile>("/users/current");
        setProfile(res.data);
        setAvatarPreview(res.data.avatar_url || null);
      } catch (err: any) {
        console.error("Ошибка загрузки профиля:", err);
        setMessage("⚠️ Не удалось загрузить профиль. Войдите снова.");
        logout();
        navigate("/login", { replace: true });
      }
    };

    fetchProfile();
  }, [user, navigate, logout]);

  // 🔹 Пинг для онлайн-статуса (каждые 30 секунд)
// 🔹 Пинг для онлайн-статуса (каждые 30 секунд)
useEffect(() => {
  if (!user) return; // проверяем, что пользователь есть

  let isMounted = true;
  let lastPingTime = Date.now();

  const pingPresence = async () => {
    try {
      const res = await apiClient.post("/users/ping");
      if (!isMounted) return;

      lastPingTime = Date.now();
      setProfile(prev => prev ? { ...prev, online: res.data.online, last_seen_at: res.data.last_seen_at } : prev);
    } catch (err) {
      console.error("Ошибка ping:", err);
      setProfile(prev => prev ? { ...prev, online: false } : prev);
    }
  };

  pingPresence(); // первый пинг сразу

  const interval = setInterval(() => {
    pingPresence();
    const now = Date.now();
    setProfile(prev => prev ? { 
      ...prev, 
      online: now - lastPingTime <= 35_000 ? prev.online : false 
    } : prev);
  }, 30_000); // интервал 30 секунд

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [user]); // зависимость только user


  // 🔹 Работа с аватаром
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    let avatarData: any;

    if (avatarFile) {
      try {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await apiClient.post("/attachments/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        avatarData = {
          id: uploadRes.data.id,
          storage: uploadRes.data.storage,
          metadata: uploadRes.data.metadata,
        };
        setAvatarPreview(uploadRes.data.url || avatarPreview);
      } catch {
        setMessage("⚠️ Не удалось загрузить аватар. Сохраняем только имя пользователя.");
      }
    }

    const body: any = { user: { username: profile.username } };
    if (avatarData) {
      body.user.avatar = avatarData;
      body.user.remove_avatar = false;
    }

    try {
      const res = await apiClient.patch("/users/profile", body);
      setProfile(prev => prev ? { ...prev, ...res.data } : prev);
      setAvatarPreview(res.data.avatar_url || avatarPreview);
      setMessage("✅ Профиль обновлён!");
    } catch (err: any) {
      console.error("Ошибка обновления профиля:", err);
      setMessage(err.response?.data?.message || "Ошибка обновления");
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile) return;
    try {
      await apiClient.patch("/users/profile", {
        user: { username: profile.username, remove_avatar: true },
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

  const requestPasswordReset = async () => {
    if (!profile?.email) return;
    try {
      await apiClient.post("/auth/request_password_reset", { auth: { email: profile.email } });
      setMessage("📧 Письмо для смены пароля отправлено на почту!");
    } catch (err: any) {
      console.error("Ошибка при сбросе пароля:", err);
      setMessage(err.response?.data?.message || "Ошибка при запросе смены пароля");
    }
  };

  const handleLogout = async () => {
    try { await apiClient.delete("/auth/logout"); } catch {}
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
    handleRemoveAvatar,
    requestPasswordReset,
    handleLogout,
  };
};
