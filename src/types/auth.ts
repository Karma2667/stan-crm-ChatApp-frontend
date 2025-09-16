// src/types/auth.ts

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  online: boolean;
  lastSeenAt?: string | null;
}

export interface AppAuth {
  accessToken: string;
  refreshToken: string;
  user: User;
}
