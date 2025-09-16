// types.ts
// src/types/types.ts
export interface Auth { // API тип
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
    online: boolean;
    email: string;
  };
}

export interface AppAuth {     // UI тип
  token: string;
  userId: number;
  username: string;
  avatar?: string;
  online: boolean;
}
