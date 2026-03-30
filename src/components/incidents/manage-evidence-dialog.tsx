
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/components/permissions-provider';
import { Loader2, FilePlus, Image as ImageIcon, Trash2, Camera, CircleDot, VideoOff, Send, MessageSquare, User, Clock, FileText } from 'lucide-react';
import { Incident } from '@/lib/incident-service';
import { getEvidenceForEntity, addEvidence, deleteEvidence, Evidence } from '@/lib/evidence-actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { uploadImage } from '@/lib/storage-actions';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';

interface ManageEvidenceDialogProps {
  incident: Incident;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

const MAX_IMAGE_WIDTH = 1024;
const IMAGE_QUALITY = 0.8;

const resizeAndCompressImage = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available.'));
                
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
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

export function ManageEvidenceDialog({ incident, isOpen, onOpenChange, onSuccess }: ManageEvidenceDialogProps) {
  const { user } = usePermissions();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [evidenceList, setEvidenceList] = React.useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");

  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const fetchEvidence = React.useCallback(() => {
    setIsLoading(true);
    getEvidenceForEntity(incident.id, 'Incidents')
      .then(setEvidenceList)
      .catch(() => toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível buscar as evidências.' }))
      .finally(() => setIsLoading(false));
  }, [incident.id, toast]);

  React.useEffect(() => {
    if (isOpen) {
      fetchEvidence();
    }
  }, [isOpen, fetchEvidence]);
  
  const handleAddNote = async () => {
    if (!user || !newNote.trim()) return;
    setIsSubmitting(true);
    try {
        await addEvidence({
            entity_id: incident.id,
            entity_type: 'Incidents',
            user_id: user.id,
            type: 'note',
            data: { text: newNote.trim() }
        });
        setNewNote("");
        fetchEvidence();
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao adicionar nota', description: err.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (dataURI: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        const blobName = `evidence-incident-${incident.id}-${Date.now()}.jpg`;
        const url = await uploadImage(dataURI, blobName);
        await addEvidence({
            entity_id: incident.id,
            entity_type: 'Incidents',
            user_id: user.id,
            type: 'image',
            data: { url }
        });
        fetchEvidence();
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Erro no Upload', description: err.message });
    } finally {
        setIsSubmitting(false);
        if (isCameraOpen) closeCamera();
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const compressedDataURI = await resizeAndCompressImage(file);
        if (compressedDataURI) {
            await handleFileUpload(compressedDataURI);
        }
    } catch(err) {
        toast({ variant: 'destructive', title: 'Erro ao processar imagem', description: 'Não foi possível otimizar a imagem selecionada.' });
    }
  };

  const openCamera = async () => {
    // Implementação da câmera...
  };
  
  const closeCamera = () => {
    // ...
  }

  const handleCapture = async () => {
    // ...
  }

  const handleDeleteEvidence = async (evidenceId: string) => {
    if(!user) return;
    try {
        await deleteEvidence(evidenceId, user.id);
        toast({ title: 'Sucesso', description: 'A evidência foi removida.' });
        fetchEvidence();
    } catch (err: any) {
         toast({ variant: 'destructive', title: 'Erro ao remover', description: err.message });
    }
  }


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Evidências do Incidente</DialogTitle>
          <DialogDescription>
            {incident.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-72 pr-6">
                <div className="space-y-6">
                    {isLoading ? <Loader2 className="mx-auto my-10 h-8 w-8 animate-spin" /> : 
                     evidenceList.length === 0 ? <p className="text-center text-sm text-muted-foreground py-10">Nenhuma evidência registrada.</p> :
                     evidenceList.map(ev => (
                        <div key={ev.id} className="flex items-start gap-4 group">
                            <Avatar>
                                <AvatarImage src={user?.photo_url ?? undefined} />
                                <AvatarFallback>{getInitials(ev.userdisplay_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-sm">{ev.userdisplay_name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteEvidence(ev.id)}>Confirmar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {ev.type === 'note' && <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{ev.data.text}</p>}
                                {ev.type === 'image' && ev.data.url && <a href={ev.data.url} target="_blank" rel="noopener noreferrer"><img src={ev.data.url} alt="Evidência" className="mt-2 rounded-md max-h-48" data-ai-hint="incident photo"/></a>}
                            </div>
                        </div>
                     ))
                    }
                </div>
            </ScrollArea>
            <Separator className="my-4"/>
            <div className="flex items-start gap-2">
                <Textarea placeholder="Adicionar uma nota..." value={newNote} onChange={e => setNewNote(e.target.value)} disabled={isSubmitting}/>
                <div className="flex flex-col gap-2">
                    <Button onClick={handleAddNote} disabled={!newNote.trim() || isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                    </Button>
                    <Input type="file" ref={fileInputRef} accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="hidden" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
