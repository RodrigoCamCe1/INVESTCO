"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/lib/api-client";
import type { AuthUser, LoginCredentials, JWTPayload } from "@/types/auth";

/**
 * HOOK DE AUTENTICACIÓN
 * 
 * Proporciona:
 * - Estado de usuario actual
 * - Métodos de login/logout
 * - Verificación de permisos
 * - Gestión de sesión
 */

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout: storeLogout,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====================================================================
  // QUERY: Obtener usuario actual
  // ====================================================================
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", "current"],
    queryFn: () => apiGet<AuthUser>("/auth/me"),
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // ====================================================================
  // MUTATION: Login
  // ====================================================================
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiPost<{ user: AuthUser; token: string; refreshToken: string }>(
        "/auth/login",
        credentials
      );
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      setError(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al iniciar sesión";
      setError(message);
    },
  });

  // ====================================================================
  // MUTATION: Logout
  // ====================================================================
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/auth/logout", {});
    },
    onSettled: () => {
      storeLogout();
      setError(null);
    },
  });

  // ====================================================================
  // Método: Login
  // ====================================================================
  const login = useCallback(
    async (email: string, password: string) => {
      return loginMutation.mutate({ email, password });
    },
    [loginMutation]
  );

  // ====================================================================
  // Método: Logout
  // ====================================================================
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // ====================================================================
  // Método: Verificar si el usuario tiene un rol específico
  // ====================================================================
  const hasRole = useCallback(
    (role: string): boolean => {
      return currentUser?.roles?.includes(role) || false;
    },
    [currentUser]
  );

  // ====================================================================
  // Método: Verificar si el usuario tiene un permiso específico
  // ====================================================================
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return currentUser?.permissions?.includes(permission) || false;
    },
    [currentUser]
  );

  // ====================================================================
  // Método: Verificar múltiples permisos
  // ====================================================================
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  return {
    // Estado
    user: currentUser || user,
    token,
    isAuthenticated,
    isLoading: isLoading || isLoadingUser,
    error,

    // Métodos
    login,
    logout,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Status de operaciones
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
