
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { addIncidentSeverity, updateIncidentSeverity, IncidentSeverity } from "@/lib/incident-attributes-actions";
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
import { cn } from "@/lib/utils";

const colors = ["gray", "red", "orange", "yellow", "blue"] as const;

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional().nullable(),
  color: z.enum(colors),
  rank: z.coerce.number().int().positive("O ranking deve ser um número positivo."),
});

type FormData = z.infer<typeof formSchema>;

interface ManageIncidentSeverityDialogProps {
  mode: 'add' | 'edit';
  severity?: IncidentSeverity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorVariants: Record<(typeof colors)[number], string> = {
  red: "bg-red-500", orange: "bg-orange-500", yellow: "bg-yellow-500",
  blue: "bg-blue-500", gray: "bg-gray-500",
};

export function ManageIncidentSeverityDialog({ mode, severity, open, onOpenChange }: ManageIncidentSeverityDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", color: "gray", rank: 99 },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && severity) {
        form.reset({
          name: severity.name,
          description: severity.description || "",
          color: severity.color as (typeof colors)[number],
          rank: severity.rank,
        });
      } else {
        form.reset({ name: "", description: "", color: "gray", rank: 99 });
      }
    }
  }, [severity, mode, open, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addIncidentSeverity(data);
        toast({ title: "Sucesso!", description: `A severidade "${data.name}" foi criada.` });
      } else if (severity) {
        await updateIncidentSeverity(severity.id, data);
        toast({ title: "Sucesso!", description: `A severidade "${data.name}" foi atualizada.` });
      }
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar a severidade.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Nova Severidade' : `Editar Severidade`}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Crie um novo nível de criticidade para os incidentes." : `Editando a severidade: ${severity?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Crítica, Alta" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="rank" render={({ field }) => (
                    <FormItem><FormLabel>Ranking</FormLabel><FormControl><Input type="number" placeholder="Ex: 1 (Mais alto)" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descreva o impacto desta severidade" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>{colors.map(color => (<SelectItem key={color} value={color}><div className="flex items-center gap-2"><div className={cn("h-4 w-4 rounded-full", colorVariants[color])} /><span>{color}</span></div></SelectItem>))}</SelectContent>
                    </Select><FormMessage />
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
