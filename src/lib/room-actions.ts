'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { apiFetch } from './db';

export interface ExclusionZone {
  id: string;
  room_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AddRoomParams {
  building_id: string;
  name: string;
  depth_m?: number;
  width_m?: number;
  tile_width_cm?: number;
  tile_height_cm?: number;
  x_axis_naming?: string;
  y_axis_naming?: string;
}

const exclusionZoneSchema = z.object({
  room_id: z.string().min(1),
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
          building_id: params.building_id,
          depth_m: params.depth_m || null,
          width_m: params.width_m || null,
          tile_width_cm: params.tile_width_cm || 60,
          tile_height_cm: params.tile_height_cm || 60,
          x_axis_naming: params.x_axis_naming || 'alpha',
          y_axis_naming: params.y_axis_naming || 'numeric',
          is_test_data: false
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
  if(updates.width_m !== undefined) dbUpdates.width_m = updates.width_m;
  if(updates.width_m !== undefined) dbUpdates.width_m = updates.width_m;
  if(updates.tile_width_cm !== undefined) dbUpdates.tile_width_cm = updates.tile_width_cm;
  if(updates.tile_height_cm !== undefined) dbUpdates.tile_height_cm = updates.tile_height_cm;
  if(updates.x_axis_naming) dbUpdates.x_axis_naming = updates.x_axis_naming;
  if(updates.y_axis_naming) dbUpdates.y_axis_naming = updates.y_axis_naming;

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
export async function deleteRoom(room_id: string): Promise<void> {
    // Verifica se existem itens vinculados à sala
    const items = await apiFetch(`/parent_items?room_id=eq.${room_id}&limit=1`);
    if (items && items.length > 0) {
        throw new Error('Não é possível excluir a sala pois ela contém equipamentos.');
    }
    
    await apiFetch(`/rooms?id=eq.${room_id}`, { method: 'DELETE' });
    revalidatePath('/buildings');
}

/**
 * Busca as zonas de exclusão de uma sala.
 */
export async function getExclusionZonesByroom_id(room_id: string): Promise<ExclusionZone[]> {
    if (!room_id) return [];
    const data = await apiFetch(`/roomexclusionzones?room_id=eq.${room_id}`);
    return (data || []).map((z: any) => ({
        id: z.id,
        room_id: z.room_id,
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
            room_id: data.room_id,
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
