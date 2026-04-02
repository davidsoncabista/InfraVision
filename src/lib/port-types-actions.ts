'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface port_type {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export async function getport_types(): Promise<port_type[]> {
  try {
    return apiFetch('/port_types?order=is_default.desc,name.asc');
  } catch (error) {
    console.error('Erro ao buscar tipos de porta:', error);
    return [];
  }
}

export async function addport_type(data: { name: string, description?: string | null }) {
  const newId = `ptype_${Date.now()}`;
  try {
    await apiFetch('/port_types', {
      method: 'POST',
      body: JSON.stringify({ id: newId, name: data.name, description: data.description, is_default: false })
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao adicionar tipo de porta.');
  }
}

export async function updateport_type(id: string, data: any) {
    try {
        await apiFetch(`/port_types?id=eq.${id}&is_default=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar tipo de porta.');
    }
}

export async function deleteport_type(id: string) {
    try {
        await apiFetch(`/port_types?id=eq.${id}&is_default=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo de porta.');
    }
}
