
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/components/permissions-provider';
import { Loader2, FilePlus, Image as ImageIcon, Trash2, Camera, CircleDot, VideoOff, History, MessageSquare, User, Clock } from 'lucide-react';
import { submitEvidence, getRecentIncidentEvidence, Evidence } from './actions';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const formSchema = z.object({
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
});

type FormData = z.infer<typeof formSchema>;

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.8;

const resizeAndCompressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Não foi possível obter o contexto do canvas.'));
            
            let { width, height } = img;
            if (width > MAX_IMAGE_WIDTH) {
                height = (height * MAX_IMAGE_WIDTH) / width;
                width = MAX_IMAGE_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
        };
        img.onerror = (error) => reject(error);
    });
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

const IncidentEvidenceHistoryCard = () => {
    const [evidences, setEvidences] = React.useState<Evidence[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getRecentIncidentEvidence()
            .then(setEvidences)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Histórico de Evidências de Incidentes</CardTitle>
                <CardDescription>Visualize as últimas notas e imagens adicionadas aos incidentes do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-6">
                        {isLoading ? <Loader2 className="mx-auto my-10 h-8 w-8 animate-spin" /> : 
                         evidences.length === 0 ? <p className="text-center text-sm text-muted-foreground py-10">Nenhuma evidência de incidente registrada ainda.</p> :
                         evidences.map(ev => (
                            <div key={ev.id} className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={ev.userPhotoURL ?? undefined} />
                                    <AvatarFallback>{getInitials(ev.userDisplayName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">{ev.userDisplayName}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</p>
                                        </div>
                                         <Link href="/incidents">
                                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                                                {ev.entityType === 'Incidents' ? `Incidente` : 'Outro'}
                                            </Badge>
                                        </Link>
                                    </div>
                                    {ev.type === 'note' && <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{ev.data.text}</p>}
                                    {ev.type === 'image' && ev.data.url && <a href={ev.data.url} target="_blank" rel="noopener noreferrer"><img src={ev.data.url} alt="Evidência" className="mt-2 rounded-md max-h-48" data-ai-hint="incident evidence"/></a>}
                                    <p className="text-xs text-muted-foreground pt-1 border-t border-dashed">
                                       Relacionado a: <span className="font-medium">{ev.incidentDescription || 'Incidente não especificado'}</span>
                                    </p>
                                </div>
                            </div>
                         ))
                        }
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default function EvidencePage() {
  const { user } = usePermissions();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: "" },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
        const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
        const compressedUrls = await Promise.all(dataUrls.map(resizeAndCompressImage));
        setPreviews(prev => [...prev, ...compressedUrls]);
    } catch(err) {
        toast({ variant: 'destructive', title: 'Erro ao processar imagem', description: 'Não foi possível ler ou otimizar um dos arquivos.' });
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  }
  
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
    
    const handleCapture = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                try {
                    const compressedUrl = await resizeAndCompressImage(dataUrl);
                    setPreviews(prev => [...prev, compressedUrl]);
                    toast({ title: "Foto Adicionada!", description: "A captura foi adicionada à lista de evidências." });
                } catch(err) {
                     toast({ variant: 'destructive', title: 'Erro ao processar imagem', description: 'Não foi possível otimizar a foto capturada.' });
                }
            }
        }
    };

  const onSubmit = async (data: FormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        await submitEvidence({
            description: data.description,
            imageUrls: previews,
            userId: user.id,
        });

        toast({ title: 'Sucesso!', description: 'Sua evidência foi registrada.' });
        form.reset();
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro ao Registrar Evidência', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Central de Evidências</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FilePlus />
                Registrar Nova Evidência Geral
            </CardTitle>
            <CardDescription>
                Use para registrar eventos não atrelados a um item específico (ex: Lâmpada queimada, goteira, limpeza).
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição da Evidência</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Ex: Lâmpada do corredor C queimada; Rack A05 com a porta aberta; Manutenção no FM200 da Sala 01..."
                            rows={5}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Fotos</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting} className="w-full sm:w-auto">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Escolher Arquivos
                        </Button>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg, image/png, image/webp"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button type="button" variant="outline" onClick={openCamera} disabled={isSubmitting} className="w-full sm:w-auto">
                            <Camera className="mr-2 h-4 w-4" />
                            Usar Câmera
                        </Button>
                    </div>
                </FormItem>
                
                {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative group">
                                <img src={src} alt={`Preview ${index + 1}`} className="rounded-md object-cover aspect-square" data-ai-hint="evidence photo"/>
                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)} type="button">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || (!form.getValues('description') && previews.length === 0)}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FilePlus className="mr-2 h-4 w-4" />
                    )}
                    Registrar Evidência
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>

        <IncidentEvidenceHistoryCard />

      </div>
    </div>

    <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
        <AlertDialogContent className="max-w-full sm:max-w-3xl w-full">
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
            <Button variant="secondary" onClick={closeCamera}>Fechar</Button>
            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                <CircleDot className="mr-2 h-4 w-4" />
                Adicionar Foto
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
