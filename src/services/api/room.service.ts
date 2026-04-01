import { Room } from "@/types/database";
import apiClient from "@/lib/api-client";

const BASE_PATH = "/rooms";

export const roomService = {
  async getAll(): Promise<Room[]> {
    return apiClient.get<Room[]>(BASE_PATH);
  },

  async getById(id: string): Promise<Room | null> {
    const data = await apiClient.get<Room[]>(`${BASE_PATH}?id=eq.${id}`);
    return data?.[0] ?? null;
  },

  async create(room: Partial<Omit<Room, "items">>): Promise<Room> {
    return apiClient.post<Room>(BASE_PATH, room);
  },

  async update(id: string, room: Partial<Omit<Room, "id" | "items">>): Promise<Room> {
    return apiClient.patch<Room>(`${BASE_PATH}?id=eq.${id}`, room);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}?id=eq.${id}`);
  },
};
