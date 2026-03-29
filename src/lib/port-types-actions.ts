'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface PortType {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export async function getPortTypes(): Promise<PortType[]> {
  try {
    return apiFetch('/porttypes?order=isdefault.desc,name.asc');
  } catch (error) {
    console.error('Erro ao buscar tipos de porta:', error);
    return [];
  }
}

export async function addPortType(data: { name: string, description?: string | null }) {
  const newId = `ptype_${Date.now()}`;
  try {
    await apiFetch('/porttypes', {
      method: 'POST',
      body: JSON.stringify({ id: newId, name: data.name, description: data.description, isdefault: false })
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao adicionar tipo de porta.');
  }
}

export async function updatePortType(id: string, data: any) {
    try {
        await apiFetch(`/porttypes?id=eq.${id}&isdefault=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar tipo de porta.');
    }
}

export async function deletePortType(id: string) {
    try {
        await apiFetch(`/porttypes?id=eq.${id}&isdefault=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo de porta.');
    }
}
