
"use client";

import * as React from 'react';
import { getPendingApprovals, ApprovalRequest } from '@/lib/approval-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalItemCard } from '@/components/approvals/approval-item-card';
import { useBuilding } from '@/components/building-provider';
import { Loader2, ShieldQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApprovalsPage() {
  const { activebuildingid } = useBuilding();
  const router = useRouter();
  const [pendingApprovals, setPendingApprovals] = React.useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activebuildingid) {
      setIsLoading(false);
      setPendingApprovals([]);
      return;
    }

    setIsLoading(true);
    getPendingApprovals(activebuildingid)
      .then(setPendingApprovals)
      .finally(() => setIsLoading(false));
  }, [activebuildingid]);

  const handleSuccess = () => {
    // Re-fetch data after an approval is resolved
    if (activebuildingid) {
      setIsLoading(true);
      getPendingApprovals(activebuildingid)
        .then(setPendingApprovals)
        .finally(() => setIsLoading(false));
    }
     // also refresh other pages that might be affected
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Aprovações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            Itens que requerem sua aprovação para se tornarem ativos ou mudarem de estado crítico no prédio selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : pendingApprovals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApprovals.map(request => (
                <ApprovalItemCard key={request.id} request={request} onSuccess={handleSuccess} />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center">
              <ShieldQuestion className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-semibold text-muted-foreground">Nenhuma solicitação pendente neste prédio.</p>
              <p className="mt-1 text-sm text-muted-foreground/80">
                Quando uma alteração que exige aprovação for submetida, ela aparecerá aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
