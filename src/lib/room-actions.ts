'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { apiFetch } from './db';

export interface ExclusionZone {
  id: string;
  roomId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AddRoomParams {
  buildingId: string;
  name: string;
  widthM?: number;
  depthM?: number;
  tileWidthCm?: number;
  tileHeightCm?: number;
  xAxisNaming?: string;
  yAxisNaming?: string;
}

const exclusionZoneSchema = z.object({
  roomId: z.string().min(1),
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
  width: z.coerce.number().int().min(1),
  height: z.coerce.number().int().min(1),
});

/**
 * Adiciona uma nova sala a um prédio.
 */
export async function addRoom(params: AddRoomParams): Promise<void> {
  const newId = `R${Date.now()}`;
  await apiFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify({
          id: newId,
          name: params.name,
          buildingid: params.buildingId,
          widthm: params.widthM || null,
          depthm: params.depthM || null,
          tilewidthcm: params.tileWidthCm || 60,
          tileheightcm: params.tileHeightCm || 60,
          xaxisnaming: params.xAxisNaming || 'alpha',
          yaxisnaming: params.yAxisNaming || 'numeric',
          istestdata: false
      })
  });
  revalidatePath('/buildings');
}

/**
 * Atualiza os detalhes de uma sala existente.
 */
export async function updateRoom(params: any): Promise<void> {
  const { id, ...updates } = params;
  
  // Mapeia para minúsculo esperado pelo PostgreSQL no PostgREST
  const dbUpdates: any = {};
  if(updates.name) dbUpdates.name = updates.name;
  if(updates.widthM !== undefined) dbUpdates.widthm = updates.widthM;
  if(updates.depthM !== undefined) dbUpdates.depthm = updates.depthM;
  if(updates.tileWidthCm !== undefined) dbUpdates.tilewidthcm = updates.tileWidthCm;
  if(updates.tileHeightCm !== undefined) dbUpdates.tileheightcm = updates.tileHeightCm;
  if(updates.xAxisNaming) dbUpdates.xaxisnaming = updates.xAxisNaming;
  if(updates.yAxisNaming) dbUpdates.yaxisnaming = updates.yAxisNaming;

  await apiFetch(`/rooms?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dbUpdates)
  });
  revalidatePath('/buildings');
  revalidatePath('/datacenter');
}

/**
 * Exclui uma sala se ela estiver vazia.
 */
export async function deleteRoom(roomId: string): Promise<void> {
    // Verifica se existem itens vinculados à sala
    const items = await apiFetch(`/parent_items?roomid=eq.${roomId}&limit=1`);
    if (items && items.length > 0) {
        throw new Error('Não é possível excluir a sala pois ela contém equipamentos.');
    }
    
    await apiFetch(`/rooms?id=eq.${roomId}`, { method: 'DELETE' });
    revalidatePath('/buildings');
}

/**
 * Busca as zonas de exclusão de uma sala.
 */
export async function getExclusionZonesByRoomId(roomId: string): Promise<ExclusionZone[]> {
    if (!roomId) return [];
    const data = await apiFetch(`/roomexclusionzones?roomid=eq.${roomId}`);
    return (data || []).map((z: any) => ({
        id: z.id,
        roomId: z.roomid,
        x: z.x,
        y: z.y,
        width: z.width,
        height: z.height
    }));
}

/**
 * Adiciona uma zona de exclusão a uma sala.
 */
export async function addExclusionZone(data: z.infer<typeof exclusionZoneSchema>) {
    const newId = `exz_${Date.now()}`;
    await apiFetch('/roomexclusionzones', {
        method: 'POST',
        body: JSON.stringify({
            id: newId,
            roomid: data.roomId,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height
        })
    });
    revalidatePath('/datacenter');
}

/**
 * Atualiza uma zona de exclusão existente.
 */
export async function updateExclusionZone(zoneId: string, data: Partial<ExclusionZone>) {
    await apiFetch(`/roomexclusionzones?id=eq.${zoneId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
    revalidatePath('/datacenter');
}

/**
 * Remove uma zona de exclusão.
 */
export async function deleteExclusionZone(zoneId: string) {
    await apiFetch(`/roomexclusionzones?id=eq.${zoneId}`, { method: 'DELETE' });
    revalidatePath('/datacenter');
}
