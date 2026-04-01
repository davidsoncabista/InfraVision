
'use server';

import { inventoryService } from '@/services/api/inventory.service';

export async function getInventoryData(building_id?: string) {
    return inventoryService.getInventoryData(building_id);
}
