

"use client";

import { useState, useEffect, useRef } from 'react';
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Link, ArrowRightLeft, HardDrive, Puzzle, FileImage, Camera, Trash2, VideoOff, CircleDot, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/components/permissions-provider';
import { Incident, updateIncident, resolveConnectionIncident } from '@/lib/incident-service';
import { getIncidentStatuses, IncidentStatus } from '@/lib/incident-attributes-actions';
import { getConnectablechild_items, getPortsByChildItemId, EquipmentPort, ConnectableItem, ConnectionDetail } from '@/lib/connection-actions';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { uploadImage } from '@/lib/storage-actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const formSchema = z.object({
  statusId: z.string().optional(),
  notes: z.string().optional(),
});

const resolutionFormSchema = z.object({
  sideB_itemId: z.string({ required_error: "Selecione o equipamento de destino."}),
  sideB_portId: z.string({ required_error: "Selecione a porta de destino."}),
  labelText: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;
type ResolutionFormData = z.infer<typeof resolutionFormSchema>;

interface ManageIncidentDialogProps {
  incident: Incident;
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
}


const PortList = ({ ports, selectedPortId, onPortSelect, isLoading, side }: { ports: EquipmentPort[]; selectedPortId: string | null; onPortSelect: (portId: string) => void; isLoading: boolean; side: 'A' | 'B'; }) => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }
    if (ports.length === 0) {
        return <p className="text-center text-muted-foreground text-sm py-4">Nenhuma porta encontrada.</p>;
    }
    return (
        <ScrollArea className="h-40 pr-3">
             <RadioGroup value={selectedPortId || ""} onValueChange={onPortSelect} className="space-y-2">
                {ports.map(port => {
                    const isDisabled = !!port.connectedToPortId;
                    const id = `port-${side}-${port.id}`;
                    return (
                        <div key={id} className="flex items-center">
                            <RadioGroupItem value={port.id} id={id} disabled={isDisabled} />
                             <Label htmlFor={id} className={cn("ml-2 flex justify-between items-center w-full p-2 rounded-md", isDisabled ? "cursor-not-allowed text-muted-foreground/50 bg-muted/20" : "cursor-pointer hover:bg-muted/50")}>
                                <span>{port.label} <span className="text-xs text-muted-foreground">({port.portTypeName})</span></span>
                                {isDisabled && <span className="text-xs text-red-500/70">Ocupada</span>}
                            </Label>
                        </div>
                    )
                })}
            </RadioGroup>
        </ScrollArea>
    )
}


