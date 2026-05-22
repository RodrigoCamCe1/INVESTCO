"use client";

import { useEffect, PropsWithChildren } from "react";
import { useAuthStore } from "@/store/auth-store";

/**
 * PROVEEDOR DE AUTENTICACIÓN
 * 
 * Gestiona:
 * - Inicialización de sesión
 * - Persistencia de token
 * - Sincronización con IndexedDB
 * - Redirección en caso de pérdida de sesión
 */

export function AuthProvider({ children }: PropsWithChildren) {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Inicializar autenticación al montar el componente
    // Lee el token del localStorage e IndexedDB
    initializeAuth();
  }, [initializeAuth]);

  // No renderizar nada hasta que la autenticación esté inicializada
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-brand-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
