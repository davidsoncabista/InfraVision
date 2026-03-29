'use server';

import { apiFetch } from './db';
import type { User } from './user-service';
import type { GridItem } from '@/types/datacenter';
import type { ApprovalRequest } from './approval-actions';

/**
 * Grava um evento no log de auditoria via API REST.
 * Os campos no body seguem a nomenclatura minúscula do PostgreSQL.
 */
export async function logAuditEvent(event: { user: User; action: string; entityType?: string; entityId?: string; details?: any }): Promise<void> {
    try {
        await apiFetch('/auditlog', {
            method: 'POST',
            body: JSON.stringify({
                userid: event.user.id,
                userdisplayname: event.user.displayName || event.user.email,
                action: event.action,
                entitytype: event.entityType || null,
                entityid: event.entityId || null,
                details: event.details ? JSON.stringify(event.details) : null,
                timestamp: new Date().toISOString()
            })
        });
    } catch (err) {
        console.error('Falha ao gravar auditoria:', err);
    }
}

/**
 * Busca todos os logs de auditoria ordenados por data decrescente.
 */
export async function getAuditLogs(): Promise<any[]> {
    try {
        const data = await apiFetch('/auditlog?order=timestamp.desc');
        return (data || []).map((log: any) => ({
            id: log.id,
            timestamp: new Date(log.timestamp).toISOString(),
            userDisplayName: log.userdisplayname,
            action: log.action,
            entityType: log.entitytype,
            entityId: log.entityid,
            entityLabel: log.entityid,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {}),
        }));
    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return [];
    }
}

/**
 * Busca o objeto completo de um item (Parent ou Child) referenciado em um log.
 * Converte as chaves minúsculas do DB para a interface GridItem.
 */
export async function getFullItemFromLog(entityType: string, entityId: string): Promise<GridItem | null> {
    const endpoint = entityType.toLowerCase() === 'parentitems' ? '/parentitems' : '/childitems';
    try {
        const data = await apiFetch(`${endpoint}?id=eq.${entityId}`);
        if (data && data.length > 0) {
            const item = data[0];
            return {
                ...item,
                roomId: item.roomid,
                parentId: item.parentid,
                serialNumber: item.serialnumber,
                tamanhoU: item.tamanhou,
                posicaoU: item.posicaou
            } as GridItem;
        }
        return null;
    } catch (error) {
        console.error(`Erro ao buscar item ${entityId} para auditoria:`, error);
        return null;
    }
}

/**
 * Busca o objeto completo de uma aprovação referenciada em um log.
 * Realiza o mapeamento manual das colunas minúsculas do PostgreSQL.
 */
export async function getFullApprovalFromLog(entityId: string): Promise<ApprovalRequest | null> {
    try {
        const data = await apiFetch(`/approvals?id=eq.${entityId}`);
        if (data && data.length > 0) {
            const record = data[0];
            const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
            return {
                id: record.id,
                entityId: record.entityid,
                entityType: record.entitytype,
                entityLabel: record.entitylabel,
                entityTypeName: record.entitytypename,
                requestedAt: new Date(record.requestedat).toISOString(),
                requestedByUserDisplayName: record.requestedbyuserdisplayname,
                details: details,
                status: record.status,
                resolverNotes: record.resolvernotes,
                resolvedByUserDisplayName: record.resolvedbyuserdisplayname,
                resolvedAt: record.resolvedat ? new Date(record.resolvedat).toISOString() : undefined
            } as ApprovalRequest;
        }
        return null;
    } catch (error) {
        console.error(`Erro ao buscar aprovação ${entityId} para auditoria:`, error);
        return null;
    }
}
