'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface ConnectionType {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export async function getConnectionTypes(): Promise<ConnectionType[]> {
  try {
    const data = await apiFetch('/connection_types?order=is_default.desc,name.asc');
    return (data || []).map((c: any) => ({
        ...c,
        isDefault: !!c.is_default
    }));
  } catch (error) {
    console.error('Erro ao buscar tipos de conexão:', error);
    return [];
  }
}

export async function addConnectionType(data: { name: string, description?: string | null }) {
  const newId = `ctype_${Date.now()}`;
  try {
    await apiFetch('/connection_types', {
        method: 'POST',
        body: JSON.stringify({ id: newId, name: data.name, description: data.description, is_default: false })
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao adicionar tipo de conexão.');
  }
}

export async function updateConnectionType(id: string, data: any) {
    try {
        await apiFetch(`/connection_types?id=eq.${id}&is_default=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar tipo de conexão.');
    }
}

export async function deleteConnectionType(id: string) {
    try {
        await apiFetch(`/connection_types?id=eq.${id}&is_default=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo de conexão.');
    }
}
