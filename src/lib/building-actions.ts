
'use server';

import { buildingService } from '@/services/api/building.service';
import { revalidatePath } from 'next/cache';

export async function getBuildingsList(): Promise<{ id: string; name: string }[]> {
  try {
    const data = await buildingService.getAll();
    return data.map((b) => ({ id: b.id, name: b.name }));
  } catch (error: any) {
    console.error('Erro ao buscar lista de prédios:', error);
    return [];
  }
}

export async function addBuilding(name: string, address?: string): Promise<void> {
  try {
    const newId = `B${Date.now()}`;
    await buildingService.create({ id: newId, name: name.trim(), address: address?.trim() || undefined, is_test_data: false });
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao adicionar o prédio.');
  }
}

export async function deleteBuilding(id: string): Promise<void> {
  try {
    await buildingService.delete(id);
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao excluir o prédio.');
  }
}

export async function updateBuilding({ id, name, address }: { id: string; name: string; address?: string; }): Promise<void> {
  try {
    await buildingService.update(id, { name: name.trim(), address: address?.trim() || undefined });
    revalidatePath('/buildings');
  } catch (error: any) {
    throw new Error('Falha ao atualizar o prédio.');
  }
}
