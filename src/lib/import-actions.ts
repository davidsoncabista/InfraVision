'use server';

import { apiFetch } from './db';
import { revalidatePath } from 'next/cache';
import { createConnection } from './connection-actions';

interface ChildItemImportData {
    label: string;
    type: string;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    sizeU?: number;
    parentRack: string;
    posicaoU?: number;
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
export async function importchild_items(items: ChildItemImportData[], buildingId: string): Promise<ImportResult> {
    if (!buildingId) throw new Error("ID do prédio obrigatório.");
    
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
        try {
            // Busca o rack pai pelo label e garantindo que pertence ao prédio correto
            const parents = await apiFetch(`/parent_items?label=eq.${encodeURIComponent(item.parentRack)}&rooms.buildingid=eq.${buildingId}&select=id,rooms!inner(buildingid)`);
            
            if (!parents || parents.length === 0) {
                errorCount++;
                continue;
            }
            const parentId = parents[0].id;
            const newId = `citem_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            await apiFetch('/child_items', {
                method: 'POST',
                body: JSON.stringify({
                    id: newId,
                    label: item.label,
                    parentid: parentId,
                    type: item.type,
                    brand: item.manufacturer,
                    modelo: item.model,
                    serialnumber: item.serialNumber || null,
                    tamanhou: item.sizeU || null,
                    posicaou: item.posicaoU || null,
                    status: 'draft',
                    istestdata: false
                })
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
            await apiFetch('/parent_items', {
                method: 'POST',
                body: JSON.stringify({ 
                    id: newId, 
                    label: item.label, 
                    type: item.type,
                    status: 'draft',
                    widthm: 0.6,
                    heightm: 1.0,
                    istestdata: false 
                })
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
export async function importConnections(items: ConnectionImportData[], buildingId: string): Promise<ImportResult> {
    if (!buildingId) throw new Error("ID do prédio obrigatório.");
    let successCount = 0;
    let errorCount = 0;

    const types = await apiFetch('/connectiontypes?name=eq.Dados UTP&select=id');
    const defaultConnTypeId = types?.[0]?.id;
    if (!defaultConnTypeId) throw new Error("Tipo padrão não encontrado.");

    const findPort = async (equipLabel: string, portLabel: string) => {
        // Busca a porta garantindo o encadeamento de labels até o prédio
        const ports = await apiFetch(`/equipment_ports?label=eq.${encodeURIComponent(portLabel)}&child_items.label=eq.${encodeURIComponent(equipLabel)}&child_items.parent_items.rooms.buildingid=eq.${buildingId}&select=id,child_items!inner(label,parent_items!inner(rooms!inner(buildingid)))`);
        return ports?.[0];
    };

    for (const conn of items) {
        try {
            const portAInfo = await findPort(conn.from_equipment, conn.from_port);
            if (!portAInfo) { errorCount++; continue; }

            const portBInfo = conn.to_equipment && conn.to_port ? await findPort(conn.to_equipment, conn.to_port) : null;
            
            await createConnection({
                portA_id: portAInfo.id,
                portB_id: portBInfo?.id,
                connectionTypeId: defaultConnTypeId,
                userId: 'system' 
            });
            
            successCount++;
        } catch (innerError) {
            errorCount++;
        }
    }
    
    revalidatePath('/depara');
    return { successCount, errorCount, totalCount: items.length };
}
