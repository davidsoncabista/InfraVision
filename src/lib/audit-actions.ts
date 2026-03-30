'use server';

import { apiFetch } from './db';
import type { User } from './user-service';
import type { GridItem } from '@/types/datacenter';
import type { ApprovalRequest } from './approval-actions';

/**
 * Grava um evento no log de auditoria via API REST.
 * Os campos no body seguem a nomenclatura minúscula do PostgreSQL.
 */
export async function logAuditEvent(event: { user: User; action: string; entity_type?: string; entity_id?: string; details?: any }): Promise<void> {
    try {
        await apiFetch('/auditlog', {
            method: 'POST',
            body: JSON.stringify({
                user_id: event.user.id,
                userdisplayname: event.user.displayName || event.user.email,
                action: event.action,
                entity_type: event.entity_type || null,
                entity_id: event.entity_id || null,
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
            entity_type: log.entity_type,
            entity_id: log.entity_id,
            entityLabel: log.entity_id,
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
export async function getFullItemFromLog(entity_type: string, entity_id: string): Promise<GridItem | null> {
    const endpoint = entity_type.toLowerCase() === 'parent_items' ? '/parent_items' : '/child_items';
    try {
        const data = await apiFetch(`${endpoint}?id=eq.${entity_id}`);
        if (data && data.length > 0) {
            const item = data[0];
            return {
                ...item,
                room_id: item.room_id,
                parent_id: item.parent_id,
                serial_number: item.serial_number,
                tamanho_u: item.tamanho_u,
                posicao_u: item.posicao_u
            } as GridItem;
        }
        return null;
    } catch (error) {
        console.error(`Erro ao buscar item ${entity_id} para auditoria:`, error);
        return null;
    }
}

/**
 * Busca o objeto completo de uma aprovação referenciada em um log.
 * Realiza o mapeamento manual das colunas minúsculas do PostgreSQL.
 */
export async function getFullApprovalFromLog(entity_id: string): Promise<ApprovalRequest | null> {
    try {
        const data = await apiFetch(`/approvals?id=eq.${entity_id}`);
        if (data && data.length > 0) {
            const record = data[0];
            const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
            return {
                id: record.id,
                entity_id: record.entity_id,
                entity_type: record.entity_type,
                entityLabel: record.entitylabel,
                entity_typeName: record.entity_typename,
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
        console.error(`Erro ao buscar aprovação ${entity_id} para auditoria:`, error);
        return null;
    }
}
