
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";

import { addIncidentStatus, updateIncidentStatus, IncidentStatus } from "@/lib/incident-attributes-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const colors = ["gray", "red", "orange", "yellow", "blue", "green"] as const;
const icons = ["Info", "AlertTriangle", "Clock", "CheckCircle"] as const;

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional().nullable(),
  color: z.enum(colors),
  icon_name: z.enum(icons).optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface ManageIncidentStatusDialogProps {
  mode: 'add' | 'edit';
  status?: IncidentStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorVariants: Record<(typeof colors)[number], string> = {
  red: "bg-red-500", orange: "bg-orange-500", yellow: "bg-yellow-500",
  blue: "bg-blue-500", green: "bg-green-500", gray: "bg-gray-500",
};

const iconMap: Record<(typeof icons)[number], React.ElementType> = {
  AlertTriangle, Clock, CheckCircle, Info,
};

export function ManageIncidentStatusDialog({ mode, status, open, onOpenChange }: ManageIncidentStatusDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", color: "gray", icon_name: "Info" },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && status) {
        form.reset({
          name: status.name,
          description: status.description || "",
          color: status.color as (typeof colors)[number],
          icon_name: status.icon_name as (typeof icons)[number] || "Info",
        });
      } else {
        form.reset({ name: "", description: "", color: "gray", icon_name: "Info" });
      }
    }
  }, [status, mode, open, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addIncidentStatus(data);
        toast({ title: "Sucesso!", description: `O status "${data.name}" foi criado.` });
      } else if (status) {
        await updateIncidentStatus(status.id, data);
        toast({ title: "Sucesso!", description: `O status "${data.name}" foi atualizado.` });
      }
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o status.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Status de Incidente' : `Editar Status`}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Crie um novo status para o ciclo de vida dos incidentes." : `Editando o status: ${status?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Aberto, Resolvido" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descreva quando usar este status" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>{colors.map(color => (<SelectItem key={color} value={color}><div className="flex items-center gap-2"><div className={cn("h-4 w-4 rounded-full", colorVariants[color])} /><span>{color}</span></div></SelectItem>))}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="icon_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "Info"}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>{icons.map(icon_name => {
                      const Icon = iconMap[icon_name];
                      return (<SelectItem key={icon_name} value={icon_name}><div className="flex items-center gap-2"><Icon className="h-4 w-4"/><span>{icon_name}</span></div></SelectItem>)
                    })}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
            </div>
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
