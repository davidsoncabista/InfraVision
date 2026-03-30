

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Server, Snowflake, Router, Network, PanelTop, Database, Power, Fan, HardDrive, Box, Circle, Square } from "lucide-react";

import { updateItemType } from "@/lib/item-types-actions";
import type { ItemType } from "@/lib/item-types-actions";
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
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { ScrollArea } from "./ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const iconList = [
  { name: 'Server', icon: Server },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Router', icon: Router },
  { name: 'Network', icon: Network },
  { name: 'PanelTop', icon: PanelTop },
  { name: 'Database', icon: Database },
  { name: 'Power', icon: Power },
  { name: 'Fan', icon: Fan },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Box', icon: Box },
];

const parentitem_typeschema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  category: z.string().min(3, "A categoria deve ter pelo menos 3 caracteres."),
  shape: z.enum(['rectangle', 'circle']),
  defaultwidth_m: z.coerce.number().optional().nullable(),
  default_height_m: z.coerce.number().optional().nullable(),
  default_radius_m: z.coerce.number().optional().nullable(),
  icon_name: z.string().optional(),
  can_have_children: z.boolean(),
  is_resizable: z.boolean(),
  default_color: z.string().optional(),
}).refine(data => {
    if (data.shape === 'rectangle' && (!data.defaultwidth_m || !data.default_height_m)) {
        return false;
    }
    if (data.shape === 'circle' && !data.default_radius_m) {
        return false;
    }
    return true;
}, {
    message: "Dimensões apropriadas (largura/comprimento ou raio) são obrigatórias para a forma selecionada.",
    path: ["shape"],
});


const childitem_typeschema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    icon_name: z.string().optional(),
    // Para manter a consistência, mesmo que oculto, o schema precisa corresponder à action
    category: z.string().default('Equipamento'),
    defaultwidth_m: z.coerce.number().default(0),
    default_height_m: z.coerce.number().default(0),
    default_color: z.string().optional(),
});


interface EditItemTypeDialogProps {
  itemType: ItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isParentType: boolean;
}

export function EditItemTypeDialog({ itemType, open, onOpenChange, isParentType }: EditItemTypeDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(isParentType ? parentitem_typeschema : childitem_typeschema),
  });
  
  const selectedShape = form.watch('shape');

  useEffect(() => {
    if (open) {
      form.reset({
        name: itemType.name,
        category: itemType.category,
        shape: itemType.shape || 'rectangle',
        defaultwidth_m: itemType.defaultwidth_m,
        default_height_m: itemType.default_height_m,
        default_radius_m: itemType.default_radius_m,
        icon_name: itemType.icon_name || "",
        can_have_children: itemType.can_have_children,
        is_resizable: itemType.is_resizable,
        default_color: itemType.default_color || "",
      });
    }
  }, [open, itemType, form]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (data: any) => {
    try {
      await updateItemType(itemType.id, data, isParentType);
      toast({
        title: "Sucesso!",
        description: `O tipo de item "${data.name}" foi atualizado.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Falha ao atualizar tipo de item:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar o tipo de item.",
      });
    }
  };
  
  const renderParentForm = () => (
     <>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Rack 42U" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Gabinetes" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <FormField
          control={form.control}
          name="shape"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Forma do Item</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="rectangle" id="shape-rect-edit" /></FormControl>
                    <FormLabel className="font-normal flex items-center gap-2" htmlFor="shape-rect-edit"><Square className="h-4 w-4" /> Retângulo</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="circle" id="shape-circle-edit" /></FormControl>
                    <FormLabel className="font-normal flex items-center gap-2" htmlFor="shape-circle-edit"><Circle className="h-4 w-4" /> Círculo</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedShape === 'rectangle' ? (
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="defaultwidth_m" render={({ field }) => (
                    <FormItem><FormLabel>Largura Padrão (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="default_height_m" render={({ field }) => (
                    <FormItem><FormLabel>Comprimento Padrão (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        ) : (
             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="default_radius_m" render={({ field }) => (
                    <FormItem><FormLabel>Raio Padrão (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
             </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="icon_name" render={({ field }) => (
                <FormItem><FormLabel>Ícone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um ícone..." /></SelectTrigger></FormControl>
                    <SelectContent><ScrollArea className="h-48">{iconList.map((icon) => (<SelectItem key={icon.name} value={icon.name}><div className="flex items-center gap-2"><icon.icon className="h-4 w-4" /><span>{icon.name}</span></div></SelectItem>))}</ScrollArea></SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="default_color" render={({ field }) => (
                <FormItem><FormLabel>Cor Padrão</FormLabel><FormControl><Input type="color" {...field} value={field.value ?? ''} className="h-10" /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="flex items-center space-x-8 pt-2">
            <FormField control={form.control} name="is_resizable" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5 mr-4"><FormLabel>Redimensionável</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )}/>
            <FormField control={form.control} name="can_have_children" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5 mr-4"><FormLabel>Pode Aninhar</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )}/>
        </div>
    </>
  );

  const renderChildForm = () => (
     <>
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome do Tipo de Equipamento</FormLabel><FormControl><Input placeholder="Ex: Servidor, Switch, Patch Panel" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="icon_name" render={({ field }) => (
            <FormItem><FormLabel>Ícone</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um ícone..." /></SelectTrigger></FormControl>
                <SelectContent><ScrollArea className="h-48">{iconList.map((icon) => (<SelectItem key={icon.name} value={icon.name}><div className="flex items-center gap-2"><icon.icon className="h-4 w-4" /><span>{icon.name}</span></div></SelectItem>))}</ScrollArea></SelectContent>
            </Select><FormMessage /></FormItem>
        )}/>
     </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tipo de Item: {itemType.name}</DialogTitle>
          <DialogDescription>
            Altere os atributos deste tipo de equipamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {isParentType ? renderParentForm() : renderChildForm()}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
