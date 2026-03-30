'use server';

import { apiFetch } from "@/lib/db";
import type { Building, Room, GridItem } from "@/types/datacenter";

/**
 * Busca todos os dados necessários para renderizar a planta baixa (Footprint).
 * Agora utiliza chamadas HTTPS via PostgREST com endpoints em minúsculo.
 */
export async function getDatacenterData(): Promise<Building[]> {
    try {
        // Buscamos os dados fundamentais em paralelo para máxima performance
        const [buildings, rooms, items, item_types] = await Promise.all([
            apiFetch('/buildings?select=id,name&order=name.asc'),
            apiFetch('/rooms?order=name.asc'),
            apiFetch('/parent_items?status=not.in.(decommissioned,deleted)'),
            apiFetch('/item_types?select=name,shape,iconname,defaultcolor')
        ]);

        // Criamos um mapa de tipos para enriquecer os itens com ícones e formas
        const item_typesMap = new Map((item_types || []).map((it: any) => [it.name, it]));

        // Processamos as salas mapeando os nomes de coluna minúsculos do PostgreSQL
        const allRooms = (rooms || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            building_id: r.building_id,
            widthM: r.widthm || 20, 
            depthM: r.depthm || 20, 
            tileWidthCm: r.tilewidthcm || 60,
            tileHeightCm: r.tileheightcm || 60,
            xAxisNaming: r.xaxisnaming || 'alpha',
            yAxisNaming: r.yaxisnaming || 'numeric',
            items: []
        }));

        // Processamos os itens da planta aplicando o mapeamento de tipos
        const allItems = (items || []).map((item: any) => {
            const typeInfo = item_typesMap.get(item.type) || {};
            return {
                ...item,
                room_id: item.room_id,
                widthM: item.widthm,
                heightM: item.heightm,
                radiusM: item.radiusm,
                serial_number: item.serial_number,
                isTagEligible: item.istageligible,
                ownerEmail: item.owneremail,
                dataSheetUrl: item.datasheeturl,
                trellisId: item.trellisid,
                tamanho_u: item.tamanho_u,
                potencia_w: item.potencia_w,
                is_test_data: !!item.is_test_data,
                // Dados vindos da tabela de tipos
                shape: typeInfo.shape,
                iconName: typeInfo.iconname,
                itemTypeColor: typeInfo.defaultcolor
            };
        });

        // Montamos a hierarquia: Prédios -> Salas -> Itens
        const roomsById = new Map(allRooms.map((r: any) => [r.id, r]));
        allItems.forEach((item: any) => {
            if (item.room_id && roomsById.has(item.room_id)) {
                roomsById.get(item.room_id)!.items.push(item);
            }
        });

        return (buildings || []).map((b: any) => ({
            ...b,
            rooms: allRooms.filter((r: any) => r.building_id === b.id)
        }));

    } catch (err: any) {
        console.error('Falha ao buscar dados do datacenter via API:', err);
        return [];
    }
}
