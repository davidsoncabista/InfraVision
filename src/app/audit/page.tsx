
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getAuditLogs, getFullItemFromLog, getFullApprovalFromLog } from '@/lib/audit-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EyeOff, FileDiff, User, HardDrive, Link2, CheckSquare, ShieldQuestion, Move, FilePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGridLabel } from '@/lib/geometry';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import type { GridItem } from '@/types/datacenter';
import { ItemDetailDialog } from '@/components/item-detail-dialog';
import { ApprovalDetailsDialog } from '@/components/approvals/approval-details-dialog'; // Será criado
import type { ApprovalRequest } from '@/lib/approval-actions';
import { useRouter } from 'next/navigation';

interface AuditLog {
    id: number;
    timestamp: string;
    userdisplay_name: string;
    action: string;
    entity_type: string;
    entity_id: string;
    entityLabel: string;
    details: any;
}

const actionDisplayMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    ITEM_CREATED: { label: 'Item Criado', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: FilePlus },
    ITEM_UPDATED: { label: 'Item Atualizado', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: FileDiff },
    ITEM_MOVED: { label: 'Item Movido', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Move },
    ITEM_DELETED: { label: 'Item Excluído', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: HardDrive },
    USER_CREATED: { label: 'Usuário Criado', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: User },
    USER_UPDATED: { label: 'Usuário Atualizado', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: User },
    USER_DELETED: { label: 'Usuário Excluído', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: User },
    CONNECTION_CREATED: { label: 'Conexão Criada', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Link2 },
    CONNECTION_DELETED: { label: 'Conexão Removida', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Link2 },
    APPROVAL_APPROVED: { label: 'Aprovação Aceita', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', icon: CheckSquare },
    APPROVAL_REJECTED: { label: 'Aprovação Rejeitada', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: CheckSquare },
    INCIDENT_STATUS_UPDATED: { label: 'Status de Incidente Atualizado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileDiff },
    INCIDENT_RESOLVED_CONNECTION: { label: 'Incidente de Conexão Resolvido', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: FileDiff },
    DEFAULT: { label: 'Ação do Sistema', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: ShieldQuestion },
};

const LogRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
    </TableRow>
)

const renderDetails = (log: AuditLog, statusesMap: Map<string, ItemStatus>) => {
    if (!log.details) return <span className="text-xs italic text-muted-foreground">N/A</span>;
    
    // Tratamento para Criação de Item
    if (log.action === 'ITEM_CREATED' && log.details.status) {
        const statusName = statusesMap.get(log.details.status)?.name || log.details.status;
        return <div className="text-sm">Item criado com o status inicial <Badge variant="secondary">{statusName}</Badge>.</div>
    }
    
    // Tratamento para Aprovações
    if ((log.action === 'APPROVAL_APPROVED' || log.action === 'APPROVAL_REJECTED') && log.details.approvalDetails) {
        const { approvalDetails, notes } = log.details;
        const decisionText = log.action === 'APPROVAL_APPROVED' ? 'aprovada' : 'rejeitada';
        return (
            <div className="text-sm space-y-1">
                <div>A solicitação para alterar status de <Badge variant="outline">{approvalDetails.fromName}</Badge> para <Badge variant="secondary">{approvalDetails.toName}</Badge> foi {decisionText}.</div>
                {notes && <p className="text-xs text-muted-foreground">Nota: "{notes}"</p>}
            </div>
        )
    }
    
    // Tratamento para Movimentação
    if (log.action === 'ITEM_UPDATED' && (log.details.x || log.details.y)) {
        const fromX = log.details.x?.old;
        const fromY = log.details.y?.old;
        const toX = log.details.x?.new;
        const toY = log.details.y?.new;
        
        if (fromX !== undefined && fromY !== undefined && toX !== undefined && toY !== undefined) {
            const from = getGridLabel(fromX, fromY, 'alpha', 'numeric');
            const to = getGridLabel(toX, toY, 'alpha', 'numeric');
            return <div className="text-sm">Item movido da posição <strong>{from}</strong> para <strong>{to}</strong>.</div>
        }
    }


    // Tratamento para Mudança de Status
    if (log.details.status) {
        const fromStatus = statusesMap.get(log.details.status.old)?.name || log.details.status.old;
        const toStatus = statusesMap.get(log.details.status.new)?.name || log.details.status.new;
        if (fromStatus && toStatus) {
            return <div className="text-sm">Status alterado de <Badge variant="outline">{fromStatus}</Badge> para <Badge variant="secondary">{toStatus}</Badge>.</div>
        }
    }
    
    // Tratamento para atualização de usuário
    if (log.action === 'USER_UPDATED' && log.details.data) {
        const { role, ...otherData } = log.details.data;
        return (
            <div className="space-y-1 text-sm">
                {role && <p><span className="font-medium">Cargo alterado para:</span> {role}</p>}
                {Object.entries(otherData).map(([key, value]) => (
                     <div key={key}>
                        <span className="capitalize font-medium">{key}:</span> {String(value)}
                    </div>
                ))}
            </div>
        )
    }

    // Formatação para outras mudanças com 'old' e 'new'
    const isChangeLog = Object.values(log.details).every(val => typeof val === 'object' && val !== null && 'old' in val && 'new' in val);
    if (isChangeLog) {
        return (
             <div className="space-y-1">
                {Object.entries(log.details).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-xs font-mono">
                        <span className="font-semibold text-foreground/80">{key}:</span>
                        <span className="text-red-500/80 ml-2">"{String(value.old)}"</span>
                        <span className="text-foreground/80 mx-1">→</span>
                        <span className="text-green-500/80">"{String(value.new)}"</span>
                    </div>
                ))}
            </div>
        )
    }

    // Formatação padrão para outros objetos JSON
    return <pre className="mt-2 p-2 bg-muted/50 rounded-md whitespace-pre-wrap font-mono text-xs">{JSON.stringify(log.details, null, 2)}</pre>
}

