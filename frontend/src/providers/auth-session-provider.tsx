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
import {
  buildMockSession,
  findMockUserByRole,
  validateMockLogin,
} from "@/lib/mock-auth";
import type { MockRoleCode } from "@/constants/permissions";
import type { MockSession } from "@/types/auth";

interface AuthSessionContextValue {
  session: MockSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  loginAsRole: (role: MockRoleCode) => MockSession;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setHydrated(true);
  }, []);

  const applySession = useCallback((next: MockSession) => {
    saveSession(next);
    setSession(next);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const next = validateMockLogin(email, password);
    if (!next) return false;
    applySession(next);
    return true;
  }, [applySession]);

  const loginAsRole = useCallback(
    (role: MockRoleCode): MockSession => {
      const credential = findMockUserByRole(role);
      const next = buildMockSession(credential);
      applySession(next);
      return next;
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
      loginAsRole,
      logout,
    }),
    [session, hydrated, login, loginAsRole, logout],
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
