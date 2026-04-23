export type AppRole = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_SUPER_ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: AppRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
