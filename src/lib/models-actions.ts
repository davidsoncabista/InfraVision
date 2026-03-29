'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface Model {
  id: string;
  name: string;
  manufacturerId: string;
  portConfig: string | null;
  tamanhoU: number | null;
}

export async function getModelsByManufacturerId(manufacturerId: string): Promise<Model[]> {
  const data = await apiFetch(`/models?manufacturerid=eq.${manufacturerId}&order=name.asc`);
  return (data || []).map((m: any) => ({
      ...m,
      manufacturerId: m.manufacturerid,
      portConfig: m.portconfig
  }));
}

export async function addModel(data: any) {
  const newId = `model_${Date.now()}`;
  const dbData = {
      id: newId,
      name: data.name,
      manufacturerid: data.manufacturerId,
      portconfig: data.portConfig,
      tamanhou: data.tamanhoU
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
    if(data.manufacturerId) dbData.manufacturerid = data.manufacturerId;
    if(data.portConfig !== undefined) dbData.portconfig = data.portConfig;
    if(data.tamanhoU !== undefined) dbData.tamanhou = data.tamanhoU;

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
