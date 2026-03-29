'use server';

import { apiFetch } from './db';
import { revalidatePath } from 'next/cache';
import { _getUserById } from './user-service';
import { logAuditEvent } from './audit-actions';

async function createPortsForModel(childItemId: string, modelName: string) {
    const models = await apiFetch(`/models?name=eq.${encodeURIComponent(modelName)}&select=portconfig`);
    if (models.length === 0 || !models[0].portconfig) return;

    const portConfig = models[0].portconfig;
    const portTypes = await apiFetch('/porttypes?select=id,name');
    const portTypesMap = new Map(portTypes.map((pt: any) => [pt.name.toUpperCase(), pt.id]));
    
    const portGroups = portConfig.split(';').filter(Boolean);
    let portCounter = 1;

    for (const group of portGroups) {
        const parts = group.toLowerCase().split('x');
        if (parts.length !== 2) continue;
        const quantity = parseInt(parts[0], 10);
        const typeName = parts[1].toUpperCase();
        const portTypeId = portTypesMap.get(typeName);
        if (!portTypeId) continue;

        for (let i = 0; i < quantity; i++) {
            const portId = `eport_${childItemId}_${portCounter}`;
            const portLabel = `${typeName.replace(/[^A-Z0-9]/g, '')}-${i + 1}`;
            await apiFetch('/equipmentports', {
                method: 'POST',
                body: JSON.stringify({
                    id: portId,
                    childitemid: childItemId,
                    porttypeid: portTypeId,
                    label: portLabel,
                    status: 'down'
                })
            });
            portCounter++;
        }
    }
}

export async function updateItemDetails(itemData: any, userId: string): Promise<void> {
    const user = await _getUserById(userId);
    if (!user) throw new Error("Usuário não autenticado.");

    const { id, ...fields } = itemData;
    const isChild = 'parentId' in fields || 'parentid' in fields;
    const tableName = isChild ? 'childitems' : 'parentitems';
    
    const existing = await apiFetch(`/${tableName}?id=eq.${id}`);
    const existingItem = existing[0];

    // Limpeza de campos injetados pela UI que não existem no DB
    const { iconName, shape, itemTypeColor, roomName, buildingName, parentName, ...rest } = fields;
    
    // Mapeamento manual para camelCase -> snake_case/minúsculo do Postgres
    const validFields: any = {};
    Object.entries(rest).forEach(([key, value]) => {
        validFields[key.toLowerCase()] = value;
    });

    if (existingItem) {
        await apiFetch(`/${tableName}?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(validFields)
        });
        await logAuditEvent({ user, action: 'ITEM_UPDATED', entityType: tableName, entityId: id, details: validFields });
    } else {
        await apiFetch(`/${tableName}`, {
            method: 'POST',
            body: JSON.stringify({ ...validFields, id })
        });

        if (isChild && validFields.modelo) {
            await createPortsForModel(id, validFields.modelo);
        }
        await logAuditEvent({ user, action: 'ITEM_CREATED', entityType: tableName, entityId: id, details: validFields });
    }

    revalidatePath('/datacenter');
    revalidatePath('/inventory');
}
