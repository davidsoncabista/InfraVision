
"use client";

import * as React from 'react';
import type { ApprovalRequest } from '@/lib/approval-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, X, Clock, User, HardDrive, Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResolveApprovalDialog } from '@/components/approvals/resolve-approval-dialog';

export function ApprovalItemCard({ request, onSuccess }: { request: ApprovalRequest, onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {request.entityType === 'parent_items' ? <Puzzle className="h-5 w-5"/> : <HardDrive className="h-5 w-5" />}
            {request.entityLabel}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Solicitação para alterar o status do item de 
            <Badge variant="outline" className="mx-1.5">{request.details.fromName}</Badge> para <Badge variant="secondary" className="mx-1.5">{request.details.toName}</Badge>.
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Solicitado por: <strong>{request.requestedByUserDisplayName}</strong></span>
          </div>
           <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>Em: {new Date(request.requestedAt).toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}><X className="mr-2 h-4 w-4"/> Rejeitar</Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}><Check className="mr-2 h-4 w-4"/> Aprovar</Button>
        </CardFooter>
      </Card>
      {isDialogOpen && (
        <ResolveApprovalDialog
          request={request}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={onSuccess}
        />
      )}
    </>
  )
}
