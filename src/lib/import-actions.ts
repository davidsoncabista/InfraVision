'use server';

import { apiGet, apiPost } from './api-client';
import { revalidatePath } from 'next/cache';
import { createConnection } from './connection-actions';

interface ChildItemImportData {
    label: string;
    type: string;
    manufacturer: string;
    model: string;
    serial_number?: string;
    sizeU?: number;
    parentRack: string;
    posicao_u?: number;
}

interface ParentItemImportData {
    label: string;
    type: string;
    location?: string;
}

interface ConnectionImportData {
    from_equipment: string;
    from_port: string;
    to_equipment?: string;
    to_port?: string;
    connection_type?: string; 
}

export interface ImportResult {
    successCount: number;
    errorCount: number;
    totalCount: number;
}

/**
 * Importa equipamentos aninhados buscando o rack pai por nome no prédio ativo.
 */
export async function importchild_items(items: ChildItemImportData[], building_id: string): Promise<ImportResult> {
    if (!building_id) throw new Error("ID do prédio obrigatório.");
    
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
        try {
            // Busca o rack pai pelo label e garantindo que pertence ao prédio correto
            const parents = await apiGet('/parent_items', { 
                label: `eq.${encodeURIComponent(item.parentRack)}`,
                'rooms.building_id': `eq.${building_id}`,
                select: 'id,rooms!inner(building_id)'
            });
            
            if (!parents || parents.length === 0) {
                errorCount++;
                continue;
            }
            const parent_id = parents[0].id;
            const newId = `citem_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            await apiPost('/child_items', {
                id: newId,
                label: item.label,
                parent_id: parent_id,
                type: item.type,
                brand: item.manufacturer,
                modelo: item.model,
                serial_number: item.serial_number || null,
                tamanho_u: item.sizeU ? Number(item.sizeU) : null,
                posicao_u: item.posicao_u ? Number(item.posicao_u) : null,
                status: 'draft',
                is_test_data: false
            });
            successCount++;
        } catch (innerError) {
            errorCount++;
        }
    }

    revalidatePath('/inventory');
    return { successCount, errorCount, totalCount: items.length };
}

/**
 * Importa itens de planta (como Racks) criando-os em rascunho sem alocação inicial.
 */
export async function importparent_items(items: ParentItemImportData[]): Promise<ImportResult> {
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of items) {
        try {
            const newId = `pitem_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await apiPost('/parent_items', { 
                id: newId, 
                label: item.label, 
                type: item.type,
                status: 'draft',
                width_m: 0.6,
                height_m: 1.0,
                is_test_data: false 
            });
            successCount++;
        } catch (innerError) {
            errorCount++;
        }
    }
    revalidatePath('/inventory');
    return { successCount, errorCount, totalCount: items.length };
}

/**
 * Importa conexões De/Para resolvendo os equipamentos e portas por nome.
 */
export async function importConnections(items: ConnectionImportData[], building_id: string): Promise<ImportResult> {
    if (!building_id) throw new Error("ID do prédio obrigatório.");
    let successCount = 0;
    let errorCount = 0;

    const types = await apiGet('/connectiontypes', { name: 'eq.Dados UTP', select: 'id' });
    const defaultConnTypeId = types?.[0]?.id;
    if (!defaultConnTypeId) throw new Error("Tipo padrão não encontrado.");

    const findPort = async (equipLabel: string, portLabel: string) => {
        // Busca a porta garantindo o encadeamento de labels até o prédio
        const ports = await apiGet('/equipment_ports', {
            label: `eq.${encodeURIComponent(portLabel)}`,
            'child_items.label': `eq.${encodeURIComponent(equipLabel)}`,
            'child_items.parent_items.rooms.building_id': `eq.${building_id}`,
            select: 'id,child_items!inner(label,parent_items!inner(rooms!inner(building_id)))'
        });
        return ports?.[0];
    };

    for (const conn of items) {
        try {
            const portAInfo = await findPort(conn.from_equipment, conn.from_port);
            if (!portAInfo) { errorCount++; continue; }

            const portBInfo = conn.to_equipment && conn.to_port ? await findPort(conn.to_equipment, conn.to_port) : null;
            
            await createConnection({
                port_a_id: portAInfo.id,
                port_b_id: portBInfo?.id,
                connection_type_id: defaultConnTypeId,
                user_id: 'system' 
            });
            
            successCount++;
        } catch (innerError) {
            errorCount++;
        }
    }
    
    revalidatePath('/depara');
    return { successCount, errorCount, totalCount: items.length };
}
