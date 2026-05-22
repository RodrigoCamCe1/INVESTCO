import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * STORE DE ESTADO DE UI LOCAL (ZUSTAND)
 * 
 * Gestiona:
 * - Estado de sidebars, modales
 * - Preferencias de usuario (tema)
 * - Filtros activos
 * - Paginación
 * - Persistencia en localStorage
 */

interface UIState {
  // ====================================================================
  // LAYOUT
  // ====================================================================
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  darkMode: boolean;

  // ====================================================================
  // MODALES Y DIALOGS
  // ====================================================================
  modals: {
    confirmDialog?: {
      isOpen: boolean;
      title: string;
      description: string;
      onConfirm: () => void;
      onCancel: () => void;
    };
    formModal?: {
      isOpen: boolean;
      type: "create" | "edit" | "view";
      entityType: string;
      entityId?: string;
    };
  };

  // ====================================================================
  // NOTIFICACIONES TOAST
  // ====================================================================
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }>;

  // ====================================================================
  // FILTROS Y BÚSQUEDA
  // ====================================================================
  filters: {
    [key: string]: any;
  };

  // ====================================================================
  // PAGINACIÓN
  // ====================================================================
  pagination: {
    page: number;
    pageSize: number;
  };

  // ====================================================================
  // ACCIONES
  // ====================================================================

  // Layout
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleDarkMode: () => void;

  // Modales
  openConfirmDialog: (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  closeConfirmDialog: () => void;

  openFormModal: (
    type: "create" | "edit" | "view",
    entityType: string,
    entityId?: string
  ) => void;
  closeFormModal: () => void;

  // Toasts
  addToast: (
    message: string,
    type: "success" | "error" | "warning" | "info",
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Filtros
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;

  // Paginación
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Estado inicial
      sidebarOpen: true,
      mobileMenuOpen: false,
      darkMode: false,
      modals: {},
      toasts: [],
      filters: {},
      pagination: { page: 1, pageSize: 10 },

      // Layout
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      openSidebar: () => set({ sidebarOpen: true }),

      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),

      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      // Confirm Dialog
      openConfirmDialog: (title, description, onConfirm, onCancel) =>
        set({
          modals: {
            confirmDialog: {
              isOpen: true,
              title,
              description,
              onConfirm,
              onCancel: onCancel || (() => {}),
            },
          },
        }),
      closeConfirmDialog: () =>
        set((state) => ({
          modals: {
            ...state.modals,
            confirmDialog: { ...state.modals.confirmDialog, isOpen: false },
          },
        })),

      // Form Modal
      openFormModal: (type, entityType, entityId) =>
        set({
          modals: {
            formModal: {
              isOpen: true,
              type,
              entityType,
              entityId,
            },
          },
        }),
      closeFormModal: () =>
        set((state) => ({
          modals: {
            ...state.modals,
            formModal: { ...state.modals.formModal, isOpen: false },
          },
        })),

      // Toasts
      addToast: (message, type, duration = 3000) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              id: `${Date.now()}-${Math.random()}`,
              type,
              message,
              duration,
            },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      // Filtros
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilter: (key) =>
        set((state) => ({
          filters: Object.fromEntries(
            Object.entries(state.filters).filter(([k]) => k !== key)
          ),
        })),

      clearAllFilters: () => set({ filters: {} }),

      // Paginación
      setPage: (page) =>
        set((state) => ({
          pagination: { ...state.pagination, page },
        })),

      setPageSize: (pageSize) =>
        set((state) => ({
          pagination: { ...state.pagination, pageSize },
        })),

      resetPagination: () =>
        set({
          pagination: { page: 1, pageSize: 10 },
        }),
    }),
    {
      name: "investco-ui-store",
      // Persistir solo ciertos valores
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        darkMode: state.darkMode,
        pagination: state.pagination,
      }),
    }
  )
);
