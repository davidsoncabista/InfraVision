'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';
import { updateItemDetails } from './item-detail-actions';
import type { GridItem } from '@/types/datacenter';

/**
 * Server Action dedicada a atualizar a posição (x, y) de um ParentItem.
 */
export async function updateParentItemPosition(
  itemId: string,
  x: number,
  y: number,
  userId: string
): Promise<void> {
  if (!itemId || x === undefined || y === undefined || !userId) {
    throw new Error('Dados insuficientes para atualizar a posição do item.');
  }

  try {
    // Reutiliza a lógica centralizada de atualização que já lida com o PostgREST em minúsculo
    await updateItemDetails({ id: itemId, x, y }, userId);
  } catch (error: any) {
    console.error(`Erro ao tentar mover item ${itemId}:`, error);
    throw new Error(error.message || 'Falha ao salvar a nova posição do item.');
  }
}

/**
 * Server Action para buscar todos os parent_items que não estão alocados em nenhuma sala.
 */
export async function getUnallocatedparent_items(): Promise<GridItem[]> {
    try {
        // Busca itens onde roomid é nulo e não estão descomissionados, usando rota em minúsculo
        const data = await apiFetch('/parent_items?roomid=is.null&status=neq.decommissioned');
        return (data || []).map((item: any) => ({
            ...item,
            roomId: item.roomid,
            widthM: item.widthm,
            heightM: item.heightm,
            radiusM: item.radiusm,
            serialNumber: item.serialnumber,
            ownerEmail: item.owneremail,
            dataSheetUrl: item.datasheeturl,
            tamanhoU: item.tamanhou,
            posicaoU: item.posicaou,
            potenciaW: item.potenciaw,
            isTestData: !!item.istestdata
        }));
    } catch (error) {
        console.error("Erro ao buscar itens de planta não alocados:", error);
        return [];
    }
}

/**
 * Server Action para alocar um ParentItem em uma sala e posição específicas.
 */
export async function allocateParentItem({ 
    itemId, 
    roomId, 
    x, 
    y, 
    userId 
}: { 
    itemId: string, 
    roomId: string, 
    x: number, 
    y: number, 
    userId: string 
}) {
    if (!itemId || !roomId || x === undefined || y === undefined || !userId) {
        throw new Error('Dados insuficientes para alocar o item.');
    }

    try {
        // Atualiza usando o endpoint em minúsculo através do updateItemDetails
        await updateItemDetails({ id: itemId, roomid: roomId, x, y }, userId);
        revalidatePath('/datacenter');
    } catch (error: any) {
        console.error(`Erro ao alocar o item ${itemId}:`, error);
        throw new Error(error.message || 'Falha ao alocar o item.');
    }
}
