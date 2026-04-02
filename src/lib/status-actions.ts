
'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import { statusColors } from './status-config';

export interface ItemStatus {
  id: string;
  name: string;
  description: string | null;
  color: typeof statusColors[number];
  isArchived: boolean;
  isDefault: boolean;
}

export async function getItemStatuses(): Promise<ItemStatus[]> {
  try {
    const data = await apiGet('/item_statuses', { order: 'is_default.desc,name.asc' });
    return (data || []).map((s: any) => ({
        ...s,
        isArchived: !!s.isarchived,
        isDefault: !!s.is_default
    }));
  } catch (error) {
    return [];
  }
}

export async function addStatus(data: any) {
  const newId = `status_${Date.now()}`;
  try {
    await apiPost('/item_statuses', { 
        id: newId, 
        name: data.name,
        description: data.description,
        color: data.color,
        isarchived: !!data.isArchived,
        is_default: false 
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao adicionar status: ' + error.message);
  }
}

export async function updateStatus(id: string, data: any) {
  try {
    const dbData: any = {};
    if(data.name) dbData.name = data.name;
    if(data.description) dbData.description = data.description;
    if(data.color) dbData.color = data.color;
    if(data.isArchived !== undefined) dbData.isarchived = !!data.isArchived;

    await apiPatch('/item_statuses', dbData, { id: `eq.${id}`, is_default: 'eq.false' });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao atualizar status.');
  }
}

export async function deleteStatus(id: string) {
    try {
        const pInUse = await apiGet('/parent_items', { status: `eq.${id}`, limit: 1 });
        const cInUse = await apiGet('/child_items', { status: `eq.${id}`, limit: 1 });
        
        if ((pInUse && pInUse.length > 0) || (cInUse && cInUse.length > 0)) {
            throw new Error('Este status está em uso e não pode ser excluído.');
        }

        await apiDelete('/item_statuses', { id: `eq.${id}`, is_default: 'eq.false' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao excluir status.');
    }
}
