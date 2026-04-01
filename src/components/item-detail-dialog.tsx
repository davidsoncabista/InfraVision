
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileImage, Camera, Trash2, Video, VideoOff, CircleDot, Palette, Server, Box, Info } from 'lucide-react';
import { usePermissions } from '@/components/permissions-provider';
import { uploadImage } from '@/lib/storage-actions';
import { useToast } from '@/hooks/use-toast';
import type { Building, Room, GridItem } from '@/types/datacenter';
import { updateItemDetails } from '@/lib/item-detail-actions'; 
import { DeleteItemConfirmationDialog } from '@/components/delete-item-confirmation-dialog';
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ApprovalRequest, getPendingApprovalForItem } from '@/lib/approval-actions';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';


const ChildItemsList = ({ parent_id, allItems, onItemClick }: { parent_id: string, allItems: GridItem[], onItemClick: (item: GridItem) => void }) => {
    const child_items = allItems.filter(item => item.parent_id === parent_id);

    if (child_items.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-4 mt-4 border-t">
                Nenhum item aninhado neste equipamento.
            </div>
        );
    }
    
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Itens Aninhados</h4>
            <ScrollArea className="h-40">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Posição (U)</TableHead>
                            <TableHead>Tamanho (U)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {child_items.map(child => (
                             <TableRow key={child.id} className="cursor-pointer" onClick={() => onItemClick(child)}>
                                <TableCell>{child.label}</TableCell>
                                <TableCell><Badge variant="outline">{child.type}</Badge></TableCell>
                                <TableCell>{child.posicao_u || '-'}</TableCell>
                                <TableCell>{child.tamanho_u || '-'}</TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};


const RackView = ({ parentItem, child_items, onItemClick }: { parentItem: Partial<GridItem>, child_items: GridItem[], onItemClick: (item: GridItem) => void }) => {
    const sizeU = parentItem.tamanho_u;
    if (!sizeU || sizeU <= 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-md">
                Tamanho (U) não definido.
            </div>
        );
    }
    const units = Array.from({ length: sizeU }, (_, i) => sizeU - i);
    
    // Mapeia quais U's estão ocupados por qual item
    const occupiedUnits = new Map<number, GridItem>();
    child_items.forEach(child => {
        if(child.posicao_u && child.tamanho_u){
            for(let i=0; i < child.tamanho_u; i++){
                occupiedUnits.set(child.posicao_u + i, child);
            }
        }
    });

    return (
        <div className="flex h-full border rounded-md p-1 bg-muted/20">
            <ScrollArea className="flex-1 w-full p-1">
                <div className="relative">
                    {/* Renderiza as unidades vazias */}
                    {units.map((u) => (
                         <div key={`u-${u}`} className="flex items-center h-8 my-0.5">
                            <div className="text-xs w-6 text-center text-muted-foreground">{u}</div>
                            <div className="flex-1 h-full border rounded-sm bg-background border-dashed" />
                         </div>
                    ))}
                    
                    {/* Renderiza os itens filhos sobre as unidades */}
                    {child_items.map(child => {
                        if (!child.posicao_u || !child.tamanho_u) return null;

                        const topPosition = (sizeU - (child.posicao_u + child.tamanho_u - 1)) * 34; // 34px = h-8 + my-0.5
                        const itemHeight = child.tamanho_u * 34 - 2; // Desconta a margem

                        return (
                            <TooltipProvider key={child.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="absolute left-7 right-1 rounded-sm bg-primary/20 border border-primary text-primary-foreground p-1 flex items-center justify-center cursor-pointer hover:bg-primary/30"
                                            style={{ top: `${topPosition}px`, height: `${itemHeight}px` }}
                                            onClick={() => onItemClick(child)}
                                        >
                                            <p className="text-xs font-medium text-center truncate">{child.label}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{child.label} ({child.tamanho_u}U)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};


const GenericItemView = ({ item, hasPermission, onItemChange }: { item: Partial<GridItem>, hasPermission: (p: string) => boolean, onItemChange: (key: keyof GridItem, value: any) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  
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

                    if (!ctx) {
                        return reject(new Error('Não foi possível obter o contexto do canvas.'));
                    }

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
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !item.id) return;
        const file = e.target.files[0];
        
        try {
            const compressedDataURI = await resizeAndCompressImage(file);
            if (compressedDataURI) {
                uploadDataURI(compressedDataURI, `item-${item.id}-${Date.now()}.jpg`);
            }
        } catch(error) {
             toast({ title: 'Erro de Otimização', description: 'Não foi possível otimizar a imagem selecionada.', variant: 'destructive' });
        }
    };

  const uploadDataURI = async (dataURI: string, blobName: string) => {
      setIsUploading(true);
      try {
          const url = await uploadImage(dataURI, blobName);
          onItemChange('image_url', url);
          toast({ title: 'Sucesso!', description: 'A imagem foi carregada.' });
      } catch (error) {
          const msg = error instanceof Error ? error.message : "Erro desconhecido.";
          toast({ title: 'Erro de Upload', description: msg, variant: 'destructive' });
      } finally {
          setIsUploading(false);
          setIsCameraOpen(false); // Fecha a câmera após o upload
      }
  };

  const handleRemoveImage = () => {
    onItemChange('image_url', null);
  }
  
  const openCamera = async () => {
      setIsCameraOpen(true);
      setCameraError(null);
      setHasCameraPermission(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
              setHasCameraPermission(true);
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
              }
          } catch (err) {
              console.error("Erro ao acessar a câmera:", err);
              setHasCameraPermission(false);
              if (err instanceof DOMException) {
                  if (err.name === "NotAllowedError") {
                      setCameraError("Permissão para acessar a câmera foi negada. Verifique as configurações do seu navegador.");
                  } else {
                       setCameraError(`Erro ao iniciar a câmera: ${err.message}`);
                  }
              } else {
                 setCameraError("Ocorreu um erro desconhecido ao tentar acessar a câmera.");
              }
          }
      } else {
          setHasCameraPermission(false);
          setCameraError("Seu navegador não suporta o acesso à câmera.");
      }
  };

  const closeCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && item.id) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        let { videoWidth: width, videoHeight: height } = video;
        if (width > MAX_IMAGE_WIDTH) {
            height = (height * MAX_IMAGE_WIDTH) / width;
            width = MAX_IMAGE_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURI = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
            uploadDataURI(dataURI, `item-${item.id}-capture-${Date.now()}.jpg`);
            closeCamera();
        }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 rounded-md p-4">
        <div className="relative p-2 border rounded-md bg-muted/30 min-h-[128px] w-full flex justify-center items-center mb-4 group/image">
          {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
          ) : item.image_url ? (
            <>
              <img src={item.image_url} alt="Preview" className="max-h-48 object-contain rounded-md" data-ai-hint="server rack"/>
              <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/image:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                  type="button"
                  disabled={!hasPermission('item:image:upload')}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma imagem</p>
          )}
        </div>
        {hasPermission('item:image:upload') ? (
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FileImage className="mr-2 h-4 w-4" />
              {item.image_url ? "Alterar Imagem" : "Escolher Arquivo"}
            </Button>
            <Input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            <Button type="button" variant="outline" onClick={openCamera} disabled={isUploading}>
              <Camera className="mr-2 h-4 w-4" />
              Usar Câmera
            </Button>
          </div>
        ) : <p className="text-xs text-muted-foreground">Você não tem permissão para carregar imagens.</p>}
      </div>

      <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Capturar Imagem</AlertDialogTitle>
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
    </>
  );
};


const RackItemView = ({ item, allItems, onItemClick }: { item: Partial<GridItem>, allItems: GridItem[], onItemClick: (item: GridItem) => void }) => {
    const child_items = allItems.filter(i => i.parent_id === item.id);
    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex-grow min-h-0">
                <RackView parentItem={item} child_items={child_items} onItemClick={onItemClick} />
            </div>
        </div>
    )
}