const ConnectionResolutionForm = ({ incident, user, onSuccess }: { incident: Incident, user: any, onSuccess: () => void }) => {
    const { toast } = useToast();
    const [connectableItems, setConnectableItems] = useState<ConnectableItem[]>([]);
    const [sideA, setSideA] = useState<{ item: ConnectableItem; port: EquipmentPort } | null>(null);
    const [sideB, setSideB] = useState<{ itemId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, ports: [], isLoading: false });
    const [isLoading, setIsLoading] = useState(true);

    const [isUploading, setIsUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const form = useForm<ResolutionFormData>({
        resolver: zodResolver(resolutionFormSchema),
        defaultValues: { sideB_itemId: '', sideB_portId: '', labelText: '', imageUrl: null },
    });
    
    const selectedItemId = form.watch('sideB_itemId');
    const imageUrl = form.watch('imageUrl');

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [items, incidentDetails] = await Promise.all([
                    getConnectablechild_items(),
                    resolveConnectionIncident({ incidentId: incident.id, action: 'get_details' })
                ]);
                setConnectableItems(items);
                if (incidentDetails.details) {
                    setSideA(incidentDetails.details);
                } else {
                     toast({ variant: 'destructive', title: "Erro", description: "Não foi possível carregar os detalhes da conexão original." });
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Erro ao buscar dados", description: error.message });
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [incident.id, toast]);
    
    useEffect(() => {
        if (selectedItemId) {
            setSideB(s => ({ ...s, isLoading: true, ports: [] }));
            form.setValue('sideB_portId', '');
            getPortsByChildItemId(selectedItemId).then(ports => {
                setSideB(s => ({ ...s, ports, isLoading: false }));
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemId]);

    const handleQuickConnect = async () => {
        const sideBData = form.getValues();
         if (!sideBData.sideB_itemId || !sideBData.sideB_portId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione o equipamento e a porta de destino.' });
            return;
        }
        await onSubmit({ ...sideBData, labelText: null, imageUrl: null });
    }

    const onSubmit = async (data: ResolutionFormData) => {
        try {
            await resolveConnectionIncident({
                incidentId: incident.id,
                action: 'resolve',
                resolutionData: {
                    user_id: user.id,
                    portB_id: data.sideB_portId,
                    labelText: data.labelText,
                    imageUrl: data.imageUrl,
                }
            });
            toast({ title: "Sucesso!", description: "A conexão foi resolvida e o incidente fechado." });
            onSuccess();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao resolver conexão", description: error.message });
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !sideA) return;
        const file = e.target.files[0];
        const dataURI = await readFileAsDataURI(file);
        if (dataURI) {
            handleUpload(dataURI, `connection-${sideA.port.id}-${Date.now()}.${file.type.split('/')[1]}`);
        }
    };
  
    const readFileAsDataURI = (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => {
                toast({ title: 'Erro de Leitura', description: 'Não foi possível ler o arquivo selecionado.', variant: 'destructive' });
                resolve(null);
            };
        });
    };

    const handleUpload = async (dataURI: string, blobName: string) => {
        setIsUploading(true);
        form.setValue('imageUrl', '');
        try {
            const url = await uploadImage(dataURI, blobName);
            form.setValue('imageUrl', url);
            toast({ title: 'Sucesso!', description: 'A imagem foi carregada.' });
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erro desconhecido.";
            toast({ title: 'Erro de Upload', description: msg, variant: 'destructive' });
        } finally {
            setIsUploading(false);
            if(isCameraOpen) closeCamera();
        }
    };

    const openCamera = async () => {
        setIsCameraOpen(true);
        setCameraError(null);
        setHasCameraPermission(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                setHasCameraPermission(false);
                setCameraError("Permissão para acessar a câmera foi negada. Verifique as configurações do seu navegador.");
            }
        } else {
            setHasCameraPermission(false);
            setCameraError("Seu navegador não suporta o acesso à câmera.");
        }
    };

     const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    }

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataURI = canvas.toDataURL('image/jpeg');
                handleUpload(dataURI, `conn-capture-${Date.now()}.jpg`);
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!sideA) {
        return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar os dados da conexão original associada a este incidente.</AlertDescription></Alert>
    }

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-semibold">Lado A (Origem)</p>
                    <Separator className="my-2"/>
                    <div className="flex items-center gap-2 text-sm mb-2">
                        <HardDrive className="h-4 w-4" />
                        <span>{sideA.item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Puzzle className="h-4 w-4" />
                        <span>{sideA.item.parentName}</span>
                    </div>
                    <div className="mt-4 pl-4 border-l-2 border-primary">
                        <p className="font-semibold text-primary">{sideA.port.label}</p>
                        <p className="text-xs text-muted-foreground">{sideA.port.portTypeName}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center pt-16">
                    <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                </div>
                
                 <div className="p-4 border rounded-md">
                    <p className="font-semibold">Lado B (Destino)</p>
                     <Separator className="my-2"/>
                     <FormField control={form.control} name="sideB_itemId" render={({ field }) => (
                         <FormItem>
                             <Select onValueChange={field.onChange} value={field.value}>
                                 <FormControl><SelectTrigger><SelectValue placeholder="Selecione o equipamento..." /></SelectTrigger></FormControl>
                                 <SelectContent>
                                     {connectableItems.filter(i => i.id !== sideA.item.id).map(item => <SelectItem key={item.id} value={item.id}>{item.label} ({item.parentName})</SelectItem>)}
                                 </SelectContent>
                             </Select>
                             <FormMessage />
                         </FormItem>
                     )}/>
                     {selectedItemId && (
                        <FormField control={form.control} name="sideB_portId" render={({ field }) => (
                            <FormItem className="mt-2">
                                <PortList ports={sideB.ports} isLoading={sideB.isLoading} selectedPortId={field.value} onPortSelect={field.onChange} side="B"/>
                                <FormMessage />
                            </FormItem>
                         )}/>
                     )}
                </div>
            </div>

             <Separator />
            <p className="font-semibold">Detalhes da Conexão (Opcional)</p>
             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="labelText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto da Etiqueta</FormLabel>
                      <FormControl><Textarea placeholder="Digite o texto da etiqueta do cabo..." {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                 <FormItem>
                    <FormLabel>Evidência Fotográfica</FormLabel>
                    <div className="relative p-2 border rounded-md bg-muted/30 min-h-[128px] w-full flex justify-center items-center group/image">
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : imageUrl ? (
                            <>
                            <img src={imageUrl} alt="Preview" className="max-h-48 object-contain rounded-md" data-ai-hint="cable connection"/>
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/image:opacity-100 transition-opacity" onClick={() => form.setValue('imageUrl', null)} type="button">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </>
                        ) : <p className="text-sm text-muted-foreground">Nenhuma imagem</p>}
                    </div>
                    <div className="flex gap-2 justify-center mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            <FileImage className="mr-2 h-4 w-4" /> Arquivo
                        </Button>
                        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        <Button type="button" variant="outline" size="sm" onClick={openCamera} disabled={isUploading}>
                            <Camera className="mr-2 h-4 w-4" /> Câmera
                        </Button>
                    </div>
                 </FormItem>
             </div>


            <DialogFooter className="pt-4">
                 <div className="inline-flex rounded-md shadow-sm">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={form.formState.isSubmitting}
                            className="rounded-r-none"
                        >
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Link className="mr-2 h-5 w-5"/>}
                            Resolver com Evidência
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="lg" variant="outline" className="rounded-l-none px-3" disabled={form.formState.isSubmitting}>
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleQuickConnect} disabled={form.formState.isSubmitting}>
                                    Resolver Rapidamente (sem evidência)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
            </DialogFooter>
             <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
                <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Capturar Imagem da Conexão</AlertDialogTitle>
                </AlertDialogHeader>
                    <div className="relative w-full aspect-video bg-black rounded-md flex items-center justify-center">
                        {hasCameraPermission === null && <Loader2 className="h-8 w-8 animate-spin text-white"/>}
                        <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />

                        {hasCameraPermission === false && cameraError && (
                            <Alert variant="destructive" className="absolute m-4">
                                <VideoOff className="h-4 w-4" />
                                <AlertTitle>Erro na Câmera</AlertTitle>
                                <AlertDescription>{cameraError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={closeCamera}>Cancelar</AlertDialogCancel>
                    <Button onClick={handleCapture} disabled={!hasCameraPermission || isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CircleDot className="mr-2 h-4 w-4" />}
                        Tirar Foto
                    </Button>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
        </Form>
    );
};


const StatusUpdateForm = ({ incident, onOpenChange, onSuccess }: { incident: Incident, onOpenChange: () => void, onSuccess: () => void }) => {
    const { toast } = useToast();
    const { user } = usePermissions();
    const [statuses, setStatuses] = React.useState<IncidentStatus[]>([]);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { statusId: incident.statusId, notes: "" },
    });

    React.useEffect(() => {
        getIncidentStatuses().then(setStatuses);
        form.reset({ statusId: incident.statusId, notes: "" });
    }, [incident, form]);

    const onSubmit = async (data: FormData) => {
        if (!user || !data.statusId) {
            toast({ variant: 'destructive', title: "Erro", description: "Usuário ou status não definido." });
            return;
        }

        try {
            await updateIncident(incident.id, data.statusId, user.id, data.notes);
            toast({ title: "Sucesso!", description: "O status do incidente foi atualizado." });
            onSuccess();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro", description: error.message });
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="statusId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alterar Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Selecione um novo status..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Adicione uma nota sobre a mudança de status..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onOpenChange} disabled={form.formState.isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export function ManageIncidentDialog({ incident, isOpen, onOpenChange, onSuccess }: ManageIncidentDialogProps) {
    const { user } = usePermissions();
    const isConnectionIncident = incident.typeName === 'Integridade de Dados';
    const canBeResolved = incident.status !== 'Resolvido' && incident.status !== 'Fechado';

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={isConnectionIncident ? "max-w-5xl" : "max-w-lg"}>
                <DialogHeader>
                    <DialogTitle>Gerenciar Incidente</DialogTitle>
                    <DialogDescription className="break-all">
                        {incident.description}
                    </DialogDescription>
                </DialogHeader>
                
                {isConnectionIncident && canBeResolved ? (
                    <ConnectionResolutionForm incident={incident} user={user} onSuccess={onSuccess} />
                ) : (
                    <StatusUpdateForm incident={incident} onOpenChange={onOpenChange} onSuccess={onSuccess} />
                )}

            </DialogContent>
        </Dialog>
    );
}
