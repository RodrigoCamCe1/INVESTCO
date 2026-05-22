import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

/**
 * STORE DE AUTENTICACIÓN (ZUSTAND)
 * 
 * Gestiona:
 * - Token JWT
 * - Datos del usuario actual
 * - Estado de autenticación
 * - Persistencia en localStorage
 */

interface AuthStoreState {
  // Estado
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Acciones
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
  setIsInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isInitialized: false,
      isAuthenticated: false,

      // Setear usuario
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // Setear token
      setToken: (token, refreshToken = null) =>
        set({
          token,
          refreshToken,
          isAuthenticated: !!token,
        }),

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        // Limpiar storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("investco-auth-store");
          sessionStorage.clear();
        }
      },

      // Inicializar autenticación
      initializeAuth: () => {
        const { token } = get();

        // Simular validación del token
        if (token) {
          // En una app real, validarías el token aquí
          set({ isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      },

      // Setear si está inicializado
      setIsInitialized: (initialized) =>
        set({ isInitialized: initialized }),
    }),
    {
      name: "investco-auth-store",
      // Persistir solo token y refreshToken, no el usuario completo
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      // Verificar token al hidratar del localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validar que el token exista y sea válido
          if (state.token) {
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

/**
 * Selector para obtener el estado de autenticación
 */
export const selectIsAuthenticated = (state: AuthStoreState) =>
  state.isAuthenticated;

export const selectUser = (state: AuthStoreState) => state.user;

export const selectToken = (state: AuthStoreState) => state.token;
