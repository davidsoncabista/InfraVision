'use server';

import { apiFetch } from './db';
import { logAuditEvent } from './audit-actions';
import { _getUserById } from './user-service';
import { revalidatePath } from 'next/cache';

export interface ConnectableItem {
    id: string;
    label: string;
    type: string;
    parentName: string | null;
}

export interface EquipmentPort {
    id: string;
    label: string;
    port_typeName: string;
    status: 'up' | 'down' | 'disabled';
    connectionId: string | null;
    connectedToPortId: string | null;
    connectedToPortLabel: string | null;
    connectedToEquipmentLabel: string | null;
}

export interface EquipmentSummary {
    id: string;
    label: string;
    type: string;
    parentName: string | null;
    totalPorts: number;
    usedPorts: number;
}

export interface ConnectionDetail {
    id: string;
    portA_id: string;
    portB_id: string | null;
    itemA_label: string;
    itemA_parentName: string | null;
    portA_label: string;
    itemB_label: string | null;
    itemB_parentName: string | null;
    portB_label: string | null;
    connectionType: string;
    connectionTypeId: string;
    status: string;
    image_url: string | null;
    labelText: string | null;
}

export async function getConnectablechild_items(building_id?: string): Promise<ConnectableItem[]> {
    try {
        // Resource embedding para filtrar por prédio usando endpoints minúsculos
        let url = '/child_items?select=id,label,type,parent_items(label,rooms(building_id))';
        if (building_id) {
            url += `&parent_items.rooms.building_id=eq.${building_id}`;
        }
        const data = await apiFetch(url);
        return data.map((ci: any) => ({
            id: ci.id,
            label: ci.label,
            type: ci.type,
            parentName: ci.parent_items?.label || null
        }));
    } catch (error) {
        return [];
    }
}

export async function getPortsByChildItemId(childItemId: string | null): Promise<EquipmentPort[]> {
    if (!childItemId) return [];
    try {
        // PostgREST select com nomes de tabelas em minúsculo
        const data = await apiFetch(`/equipment_ports?childitemid=eq.${childItemId}&select=*,port_types(name),connections!portA_id(*),connectedport:connectedtoportid(label,child_items(label))&order=label.asc`);
        
        return data.map((ep: any) => ({
            id: ep.id,
            label: ep.label,
            port_typeName: ep.port_types?.name || 'N/A',
            status: ep.status,
            connectionId: ep.connections?.[0]?.id || null,
            connectedToPortId: ep.connectedtoportid,
            connectedToPortLabel: ep.connectedport?.label || null,
            connectedToEquipmentLabel: ep.connectedport?.child_items?.label || null
        }));
    } catch (error) {
        return [];
    }
}

export async function getAllConnections(building_id?: string): Promise<ConnectionDetail[]> {
    try {
        let url = '/connections?select=*,portA:portA_id(label,child_items(label,parent_items(label,rooms(building_id)))),portB:portB_id(label,child_items(label,parent_items(label))),connectiontypes(name)';
        if (building_id) {
            url += `&portA.child_items.parent_items.rooms.building_id=eq.${building_id}`;
        }
        const data = await apiFetch(url);
        return data.map((c: any) => ({
            id: c.id,
            portA_id: c.portA_id,
            portB_id: c.portB_id,
            itemA_label: c.portA?.child_items?.label || 'N/A',
            itemA_parentName: c.portA?.child_items?.parent_items?.label || null,
            portA_label: c.portA?.label || 'N/A',
            itemB_label: c.portB?.child_items?.label || null,
            itemB_parentName: c.portB?.child_items?.parent_items?.label || null,
            portB_label: c.portB?.label || null,
            connectionType: c.connectiontypes?.name || 'N/A',
            connectionTypeId: c.connectiontypeid,
            status: c.status,
            image_url: c.image_url,
            labelText: c.labeltext
        }));
    } catch (error) {
        return [];
    }
}

export async function createConnection(data: { 
    portA_id: string; 
    portB_id?: string | null; 
    connectionTypeId: string; 
    labelText?: string | null;
    image_url?: string | null;
    user_id: string;
}) {
    const user = await _getUserById(data.user_id);
    if (!user) throw new Error("Usuário inválido.");

    const connectionId = `conn_${Date.now()}`;
    const status = data.portB_id ? 'active' : 'unresolved';

    await apiFetch('/connections', {
        method: 'POST',
        body: JSON.stringify({
            id: connectionId,
            portA_id: data.portA_id,
            portB_id: data.portB_id || null,
            connectiontypeid: data.connectionTypeId,
            labeltext: data.labelText || null,
            image_url: data.image_url || null,
            status
        })
    });

    // Atualiza portas
    await apiFetch(`/equipment_ports?id=eq.${data.portA_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'up', connectedtoportid: data.portB_id || null })
    });

    if (data.portB_id) {
        await apiFetch(`/equipment_ports?id=eq.${data.portB_id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'up', connectedtoportid: data.portA_id })
        });
    }

    await logAuditEvent({ user, action: 'CONNECTION_CREATED', entity_type: 'connections', entity_id: connectionId });
    revalidatePath('/depara');
}

export async function disconnectConnection(connectionId: string, user_id: string) {
    const user = await _getUserById(user_id);
    if (!user) throw new Error("Usuário inválido.");

    const connData = await apiFetch(`/connections?id=eq.${connectionId}`);
    if (connData.length === 0) throw new Error("Conexão não encontrada.");
    
    const { portA_id, portB_id } = connData[0];

    await apiFetch(`/connections?id=eq.${connectionId}`, { method: 'DELETE' });
    
    if (portA_id) await apiFetch(`/equipment_ports?id=eq.${portA_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'down', connectedtoportid: null }) });
    if (portB_id) await apiFetch(`/equipment_ports?id=eq.${portB_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'down', connectedtoportid: null }) });

    await logAuditEvent({ user, action: 'CONNECTION_DELETED', entity_type: 'connections', entity_id: connectionId });
    revalidatePath('/depara');
}

export async function getConnectableEquipmentSummary(building_id?: string): Promise<EquipmentSummary[]> {
    try {
        const items = await getConnectablechild_items(building_id);
        const summaries = await Promise.all(items.map(async (item) => {
            const ports = await apiFetch(`/equipment_ports?childitemid=eq.${item.id}`);
            return {
                ...item,
                totalPorts: ports.length,
                usedPorts: ports.filter((p: any) => p.status === 'up').length
            };
        }));
        return summaries;
    } catch (error) {
        return [];
    }
}

export async function addPortToEquipment(data: { childItemId: string; port_typeId: string; label: string; }) {
    await apiFetch('/equipment_ports', {
        method: 'POST',
        body: JSON.stringify({ id: `eport_${Date.now()}`, childitemid: data.childItemId, port_typeid: data.port_typeId, label: data.label, status: 'down' })
    });
    revalidatePath('/connections');
}

export async function deletePortFromEquipment(portId: string, user_id: string) {
    const user = await _getUserById(user_id);
    if (!user) throw new Error("Usuário inválido.");
    await apiFetch(`/equipment_ports?id=eq.${portId}&status=neq.up`, { method: 'DELETE' });
    await logAuditEvent({ user, action: 'PORT_DELETED', entity_type: 'equipment_ports', entity_id: portId });
    revalidatePath('/connections');
}
