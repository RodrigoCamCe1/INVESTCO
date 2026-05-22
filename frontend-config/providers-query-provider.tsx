"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useMemo } from "react";

/**
 * PROVEEDOR DE TANSTACK QUERY (React Query v5)
 * 
 * Gestiona:
 * - Caché de datos del servidor
 * - Sincronización automática
 * - Background refetching
 * - Manejo de errores y reintentos
 * 
 * Configuración optimizada para aplicaciones empresariales
 */

export function QueryProvider({ children }: PropsWithChildren) {
  // Crear instancia del QueryClient con configuración enterprise
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ============================================================
            // CONFIGURACIÓN DE CONSULTAS
            // ============================================================

            // Tiempo de espera antes de considerar datos como "stale"
            staleTime: 1000 * 60 * 5, // 5 minutos

            // Tiempo que los datos se mantienen en caché
            gcTime: 1000 * 60 * 10, // 10 minutos (antiguamente cacheTime)

            // Reintentos automáticos en caso de error
            retry: (failureCount, error: any) => {
              // No reintentar en errores 400 o 401
              if (error?.status === 400 || error?.status === 401) {
                return false;
              }
              // Reintentar máximo 2 veces en otros errores
              return failureCount < 2;
            },

            // Demora entre reintentos (exponencial)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // No refetchar automáticamente cuando la ventana recupera el foco
            refetchOnWindowFocus: false,

            // No refetchar en cambio de pestaña
            refetchOnReconnect: "stale",

            // Demora antes de marcar como stale cuando se monta
            refetchOnMount: true,
          },

          mutations: {
            // ============================================================
            // CONFIGURACIÓN DE MUTACIONES (POST, PUT, DELETE)
            // ============================================================

            // Reintentos en mutaciones
            retry: 1,
            retryDelay: 1000,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools para desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
