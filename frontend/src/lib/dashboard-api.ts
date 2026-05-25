import { api } from "@/lib/api-client";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyListItem {
  id: string;
  code: string;
  type: "LOTE" | "CASA" | "DEPTO" | "DUPLEX";
  address: string;
  zone: string;
  m2: string;
  status: "DISPONIBLE" | "RESERVADO" | "VENDIDO" | "EN_CONSTRUCCION" | "ENTREGADO";
}

export interface ClientListItem {
  id: string;
  ci: string;
  firstName: string;
  lastName: string;
  status: "LEAD" | "PROSPECTO" | "RESERVADO" | "FIRMADO" | "ENTREGADO" | "CERRADO";
}

export interface ContractListItem {
  id: string;
  totalAmount: string;
  currency: string;
  status: "BORRADOR" | "REVISION" | "FIRMADO" | "MODIFICADO" | "RESCINDIDO";
  signedDate: string | null;
  createdAt: string;
  deliveryDeadline: string;
  property?: { code: string; address: string };
  client?: { firstName: string; lastName: string };
}

export interface ReservationListItem {
  id: string;
  status: "ACTIVA" | "VENCIDA" | "CONVERTIDA" | "CANCELADA";
  depositAmount: string;
  reservationDate: string;
  expiresAt: string;
}

export interface ProjectListItem {
  id: string;
  code: string;
  status: "PLANIFICADO" | "EN_EJECUCION" | "PAUSADO" | "FINALIZADO" | "CANCELADO";
  currentStage: "PRELIMINARES" | "OBRA_BRUTA" | "OBRA_FINA" | "ENTREGA";
  startDate: string;
  endDate: string | null;
  property?: { code: string; address: string; zone: string };
}

export interface ProjectProgress {
  totalPercent: number;
  byStage: Array<{ stage: string; weightPercent: number; donePercent: number }>;
}

export interface PaymentListItem {
  id: string;
  type:
    | "DESEMBOLSO_BANCO"
    | "PAGO_CLIENTE"
    | "PAGO_PROVEEDOR"
    | "PAGO_CONTRATISTA"
    | "REEMBOLSO";
  amount: string;
  currency: string;
  paymentDate: string;
}

async function listAll<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const { data } = await api.get<Paginated<T> | T[]>(path, {
    params: { limit: 100, ...params },
  });
  if (Array.isArray(data)) return data;
  return data.items;
}

export const dashboardApi = {
  properties: () => listAll<PropertyListItem>("/properties"),
  clients: () => listAll<ClientListItem>("/clients"),
  contracts: () => listAll<ContractListItem>("/contracts"),
  reservations: () => listAll<ReservationListItem>("/reservations"),
  projects: () => listAll<ProjectListItem>("/projects"),
  payments: () => listAll<PaymentListItem>("/payments"),
  projectProgress: async (id: string): Promise<ProjectProgress> => {
    const { data } = await api.get<ProjectProgress>(`/projects/${id}/progress`);
    return data;
  },
};
