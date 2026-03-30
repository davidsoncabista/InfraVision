
'use server';

import { apiFetch } from './db';
import { getItemStatuses } from './status-actions';

export async function getInventoryData(buildingId?: string) {
    try {
        // Resource embedding usando rotas minúsculas
        let pUrl = '/parent_items?status=not.in.(decommissioned,deleted)&select=*,rooms!inner(name,buildings!inner(id,name))';
        let cUrl = '/child_items?status=not.in.(decommissioned,deleted)&select=*,parent_items!inner(label,rooms!inner(buildings!inner(id)))';

        if (buildingId) {
            pUrl += `&rooms.buildings.id=eq.${buildingId}`;
            cUrl += `&parent_items.rooms.buildings.id=eq.${buildingId}`;
        }

        const [statuses, parent_items, child_items] = await Promise.all([
            getItemStatuses(),
            apiFetch(pUrl),
            apiFetch(cUrl)
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
