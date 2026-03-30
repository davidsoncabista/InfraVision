'use server';

import { apiFetch } from './db';
import { _getUserById } from './user-service';
import { logAuditEvent } from './audit-actions';
import { revalidatePath } from 'next/cache';

export interface Evidence {
    id: string;
    entityId: string;
    entityType: string;
    user_id: string;
    userDisplayName: string;
    timestamp: string;
    type: string;
    data: any;
}

export async function getEvidenceForEntity(entityId: string, entityType: string): Promise<Evidence[]> {
    if (!entityId || !entityType) return [];
    try {
        // PostgREST: Resource Embedding com nomes em minúsculo
        const data = await apiFetch(`/evidence?entityid=eq.${entityId}&entitytype=eq.${entityType}&select=*,users:user_id(displayname)&order=timestamp.asc`);
        
        return data.map((record: any) => ({
            id: record.id,
            entityId: record.entityid,
            entityType: record.entitytype,
            user_id: record.user_id,
            userDisplayName: record.users?.displayname || record.user_id,
            timestamp: new Date(record.timestamp).toISOString(),
            type: record.type,
            data: typeof record.data === 'string' ? JSON.parse(record.data) : record.data,
        }));
    } catch (error) {
        console.error("Erro ao buscar evidências:", error);
        return [];
    }
}

export async function addEvidence(data: any) {
    const user = await _getUserById(data.user_id);
    if (!user) throw new Error("Usuário não autenticado.");

    const newId = `evid_${Date.now()}`;

    try {
        await apiFetch('/evidence', {
            method: 'POST',
            body: JSON.stringify({
                id: newId,
                entityid: data.entityId,
                entitytype: data.entityType,
                user_id: data.user_id,
                timestamp: new Date().toISOString(),
                type: data.type,
                data: data.data
            })
        });

        await logAuditEvent({ user, action: 'EVIDENCE_ADDED', entityType: data.entityType, entityId: data.entityId });
        revalidatePath('/incidents');
        revalidatePath('/evidence');
    } catch (error: any) {
        throw new Error("Falha ao salvar evidência: " + error.message);
    }
}

export async function deleteEvidence(evidenceId: string, user_id: string) {
    const user = await _getUserById(user_id);
    if (!user) throw new Error("Usuário não autenticado.");
    
    try {
        await apiFetch(`/evidence?id=eq.${evidenceId}`, { method: 'DELETE' });
        await logAuditEvent({ user, action: 'EVIDENCE_DELETED', entityType: 'evidence', entityId: evidenceId });
        revalidatePath('/incidents');
        revalidatePath('/evidence');
    } catch (error: any) {
        throw new Error("Falha ao excluir evidência: " + error.message);
    }
}
