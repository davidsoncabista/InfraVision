
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from 'lucide-react';
import { usePermissions } from '@/components/permissions-provider';
import { useToast } from '@/hooks/use-toast';
import type { GridItem } from '@/types/datacenter';
import type { ItemStatus } from '@/lib/status-actions';
import { updateItemDetails } from '@/lib/item-detail-actions'; 
import { DeleteItemConfirmationDialog } from '@/components/delete-item-confirmation-dialog';

interface ChildItemDetailDialogProps {
  item: GridItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdate: () => void;
  onItemDelete: () => void;
  allItems: GridItem[];
  statuses: ItemStatus[];
}

export function ChildItemDetailDialog({ 
  item, 
  open, 
  onOpenChange, 
  onItemUpdate, 
  onItemDelete,
  allItems,
  statuses
}: ChildItemDetailDialogProps) {
  const { toast } = useToast();
  const { user, hasPermission } = usePermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<GridItem>>({});

  const parentCandidates = allItems.filter(i => !i.parentId && i.tamanhoU && i.tamanhoU > 0);

  useEffect(() => {
    if (item) {
      setEditFormData(item);
    }
  }, [item]);

  const handleFormChange = (key: keyof GridItem, value: any) => {
     setEditFormData(prev => ({...prev, [key]: value}))
  }

  const handleNumericFormChange = (key: keyof GridItem, value: string) => {
    if (value === '') {
        handleFormChange(key, null);
    } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            handleFormChange(key, numValue);
        }
    }
  };

  const handleSave = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    setIsSaving(true);
    try {
      await updateItemDetails({ id: item.id, ...editFormData }, user.id);
      onOpenChange(false);
      onItemUpdate();
      toast({ title: "Sucesso!", description: `As alterações em ${editFormData.label} foram processadas.` });
    } catch (error: any) {
      toast({ title: 'Ação Registrada', description: error.message });
      onOpenChange(false);
      onItemUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  const canDeleteItem = (
    (item.status === 'draft' && hasPermission('item:delete:draft')) ||
    (item.status !== 'draft' && hasPermission('item:decommission:active'))
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Equipamento: {item.label}</DialogTitle>
            <DialogDescription>
              Altere os detalhes do equipamento aninhado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">Nome</Label>
                <Input id="label" value={editFormData.label || ''} onChange={(e) => handleFormChange('label', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">Item Pai (Rack)</Label>
                <Select
                    value={editFormData.parentId || ''}
                    onValueChange={(value) => handleFormChange('parentId', value)}
                >
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {parentCandidates.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select
                    value={editFormData.status || ''}
                    onValueChange={(value) => handleFormChange('status', value)}
                >
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="posicaoU" className="text-right">Posição (U)</Label>
                <Input id="posicaoU" type="number" value={editFormData.posicaoU ?? ''} onChange={(e) => handleNumericFormChange('posicaoU', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serialNumber" className="text-right">Nº de Série</Label>
                <Input id="serialNumber" value={editFormData.serialNumber || ''} onChange={(e) => handleFormChange('serialNumber', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelo" className="text-right">Modelo</Label>
                <Input id="modelo" value={editFormData.modelo || ''} onChange={(e) => handleFormChange('modelo', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">Fabricante</Label>
                <Input id="brand" value={editFormData.brand || ''} onChange={(e) => handleFormChange('brand', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea id="description" value={editFormData.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className='justify-between'>
            <div>
              {canDeleteItem && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isSaving}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {item.status === 'draft' ? 'Excluir' : 'Descomissionar'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {item && (
        <DeleteItemConfirmationDialog
          item={item}
          open={isDeleteDialogOpen}
          onConfirm={onItemDelete}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
}
