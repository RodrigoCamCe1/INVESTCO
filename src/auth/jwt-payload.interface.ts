import { RoleCode } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleCode[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: RoleCode[];
}
