
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { GridItem } from '@/types/datacenter';
import { getManufacturers, Manufacturer } from '@/lib/manufacturer-actions';
import { getModelsByManufacturerId, Model } from '@/lib/models-actions';
import { getItemTypes, ItemType } from '@/lib/item-types-actions';
import { updateItemDetails } from '@/lib/item-detail-actions';
import { usePermissions } from '../permissions-provider';

const formSchema = z.object({
  parentId: z.string({ required_error: "Você deve selecionar um item pai." }),
  type: z.string({ required_error: "Você deve selecionar um tipo." }),
  manufacturerId: z.string({ required_error: "Você deve selecionar um fabricante." }),
  modelId: z.string({ required_error: "Você deve selecionar um modelo." }),
  label: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  posicaoU: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddChildItemDialogProps {
  allItems: GridItem[];
  itemTypes: ItemType[];
  manufacturers: Manufacturer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChildItemDialog({ 
  allItems, 
  itemTypes,
  manufacturers,
  open, 
  onOpenChange 
}: AddChildItemDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = usePermissions();
  
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: undefined,
      type: undefined,
      manufacturerId: undefined,
      modelId: undefined,
      label: "",
      posicaoU: undefined,
    }
  });

  const parentCandidates = allItems.filter(item => item.tamanhoU && item.tamanhoU > 0);
  const selectedManufacturerId = form.watch('manufacturerId');
  
  useEffect(() => {
    if (open) {
      form.reset();
      setModels([]);
    }
  }, [open, form]);
  
  useEffect(() => {
      if (selectedManufacturerId) {
          setIsLoadingModels(true);
          setModels([]); 
          form.setValue('modelId', ''); 
          getModelsByManufacturerId(selectedManufacturerId)
              .then(setModels)
              .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os modelos." }))
              .finally(() => setIsLoadingModels(false));
      } else {
          setModels([]);
      }
  // A dependência `form` é omitida para evitar um loop, pois `setValue` a modifica.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerId]);


  const onSubmit = async (data: FormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    try {
        const selectedModel = models.find(m => m.id === data.modelId);
        if (!selectedModel) {
            throw new Error("Modelo selecionado não é válido.");
        }

        await updateItemDetails({
            id: `citem_${Date.now()}`,
            label: data.label,
            type: data.type,
            modelo: selectedModel.name,
            brand: manufacturers.find(m => m.id === data.manufacturerId)?.name,
            parentId: data.parentId,
            status: 'draft',
            posicaoU: data.posicaoU || undefined,
            tamanhoU: selectedModel.tamanhoU,
        }, user.id);

      toast({
        title: "Sucesso!",
        description: `O equipamento "${data.label}" foi adicionado.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível adicionar o equipamento.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento Aninhado</DialogTitle>
          <DialogDescription>
            Siga os passos para adicionar um novo servidor, switch, etc., dentro de um item existente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>1. Aninhar Dentro de (Pai)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o rack..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {parentCandidates.map((item) => (
                                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Tipo de Equipamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturerId"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>3. Fabricante</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                              <SelectContent>
                                  {manufacturers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelId"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>4. Modelo</FormLabel>
                          <Select 
                              onValueChange={field.onChange} 
                              value={field.value} 
                              disabled={!selectedManufacturerId}
                          >
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder={
                                          !selectedManufacturerId ? "Primeiro selecione um fabricante" : 
                                          isLoadingModels ? "Carregando..." : 
                                          "Selecione o modelo..."
                                      } />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {!isLoadingModels && models.length === 0 ? (
                                    <FormItem className="p-4 text-sm text-muted-foreground text-center">Nenhum modelo cadastrado.</FormItem>
                                  ) : (
                                    models.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)
                                  )}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>5. Nome (Hostname)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: SRV-WEB-01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="posicaoU"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Posição U (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 21" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar Equipamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

