
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { addport_type, updateport_type, port_type } from "@/lib/port-types-actions";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface Manageport_typeDialogProps {
  mode: 'add' | 'edit';
  port_type?: port_type;
  children: React.ReactNode;
}

// Feito com ódio e cafeína por davidson.dev.br.
export function Manageport_typeDialog({ mode, port_type, children }: Manageport_typeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (isOpen) {
        if (mode === 'edit' && port_type) {
            form.reset({
                name: port_type.name,
                description: port_type.description || "",
            });
        } else {
            form.reset({ name: "", description: "" });
        }
    }
  }, [port_type, mode, isOpen, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addport_type(data);
        toast({ title: "Sucesso!", description: `O tipo de porta "${data.name}" foi criado.` });
      } else if (port_type) {
        await updateport_type(port_type.id, data);
        toast({ title: "Sucesso!", description: `O tipo de porta "${data.name}" foi atualizado.` });
      }
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o tipo de porta.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Tipo de Porta' : `Editar Tipo de Porta`}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? "Defina um novo tipo de conector físico (ex: RJ45, Fibra LC, Tomada 20A)."
              : `Editando o tipo de porta: ${port_type?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Ex: RJ45, SFP+" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Descreva o uso ou características deste tipo de porta." {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'add' ? 'Adicionar' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
