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
  propertyId: string;
  contractId: string;
  startDate: string;
  endDate: string | null;
  currentStage: ProjectStage;
  status: ProjectStatus;
  projectManagerId: string;
  qualityManagerId: string | null;
  budgetManagerId: string | null;
  property?: Property;
  contract?: Contract;
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
