import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * STORE PARA COLA OFFLINE (ZUSTAND + IndexedDB)
 * 
 * Gestiona:
 * - Cola de peticiones pendientes (PWA)
 * - Estado de conexión
 * - Persistencia en IndexedDB para datos grandes
 */

export interface OfflineRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: any;
  timestamp: number;
  attempts: number;
}

interface OfflineStoreState {
  // Estado
  queue: OfflineRequest[];
  isOnline: boolean;

  // Acciones
  addRequest: (request: OfflineRequest) => void;
  removeRequest: (id: string) => void;
  updateRequest: (id: string, updates: Partial<OfflineRequest>) => void;
  setIsOnline: (isOnline: boolean) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineStoreState>()(
  persist(
    (set) => ({
      // Estado inicial
      queue: [],
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,

      // Acciones
      addRequest: (request) =>
        set((state) => ({
          queue: [...state.queue, request],
        })),

      removeRequest: (id) =>
        set((state) => ({
          queue: state.queue.filter((req) => req.id !== id),
        })),

      updateRequest: (id, updates) =>
        set((state) => ({
          queue: state.queue.map((req) =>
            req.id === id ? { ...req, ...updates } : req
          ),
        })),

      setIsOnline: (isOnline) => set({ isOnline }),

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: "investco-offline-store",
      // Usar IndexedDB para almacenamiento más confiable
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const db = await openIndexedDB();
            return await getFromIndexedDB(db, name);
          } catch {
            // Fallback a localStorage si IndexedDB no está disponible
            return localStorage.getItem(name);
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            const db = await openIndexedDB();
            await saveToIndexedDB(db, name, value);
          } catch {
            // Fallback a localStorage
            localStorage.setItem(name, value);
          }
        },
        removeItem: async (name: string) => {
          try {
            const db = await openIndexedDB();
            await removeFromIndexedDB(db, name);
          } catch {
            // Fallback a localStorage
            localStorage.removeItem(name);
          }
        },
      })),
    }
  )
);

// ====================================================================
// HELPERS PARA IndexedDB
// ====================================================================

async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("investco-offline-db", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("store")) {
        db.createObjectStore("store");
      }
    };
  });
}

async function getFromIndexedDB(db: IDBDatabase, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["store"], "readonly");
    const store = transaction.objectStore("store");
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function saveToIndexedDB(
  db: IDBDatabase,
  key: string,
  value: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["store"], "readwrite");
    const store = transaction.objectStore("store");
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function removeFromIndexedDB(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["store"], "readwrite");
    const store = transaction.objectStore("store");
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
