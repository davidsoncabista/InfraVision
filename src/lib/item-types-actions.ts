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
  default_width_m: number;
  default_depth_m: number;
  default_radius_m?: number | null;
  icon_name?: string;
  can_have_children?: boolean;
  is_resizable?: boolean;
  status: 'active' | 'deleted';
  default_color?: string;
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
    default_width_m: r.default_width_m || 0,
    default_depth_m: r.default_depth_m || 0,
    default_radius_m: r.default_radius_m,
    icon_name: r.icon_name,
    can_have_children: !!r.can_have_children,
    is_resizable: !!r.is_resizable,
    status: r.status,
    default_color: r.default_color,
    is_test_data: !!r.is_test_data,
    isDefault: !!r.is_default
});

const getEndpoint = (isParentType: boolean) => (isParentType ? '/item_types' : '/item_types_eqp');

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
        icon_name: data.icon_name || null,
        can_have_children: data.can_have_children ? true : false,
        is_resizable: data.is_resizable ? true : false,
        status: 'active',
        is_test_data: false,
        default_color: data.default_color || null,
        shape: data.shape || 'rectangle',
        default_width_m: data.shape === 'circle' ? data.default_radius_m : (data.default_width_m || 0.6),
        default_depth_m: data.shape === 'circle' ? data.default_radius_m : (data.default_depth_m || 1.0),
        default_radius_m: data.default_radius_m || null,
        is_default: false
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
  if (data.icon_name !== undefined) dataForDb.icon_name = data.icon_name;
  if (data.defaultwidth_m !== undefined) dataForDb.defaultwidth_m = data.defaultwidth_m;
  if (data.default_depth_m !== undefined) dataForDb.default_depth_m = data.default_depth_m;
  if (data.default_radius_m !== undefined) dataForDb.default_radius_m = data.default_radius_m;
  if (data.default_color !== undefined) dataForDb.default_color = data.default_color;
  if (data.can_have_children !== undefined) dataForDb.can_have_children = data.can_have_children;
  if (data.is_resizable !== undefined) dataForDb.is_resizable = data.is_resizable;
  if (data.shape) dataForDb.shape = data.shape;

  try {
    await apiFetch(`${endpoint}?id=eq.${id}&is_default=eq.false`, {
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
