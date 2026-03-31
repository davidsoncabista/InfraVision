
'use server';

import { apiGet } from './api-client';
import { getItemStatuses } from './status-actions';

export async function getInventoryData(building_id?: string) {
    try {
        // Resource embedding usando rotas minúsculas
        const pParams: any = {
            status: 'not.in.(decommissioned,deleted)',
            select: '*,rooms!inner(name,buildings!inner(id,name))'
        };
        const cParams: any = {
            status: 'not.in.(decommissioned,deleted)',
            select: '*,parent_items!inner(label,rooms!inner(buildings!inner(id)))'
        };

        if (building_id) {
            pParams['rooms.buildings.id'] = `eq.${building_id}`;
            cParams['parent_items.rooms.buildings.id'] = `eq.${building_id}`;
        }

        const [statuses, parent_items, child_items] = await Promise.all([
            getItemStatuses(),
            apiGet('/parent_items', pParams),
            apiGet('/child_items', cParams)
        ]);

        const mappedParents = (parent_items || []).map((pi: any) => ({
            ...pi,
            roomName: pi.rooms?.name,
            buildingName: pi.rooms?.buildings?.name
        }));

        const mappedChildren = (child_items || []).map((ci: any) => ({
            ...ci,
            parentName: ci.parent_items?.label
        }));

        return {
            parent_items: mappedParents,
            child_items: mappedChildren,
            allItems: [...mappedParents, ...mappedChildren],
            statuses
        };

    } catch (error) {
        console.error("Erro ao buscar dados do inventário:", error);
        return { parent_items: [], child_items: [], allItems: [], statuses: [] };
    }
}
