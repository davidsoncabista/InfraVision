'use server';

import { apiFetch } from './db';
import { revalidatePath } from 'next/cache';
import { _getUserById } from './user-service';
import { logAuditEvent } from './audit-actions';

async function createPortsForModel(childItemId: string, modelName: string) {
    const models = await apiFetch(`/models?name=eq.${encodeURIComponent(modelName)}&select=portconfig`);
    if (models.length === 0 || !models[0].portconfig) return;

    const portConfig = models[0].portconfig;
    const port_types = await apiFetch('/port_types?select=id,name');
    const port_typesMap = new Map(port_types.map((pt: any) => [pt.name.toUpperCase(), pt.id]));
    
    const portGroups = portConfig.split(';').filter(Boolean);
    let portCounter = 1;

    for (const group of portGroups) {
        const parts = group.toLowerCase().split('x');
        if (parts.length !== 2) continue;
        const quantity = parseInt(parts[0], 10);
        const typeName = parts[1].toUpperCase();
        const port_typeId = port_typesMap.get(typeName);
        if (!port_typeId) continue;

        for (let i = 0; i < quantity; i++) {
            const portId = `eport_${childItemId}_${portCounter}`;
            const portLabel = `${typeName.replace(/[^A-Z0-9]/g, '')}-${i + 1}`;
            await apiFetch('/equipment_ports', {
                method: 'POST',
                body: JSON.stringify({
                    id: portId,
                    childitemid: childItemId,
                    port_typeid: port_typeId,
                    label: portLabel,
                    status: 'down'
                })
            });
            portCounter++;
        }
    }
}

export async function updateItemDetails(itemData: any, user_id: string): Promise<void> {
    const user = await _getUserById(user_id);
    if (!user) throw new Error("Usuário não autenticado.");

    const { id, ...fields } = itemData;
    const isChild = 'parent_id' in fields || 'parent_id' in fields;
    const tableName = isChild ? 'child_items' : 'parent_items';
    
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
        await logAuditEvent({ user, action: 'ITEM_UPDATED', entity_type: tableName, entity_id: id, details: validFields });
    } else {
        await apiFetch(`/${tableName}`, {
            method: 'POST',
            body: JSON.stringify({ ...validFields, id })
        });

        if (isChild && validFields.modelo) {
            await createPortsForModel(id, validFields.modelo);
        }
        await logAuditEvent({ user, action: 'ITEM_CREATED', entity_type: tableName, entity_id: id, details: validFields });
    }

    revalidatePath('/datacenter');
    revalidatePath('/inventory');
}
