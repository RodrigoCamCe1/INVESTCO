/**
 * TIPOS DE AUTENTICACIÓN
 * 
 * Interfaces compartidas entre frontend y backend (NestJS)
 */

// ====================================================================
// JWT Y SEGURIDAD
// ====================================================================

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ====================================================================
// USUARIO
// ====================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// CREDENCIALES Y AUTENTICACIÓN
// ====================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignUpCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface SignUpResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

// ====================================================================
// RECUPERACIÓN DE CONTRASEÑA
// ====================================================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ====================================================================
// VERIFICACIÓN DE EMAIL
// ====================================================================

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

// ====================================================================
// ROLES Y PERMISOS
// ====================================================================

export type UserRole =
  | "admin"
  | "project_manager"
  | "supervisor"
  | "employee"
  | "client"
  | "vendor";

export type Permission =
  | "view_projects"
  | "create_projects"
  | "edit_projects"
  | "delete_projects"
  | "view_budgets"
  | "edit_budgets"
  | "view_reports"
  | "export_reports"
  | "manage_users"
  | "manage_roles"
  | "system_settings";

// ====================================================================
// PROFILE/SETTINGS
// ====================================================================

export interface UserProfile extends AuthUser {
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

// ====================================================================
// ERRORES DE AUTENTICACIÓN
// ====================================================================

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}
