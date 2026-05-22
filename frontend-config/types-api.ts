/**
 * TIPOS COMPARTIDOS DE API
 * 
 * Interfaces para respuestas y peticiones HTTP
 * Compartidas entre frontend y backend
 */

// ====================================================================
// RESPUESTAS GENÉRICAS
// ====================================================================

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// ====================================================================
// FILTROS Y PAGINACIÓN
// ====================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface QueryParams extends PaginationParams, FilterParams {}

// ====================================================================
// MODELOS COMPARTIDOS DEL ERP
// ====================================================================

// --- INMUEBLES ---

export interface Property {
  id: string;
  code: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  area: number;
  status: PropertyStatus;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyStatus = "available" | "sold" | "reserved" | "under_construction";

// --- PROYECTOS ---

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  budget: string; // Usar como Decimal en frontend
  spent: string;
  progress: number; // 0-100
  manager: string; // User ID
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

// --- CONTRATOS ---

export interface Contract {
  id: string;
  number: string;
  clientId: string;
  projectId: string;
  type: ContractType;
  status: ContractStatus;
  value: string; // Usar como Decimal
  signedDate: Date;
  startDate: Date;
  endDate: Date;
  description?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContractType = "service" | "supply" | "construction" | "other";
export type ContractStatus =
  | "draft"
  | "pending_review"
  | "signed"
  | "active"
  | "completed"
  | "cancelled";

// --- CLIENTES ---

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  city?: string;
  country?: string;
  status: ClientStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientStatus = "active" | "inactive" | "blocked" | "prospect";

// --- REPORTES ---

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  data: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = "budget" | "progress" | "financial" | "compliance" | "custom";

// ====================================================================
// RESPUESTAS ESPECÍFICAS
// ====================================================================

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: string;
  spent: string;
  clientCount: number;
  contractCount: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
  createdBy: string;
  createdAt: Date;
}

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "comment"
  | "file_uploaded";

// ====================================================================
// REQUEST BODIES
// ====================================================================

export interface CreateProjectRequest {
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget: string;
  managerId: string;
  location?: string;
}

export interface UpdateProjectRequest
  extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
  progress?: number;
}

export interface CreateContractRequest {
  number: string;
  clientId: string;
  projectId: string;
  type: ContractType;
  value: string;
  signedDate: string;
  startDate: string;
  endDate: string;
  description?: string;
  terms?: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

// ====================================================================
// RESPUESTAS DE ARCHIVO
// ====================================================================

export interface FileUploadResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface BulkUploadResponse {
  successful: FileUploadResponse[];
  failed: Array<{
    file: string;
    error: string;
  }>;
}

// ====================================================================
// NOTIFICACIONES
// ====================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | "project_update"
  | "budget_alert"
  | "deadline_approaching"
  | "new_comment"
  | "system_alert";
