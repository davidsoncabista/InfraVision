'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import type { GridItem, Room } from '@/types/datacenter';
import type { ItemType } from './item-types-actions';

/**
 * Adiciona um novo item de planta baixa (ParentItem).
 */
export async function addItem({ label, itemType, room }: { label: string; itemType: ItemType; room: Room }): Promise<GridItem> {
  const newId = `pitem_${Date.now()}`;
  
  const newItem = {
      id: newId,
      label: label,
      x: 0,
      y: 0,
      width_m: Number(itemType.defaultwidth_m),
      heightm: Number(itemType.default_height_m),
      radiusm: itemType.default_radius_m ? Number(itemType.default_radius_m) : null,
      type: itemType.name,
      status: 'draft',
      room_id: room.id,
      color: itemType.default_color || null,
      shape: itemType.shape,
      is_test_data: false
  };

  const result = await apiPost('/parent_items', newItem);

  revalidatePath('/datacenter');
  return result[0];
}

/**
 * Exclui ou descomissiona um item (Parent ou Child).
 */
export async function deleteItem({ item, hardDelete }: { item: GridItem; hardDelete: boolean }): Promise<void> {
  const endpoint = item.parent_id ? '/child_items' : '/parent_items';

  if (hardDelete) {
    await apiDelete(endpoint, { id: `eq.${item.id}` });
  } else {
    await apiPatch(endpoint, { status: 'decommissioned' }, { id: `eq.${item.id}` });
  }

  revalidatePath('/datacenter');
  revalidatePath('/trash');
  revalidatePath('/inventory');
}

/**
 * Busca todos os itens descomissionados para a lixeira.
 */
export async function getDecommissionedItems(): Promise<GridItem[]> {
    try {
        const [pItems, cItems] = await Promise.all([
            apiGet('/parent_items', { status: 'eq.decommissioned' }),
            apiGet('/child_items', { status: 'eq.decommissioned' })
        ]);
        return [...(pItems || []), ...(cItems || [])].sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        return [];
    }
}

/**
 * Restaura um item descomissionado para o status Ativo.
 */
export async function restoreItem(item: GridItem): Promise<void> {
  const endpoint = item.parent_id ? '/child_items' : '/parent_items';
  await apiPatch(endpoint, { status: 'active' }, { id: `eq.${item.id}` });
  revalidatePath('/trash');
  revalidatePath('/datacenter');
  revalidatePath('/inventory');
}
