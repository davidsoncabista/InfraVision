"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2, Link, Unlink, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPortsByChildItemId, disconnectConnection, EquipmentPort, EquipmentSummary, deletePortFromEquipment } from '@/lib/connection-actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '../permissions-provider';
import { AddPortDialog } from './add-port-dialog';

interface EquipmentPortsDialogProps {
  equipment: EquipmentSummary;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const statusStyles: Record<EquipmentPort['status'], string> = {
  up: "text-green-500",
  down: "text-red-500",
  disabled: "text-gray-500",
};

const statusDotStyles: Record<EquipmentPort['status'], string> = {
  up: "bg-green-500",
  down: "bg-red-500",
  disabled: "bg-gray-500",
};

export function EquipmentPortsDialog({ equipment, isOpen, onOpenChange }: EquipmentPortsDialogProps) {
  const [ports, setPorts] = React.useState<EquipmentPort[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [portToDisconnect, setPortToDisconnect] = React.useState<EquipmentPort | null>(null);
  const [portToDelete, setPortToDelete] = React.useState<EquipmentPort | null>(null);
  const [isAddPortDialogOpen, setIsAddPortDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = usePermissions();

  const fetchPorts = React.useCallback(() => {
    setIsLoading(true);
    getPortsByChildItemId(equipment.id)
      .then(setPorts)
      .catch(() => toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível buscar as portas.' }))
      .finally(() => setIsLoading(false));
  }, [equipment.id, toast]);

  React.useEffect(() => {
    if (isOpen) {
      fetchPorts();
    }
  }, [isOpen, fetchPorts]);

  const handleDisconnect = async () => {
    if (!portToDisconnect || !portToDisconnect.connectionId || !user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Dados insuficientes para desconectar.' });
      return;
    }
    setIsProcessing(portToDisconnect.id);
    try {
      await disconnectConnection(portToDisconnect.connectionId, user.id);
      toast({ title: 'Sucesso!', description: 'A conexão foi desfeita.' });
      setPortToDisconnect(null);
      fetchPorts(); // Re-fetch para atualizar a lista
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };
  
  const handleDeletePort = async () => {
    if (!portToDelete || !user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Dados insuficientes para excluir a porta.' });
      return;
    }
    setIsProcessing(portToDelete.id);
    try {
      await deletePortFromEquipment(portToDelete.id, user.id);
      toast({ title: 'Sucesso!', description: `A porta ${portToDelete.label} foi excluída.` });
      setPortToDelete(null);
      fetchPorts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao Excluir', description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Portas do Equipamento: {equipment.label}</DialogTitle>
                <DialogDescription>
                  Visualize o status de todas as portas e suas conexões.
                </DialogDescription>
              </div>
              <Button onClick={() => setIsAddPortDialogOpen(true)}><Plus className="mr-2 h-4 w-4"/> Adicionar Porta</Button>
            </div>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="border rounded-md">
                  <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>Porta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conectado Em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {isLoading ? (
                           <TableRow>
                              <TableCell colSpan={5} className="h-48 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/>
                              </TableCell>
                          </TableRow>
                      ) : ports.length > 0 ? (
                          ports.map(port => (
                          <TableRow key={port.id}>
                              <TableCell className="font-medium">{port.label}</TableCell>
                              <TableCell><Badge variant="outline">{port.portTypeName}</Badge></TableCell>
                              <TableCell>
                                  <div className="flex items-center gap-2">
                                      <span className={cn("h-2 w-2 rounded-full", statusDotStyles[port.status])} />
                                      <span className={cn("capitalize font-medium", statusStyles[port.status])}>{port.status}</span>
                                  </div>
                              </TableCell>
                              <TableCell>
                                  {port.connectedToEquipmentLabel && port.connectedToPortLabel ? (
                                      <div className="text-sm">
                                          <span className="font-semibold">{port.connectedToEquipmentLabel}</span>
                                          <span className="text-muted-foreground"> / {port.connectedToPortLabel}</span>
                                      </div>
                                  ) : (
                                      <span className="text-xs text-muted-foreground italic">Não conectado</span>
                                  )}
                              </TableCell>
                               <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" disabled={!port.connectionId || !!isProcessing} onClick={() => setPortToDisconnect(port)}>
                                      {isProcessing === port.id && port.connectionId ? <Loader2 className="h-4 w-4 animate-spin"/> : <Unlink className="h-4 w-4" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" disabled={port.status === 'up' || !!isProcessing} onClick={() => setPortToDelete(port)}>
                                      {isProcessing === port.id && port.status !== 'up' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                              </TableCell>
                          </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                              Nenhuma porta encontrada para este equipamento.
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
                  </Table>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <AddPortDialog 
        childItemId={equipment.id}
        isOpen={isAddPortDialogOpen}
        onOpenChange={setIsAddPortDialogOpen}
        onSuccess={fetchPorts}
      />

      <AlertDialog open={!!portToDisconnect} onOpenChange={() => setPortToDisconnect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desconexão?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja desconectar a porta <span className="font-bold">{portToDisconnect?.label}</span>? Esta ação irá remover a conexão e liberar a porta. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Unlink className="mr-2 h-4 w-4"/>
                Sim, Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={!!portToDelete} onOpenChange={() => setPortToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir permanentemente a porta <span className="font-bold">{portToDelete?.label}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePort} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Trash2 className="mr-2 h-4 w-4"/>
                Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
