'use server';

import { apiFetch } from './db';
import { logAuditEvent } from './audit-actions';
import { revalidatePath } from 'next/cache';
import { _getUserById } from './user-service';

export interface ApprovalRequest {
    id: string;
    entity_id: string;
    entity_type: 'parent_items' | 'child_items';
    entityLabel: string;
    entity_typeName: string;
    requestedAt: string;
    requestedByUserdisplay_name: string;
    details: { 
        from: string;
        to: string;
        fromName?: string;
        toName?: string;
    };
    status: string;
    resolverNotes?: string;
    resolvedByUserdisplay_name?: string;
    resolvedAt?: string;
}

/**
 * Busca aprovações pendentes filtrando por prédio através dos itens relacionados.
 */
export async function getPendingApprovals(building_id: string): Promise<ApprovalRequest[]> {
    if (!building_id) return [];

    try {
        // 1. Busca TODAS as aprovações pendentes 
        const pending = await apiFetch('/approvals?status=eq.pending');
        if (!pending || pending.length === 0) return [];

        // 2. Busca os status para podermos mapear os nomes (ex: de 'draft' para 'Rascunho')
        const statusRows = await apiFetch('/item_statuses?select=id,name');
        const statusMap = new Map(statusRows.map((s: any) => [s.id, s.name]));

        // 3. Separa os IDs para buscarmos os itens no banco
        const parent_ids = pending.filter((a: any) => a.entity_type === 'parent_items').map((a: any) => a.entity_id);
        const childIds = pending.filter((a: any) => a.entity_type === 'child_items').map((a: any) => a.entity_id);

        // Armazena os itens que realmente pertencem a este prédio
        const validItems = new Map<string, any>();

        // Busca parent_items (aqui o JOIN funciona porque ParentItem tem FK com Room)
        if (parent_ids.length > 0) {
            const parents = await apiFetch(`/parent_items?id=in.(${parent_ids.join(',')})&select=id,label,type,rooms!inner(building_id)`);
            parents?.forEach((p: any) => {
                if (p.rooms?.building_id === building_id) validItems.set(p.id, p);
            });
        }

        // Busca child_items (aqui o JOIN funciona porque ChildItem tem FK com ParentItem, que tem FK com Room)
        if (childIds.length > 0) {
            const childs = await apiFetch(`/child_items?id=in.(${childIds.join(',')})&select=id,label,type,parent_items!inner(rooms!inner(building_id))`);
            childs?.forEach((c: any) => {
                if (c.parent_items?.rooms?.building_id === building_id) validItems.set(c.id, c);
            });
        }

        // 4. Filtra e mapeia apenas as aprovações que bateram com o prédio atual
        const result: ApprovalRequest[] = [];

        pending.forEach((record: any) => {
            const item = validItems.get(record.entity_id);
            if (item) {
                const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
                
                result.push({
                    id: record.id,
                    entity_id: record.entity_id,
                    entity_type: record.entity_type,
                    entityLabel: item.label || record.entity_id,
                    entity_typeName: item.type || 'N/A',
                    requestedAt: new Date(record.requestedat).toISOString(),
                    requestedByUserdisplay_name: record.requestedbyuserdisplay_name,
                    details: {
                        ...details,
                        fromName: statusMap.get(details.from) || details.from,
                        toName: statusMap.get(details.to) || details.to,
                    },
                    status: record.status
                });
            }
        });

        // Retorna ordenado pelos mais recentes
        return result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    } catch (error) {
        console.error("Erro ao buscar aprovações:", error);
        return [];
    }
}

export async function resolveApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    notes: string | null,
    adminuser_id: string,
): Promise<void> {
    const user = await _getUserById(adminuser_id);
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const approvals = await apiFetch(`/approvals?id=eq.${approvalId}`);
        const approval = approvals[0];

        if (!approval || approval.status !== 'pending') {
            throw new Error("Solicitação não encontrada ou já resolvida.");
        }

        const details = typeof approval.details === 'string' ? JSON.parse(approval.details) : approval.details;

        if (decision === 'approved') {
            const endpoint = approval.entity_type.toLowerCase();
            await apiFetch(`/${endpoint}?id=eq.${approval.entity_id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: details.to })
            });
        }

        await apiFetch(`/approvals?id=eq.${approvalId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: decision,
                resolvedbyuser_id: user.id,
                resolvedbyuserdisplay_name: user.display_name,
                resolvernotes: notes,
                resolvedat: new Date().toISOString()
            })
        });

        await logAuditEvent({
            user,
            action: `APPROVAL_${decision.toUpperCase()}`,
            entity_type: 'Approvals',
            entity_id: approvalId,
            details: { item: approval.entity_id, decision }
        });

        revalidatePath('/approvals');
        revalidatePath('/inventory');
    } catch (error: any) {
        throw new Error(error.message || "Falha ao resolver aprovação.");
    }
}

export async function getPendingApprovalsCount(building_id: string): Promise<number> {
    if (!building_id) return 0;
    try {
        const data = await getPendingApprovals(building_id);
        return data.length;
    } catch (error) {
        return 0;
    }
}

export async function getPendingApprovalForItem(entity_id: string, entity_type: string): Promise<ApprovalRequest | null> {
    try {
        const data = await apiFetch(`/approvals?entity_id=eq.${entity_id}&entity_type=eq.${entity_type}&status=eq.pending&order=requestedat.desc&limit=1`);
        if (data && data.length > 0) {
            const record = data[0];
            const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
            return {
                id: record.id,
                entity_id: record.entity_id,
                entity_type: record.entity_type,
                entityLabel: record.entitylabel,
                requestedAt: new Date(record.requestedat).toISOString(),
                details
            } as any;
        }
        return null;
    } catch (error) {
        return null;
    }
}