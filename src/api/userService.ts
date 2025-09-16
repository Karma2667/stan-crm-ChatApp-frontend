// src/api/userService.ts
import { apiClient } from "./http";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  online?: boolean;
  last_seen_at?: string | null;
}

// Получить текущего пользователя
export const getCurrentUser = async (): Promise<UserProfile> => {
  const res = await apiClient.get("/v1/users/current");
  return res.data;
};

// Обновить профиль
export const updateProfile = async (
  username: string,
  avatarData?: any,
  removeAvatar?: boolean
): Promise<UserProfile> => {
  const body: any = {
    user: {
      username,
      remove_avatar: removeAvatar || false,
    },
  };

  if (avatarData) {
    body.user.avatar = avatarData;
    body.user.remove_avatar = false; // если передан файл, игнорируем remove_avatar
  }

  const res = await apiClient.patch("/v1/users/profile", body);
  return res.data;
};

// Загрузка аватара
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("attachment", file);
  const res = await apiClient.post("/v1/attachments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // {id, storage, metadata}
};

// Запрос на смену пароля
export const requestPasswordReset = async (email: string) => {
  await apiClient.post("/v1/auth/request_password_reset", { auth: { email } });
};