export default function AuditPage() {
    const [auditLogEnabled] = useLocalStorage('dev_auditLogEnabled', false);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusesMap, setStatusesMap] = useState<Map<string, ItemStatus>>(new Map());
    const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
    const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
    const router = useRouter();

    const fetchLogs = React.useCallback(() => {
        if (auditLogEnabled) {
            setIsLoading(true);
            Promise.all([
                getAuditLogs(),
                getItemStatuses()
            ]).then(([logData, statusData]) => {
                setLogs(logData);
                setStatusesMap(new Map(statusData.map(s => [s.id, s])));
            }).catch(() => {
                // Tratar erros aqui se necessário
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
            setLogs([]);
        }
    }, [auditLogEnabled]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleRowClick = async (log: AuditLog) => {
        if (log.entity_type === 'parent_items' || log.entity_type === 'child_items') {
            const item = await getFullItemFromLog(log.entity_type, log.entity_id);
            setSelectedItem(item);
        } else if (log.entity_type === 'Approvals') {
            const approval = await getFullApprovalFromLog(log.entity_id);
            setSelectedApproval(approval);
        } else if (log.entity_type === 'User') {
            router.push(`/users#${log.entity_id}`); // Exemplo, pode ser um modal no futuro
        }
    };

    if (!auditLogEnabled) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold font-headline">Auditoria</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Log de Auditoria</CardTitle>
                        <CardDescription>
                            Acompanhe todas as ações importantes realizadas no sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center">
                            <EyeOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-semibold">O Log de Auditoria está desativado.</p>
                            <p className="text-sm text-muted-foreground/80">
                                Ative-o no menu de desenvolvedor para começar a registrar e visualizar as ações.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
  
    return (
    <>
        <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Auditoria</h1>
        <Card>
            <CardHeader>
            <CardTitle>Log de Auditoria</CardTitle>
            <CardDescription>
                Acompanhe todas as ações importantes realizadas no sistema. Clique em uma linha para ver detalhes.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quando</TableHead>
                            <TableHead>Quem</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Detalhes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <>
                                <LogRowSkeleton />
                                <LogRowSkeleton />
                                <LogRowSkeleton />
                            </>
                        ) : logs.length > 0 ? (
                            logs.map(log => {
                                const isMoveAction = log.action === 'ITEM_UPDATED' && log.details && (log.details.x || log.details.y);
                                const actionKey = isMoveAction ? 'ITEM_MOVED' : log.action;
                                const displayInfo = actionDisplayMap[actionKey] || actionDisplayMap.DEFAULT;
                                const Icon = displayInfo.icon;
                                return (
                                <TableRow key={log.id} onClick={() => handleRowClick(log)} className="cursor-pointer">
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger>{new Date(log.timestamp).toLocaleDateString()}</TooltipTrigger>
                                            <TooltipContent>{new Date(log.timestamp).toLocaleString()}</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{log.userdisplay_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("whitespace-nowrap", displayInfo.color)}>
                                            <Icon className="mr-2 h-3.5 w-3.5" />
                                            {displayInfo.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm mb-1">{log.entityLabel || log.entity_id}</div>
                                        <div className="text-muted-foreground">{renderDetails(log, statusesMap)}</div>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum registro de auditoria encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </TooltipProvider>
            </CardContent>
        </Card>
        </div>
        {selectedItem && (
            <ItemDetailDialog 
                item={selectedItem}
                open={!!selectedItem}
                onOpenChange={() => setSelectedItem(null)}
                onItemUpdate={() => { setSelectedItem(null); fetchLogs(); }}
                onItemDelete={() => { setSelectedItem(null); fetchLogs(); }}
                fullItemContext={{ allItems: [] }} // Pode ser melhorado para buscar o contexto real
            />
        )}
        {selectedApproval && (
            <ApprovalDetailsDialog
                approval={selectedApproval}
                isOpen={!!selectedApproval}
                onOpenChange={() => setSelectedApproval(null)}
            />
        )}
    </>
  );
}
