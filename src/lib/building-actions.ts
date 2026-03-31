
'use server';

import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import { revalidatePath } from 'next/cache';

export async function getBuildingsList(): Promise<{ id: string; name: string }[]> {
  try {
    const data = await apiGet('/buildings', { select: 'id,name', order: 'name.asc' });
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar lista de prédios:', error);
    return [];
  }
}

export async function addBuilding(name: string, address?: string): Promise<void> {
  try {
    const newId = `B${Date.now()}`;
    await apiPost('/buildings', { id: newId, name: name.trim(), address: address?.trim() || null, is_test_data: false });
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao adicionar o prédio.');
  }
}

export async function deleteBuilding(id: string): Promise<void> {
  try {
    await apiDelete(`/buildings?id=eq.${id}`);
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao excluir o prédio.');
  }
}

export async function updateBuilding({ id, name, address }: { id: string, name: string, address?: string }): Promise<void> {
  try {
    await apiPatch(`/buildings?id=eq.${id}`, { name: name.trim(), address: address || null });
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao atualizar o prédio.');
  }
}
