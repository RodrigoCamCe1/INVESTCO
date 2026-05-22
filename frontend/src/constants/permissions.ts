/**
 * Permisos simulados alineados con módulos del backend Investco (RBAC por rol).
 */

export const PERMISSIONS = {
  // Sistema
  USERS_MANAGE: "users:manage",
  ROLES_MANAGE: "roles:manage",
  SETTINGS_MANAGE: "settings:manage",

  // Comercial
  CLIENTS_READ: "clients:read",
  CLIENTS_WRITE: "clients:write",
  RESERVATIONS_READ: "reservations:read",
  RESERVATIONS_WRITE: "reservations:write",
  CONTRACTS_READ: "contracts:read",
  CONTRACTS_WRITE: "contracts:write",
  PROPERTIES_READ: "properties:read",
  PROPERTIES_WRITE: "properties:write",

  // Obra
  PROJECTS_READ: "projects:read",
  PROJECTS_WRITE: "projects:write",
  SCHEDULE_READ: "schedule:read",
  SCHEDULE_WRITE: "schedule:write",
  WORKERS_READ: "workers:read",
  WORKERS_WRITE: "workers:write",
  QUALITY_READ: "quality:read",
  QUALITY_WRITE: "quality:write",
  MATERIALS_READ: "materials:read",
  MATERIALS_WRITE: "materials:write",
  PURCHASE_ORDERS_READ: "purchase_orders:read",
  PURCHASE_ORDERS_WRITE: "purchase_orders:write",
  BUDGETS_READ: "budgets:read",
  BUDGETS_WRITE: "budgets:write",
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type MockRoleCode = "ADMIN" | "VENDEDOR" | "ENCARG_PROYECTO";

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<MockRoleCode, PermissionCode[]> = {
  ADMIN: [...ALL_PERMISSIONS],
  VENDEDOR: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_WRITE,
    PERMISSIONS.RESERVATIONS_READ,
    PERMISSIONS.RESERVATIONS_WRITE,
    PERMISSIONS.CONTRACTS_READ,
    PERMISSIONS.CONTRACTS_WRITE,
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.REPORTS_READ,
  ],
  ENCARG_PROYECTO: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SCHEDULE_WRITE,
    PERMISSIONS.WORKERS_READ,
    PERMISSIONS.WORKERS_WRITE,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.MATERIALS_READ,
    PERMISSIONS.MATERIALS_WRITE,
    PERMISSIONS.PURCHASE_ORDERS_READ,
    PERMISSIONS.REPORTS_READ,
  ],
};
