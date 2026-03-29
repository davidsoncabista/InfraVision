
'use server';

import { apiFetch } from './db';
import { getItemStatuses } from './status-actions';

export async function getInventoryData(buildingId?: string) {
    try {
        // Resource embedding usando rotas minúsculas
        let pUrl = '/parentitems?status=not.in.(decommissioned,deleted)&select=*,rooms!inner(name,buildings!inner(id,name))';
        let cUrl = '/childitems?status=not.in.(decommissioned,deleted)&select=*,parentitems!inner(label,rooms!inner(buildings!inner(id)))';

        if (buildingId) {
            pUrl += `&rooms.buildings.id=eq.${buildingId}`;
            cUrl += `&parentitems.rooms.buildings.id=eq.${buildingId}`;
        }

        const [statuses, parentItems, childItems] = await Promise.all([
            getItemStatuses(),
            apiFetch(pUrl),
            apiFetch(cUrl)
        ]);

        const mappedParents = (parentItems || []).map((pi: any) => ({
            ...pi,
            roomName: pi.rooms?.name,
            buildingName: pi.rooms?.buildings?.name
        }));

        const mappedChildren = (childItems || []).map((ci: any) => ({
            ...ci,
            parentName: ci.parentitems?.label
        }));

        return {
            parentItems: mappedParents,
            childItems: mappedChildren,
            allItems: [...mappedParents, ...mappedChildren],
            statuses
        };

    } catch (error) {
        console.error("Erro ao buscar dados do inventário:", error);
        return { parentItems: [], childItems: [], allItems: [], statuses: [] };
    }
}
