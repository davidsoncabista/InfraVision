'use server';

import { apiFetch } from './db';
import { logAuditEvent } from './audit-actions';
import { _getUserById } from './user-service';
import { revalidatePath } from 'next/cache';

export interface Incident {
  id: string;
  description: string;
  typeName: string;
  entityId: string;
  entityType: string;
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
export async function getIncidents(buildingId: string): Promise<Incident[]> {
    if (!buildingId) return [];
    
    try {
        // Resource embedding para trazer nomes de tipos, severidades e status em uma só chamada REST
        // Nota: O PostgREST usa o nome da relação definida pela FK
        const url = `/incidents?select=*,incidenttypes(name),incidentseverities(name,color,rank),incidentstatuses(name,color,iconname)&incidentstatuses.name=not.in.(Resolvido,Fechado)&order=detectedat.desc`;
        
        const data = await apiFetch(url);
        
        return (data || []).map((r: any) => ({
            id: r.id,
            description: r.description,
            typeName: r.incidenttypes?.name || 'N/A',
            entityId: r.entityid,
            entityType: r.entitytype,
            severity: r.incidentseverities?.name || 'N/A',
            status: r.incidentstatuses?.name || 'N/A',
            statusId: r.statusid,
            detectedAt: new Date(r.detectedat).toISOString(),
            resolvedAt: r.resolvedat ? new Date(r.resolvedat).toISOString() : null,
            severityColor: r.incidentseverities?.color || 'gray',
            statusColor: r.incidentstatuses?.color || 'gray',
            statusIcon: r.incidentstatuses?.iconname || 'Info',
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
export async function updateIncident(incidentId: string, newStatusId: string, userId: string, notes?: string) {
    const user = await _getUserById(userId);
    if (!user) throw new Error("Usuário não autenticado.");

    // Verifica se o novo status é de fechamento
    const statuses = await apiFetch(`/incidentstatuses?id=eq.${newStatusId}`);
    const isResolved = statuses && (statuses[0]?.name === 'Resolvido' || statuses[0]?.name === 'Fechado');

    await apiFetch(`/incidents?id=eq.${incidentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
            statusid: newStatusId, 
            resolvedat: isResolved ? new Date().toISOString() : null,
            notes: notes || null
        })
    });

    await logAuditEvent({ 
        user, 
        action: 'INCIDENT_STATUS_UPDATED', 
        entityType: 'incidents', 
        entityId: incidentId, 
        details: { to: newStatusId, notes } 
    });
    
    revalidatePath('/incidents');
}

/**
 * Retorna uma lista de IDs de parent_items que possuem incidentes ativos.
 */
export async function getParentItemIdsWithActiveIncidents(buildingId: string): Promise<string[]> {
    try {
        // Busca incidentes vinculados a parent_items que não estão resolvidos
        const data = await apiFetch(`/incidents?select=entityid,incidentstatuses!inner(name)&entitytype=eq.parent_items&incidentstatuses.name=not.in.(Resolvido,Fechado)`);
        return (data || []).map((r: any) => r.entityid);
    } catch (error) {
        return [];
    }
}

/**
 * Resolve um incidente de conexão De/Para.
 */
export async function resolveConnectionIncident({ incidentId, action, resolutionData }: { incidentId: string, action: 'get_details' | 'resolve', resolutionData?: any }) {
    if (action === 'get_details') {
        const incidents = await apiFetch(`/incidents?id=eq.${incidentId}`);
        if (!incidents || !incidents.length) return { details: null };
        
        const portId = incidents[0].entityid;
        const ports = await apiFetch(`/equipment_ports?id=eq.${portId}&select=*,child_items(label,parent_items(label))`);
        
        if (!ports || !ports.length) return { details: null };
        
        const port = ports[0];
        return {
            details: {
                item: { 
                    label: port.child_items?.label, 
                    id: port.childitemid,
                    parentName: port.child_items?.parent_items?.label 
                },
                port: {
                    id: port.id,
                    label: port.label,
                    portTypeName: 'N/A' // Pode ser enriquecido se necessário
                }
            }
        };
    }
    
    if (action === 'resolve' && resolutionData) {
        const { userId, portB_id, labelText, imageUrl } = resolutionData;
        const user = await _getUserById(userId);
        if (!user) throw new Error("Usuário inválido.");

        // 1. Busca os dados do incidente para saber qual é a porta A
        const incidents = await apiFetch(`/incidents?id=eq.${incidentId}`);
        if (!incidents || !incidents.length) throw new Error("Incidente não encontrado.");
        const portA_id = incidents[0].entityid;

        // 2. Cria a conexão no PostgREST
        const connectionId = `conn_res_${Date.now()}`;
        await apiFetch('/connections', {
            method: 'POST',
            body: JSON.stringify({
                id: connectionId,
                portA_id,
                portB_id,
                connectiontypeid: 'ctype_dados_utp', // Hardcoded por enquanto ou buscar dinamicamente
                status: 'active',
                labeltext: labelText || null,
                imageurl: imageUrl || null
            })
        });

        // 3. Atualiza as portas
        await apiFetch(`/equipment_ports?id=eq.${portA_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'up', connectedtoportid: portB_id }) });
        await apiFetch(`/equipment_ports?id=eq.${portB_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'up', connectedtoportid: portA_id }) });

        // 4. Fecha o incidente
        const closedStatus = await apiFetch('/incidentstatuses?name=eq.Resolvido');
        if (closedStatus && closedStatus.length > 0) {
            await apiFetch(`/incidents?id=eq.${incidentId}`, {
                method: 'PATCH',
                body: JSON.stringify({ 
                    statusid: closedStatus[0].id, 
                    resolvedat: new Date().toISOString() 
                })
            });
        }

        await logAuditEvent({ user, action: 'INCIDENT_RESOLVED_CONNECTION', entityType: 'incidents', entityId: incidentId });
        revalidatePath('/incidents');
        revalidatePath('/depara');
        return { success: true };
    }
    
    return { success: false };
}
