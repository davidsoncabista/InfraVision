
'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';
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
    const data = await apiFetch('/itemstatuses?order=isdefault.desc,name.asc');
    return (data || []).map((s: any) => ({
        ...s,
        isArchived: !!s.isarchived,
        isDefault: !!s.isdefault
    }));
  } catch (error) {
    return [];
  }
}

export async function addStatus(data: any) {
  const newId = `status_${Date.now()}`;
  try {
    await apiFetch('/itemstatuses', {
        method: 'POST',
        body: JSON.stringify({ 
            id: newId, 
            name: data.name,
            description: data.description,
            color: data.color,
            isarchived: !!data.isArchived,
            isdefault: false 
        })
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

    await apiFetch(`/itemstatuses?id=eq.${id}&isdefault=eq.false`, {
        method: 'PATCH',
        body: JSON.stringify(dbData)
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao atualizar status.');
  }
}

export async function deleteStatus(id: string) {
    try {
        const pInUse = await apiFetch(`/parent_items?status=eq.${id}&limit=1`);
        const cInUse = await apiFetch(`/child_items?status=eq.${id}&limit=1`);
        
        if ((pInUse && pInUse.length > 0) || (cInUse && cInUse.length > 0)) {
            throw new Error('Este status está em uso e não pode ser excluído.');
        }

        await apiFetch(`/itemstatuses?id=eq.${id}&isdefault=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao excluir status.');
    }
}
