import type { MockSession } from "@/types/auth";

const TOKEN_KEY = "investco_token";
const PERMISSIONS_KEY = "investco_permissions";
const USER_KEY = "investco_user";

export function saveSession(session: MockSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(session.permissions));
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const permissionsRaw = localStorage.getItem(PERMISSIONS_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !permissionsRaw || !userRaw) return null;
  try {
    return {
      token,
      permissions: JSON.parse(permissionsRaw),
      user: JSON.parse(userRaw),
    };
  } catch {
    clearSession();
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
