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
import type { AppRole, AuthSession, AuthUser } from "@/shared/types/auth";

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
  const session = readStorage<AuthSession>(window.localStorage, STORAGE_KEY);
  if (!session?.accessToken) {
    return session;
  }

  const role = resolveJwtRole(decodeJwtPayload(session.accessToken));
  if (session.user.role === role) {
    return session;
  }

  return {
    ...session,
    user: {
      ...session.user,
      role,
    },
  };
}

const roleAliases: Record<string, AppRole> = {
  ROLE_USER: "ROLE_USER",
  USER: "ROLE_USER",
  ROLE_ADMIN: "ROLE_ADMIN",
  ADMIN: "ROLE_ADMIN",
  ROLE_SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
};

const rolePriority: AppRole[] = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_USER"];

function pickHighestRole(roles: Array<AppRole | null>) {
  return rolePriority.find((role) => roles.includes(role)) ?? null;
}

function normalizeRole(value: unknown): AppRole | null {
  if (typeof value === "string") {
    const tokens = value.split(/[,\s]+/).filter(Boolean);
    return pickHighestRole(tokens.map((token) => roleAliases[token.toUpperCase()] ?? null));
  }

  if (Array.isArray(value)) {
    return pickHighestRole(value.map((item) => normalizeRole(item)));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return pickHighestRole([
      normalizeRole(record.authority),
      normalizeRole(record.role),
      normalizeRole(record.name),
    ]);
  }

  return null;
}

function resolveJwtRole(jwt: ReturnType<typeof decodeJwtPayload>): AppRole {
  return pickHighestRole([
    normalizeRole(jwt?.role),
    normalizeRole(jwt?.roles),
    normalizeRole(jwt?.authorities),
    normalizeRole(jwt?.auth),
    normalizeRole(jwt?.scope),
  ]) ?? "ROLE_USER";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => hydrateSession());

  const clearSession = useCallback(() => {
    setSession(null);
    writeStorage(window.localStorage, STORAGE_KEY, null);
  }, []);

  const login = useCallback((payload: LoginPayload) => {
    const jwt = decodeJwtPayload(payload.accessToken);
    const role = resolveJwtRole(jwt);

    const nextSession: AuthSession = {
      accessToken: payload.accessToken,
      user: {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        role,
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
