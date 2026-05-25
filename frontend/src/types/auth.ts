import type { PermissionCode, RoleCode } from "@/constants/permissions";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roles: RoleCode[];
  permissions: PermissionCode[];
}

export interface Session {
  token: string;
  user: SessionUser;
  permissions: PermissionCode[];
}

export type MockSessionUser = SessionUser;
export type MockSession = Session;
