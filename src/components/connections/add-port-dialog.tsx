
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getPortTypes, PortType } from '@/lib/port-types-actions';
import { addPortToEquipment } from '@/lib/connection-actions';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  portTypeId: z.string({ required_error: "Selecione um tipo de porta." }),
  label: z.string().min(1, "O nome da porta é obrigatório."),
});

type FormData = z.infer<typeof formSchema>;

interface AddPortDialogProps {
  childItemId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function AddPortDialog({ childItemId, isOpen, onOpenChange, onSuccess }: AddPortDialogProps) {
  const { toast } = useToast();
  const [portTypes, setPortTypes] = React.useState<PortType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = React.useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { portTypeId: undefined, label: "" },
  });

  React.useEffect(() => {
    if (isOpen) {
      setIsLoadingTypes(true);
      form.reset();
      getPortTypes()
        .then(setPortTypes)
        .catch(() => toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os tipos de porta.' }))
        .finally(() => setIsLoadingTypes(false));
    }
  }, [isOpen, toast, form]);

  const onSubmit = async (data: FormData) => {
    try {
      await addPortToEquipment({
        childItemId,
        portTypeId: data.portTypeId,
        label: data.label,
      });
      toast({ title: 'Sucesso!', description: 'A nova porta foi adicionada ao equipamento.' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Porta</DialogTitle>
          <DialogDescription>
            Selecione o tipo e defina um nome para a nova porta deste equipamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="portTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Porta</FormLabel>
                  {isLoadingTypes ? <Skeleton className="h-10 w-full" /> : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {portTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Porta (Label)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: GE-0/0/1, Eth1, Porta Auxiliar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar Porta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
