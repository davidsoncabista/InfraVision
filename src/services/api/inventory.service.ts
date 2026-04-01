import { ParentItem, ChildItem } from "@/types/database";
import apiClient from "@/lib/api-client";

const PARENT_BASE = "/parent_items";
const CHILD_BASE = "/child_items";

export const inventoryService = {
  async getParentItems(params?: Record<string, any>): Promise<ParentItem[]> {
    return apiClient.get<ParentItem[]>(PARENT_BASE, params);
  },

  async getParentItemById(id: string): Promise<ParentItem | null> {
    const data = await apiClient.get<ParentItem[]>(`${PARENT_BASE}?id=eq.${id}`);
    return data?.[0] ?? null;
  },

  async createParentItem(payload: Omit<ParentItem, "id">): Promise<ParentItem> {
    return apiClient.post<ParentItem>(PARENT_BASE, payload);
  },

  async updateParentItem(id: string, payload: Partial<Omit<ParentItem, "id">>): Promise<ParentItem> {
    return apiClient.patch<ParentItem>(`${PARENT_BASE}?id=eq.${id}`, payload);
  },

  async deleteParentItem(id: string): Promise<void> {
    await apiClient.delete(`${PARENT_BASE}?id=eq.${id}`);
  },

  async getChildItems(params?: Record<string, any>): Promise<ChildItem[]> {
    return apiClient.get<ChildItem[]>(CHILD_BASE, params);
  },

  async getChildItemById(id: string): Promise<ChildItem | null> {
    const data = await apiClient.get<ChildItem[]>(`${CHILD_BASE}?id=eq.${id}`);
    return data?.[0] ?? null;
  },

  async createChildItem(payload: Omit<ChildItem, "id">): Promise<ChildItem> {
    return apiClient.post<ChildItem>(CHILD_BASE, payload);
  },

  async updateChildItem(id: string, payload: Partial<Omit<ChildItem, "id">>): Promise<ChildItem> {
    return apiClient.patch<ChildItem>(`${CHILD_BASE}?id=eq.${id}`, payload);
  },

  async deleteChildItem(id: string): Promise<void> {
    await apiClient.delete(`${CHILD_BASE}?id=eq.${id}`);
  },
};