interface ItemDetailDialogProps {
  item: GridItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdate: (item: GridItem) => void;
  onItemDelete: (itemId: string) => void;
  fullItemContext: {
    allItems: GridItem[];
  };
  isFloorPlanContext?: boolean; // Nova propriedade
}

export const ItemDetailDialog = ({ 
  item, 
  open, 
  onOpenChange, 
  onItemUpdate, 
  onItemDelete, 
  fullItemContext, 
  isFloorPlanContext = false 
}: ItemDetailDialogProps) => {
  const { toast } = useToast();
  const { hasPermission, user } = usePermissions();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<Partial<GridItem>>({});
  const [availableStatuses, setAvailableStatuses] = React.useState<ItemStatus[]>([]);
  const [allBuildings, setAllBuildings] = React.useState<Building[]>([]);
  const [pendingApproval, setPendingApproval] = React.useState<ApprovalRequest | null>(null);
  
  const isParentItem = !item.parent_id;
  const isRackType = editFormData.type?.toLowerCase().includes('rack');
  const shape = item.shape || 'rectangle';

  React.useEffect(() => {
    if (item) {
      setEditFormData({
        ...item,
        tamanho_u: item.type?.toLowerCase().includes('rack') ? item.tamanho_u || 42 : undefined,
      });
    }
  }, [item]);

  React.useEffect(() => {
    if (open) {
        getItemStatuses().then(setAvailableStatuses);

        if (item.id) {
          const entity_type = item.parent_id ? 'child_items' : 'parent_items';
          getPendingApprovalForItem(item.id, entity_type).then(setPendingApproval);
        }

        const buildingsMap = new Map<string, Building>();
        
        fullItemContext.allItems.forEach(i => {
            if (i.buildingName && i.roomName && i.room_id) {
                const building_id = `bldg_${i.buildingName}`;
                let building = buildingsMap.get(building_id);
                if (!building) {
                    building = { id: building_id, name: i.buildingName, rooms: [], is_test_data: false };
                    buildingsMap.set(building_id, building);
                }
                
                if (!building.rooms.some(r => r.id === i.room_id)) {
                    building.rooms.push({
                        id: i.room_id,
                        name: i.roomName,
                        building_id: building.id,
                        items: [],
                        width_m: 20, height_m: 20, tile_width_cm: 60, tile_height_cm: 60,
                        x_axis_naming: 'alpha', y_axis_naming: 'numeric',
                        is_test_data: false
                    });
                }
            }
        });
        
        setAllBuildings(Array.from(buildingsMap.values()));
    } else {
        setPendingApproval(null); // Limpa o estado ao fechar
    }
  }, [open, item, fullItemContext.allItems]);


  const handleFormChange = (key: keyof GridItem, value: any) => {
     setEditFormData(prev => ({...prev, [key]: value}))
  }

  const handleNumericFormChange = (key: keyof GridItem, value: string) => {
    if (value === '') {
        handleFormChange(key, null);
    } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            handleFormChange(key, numValue);
        }
    }
  };

  const handleBuildingChange = (building_id: string) => {
    if (building_id === 'unallocated') {
        handleFormChange('room_id', null);
        return;
    }
    const selectedBuilding = allBuildings.find(b => b.id === building_id);
    if(selectedBuilding && selectedBuilding.rooms.length > 0){
      handleFormChange('room_id', selectedBuilding.rooms[0].id);
    } else {
      handleFormChange('room_id', null);
    }
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }
      await updateItemDetails({ id: item.id, ...editFormData }, user.id);
      onItemUpdate({ ...item, ...editFormData } as GridItem);
      onOpenChange(false);
      // Mensagem de sucesso genérica, o feedback específico vem da action
      toast({ title: "Sucesso!", description: `As alterações em ${editFormData.label} foram processadas.` });

    } catch (error: any) {
      // O erro esperado (envio para aprovação) é tratado aqui
      toast({ 
        title: 'Ação Registrada',
        description: error.message,
      });
      // Mesmo com o 'erro' de aprovação, fechamos o modal e atualizamos a UI
      onItemUpdate({ ...item, ...editFormData } as GridItem);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  const canDeleteItem = (
    (item.status === 'draft' && hasPermission('item:delete:draft')) ||
    (item.status !== 'draft' && hasPermission('item:decommission:active'))
  );

  const canMoveItem = item.status === 'draft' || item.status === 'maintenance';
  const selectedBuilding = allBuildings.find(b => b.rooms.some(r => r.id === editFormData.room_id));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Item: {editFormData.label}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollArea className="h-[60vh] p-4 md:col-span-2">
              <div className="grid gap-4 py-4 pr-2">
                 {pendingApproval && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Aprovação Pendente</AlertTitle>
                        <AlertDescription>
                            Uma solicitação para alterar o status para <Badge variant="secondary">{pendingApproval.details.toName || pendingApproval.details.to}</Badge> está pendente.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="label">Nome</Label>
                        <Input id="label" value={editFormData.label || ''} onChange={(e) => handleFormChange('label', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Input id="type" value={editFormData.type} readOnly disabled />
                    </div>
                    {isParentItem && !isFloorPlanContext && (
                      <>
                        <div>
                          <Label htmlFor="building">Prédio</Label>
                          <Select
                            value={selectedBuilding?.id || 'unallocated'}
                            onValueChange={handleBuildingChange}
                            disabled={!canMoveItem}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um prédio..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unallocated">Nenhum (Em Depósito)</SelectItem>
                              {allBuildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="room">Sala</Label>
                          <Select
                            value={editFormData.room_id || ''}
                            onValueChange={(value) => handleFormChange('room_id', value)}
                            disabled={!canMoveItem || !selectedBuilding}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma sala..." />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedBuilding?.rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {isParentItem && shape === 'rectangle' && (
                    <>
                        <div>
                            <Label htmlFor="width_m">Largura (m)</Label>
                            <Input id="width_m" type="number" step="0.01" value={editFormData.width_m ?? ''} onChange={(e) => handleNumericFormChange('width_m', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="heightM">Comprimento (m)</Label>
                            <Input id="heightM" type="number" step="0.01" value={editFormData.heightM ?? ''} onChange={(e) => handleNumericFormChange('heightM', e.target.value)} />
                        </div>
                    </>
                    )}
                    {isParentItem && shape === 'circle' && (
                        <div>
                            <Label htmlFor="radiusM">Raio (m)</Label>
                            <Input id="radiusM" type="number" step="0.01" value={editFormData.radiusM ?? ''} onChange={(e) => handleNumericFormChange('radiusM', e.target.value)} />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="modelo">Modelo</Label>
                        <Input id="modelo" value={editFormData.modelo || ''} onChange={(e) => handleFormChange('modelo', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="preco">Preço</Label>
                        <Input id="preco" type="number" value={editFormData.preco ?? ''} onChange={(e) => handleNumericFormChange('preco', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="serial_number">Serial</Label>
                        <Input id="serial_number" value={editFormData.serial_number || ''} onChange={(e) => handleFormChange('serial_number', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="brand">Fabricante</Label>
                        <Input id="brand" value={editFormData.brand || ''} onChange={(e) => handleFormChange('brand', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="tag">TAG</Label>
                        <Input id="tag" value={editFormData.tag || ''} onChange={(e) => handleFormChange('tag', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="trellisId">TrellisId</Label>
                        <Input id="trellisId" value={editFormData.trellisId || ''} onChange={(e) => handleFormChange('trellisId', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="tamanho_u">Tamanho (U)</Label>
                        <Input id="tamanho_u" type="number" value={editFormData.tamanho_u ?? ''} onChange={(e) => handleNumericFormChange('tamanho_u', e.target.value)} disabled={!isRackType} />
                    </div>
                    <div>
                        <Label htmlFor="potencia_w">Potência (W)</Label>
                        <Input id="potencia_w" type="number" value={editFormData.potencia_w ?? ''} onChange={(e) => handleNumericFormChange('potencia_w', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={editFormData.status} onValueChange={(value) => handleFormChange('status', value)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(status => (
                                    <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="ownerEmail">Owner (Email)</Label>
                        <Input id="ownerEmail" type="email" value={editFormData.ownerEmail || ''} onChange={(e) => handleFormChange('ownerEmail', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="isTagEligible" checked={!!editFormData.isTagEligible} onCheckedChange={(checked) => handleFormChange('isTagEligible', checked)}/>
                            <Label htmlFor="isTagEligible">Elegível TAG</Label>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Label htmlFor="color">Cor</Label>
                            <Input id="color" type="color" value={editFormData.color || '#ffffff'} onChange={(e) => handleFormChange('color', e.target.value)} className="w-16 p-1"/>
                        </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="dataSheetUrl">Data Sheet URL</Label>
                      <Input id="dataSheetUrl" type="url" placeholder="https://" value={editFormData.dataSheetUrl || ''} onChange={(e) => handleFormChange('dataSheetUrl', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" value={editFormData.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} rows={3} />
                  </div>
                  {isRackType && (
                     <ChildItemsList 
                        parent_id={item.id} 
                        allItems={fullItemContext.allItems}
                        onItemClick={(childItem) => {
                            // Ao clicar em um filho, trocamos o item no modal
                            setEditFormData(childItem);
                        }}
                     />
                  )}
              </div>
            </ScrollArea>
            <div className="md:col-span-1 h-[60vh]">
                 {isRackType ? (
                    <RackItemView 
                        item={editFormData} 
                        allItems={fullItemContext.allItems}
                        onItemClick={(childItem) => setEditFormData(childItem)}
                    />
                 ) : (
                    <GenericItemView item={editFormData} hasPermission={hasPermission} onItemChange={handleFormChange} />
                 )}
            </div>
          </div>
          <DialogFooter className='justify-between'>
            <div>
              {canDeleteItem && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isSaving}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {item.status === 'draft' ? 'Excluir Rascunho' : 'Descomissionar'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
              <Button onClick={handleEditSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {item && (
        <DeleteItemConfirmationDialog
          item={item}
          open={isDeleteDialogOpen}
          onConfirm={(hardDelete) => {
            onItemDelete(item.id);
            onOpenChange(false);
          }}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
};
