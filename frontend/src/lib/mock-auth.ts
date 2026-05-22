import { ROLE_PERMISSIONS, type MockRoleCode } from "@/constants/permissions";
import type { MockSession, MockSessionUser } from "@/types/auth";

export const MOCK_PASSWORD = "Investco2026!*";

export interface MockCredential {
  email: string;
  password: string;
  role: MockRoleCode;
  fullName: string;
  id: string;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    id: "usr-admin-001",
    email: "admin@investco.com",
    password: MOCK_PASSWORD,
    role: "ADMIN",
    fullName: "Administrador Investco",
  },
  {
    id: "usr-vendedor-001",
    email: "ventas@investco.com",
    password: MOCK_PASSWORD,
    role: "VENDEDOR",
    fullName: "Vendedor Comercial",
  },
  {
    id: "usr-encarg-001",
    email: "proyecto@investco.com",
    password: MOCK_PASSWORD,
    role: "ENCARG_PROYECTO",
    fullName: "Encargado de Proyecto",
  },
];

export function findMockUserByEmail(email: string): MockCredential | undefined {
  return MOCK_CREDENTIALS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export function findMockUserByRole(role: MockRoleCode): MockCredential {
  const user = MOCK_CREDENTIALS.find((u) => u.role === role);
  if (!user) throw new Error(`Usuario mock no definido para rol ${role}`);
  return user;
}

/** JWT ficticio (header.payload.signature en base64) para prototipo. */
export function createMockJwt(user: MockSessionUser): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };
  const encode = (obj: object) =>
    typeof btoa !== "undefined"
      ? btoa(JSON.stringify(obj))
      : Buffer.from(JSON.stringify(obj)).toString("base64");
  return `${encode(header)}.${encode(payload)}.mock-signature-investco`;
}

export function buildMockSession(credential: MockCredential): MockSession {
  const permissions = ROLE_PERMISSIONS[credential.role];
  const user: MockSessionUser = {
    id: credential.id,
    email: credential.email,
    fullName: credential.fullName,
    roles: [credential.role],
    permissions,
  };
  return {
    token: createMockJwt(user),
    user,
    permissions,
  };
}

export function validateMockLogin(
  email: string,
  password: string,
): MockSession | null {
  const credential = findMockUserByEmail(email);
  if (!credential || credential.password !== password) return null;
  return buildMockSession(credential);
}
