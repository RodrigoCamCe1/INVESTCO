import type { RoleCode } from "@/constants/permissions";

export type PropertyType = "LOTE" | "CASA" | "DEPTO" | "DUPLEX";
export type PropertyStatus =
  | "DISPONIBLE"
  | "RESERVADO"
  | "VENDIDO"
  | "EN_CONSTRUCCION"
  | "ENTREGADO";

export type ClientStatus =
  | "LEAD"
  | "PROSPECTO"
  | "RESERVADO"
  | "FIRMADO"
  | "ENTREGADO"
  | "CERRADO";

export type ReservationStatus =
  | "ACTIVA"
  | "VENCIDA"
  | "CONVERTIDA"
  | "CANCELADA";

export type ContractStatus =
  | "BORRADOR"
  | "REVISION"
  | "FIRMADO"
  | "MODIFICADO"
  | "RESCINDIDO";

export type ProjectStatus =
  | "PLANIFICADO"
  | "EN_EJECUCION"
  | "PAUSADO"
  | "FINALIZADO"
  | "CANCELADO";

export type ProjectStage =
  | "PRELIMINARES"
  | "OBRA_BRUTA"
  | "OBRA_FINA"
  | "ENTREGA";

export type ProjectKind = "CONSTRUCTION_MASTER" | "UNIT_SALE";

export type DevelopmentStatus =
  | "PLANIFICACION"
  | "ADQUISICION"
  | "PERMISOS"
  | "EN_CONSTRUCCION"
  | "COMERCIALIZACION"
  | "COMPLETADO"
  | "CANCELADO";

export type AcquisitionStatus = "NEGOCIACION" | "FIRMADO" | "CANCELADO";

export type PermitType =
  | "MUNICIPAL"
  | "BOMBEROS"
  | "AMBIENTAL"
  | "CATASTRAL"
  | "SERVICIOS";

export type PermitStatus = "GESTIONANDO" | "APROBADO" | "RECHAZADO" | "VENCIDO";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Property {
  id: string;
  code: string;
  type: PropertyType;
  address: string;
  zone: string;
  m2: string;
  status: PropertyStatus;
  parentPropertyId: string | null;
  modelBlueprintId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  ci: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  source: string | null;
  status: ClientStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  clientId: string;
  depositAmount: string;
  currency: string;
  validityDays: number;
  reservationDate: string;
  expiresAt: string;
  status: ReservationStatus;
  property?: Property;
  client?: Client;
}

export interface Contract {
  id: string;
  propertyId: string;
  clientId: string;
  version: number;
  totalAmount: string;
  currency: string;
  deliveryDeadline: string;
  signedDate: string | null;
  status: ContractStatus;
  optimisticVersion: number;
  previousContractId: string | null;
  createdAt: string;
  property?: Property;
  client?: Client;
}

export interface Project {
  id: string;
  code: string;
  kind: ProjectKind;
  propertyId: string | null;
  contractId: string | null;
  developmentId: string | null;
  startDate: string;
  endDate: string | null;
  currentStage: ProjectStage;
  status: ProjectStatus;
  projectManagerId: string;
  qualityManagerId: string | null;
  budgetManagerId: string | null;
  property?: Property | null;
  contract?: Contract | null;
  development?: Development | null;
}

export interface Development {
  id: string;
  code: string;
  name: string;
  zone: string;
  address: string;
  description: string | null;
  acquisitionBudget: string;
  constructionBudget: string;
  currency: string;
  estimatedUnits: number;
  startDate: string;
  estimatedCompletion: string | null;
  status: DevelopmentStatus;
  createdAt: string;
  updatedAt: string;
  acquisitionContracts?: AcquisitionContract[];
  permits?: Permit[];
  projects?: Project[];
  units?: Property[];
  _count?: {
    units: number;
    permits: number;
    projects: number;
    acquisitionContracts: number;
  };
}

export interface AcquisitionContract {
  id: string;
  developmentId: string;
  sellerName: string;
  sellerCi: string | null;
  sellerPhone: string | null;
  totalAmount: string;
  currency: string;
  signedDate: string | null;
  notes: string | null;
  status: AcquisitionStatus;
  createdAt: string;
}

export interface Permit {
  id: string;
  developmentId: string;
  type: PermitType;
  permitNumber: string | null;
  issuedDate: string | null;
  validUntil: string | null;
  status: PermitStatus;
  notes: string | null;
  createdAt: string;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  roles: RoleCode[];
}

export interface CreatePropertyInput {
  code: string;
  type: PropertyType;
  address: string;
  zone: string;
  m2: number;
}

export interface UpdatePropertyInput {
  type?: PropertyType;
  address?: string;
  zone?: string;
  m2?: number;
  status?: PropertyStatus;
}

export interface CreateClientInput {
  ci: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  source?: string;
}

export interface UpdateClientInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: ClientStatus;
}

export interface CreateReservationInput {
  propertyId: string;
  clientId: string;
  depositAmount: number;
  currency?: string;
  validityDays: number;
  refundConditions?: string;
}

export interface CreateContractInput {
  reservationId: string;
  totalAmount: number;
  currency?: string;
  deliveryDeadline: string;
}

export interface CreateProjectInput {
  contractId: string;
  code: string;
  startDate: string;
  projectManagerId: string;
  qualityManagerId?: string;
  budgetManagerId?: string;
}

export interface CreateDevelopmentInput {
  code: string;
  name: string;
  zone: string;
  address: string;
  description?: string;
  acquisitionBudget: number;
  constructionBudget: number;
  currency?: string;
  estimatedUnits: number;
  startDate: string;
  estimatedCompletion?: string;
}

export interface UpdateDevelopmentInput {
  name?: string;
  zone?: string;
  address?: string;
  description?: string;
  acquisitionBudget?: number;
  constructionBudget?: number;
  currency?: string;
  estimatedUnits?: number;
  estimatedCompletion?: string;
  status?: DevelopmentStatus;
}

export interface CreateAcquisitionInput {
  sellerName: string;
  sellerCi?: string;
  sellerPhone?: string;
  totalAmount: number;
  currency?: string;
  notes?: string;
}

export interface CreatePermitInput {
  type: PermitType;
  permitNumber?: string;
  issuedDate?: string;
  validUntil?: string;
  notes?: string;
}

export interface UpdatePermitInput {
  permitNumber?: string;
  issuedDate?: string;
  validUntil?: string;
  notes?: string;
  status?: PermitStatus;
}

export interface CreateConstructionMasterInput {
  code: string;
  startDate: string;
  projectManagerId: string;
  qualityManagerId?: string;
  budgetManagerId?: string;
}
