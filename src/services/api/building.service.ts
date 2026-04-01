import { Building } from "@/types/database";
import apiClient from "@/lib/api-client";

const BASE_PATH = "/buildings";

export const buildingService = {
  async getAll(): Promise<Building[]> {
    return apiClient.get<Building[]>(BASE_PATH);
  },

  async getById(id: string): Promise<Building | null> {
    const data = await apiClient.get<Building[]>(`${BASE_PATH}?id=eq.${id}`);
    return data?.[0] ?? null;
  },

  async create(building: Omit<Building, "id">): Promise<Building> {
    return apiClient.post<Building>(BASE_PATH, building);
  },

  async update(id: string, building: Partial<Omit<Building, "id">>): Promise<Building> {
    return apiClient.patch<Building>(`${BASE_PATH}?id=eq.${id}`, building);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}?id=eq.${id}`);
  },
};
