import type { MockRoleCode, PermissionCode } from "@/constants/permissions";

export interface MockSessionUser {
  id: string;
  email: string;
  fullName: string;
  roles: MockRoleCode[];
  permissions: PermissionCode[];
}

export interface MockSession {
  token: string;
  user: MockSessionUser;
  permissions: PermissionCode[];
}
