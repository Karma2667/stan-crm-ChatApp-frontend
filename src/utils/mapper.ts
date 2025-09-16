// src/utils/mapper.ts
import { Auth, User, AppAuth } from "@/api/auth";

/**
 * Преобразует объект Auth из API в AppAuth-формат для фронтенда/zustand
 */
export const mapAuthToAppAuth = (auth: Auth): AppAuth => ({
  token: auth.accessToken,
  refreshToken: auth.refreshToken,
  userId: auth.user.id,
  username: auth.user.username,
  avatar: auth.user.avatar_url || null,
  online: auth.user.online,
});

/**
 * Преобразует объект User из API в формат, который можно использовать на фронте
 */
export const mapUser = (user: User) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar_url || null,
  online: user.online,
  lastSeen: user.last_seen_at || null,
});

/**
 * Type guard для проверки, является ли объект Auth
 */
const isAuth = (obj: any): obj is Auth => "user" in obj && "accessToken" in obj;

/**
 * Mapper для FrontendAuth (ChatApp, ProfilePage)
 */
export interface FrontendAuth {
  token: string;
  userId: number;
  username: string;
  avatar_url?: string | null;
  online: boolean;
}

export const mapAuthForFrontend = (auth: Auth | AppAuth): FrontendAuth => {
  if (isAuth(auth)) {
    // это Auth из API
    return {
      token: auth.accessToken,
      userId: auth.user.id,
      username: auth.user.username,
      avatar_url: auth.user.avatar_url || null,
      online: auth.user.online,
    };
  } else {
    // это уже AppAuth
    return {
      token: auth.token,
      userId: auth.userId,
      username: auth.username,
      avatar_url: auth.avatar || null,
      online: auth.online,
    };
  }
};
