"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearSession, loadSession, saveSession } from "@/lib/auth-session";
import { apiLogin } from "@/lib/auth-api";
import { extractApiError } from "@/lib/api-client";
import { permissionsForRoles } from "@/constants/permissions";
import type { Session } from "@/types/auth";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthSessionContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setHydrated(true);
  }, []);

  const applySession = useCallback((next: Session) => {
    saveSession(next);
    setSession(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        const res = await apiLogin(email, password);
        const permissions = permissionsForRoles(res.user.roles);
        const next: Session = {
          token: res.accessToken,
          user: { ...res.user, permissions },
          permissions,
        };
        applySession(next);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: extractApiError(err, "Credenciales inválidas") };
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session: hydrated ? session : null,
      isAuthenticated: hydrated && !!session,
      login,
      logout,
    }),
    [session, hydrated, login, logout],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession debe usarse dentro de AuthSessionProvider");
  }
  return ctx;
}
