'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

/**
 * Interface que representa um tipo de equipamento no sistema.
 */
export interface ItemType {
  id: string;
  name: string;
  category: string;
  shape: 'rectangle' | 'circle';
  defaultWidthM: number;
  defaultHeightM: number;
  defaultRadiusM?: number | null;
  iconName?: string;
  canHaveChildren?: boolean;
  isResizable?: boolean;
  status: 'active' | 'deleted';
  defaultColor?: string;
  is_test_data?: boolean;
  isDefault?: boolean;
}

/**
 * Mapeia os dados minúsculos vindos do PostgreSQL para a interface camelCase do app.
 */
const mapItemType = (r: any): ItemType => ({
    id: r.id,
    name: r.name,
    category: r.category,
    shape: r.shape || 'rectangle',
    defaultWidthM: r.defaultwidthm || 0,
    defaultHeightM: r.defaultheightm || 0,
    defaultRadiusM: r.defaultradiusm,
    iconName: r.iconname,
    canHaveChildren: !!r.canhavechildren,
    isResizable: !!r.isresizable,
    status: r.status,
    defaultColor: r.defaultcolor,
    is_test_data: !!r.is_test_data,
    isDefault: !!r.isdefault
});

const getEndpoint = (isParentType: boolean) => (isParentType ? '/item_types' : '/item_typeseqp');

export async function getitem_types(isParentType: boolean): Promise<ItemType[]> {
  const endpoint = getEndpoint(isParentType);
  try {
    const data = await apiFetch(`${endpoint}?status=eq.active&order=category,name`);
    return (data || []).map(mapItemType);
  } catch (error) {
    console.error(`Erro ao buscar tipos:`, error);
    return [];
  }
}

export async function addItemType(data: any, isParentType: boolean) {
    const endpoint = getEndpoint(isParentType);
    const newId = `type_${Date.now()}`;
    
    // Tratamento de campos para o banco (nomes de coluna minúsculos)
    const dataForDb = {
        id: newId,
        name: data.name,
        category: data.category || 'Equipamento',
        iconname: data.iconName || null,
        canhavechildren: data.canHaveChildren ? true : false,
        isresizable: data.isResizable ? true : false,
        status: 'active',
        is_test_data: false,
        defaultcolor: data.defaultColor || null,
        shape: data.shape || 'rectangle',
        defaultwidthm: data.shape === 'circle' ? data.defaultRadiusM : (data.defaultWidthM || 0.6),
        defaultheightm: data.shape === 'circle' ? data.defaultRadiusM : (data.defaultHeightM || 1.0),
        defaultradiusm: data.defaultRadiusM || null,
        isdefault: false
    };

    try {
        await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(dataForDb)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao salvar tipo de item: ' + error.message);
    }
}

export async function updateItemType(id: string, data: any, isParentType: boolean): Promise<void> {
  const endpoint = getEndpoint(isParentType);
  
  // Mapeia para minúsculo
  const dataForDb: any = {};
  if (data.name) dataForDb.name = data.name;
  if (data.category) dataForDb.category = data.category;
  if (data.iconName !== undefined) dataForDb.iconname = data.iconName;
  if (data.defaultWidthM !== undefined) dataForDb.defaultwidthm = data.defaultWidthM;
  if (data.defaultHeightM !== undefined) dataForDb.defaultheightm = data.defaultHeightM;
  if (data.defaultRadiusM !== undefined) dataForDb.defaultradiusm = data.defaultRadiusM;
  if (data.defaultColor !== undefined) dataForDb.defaultcolor = data.defaultColor;
  if (data.canHaveChildren !== undefined) dataForDb.canhavechildren = data.canHaveChildren;
  if (data.isResizable !== undefined) dataForDb.isresizable = data.isResizable;
  if (data.shape) dataForDb.shape = data.shape;

  try {
    await apiFetch(`${endpoint}?id=eq.${id}&isdefault=eq.false`, {
        method: 'PATCH',
        body: JSON.stringify(dataForDb)
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao atualizar tipo: ' + error.message);
  }
}

export async function deleteItemType(id: string, isParentType: boolean): Promise<void> {
    const endpoint = getEndpoint(isParentType);
    try {
        // Soft delete (marcar como excluído)
        await apiFetch(`${endpoint}?id=eq.${id}&isdefault=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'deleted' })
        });
        revalidatePath('/system');
        revalidatePath('/trash');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo: ' + error.message);
    }
}

export async function getDeleteditem_types(): Promise<ItemType[]> {
    try {
        const [pData, cData] = await Promise.all([
            apiFetch('/item_types?status=eq.deleted'),
            apiFetch('/item_typeseqp?status=eq.deleted')
        ]);
        return [...(pData || []), ...(cData || [])].map(mapItemType);
    } catch (error) {
        return [];
    }
}

export async function restoreItemType(typeId: string): Promise<void> {
    try {
        // Tenta restaurar em ambas as tabelas
        await Promise.all([
            apiFetch(`/item_types?id=eq.${typeId}`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) }),
            apiFetch(`/item_typeseqp?id=eq.${typeId}`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) })
        ]);
        revalidatePath('/trash');
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao restaurar tipo.');
    }
}

export async function permanentlyDeleteItemType(typeId: string): Promise<void> {
    try {
        await Promise.all([
            apiFetch(`/item_types?id=eq.${typeId}&status=eq.deleted`, { method: 'DELETE' }),
            apiFetch(`/item_typeseqp?id=eq.${typeId}&status=eq.deleted`, { method: 'DELETE' })
        ]);
        revalidatePath('/trash');
    } catch (error: any) {
        throw new Error('Falha ao excluir permanentemente.');
    }
}
