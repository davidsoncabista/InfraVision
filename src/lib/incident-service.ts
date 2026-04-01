'use server';

import { apiGet, apiPatch, apiPost, apiDelete } from './api-client';
import { logAuditEvent } from './audit-actions';
import { _getUserById } from './user-service';
import { revalidatePath } from 'next/cache';

export interface Incident {
  id: string;
  description: string;
  typeName: string;
  entity_id: string;
  entity_type: string;
  severity: string;
  status: string;
  statusId: string;
  detectedAt: string;
  resolvedAt: string | null;
  severityColor: string;
  statusColor: string;
  statusIcon: string;
  evidenceCount: number;
}

/**
 * Busca incidentes ativos no prédio selecionado.
 */
export async function getIncidents(building_id: string): Promise<Incident[]> {
    if (!building_id) return [];
    
    try {
        // Resource embedding para trazer nomes de tipos, severidades e status em uma só chamada REST
        // Nota: O PostgREST usa o nome da relação definida pela FK
        const url = `/incidents?select=*,incidenttypes(name),incidentseverities(name,color,rank),incidentstatuses(name,color,icon_name)&incidentstatuses.name=not.in.(Resolvido,Fechado)&order=detectedat.desc`;
        
        const data = await apiGet('/incidents', {
            select: '*,incidenttypes(name),incidentseverities(name,color,rank),incidentstatuses(name,color,icon_name)',
            'incidentstatuses.name': 'not.in.(Resolvido,Fechado)',
            order: 'detectedat.desc'
        });
        
        return (data || []).map((r: any) => ({
            id: r.id,
            description: r.description,
            typeName: r.incidenttypes?.name || 'N/A',
            entity_id: r.entity_id,
            entity_type: r.entity_type,
            severity: r.incidentseverities?.name || 'N/A',
            status: r.incidentstatuses?.name || 'N/A',
            statusId: r.statusid,
            detectedAt: new Date(r.detectedat).toISOString(),
            resolvedAt: r.resolvedat ? new Date(r.resolvedat).toISOString() : null,
            severityColor: r.incidentseverities?.color || 'gray',
            statusColor: r.incidentstatuses?.color || 'gray',
            statusIcon: r.incidentstatuses?.icon_name || 'Info',
            evidenceCount: 0 // Será preenchido assincronamente se necessário
        }));
    } catch (err) {
        console.error('Erro ao buscar incidentes via REST:', err);
        return [];
    }
}

/**
 * Atualiza o status de um incidente.
 */
export async function updateIncident(incidentId: string, newStatusId: string, user_id: string, notes?: string) {
    const user = await _getUserById(user_id);
    if (!user) throw new Error("Usuário não autenticado.");

    // Verifica se o novo status é de fechamento
    const statuses = await apiGet('/incidentstatuses', { id: `eq.${newStatusId}` });
    const isResolved = statuses && (statuses[0]?.name === 'Resolvido' || statuses[0]?.name === 'Fechado');

    await apiPatch('/incidents', { 
        statusid: newStatusId, 
        resolvedat: isResolved ? new Date().toISOString() : null,
        notes: notes || null
    }, { id: `eq.${incidentId}` });

    await logAuditEvent({ 
        user, 
        action: 'INCIDENT_STATUS_UPDATED', 
        entity_type: 'incidents', 
        entity_id: incidentId, 
        details: { to: newStatusId, notes } 
    });
    
    revalidatePath('/incidents');
}

/**
 * Retorna uma lista de IDs de parent_items que possuem incidentes ativos.
 */
export async function getParentItemIdsWithActiveIncidents(building_id: string): Promise<string[]> {
    try {
        // Busca incidentes vinculados a parent_items que não estão resolvidos
        const data = await apiGet('/incidents', {
            select: 'entity_id,incidentstatuses!inner(name)',
            entity_type: 'eq.parent_items',
            'incidentstatuses.name': 'not.in.(Resolvido,Fechado)'
        });
        return (data || []).map((r: any) => r.entity_id);
    } catch (error) {
        return [];
    }
}

/**
 * Resolve um incidente de conexão De/Para.
 */
export async function resolveConnectionIncident({ incidentId, action, resolutionData }: { incidentId: string, action: 'get_details' | 'resolve', resolutionData?: any }) {
    if (action === 'get_details') {
        const incidents = await apiGet('/incidents', { id: `eq.${incidentId}` });
        if (!incidents || !incidents.length) return { details: null };
        
        const portId = incidents[0].entity_id;
        const ports = await apiGet('/equipment_ports', { 
            id: `eq.${portId}`, 
            select: '*,child_items(label,type,parent_items(label))' 
        });
        
        if (!ports || !ports.length) return { details: null };
        
        const port = ports[0];
        return {
            details: {
                item: { 
                    label: port.child_items?.label, 
                    id: port.childitemid,
                    parentName: port.child_items?.parent_items?.label,
                    type: port.child_items?.type || 'unknown'
                },
                port: {
                    id: port.id,
                    label: port.label,
                    port_typeName: 'N/A' // Pode ser enriquecido se necessário
                }
            }
        };
    }
    
    if (action === 'resolve' && resolutionData) {
        const { user_id, port_b_id, labelText, image_url } = resolutionData;
        const user = await _getUserById(user_id);
        if (!user) throw new Error("Usuário inválido.");

        // 1. Busca os dados do incidente para saber qual é a porta A
        const incidents = await apiGet('/incidents', { id: `eq.${incidentId}` });
        if (!incidents || !incidents.length) throw new Error("Incidente não encontrado.");
        const port_a_id = incidents[0].entity_id;

        // 2. Cria a conexão no PostgREST
        const connectionId = `conn_res_${Date.now()}`;
        await apiPost('/connections', {
            id: connectionId,
            port_a_id,
            port_b_id,
            connection_type_id: 'ctype_dados_utp', // Hardcoded por enquanto ou buscar dinamicamente
            status: 'active',
            labeltext: labelText || null,
            image_url: image_url || null
        });

        // 3. Atualiza as portas
        await apiPatch('/equipment_ports', { status: 'up', connectedtoportid: port_b_id }, { id: `eq.${port_a_id}` });
        await apiPatch('/equipment_ports', { status: 'up', connectedtoportid: port_a_id }, { id: `eq.${port_b_id}` });

        // 4. Fecha o incidente
        const closedStatus = await apiGet('/incidentstatuses', { name: 'eq.Resolvido' });
        if (closedStatus && closedStatus.length > 0) {
            await apiPatch('/incidents', { 
                statusid: closedStatus[0].id, 
                resolvedat: new Date().toISOString() 
            }, { id: `eq.${incidentId}` });
        }

        await logAuditEvent({ user, action: 'INCIDENT_RESOLVED_CONNECTION', entity_type: 'incidents', entity_id: incidentId });
        revalidatePath('/incidents');
        revalidatePath('/depara');
        return { success: true };
    }
    
    return { success: false };
}
