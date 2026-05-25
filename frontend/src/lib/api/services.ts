import { api } from "@/lib/api-client";
import type {
  AcquisitionContract,
  Client,
  Contract,
  CreateAcquisitionInput,
  CreateClientInput,
  CreateConstructionMasterInput,
  CreateContractInput,
  CreateDevelopmentInput,
  CreatePermitInput,
  CreateProjectInput,
  CreatePropertyInput,
  CreateReservationInput,
  Development,
  DevelopmentStatus,
  Paginated,
  Permit,
  Project,
  Property,
  Reservation,
  UpdateClientInput,
  UpdateDevelopmentInput,
  UpdatePermitInput,
  UpdatePropertyInput,
  UserListItem,
} from "./types";

async function listOf<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  const { data } = await api.get<Paginated<T> | T[]>(path, {
    params: { limit: 100, ...params },
  });
  if (Array.isArray(data)) return data;
  return data.items;
}

export const propertiesApi = {
  list: () => listOf<Property>("/properties"),
  get: async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
  },
  create: async (dto: CreatePropertyInput): Promise<Property> => {
    const { data } = await api.post<Property>("/properties", dto);
    return data;
  },
  update: async (id: string, dto: UpdatePropertyInput): Promise<Property> => {
    const { data } = await api.patch<Property>(`/properties/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },
};

export const clientsApi = {
  list: (params?: { status?: string; q?: string }) =>
    listOf<Client>("/clients", params ?? {}),
  get: async (id: string): Promise<Client> => {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  },
  create: async (dto: CreateClientInput): Promise<Client> => {
    const { data } = await api.post<Client>("/clients", dto);
    return data;
  },
  update: async (id: string, dto: UpdateClientInput): Promise<Client> => {
    const { data } = await api.patch<Client>(`/clients/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

export const reservationsApi = {
  list: () => listOf<Reservation>("/reservations"),
  get: async (id: string): Promise<Reservation> => {
    const { data } = await api.get<Reservation>(`/reservations/${id}`);
    return data;
  },
  create: async (dto: CreateReservationInput): Promise<Reservation> => {
    const { data } = await api.post<Reservation>("/reservations", dto);
    return data;
  },
  cancel: async (id: string): Promise<Reservation> => {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/cancel`);
    return data;
  },
};

export const contractsApi = {
  list: () => listOf<Contract>("/contracts"),
  get: async (id: string): Promise<Contract> => {
    const { data } = await api.get<Contract>(`/contracts/${id}`);
    return data;
  },
  create: async (dto: CreateContractInput): Promise<Contract> => {
    const { data } = await api.post<Contract>("/contracts", dto);
    return data;
  },
  submitReview: async (id: string): Promise<Contract> => {
    const { data } = await api.patch<Contract>(`/contracts/${id}/submit-review`);
    return data;
  },
  sign: async (id: string): Promise<Contract> => {
    const { data } = await api.patch<Contract>(`/contracts/${id}/sign`);
    return data;
  },
  rescind: async (id: string): Promise<Contract> => {
    const { data } = await api.patch<Contract>(`/contracts/${id}/rescind`);
    return data;
  },
};

export const projectsApi = {
  list: () => listOf<Project>("/projects"),
  get: async (id: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },
  create: async (dto: CreateProjectInput): Promise<Project> => {
    const { data } = await api.post<Project>("/projects", dto);
    return data;
  },
};

export const usersApi = {
  list: async (role?: string): Promise<UserListItem[]> => {
    const { data } = await api.get<UserListItem[]>("/users", {
      params: role ? { role } : {},
    });
    return data;
  },
};

export const developmentsApi = {
  list: async (params?: { status?: DevelopmentStatus }): Promise<Development[]> => {
    const { data } = await api.get<Development[]>("/developments", { params });
    return data;
  },
  get: async (id: string): Promise<Development> => {
    const { data } = await api.get<Development>(`/developments/${id}`);
    return data;
  },
  create: async (dto: CreateDevelopmentInput): Promise<Development> => {
    const { data } = await api.post<Development>("/developments", dto);
    return data;
  },
  update: async (id: string, dto: UpdateDevelopmentInput): Promise<Development> => {
    const { data } = await api.patch<Development>(`/developments/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/developments/${id}`);
  },
};

export const acquisitionsApi = {
  list: async (developmentId: string): Promise<AcquisitionContract[]> => {
    const { data } = await api.get<AcquisitionContract[]>(
      `/developments/${developmentId}/acquisitions`,
    );
    return data;
  },
  create: async (
    developmentId: string,
    dto: CreateAcquisitionInput,
  ): Promise<AcquisitionContract> => {
    const { data } = await api.post<AcquisitionContract>(
      `/developments/${developmentId}/acquisitions`,
      dto,
    );
    return data;
  },
  sign: async (id: string): Promise<AcquisitionContract> => {
    const { data } = await api.patch<AcquisitionContract>(`/acquisitions/${id}/sign`);
    return data;
  },
  cancel: async (id: string): Promise<AcquisitionContract> => {
    const { data } = await api.patch<AcquisitionContract>(`/acquisitions/${id}/cancel`);
    return data;
  },
};

export const permitsApi = {
  list: async (developmentId: string): Promise<Permit[]> => {
    const { data } = await api.get<Permit[]>(`/developments/${developmentId}/permits`);
    return data;
  },
  create: async (developmentId: string, dto: CreatePermitInput): Promise<Permit> => {
    const { data } = await api.post<Permit>(
      `/developments/${developmentId}/permits`,
      dto,
    );
    return data;
  },
  update: async (id: string, dto: UpdatePermitInput): Promise<Permit> => {
    const { data } = await api.patch<Permit>(`/permits/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/permits/${id}`);
  },
};

export const constructionApi = {
  create: async (
    developmentId: string,
    dto: CreateConstructionMasterInput,
  ): Promise<Project> => {
    const { data } = await api.post<Project>(
      `/projects/construction-master/${developmentId}`,
      dto,
    );
    return data;
  },
  finalize: async (projectId: string): Promise<Project> => {
    const { data } = await api.patch<Project>(
      `/projects/${projectId}/finalize-construction`,
    );
    return data;
  },
};
