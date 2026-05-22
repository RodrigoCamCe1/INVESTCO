"use client";

import { useCallback, useEffect, useState } from "react";
import { useOfflineStore } from "@/store/offline-store";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

/**
 * HOOK PARA GESTIÓN DE COLA OFFLINE
 * 
 * Proporciona:
 * - Sincronización automática cuando hay conexión
 * - Gestión de peticiones fallidas
 * - Estado de sincronización
 * - PWA offline-first capability
 */

export interface OfflineRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: any;
  timestamp: number;
  attempts: number;
}

export function useOfflineQueue() {
  const {
    queue,
    isOnline,
    addRequest,
    removeRequest,
    updateRequest,
    setIsOnline,
    clearQueue,
  } = useOfflineStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // ====================================================================
  // MONITOREO DE CONEXIÓN
  // ====================================================================
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar conexión inicial
    const isOnlineInitial = navigator.onLine;
    setIsOnline(isOnlineInitial);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline]);

  // ====================================================================
  // SINCRONIZACIÓN AUTOMÁTICA
  // ====================================================================
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline]);

  // ====================================================================
  // MÉTODO: Sincronizar cola
  // ====================================================================
  const syncQueue = useCallback(async () => {
    if (isSyncing || queue.length === 0) return;

    setIsSyncing(true);
    setSyncError(null);

    for (const request of queue) {
      try {
        // Ejecutar petición
        await apiClient({
          method: request.method.toLowerCase() as any,
          url: request.url,
          data: request.data,
        });

        // Remover de cola si fue exitosa
        removeRequest(request.id);
      } catch (error) {
        // Actualizar intentos
        const newAttempts = request.attempts + 1;
        const maxAttempts = 5;

        if (newAttempts >= maxAttempts) {
          // Remover si alcanzó máximo de intentos
          removeRequest(request.id);
          setSyncError(
            `Petición ${request.url} falló después de ${maxAttempts} intentos`
          );
        } else {
          // Actualizar número de intentos
          updateRequest(request.id, { attempts: newAttempts });
        }
      }
    }

    setIsSyncing(false);
  }, [queue, isSyncing, removeRequest, updateRequest]);

  // ====================================================================
  // MÉTODO: Agregar petición a cola
  // ====================================================================
  const enqueueRequest = useCallback(
    (
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      url: string,
      data?: any
    ) => {
      const id = `${method}-${url}-${Date.now()}`;
      addRequest({
        id,
        method,
        url,
        data,
        timestamp: Date.now(),
        attempts: 0,
      });
      return id;
    },
    [addRequest]
  );

  // ====================================================================
  // MÉTODO: Remover petición de cola
  // ====================================================================
  const dequeueRequest = useCallback(
    (id: string) => {
      removeRequest(id);
    },
    [removeRequest]
  );

  // ====================================================================
  // MÉTODO: Reintentar sincronización manual
  // ====================================================================
  const retrySync = useCallback(() => {
    syncQueue();
  }, [syncQueue]);

  return {
    // Estado
    queue,
    isOnline,
    isSyncing,
    syncError,
    pendingRequestsCount: queue.length,

    // Métodos
    enqueueRequest,
    dequeueRequest,
    retrySync,
    clearQueue,

    // Utilidad: Verificar si hay petición pendiente para una URL
    hasRequestForUrl: (url: string) =>
      queue.some((req) => req.url.includes(url)),
  };
}
