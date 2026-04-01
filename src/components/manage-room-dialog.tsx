
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2, Edit, Plus, XCircle } from "lucide-react";

import { updateRoom, getExclusionZonesByroom_id, addExclusionZone, updateExclusionZone, deleteExclusionZone, ExclusionZone } from "@/lib/room-actions";
import type { Room } from "@/app/buildings/page";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { getGridLabel } from "@/lib/geometry";

// --- Funções de Conversão de Coordenadas ---
function alphaToIndex(alpha: string): number {
    if (!/^[a-zA-Z]+$/.test(alpha)) return -1;
    return alpha.toUpperCase().split('').reduce((acc, char) => {
        return acc * 26 + char.charCodeAt(0) - 64;
    }, 0) - 1;
}

function numericToIndex(numeric: string): number {
    const num = parseInt(numeric, 10);
    if (isNaN(num) || num < 1) return -1;
    return num - 1;
}

function indexToAlpha(index: number): string {
    let label = '';
    let tempIndex = index;
    while (tempIndex >= 0) {
        label = String.fromCharCode(65 + (tempIndex % 26)) + label;
        tempIndex = Math.floor(tempIndex / 26) - 1;
    }
    return label;
}

function indexToNumeric(index: number): string {
    return String(index + 1);
}


const formSchema = z.object({
  name: z.string().min(3, "O nome da sala deve ter pelo menos 3 caracteres."),
  width_m: z.coerce.number().optional(),
  height_m: z.coerce.number().optional(),
  tile_width_cm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
  tile_height_cm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
  x_axis_naming: z.enum(['alpha', 'numeric']),
  y_axis_naming: z.enum(['alpha', 'numeric']),
  newExclusionZone: z.object({
    id: z.string().optional(), // ID da zona em edição
    xStr: z.string().min(1, "Obrigatório"),
    yStr: z.string().min(1, "Obrigatório"),
    width: z.coerce.number().min(1, "Deve ser >= 1"),
    height: z.coerce.number().min(1, "Deve ser >= 1"),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ManageRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageRoomDialog({ room, open, onOpenChange }: ManageRoomDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [zones, setZones] = useState<ExclusionZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [editingZone, setEditingZone] = useState<ExclusionZone | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room.name,
      width_m: room.width_m,
      height_m: room.height_m,
      tile_width_cm: room.tile_width_cm || 60,
      tile_height_cm: room.tile_height_cm || 60,
      x_axis_naming: room.x_axis_naming || 'alpha',
      y_axis_naming: room.y_axis_naming || 'numeric',
      newExclusionZone: { xStr: '', yStr: '', width: 1, height: 1 }
    },
  });

  const fetchZones = async () => {
    setIsLoadingZones(true);
    try {
        const fetchedZones = await getExclusionZonesByroom_id(room.id);
        setZones(fetchedZones);
    } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar as zonas de exclusão.", variant: "destructive" });
    } finally {
        setIsLoadingZones(false);
    }
  };

  const resetZoneForm = () => {
    setEditingZone(null);
    form.reset({
        ...form.getValues(), // Mantém os valores da sala
        newExclusionZone: { xStr: '', yStr: '', width: 1, height: 1 }
    });
  }

  useEffect(() => {
    if (open) {
      form.reset({
        name: room.name,
        width_m: room.width_m,
        height_m: room.height_m,
        tile_width_cm: room.tile_width_cm || 60,
        tile_height_cm: room.tile_height_cm || 60,
        x_axis_naming: room.x_axis_naming || 'alpha',
        y_axis_naming: room.y_axis_naming || 'numeric',
      });
      resetZoneForm();
      fetchZones();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room]);

  const { isSubmitting } = form.formState;

  const onRoomSubmit = async (data: FormData) => {
    try {
      await updateRoom({ id: room.id, ...data });
      toast({ title: "Sucesso!", description: `A sala "${data.name}" foi atualizada.` });
      onOpenChange(false);
      router.refresh(); 
      window.location.reload(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    }
  };
  
  const handleZoneSubmit = async () => {
      const zoneData = form.getValues('newExclusionZone');
      if (!zoneData) return;

      const { id, xStr, yStr, width, height } = zoneData;
      
      const x = room.x_axis_naming === 'alpha' ? alphaToIndex(xStr) : numericToIndex(xStr);
      const y = room.y_axis_naming === 'alpha' ? alphaToIndex(yStr) : numericToIndex(yStr);
      
      if (x === -1 || y === -1) {
          toast({ title: "Coordenadas Inválidas", description: "Por favor, insira valores válidos para coluna e linha.", variant: "destructive" });
          return;
      }
      
      try {
          if (editingZone && id) {
              await updateExclusionZone(id, { x, y, width, height });
              toast({ title: "Sucesso!", description: "Zona de exclusão atualizada." });
          } else {
              await addExclusionZone({ room_id: room.id, x, y, width, height });
              toast({ title: "Sucesso!", description: "Nova zona de exclusão adicionada." });
          }
          fetchZones();
          resetZoneForm();
      } catch (error: any) {
           toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
  };

  const handleEditZoneClick = (zone: ExclusionZone) => {
      setEditingZone(zone);
      form.setValue('newExclusionZone', {
          id: zone.id,
          xStr: room.x_axis_naming === 'alpha' ? indexToAlpha(zone.x) : indexToNumeric(zone.x),
          yStr: room.y_axis_naming === 'alpha' ? indexToAlpha(zone.y) : indexToNumeric(zone.y),
          width: zone.width,
          height: zone.height
      });
  };

  const handleDeleteZone = async (zoneId: string) => {
      try {
          await deleteExclusionZone(zoneId);
          toast({ title: "Sucesso!", description: "Zona de exclusão removida." });
          fetchZones();
      } catch(error: any) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Sala: {room.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onRoomSubmit)} className="space-y-4 pt-4">
             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nome da Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField control={form.control} name="width_m" render={({ field }) => ( <FormItem><FormLabel>Largura (m)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="height_m" render={({ field }) => ( <FormItem><FormLabel>Profundidade (m)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="tile_width_cm" render={({ field }) => ( <FormItem><FormLabel>Piso (cm L)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="tile_height_cm" render={({ field }) => ( <FormItem><FormLabel>Piso (cm P)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )}/>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações da Sala
              </Button>
            </DialogFooter>
          
            <Separator className="my-6" />
            <div>
                <h4 className="font-medium text-lg mb-2">Zonas de Exclusão</h4>
                <p className="text-sm text-muted-foreground mb-4">Adicione ou remova áreas onde não é permitido posicionar itens (para salas com formato em L, U, etc.). As coordenadas são baseadas no grid.</p>
                <div className="rounded-md border p-4 space-y-4">
                    {isLoadingZones ? <Skeleton className="h-20 w-full"/> : (
                        zones.length > 0 ? (
                            <div className="space-y-2">
                                {zones.map(zone => (
                                <div key={zone.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-4 font-mono text-sm">
                                        <span>De: <strong>{getGridLabel(zone.x, zone.y, room.x_axis_naming || 'alpha', room.y_axis_naming || 'numeric')}</strong></span>
                                        <span>Tamanho: <strong>{zone.width}x{zone.height}</strong></span>
                                    </div>
                                    <div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleEditZoneClick(zone)}>
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">Nenhuma zona de exclusão cadastrada para esta sala.</p>
                        )
                    )}
                </div>

                <div className="mt-6 border-t pt-6">
                    <h5 className="font-medium mb-3">{editingZone ? `Editando Zona: ${getGridLabel(editingZone.x, editingZone.y, room.x_axis_naming || 'alpha', room.y_axis_naming || 'numeric')}` : 'Adicionar Nova Zona'}</h5>
                    <div className="flex items-end gap-2">
                      <FormField control={form.control} name="newExclusionZone.xStr" render={({ field }) => (<FormItem><FormLabel>Coluna ({room.x_axis_naming === 'alpha' ? 'Letra' : 'Nº'})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                      <FormField control={form.control} name="newExclusionZone.yStr" render={({ field }) => (<FormItem><FormLabel>Linha ({room.y_axis_naming === 'alpha' ? 'Letra' : 'Nº'})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                      <FormField control={form.control} name="newExclusionZone.width" render={({ field }) => (<FormItem><FormLabel>Largura (células)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                      <FormField control={form.control} name="newExclusionZone.height" render={({ field }) => (<FormItem><FormLabel>Altura (células)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                      
                      <Button type="button" onClick={handleZoneSubmit}>
                        {editingZone ? <Edit className="h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>}
                        {editingZone ? 'Atualizar' : 'Adicionar'}
                      </Button>
                       {editingZone && (
                        <Button type="button" variant="outline" size="icon" onClick={resetZoneForm}>
                            <XCircle className="h-4 w-4" />
                        </Button>
                       )}
                    </div>
                </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
