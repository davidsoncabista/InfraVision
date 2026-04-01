import { Incident } from "@/types/database";
import apiClient from "@/lib/api-client";

const BASE_PATH = "/incidents";

export const incidentService = {
  async getAll(): Promise<Incident[]> {
    return apiClient.get<Incident[]>(BASE_PATH);
  },

  async getById(id: string): Promise<Incident | null> {
    const data = await apiClient.get<Incident[]>(`${BASE_PATH}?id=eq.${id}`);
    return data?.[0] ?? null;
  },

  async create(incident: Omit<Incident, "id">): Promise<Incident> {
    return apiClient.post<Incident>(BASE_PATH, incident);
  },

  async update(id: string, incident: Partial<Omit<Incident, "id">>): Promise<Incident> {
    return apiClient.patch<Incident>(`${BASE_PATH}?id=eq.${id}`, incident);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}?id=eq.${id}`);
  },
};
