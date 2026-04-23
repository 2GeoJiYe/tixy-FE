import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clearUnauthorizedHandler, registerUnauthorizedHandler } from "@/shared/api/http";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { readStorage, writeStorage } from "@/shared/lib/storage";
import type { AuthSession, AuthUser } from "@/shared/types/auth";

const STORAGE_KEY = "tixy.auth.session";

interface LoginPayload {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hydrateSession() {
  return readStorage<AuthSession>(window.localStorage, STORAGE_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => hydrateSession());

  const clearSession = useCallback(() => {
    setSession(null);
    writeStorage(window.localStorage, STORAGE_KEY, null);
  }, []);

  const login = useCallback((payload: LoginPayload) => {
    const jwt = decodeJwtPayload(payload.accessToken);
    const role = jwt?.role;

    const nextSession: AuthSession = {
      accessToken: payload.accessToken,
      user: {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        role:
          role === "ROLE_ADMIN" || role === "ROLE_SUPER_ADMIN" || role === "ROLE_USER"
            ? role
            : "ROLE_USER",
      },
    };

    setSession(nextSession);
    writeStorage(window.localStorage, STORAGE_KEY, nextSession);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(clearSession);
    return () => clearUnauthorizedHandler();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      logout: clearSession,
    }),
    [clearSession, login, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
