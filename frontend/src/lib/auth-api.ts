import { api } from "@/lib/api-client";
import type { RoleCode } from "@/constants/permissions";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: RoleCode[];
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthUser;
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  const { data } = await api.post<AuthTokenResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function apiMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}
