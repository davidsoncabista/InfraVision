
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { ApprovalRequest } from "@/lib/approval-actions";
import { User, ShieldQuestion, Clock, FileText } from 'lucide-react';

interface ApprovalDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  approval: ApprovalRequest | null;
}

export function ApprovalDetailsDialog({ isOpen, onOpenChange, approval }: ApprovalDetailsDialogProps) {
  if (!approval) return null;

  const decisionText = approval.status === 'approved' ? 'Aprovada' : 'Rejeitada';
  const decisionColor = approval.status === 'approved' ? 'text-green-500' : 'text-orange-500';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detalhes da Solicitação</AlertDialogTitle>
          <AlertDialogDescription>
            Revisão da solicitação de mudança de status para o item <span className="font-bold">{approval.entityLabel}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-4 py-4">
            <div className="flex justify-between items-center p-2 rounded-md bg-muted">
                <span>De: <Badge variant="outline">{approval.details.fromName}</Badge></span>
                <span>→</span>
                <span>Para: <Badge variant="secondary">{approval.details.toName}</Badge></span>
            </div>
            <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span><span className="font-semibold">Solicitado por:</span> {approval.requestedByUserDisplayName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                     <span><span className="font-semibold">Em:</span> {new Date(approval.requestedAt).toLocaleString()}</span>
                </div>
            </div>
            <div className="space-y-2 border-t pt-4">
                 <div className="flex items-center gap-2">
                    <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
                    <span className={decisionColor}><span className="font-semibold">Decisão:</span> {decisionText}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span><span className="font-semibold">Resolvido por:</span> {approval.resolvedByUserDisplayName || 'N/A'}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                     <span><span className="font-semibold">Em:</span> {approval.resolvedAt ? new Date(approval.resolvedAt).toLocaleString() : 'N/A'}</span>
                </div>
                {approval.resolverNotes && (
                     <div className="flex items-start gap-2 pt-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                         <p><span className="font-semibold">Nota do aprovador:</span> <span className="italic text-muted-foreground">"{approval.resolverNotes}"</span></p>
                    </div>
                )}
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Fechar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
