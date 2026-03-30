'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface Model {
  id: string;
  name: string;
  manufacturer_id: string;
  portConfig: string | null;
  tamanho_u: number | null;
}

export async function getModelsBymanufacturer_id(manufacturer_id: string): Promise<Model[]> {
  const data = await apiFetch(`/models?manufacturer_id=eq.${manufacturer_id}&order=name.asc`);
  return (data || []).map((m: any) => ({
      ...m,
      manufacturer_id: m.manufacturer_id,
      portConfig: m.portconfig
  }));
}

export async function addModel(data: any) {
  const newId = `model_${Date.now()}`;
  const dbData = {
      id: newId,
      name: data.name,
      manufacturer_id: data.manufacturer_id,
      portconfig: data.portConfig,
      tamanho_u: data.tamanho_u
  };
  await apiFetch('/models', {
    method: 'POST',
    body: JSON.stringify(dbData)
  });
  revalidatePath('/system');
}

export async function updateModel(id: string, data: any) {
    const dbData: any = {};
    if(data.name) dbData.name = data.name;
    if(data.manufacturer_id) dbData.manufacturer_id = data.manufacturer_id;
    if(data.portConfig !== undefined) dbData.portconfig = data.portConfig;
    if(data.tamanho_u !== undefined) dbData.tamanho_u = data.tamanho_u;

    await apiFetch(`/models?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dbData)
    });
    revalidatePath('/system');
}

export async function deleteModel(id: string) {
    await apiFetch(`/models?id=eq.${id}`, { method: 'DELETE' });
    revalidatePath('/system');
}
