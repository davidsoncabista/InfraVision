
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { addIncidentType, updateIncidentType, IncidentType, getIncidentSeverities, IncidentSeverity } from "@/lib/incident-attributes-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const typeSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional().nullable(),
  defaultSeverityId: z.string().optional().nullable(),
});

type FormData = z.infer<typeof typeSchema>;

interface ManageIncidentTypeDialogProps {
  mode: 'add' | 'edit';
  type?: IncidentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageIncidentTypeDialog({ mode, type, open, onOpenChange }: ManageIncidentTypeDialogProps) {
  const [severities, setSeverities] = useState<IncidentSeverity[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: { name: "", description: "", defaultSeverityId: "" },
  });

  useEffect(() => {
    if (open) {
      getIncidentSeverities().then(setSeverities);
      if (mode === 'edit' && type) {
        form.reset({
          name: type.name,
          description: type.description || "",
          defaultSeverityId: type.defaultSeverityId || "",
        });
      } else {
        form.reset({ name: "", description: "", defaultSeverityId: "" });
      }
    }
  }, [type, mode, open, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addIncidentType(data);
        toast({ title: "Sucesso!", description: `O tipo "${data.name}" foi criado.` });
      } else if (type) {
        await updateIncidentType(type.id, data);
        toast({ title: "Sucesso!", description: `O tipo "${data.name}" foi atualizado.` });
      }
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o tipo de incidente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Tipo de Incidente' : `Editar Tipo`}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Crie uma nova categoria para os incidentes." : `Editando o tipo: ${type?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Integridade de Dados" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descreva este tipo de incidente" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="defaultSeverityId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Severidade Padrão (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {severities.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Adicionar' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
