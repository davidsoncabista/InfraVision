
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Plus,
  RefreshCw,
  LayoutGrid,
  Maximize,
  Circle,
  Info,
  Server,
  Snowflake,
  Router,
  Network,
  PanelTop,
  Database,
  Power,
  Fan,
  HardDrive,
  Box,
  ShieldAlert,
  Cloud,
  Flame,
  BatteryCharging,
  Siren,
  Component,
  CloudCog,
  Plug,
  CheckCircle2,
  Wrench,
  FilePenLine,
  Clock,
  HelpCircle,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useBuilding } from '@/components/building-provider';
import { usePermissions } from '@/components/permissions-provider';
import { useToast } from '@/hooks/use-toast';
import type { Building, Room, GridItem } from '@/types/datacenter';
import { ManageRoomDialog } from '@/components/manage-room-dialog';
import { updateParentItemPosition, getUnallocatedparent_items, allocateParentItem } from '@/lib/parent-item-actions';
import { ItemDetailDialog } from '@/components/item-detail-dialog'; 
import { AddItemDialog } from '@/components/add-item-dialog';
import { cn } from '@/lib/utils';
import { statusColors } from '@/lib/status-config';
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card';
import { getGridLabel } from '@/lib/geometry';
import { getParentItemIdsWithActiveIncidents } from '@/lib/incident-service';
import { getDatacenterData } from '@/app/datacenter/actions'; // Importado para re-fetch
import { getExclusionZonesByRoomId, ExclusionZone } from '@/lib/room-actions'; 
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const colorMap: Record<typeof statusColors[number], string> = {
    gray: "hsl(220 9% 46%)", red: "hsl(0 72% 51%)", orange: "hsl(30 90% 50%)",
    amber: "hsl(45 90% 50%)", yellow: "hsl(54 90% 50%)", lime: "hsl(90 90% 50%)",
    green: "hsl(142 71% 45%)", emerald: "hsl(158 70% 45%)", teal: "hsl(172 70% 40%)",
    cyan: "hsl(190 80% 55%)", sky: "hsl(200 90% 55%)", blue: "hsl(221 83% 53%)",
    indigo: "hsl(245 70% 60%)", violet: "hsl(262 80% 65%)", purple: "hsl(275 70% 55%)",
    fuchsia: "hsl(300 80% 60%)", pink: "hsl(330 80% 60%)", rose: "hsl(350 80% 60%)",
};

const getStatusColorHex = (statuses: ItemStatus[], statusId: GridItem['status']): string => {
    const status = statuses.find(s => s.id === statusId);
    return status ? colorMap[status.color] : colorMap.gray;
}

const itemIcons: Record<string, React.ElementType> = {
  Server, Snowflake, Router, Network, PanelTop, Database, Power, Fan, HardDrive, Box, ShieldAlert, Cloud, Flame, BatteryCharging, Siren, Component, CloudCog, Plug, default: Box,
};

const statusIcons: Record<string, React.ElementType> = {
    active: CheckCircle2,
    maintenance: Wrench,
    draft: FilePenLine,
    pending_approval: Clock,
    default: HelpCircle,
};

const AllocationLobby = ({ items, onDragStart }: { items: GridItem[], onDragStart: (e: React.DragEvent, itemId: string) => void }) => {
    return (
        <Card className="absolute bottom-4 left-4 z-10 w-64 shadow-lg">
            <Accordion type="single" collapsible>
                <AccordionItem value="lobby" className="border-b-0">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                           <Archive className="h-4 w-4" />
                           <span className="text-sm font-semibold">Lobby de Alocação</span>
                           <Badge variant="secondary">{items.length}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                         {items.length === 0 ? (
                             <p className="text-xs text-muted-foreground text-center p-4">Nenhum item não alocado.</p>
                         ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {items.map(item => (
                                    <div 
                                        key={item.id} 
                                        draggable 
                                        onDragStart={(e) => onDragStart(e, item.id)}
                                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 cursor-grab active:cursor-grabbing"
                                    >
                                        <Box className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <span className="text-xs text-muted-foreground">{item.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
};


export function DatacenterClient({ initialData }: { initialData: Building[] }) {
  const { toast } = useToast();
  const { user, hasPermission } = usePermissions();
  const { activeBuildingId } = useBuilding();
  
  const [data, setData] = React.useState(initialData);
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  
  const gridItems = React.useMemo(() => {
    const building = data.find(b => b.id === activeBuildingId);
    const room = building?.rooms.find(r => r.id === activeRoomId);
    return room?.items || [];
  }, [data, activeBuildingId, activeRoomId]);
  
  const [itemsWithIncidents, setItemsWithIncidents] = React.useState<string[]>([]);
  const [exclusionZones, setExclusionZones] = React.useState<ExclusionZone[]>([]);
  const [unallocatedItems, setUnallocatedItems] = React.useState<GridItem[]>([]);
  const [isEditRoomOpen, setIsEditRoomOpen] = React.useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  
  const [editingItem, setEditingItem] = React.useState<GridItem | null>(null);

  const [viewTransform, setViewTransform] = React.useState({ x: 50, y: 50, scale: 1 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStartRef = React.useRef({ x: 0, y: 0 });
  
  const [touchState, setTouchState] = React.useState<{type: 'pan' | 'pinch', lastPos: {x: number, y: number}, lastDist: number} | null>(null);

  const [draggingItem, setDraggingItem] = React.useState<{ id: string; offsetX: number; offsetY: number; originalX: number; originalY: number; fromLobby?: boolean } | null>(null);

  const [cellSize, setCellSize] = React.useState(50);
  const [statuses, setStatuses] = React.useState<ItemStatus[]>([]);

  const floorPlanRef = React.useRef<HTMLDivElement>(null);

  const refreshData = React.useCallback(() => {
    getDatacenterData().then(setData);
    getUnallocatedparent_items().then(setUnallocatedItems);
  }, []);

  const currentBuilding = React.useMemo(() => 
    data.find(b => b.id === activeBuildingId),
  [data, activeBuildingId]);

  const availableRooms = React.useMemo(() => currentBuilding?.rooms || [], [currentBuilding]);

  const activeRoom = React.useMemo(() => availableRooms.find(r => r.id === activeRoomId), [availableRooms, activeRoomId]);

  const roomDimensions = React.useMemo(() => ({
    widthM: activeRoom?.widthM || 20,
    depthM: activeRoom?.depthM || 20,
  }), [activeRoom]);

  const tileDimensions = React.useMemo(() => ({
      widthCm: activeRoom?.tileWidthCm || 60,
      heightCm: activeRoom?.tileHeightCm || 60,
  }), [activeRoom]);

  const gridNaming = React.useMemo(() => ({
    x: activeRoom?.xAxisNaming || 'alpha',
    y: activeRoom?.yAxisNaming || 'numeric',
  }), [activeRoom]);

  React.useEffect(() => {
    getItemStatuses().then(setStatuses);
    getUnallocatedparent_items().then(setUnallocatedItems);
  }, []);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.some(r => r.id === activeRoomId)) {
        setActiveRoomId(availableRooms[0].id);
    } else if (availableRooms.length === 0) {
        setActiveRoomId(null);
    }
  }, [availableRooms, activeRoomId]);

  React.useEffect(() => {
    if (activeBuildingId) {
      getParentItemIdsWithActiveIncidents(activeBuildingId)
        .then(setItemsWithIncidents)
        .catch(err => console.error("Failed to fetch incident data:", err));
    } else {
      setItemsWithIncidents([]);
    }
    
    if(activeRoomId) {
        getExclusionZonesByRoomId(activeRoomId)
          .then(setExclusionZones)
          .catch(err => console.error("Failed to fetch exclusion zones:", err));
    } else {
        setExclusionZones([]);
    }

  }, [activeBuildingId, activeRoomId, gridItems]);


  const GRID_COLS = Math.floor((roomDimensions.widthM * 100) / tileDimensions.widthCm);
  const GRID_ROWS = Math.floor((roomDimensions.depthM * 100) / tileDimensions.heightCm);

  const handleWheel = (e: React.WheelEvent) => {
    if (!floorPlanRef.current) return;
    e.preventDefault();
    const rect = floorPlanRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newScale = Math.max(0.2, Math.min(2.5, viewTransform.scale - e.deltaY * 0.001));
    
    const newX = mouseX - (mouseX - viewTransform.x) * (newScale / viewTransform.scale);
    const newY = mouseY - (mouseY - viewTransform.y) * (newScale / viewTransform.scale);
    
    setViewTransform({ x: newX, y: newY, scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    panStartRef.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y };
    setIsPanning(true);
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingItem) {
      handleItemDrag(e.clientX, e.clientY);
    } else if (isPanning) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      setViewTransform({ ...viewTransform, x: newX, y: newY });
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.style.cursor = 'grab';
    }
    if (draggingItem && !draggingItem.fromLobby) {
      const draggedItem = gridItems.find(item => item.id === draggingItem.id);
      if (draggedItem && (draggedItem.x !== draggingItem.originalX || draggedItem.y !== draggingItem.originalY)) {
        
        const itemWidthInCells = draggedItem.widthM / (tileDimensions.widthCm / 100);
        const itemHeightInCells = draggedItem.heightM / (tileDimensions.heightCm / 100);
        let collidesWithExclusion = false;
        for (const zone of exclusionZones) {
          if (
            draggedItem.x < zone.x + zone.width &&
            draggedItem.x + itemWidthInCells > zone.x &&
            draggedItem.y < zone.y + zone.height &&
            draggedItem.y + itemHeightInCells > zone.y
          ) {
            collidesWithExclusion = true;
            break;
          }
        }
        
        if (collidesWithExclusion) {
          toast({
            variant: "destructive",
            title: "Posição Inválida",
            description: "Não é possível mover um item para uma zona de exclusão.",
          });
          refreshData();
          setDraggingItem(null);
          return;
        }

        try {
          if (!user) throw new Error("Usuário não identificado.");
          await updateParentItemPosition(draggedItem.id, draggedItem.x, draggedItem.y, user.id);
          toast({
            title: "Item Movido!",
            description: `O item "${draggedItem.label}" foi movido para a nova posição.`,
          });
          refreshData();
        } catch (error: any) {
          refreshData();
          toast({
            variant: "destructive",
            title: "Movimentação não permitida",
            description: error.message,
          });
        }
      }
      setDraggingItem(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingItem?.fromLobby || !activeRoom || !user) return;
    
    const rect = floorPlanRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewTransform.x) / (cellSize * viewTransform.scale);
    const y = (e.clientY - rect.top - viewTransform.y) / (cellSize * viewTransform.scale);

    const cellX = Math.round(x);
    const cellY = Math.round(y);
    
    try {
        await allocateParentItem({
            itemId: draggingItem.id,
            roomId: activeRoom.id,
            x: cellX,
            y: cellY,
            userId: user.id
        });
        toast({ title: "Sucesso!", description: "Item alocado na planta baixa." });
        refreshData();
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Erro ao Alocar', description: error.message });
    } finally {
        setDraggingItem(null);
    }
  };


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.touches.length === 1) {
          setTouchState({ type: 'pan', lastPos: {x: e.touches[0].clientX, y: e.touches[0].clientY}, lastDist: 0 });
      } else if (e.touches.length === 2) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          setTouchState({ type: 'pinch', lastPos: { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 }, lastDist: dist });
      }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!touchState) return;

      if (e.touches.length === 1 && touchState.type === 'pan') {
          const dx = e.touches[0].clientX - touchState.lastPos.x;
          const dy = e.touches[0].clientY - touchState.lastPos.y;
          setViewTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
          setTouchState({ ...touchState, lastPos: { x: e.touches[0].clientX, y: e.touches[0].clientY }});
      } else if (e.touches.length === 2 && touchState.type === 'pinch') {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const midPoint = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
          const scaleChange = dist / touchState.lastDist;

          setViewTransform(prev => {
              const newScale = Math.max(0.2, Math.min(2.5, prev.scale * scaleChange));
              const rect = floorPlanRef.current!.getBoundingClientRect();
              const mouseX = midPoint.x - rect.left;
              const mouseY = midPoint.y - rect.top;

              const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
              const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
              return { x: newX, y: newY, scale: newScale };
          });
          setTouchState({ ...touchState, lastDist: dist, lastPos: midPoint });
      }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchState(null);
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: GridItem) => {
      e.stopPropagation();
      
      if (e.detail === 2) { 
        setEditingItem(item);
        return;
      }
      
      if (!floorPlanRef.current) return;
      
      const rect = floorPlanRef.current.getBoundingClientRect();
      const itemScreenX = item.x * cellSize * viewTransform.scale + viewTransform.x + rect.left;
      const itemScreenY = item.y * cellSize * viewTransform.scale + viewTransform.y + rect.top;

      const offsetX = e.clientX - itemScreenX;
      const offsetY = e.clientY - itemScreenY;
      
      setDraggingItem({ id: item.id, offsetX, offsetY, originalX: item.x, originalY: item.y });
  };
  
  const handleLobbyDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggingItem({ id: itemId, fromLobby: true, offsetX: 0, offsetY: 0, originalX: 0, originalY: 0 });
    e.dataTransfer.effectAllowed = 'move';
  };


  const handleItemDrag = (clientX: number, clientY: number) => {
    if (!draggingItem || !floorPlanRef.current) return;

    const rect = floorPlanRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newGridX = (mouseX - viewTransform.x - draggingItem.offsetX) / (cellSize * viewTransform.scale);
    const newGridY = (mouseY - viewTransform.y - draggingItem.offsetY) / (cellSize * viewTransform.scale);

    const newCellX = Math.round(newGridX);
    const newCellY = Math.round(newGridY);
    
    const updatedItems = gridItems.map(item => {
      if (item.id === draggingItem.id) {
        const clampedX = Math.max(0, Math.min(newCellX, GRID_COLS - 1));
        const clampedY = Math.max(0, Math.min(newCellY, GRID_ROWS - 1));
        return { ...item, x: clampedX, y: clampedY };
      }
      return item;
    });

    const activeBuilding = data.find(b => b.id === activeBuildingId);
    if (activeBuilding) {
        const updatedRooms = activeBuilding.rooms.map(r => r.id === activeRoomId ? { ...r, items: updatedItems } : r);
        const updatedBuilding = { ...activeBuilding, rooms: updatedRooms };
        setData(d => d.map(b => b.id === activeBuildingId ? updatedBuilding : b));
    }
  };

  const handleItemUpdate = () => {
    refreshData();
  };
  
  const handleItemAdded = () => {
    refreshData();
  };

  const handleItemDelete = () => {
    refreshData();
  };

  const resetView = () => setViewTransform({ x: 50, y: 50, scale: 1 });

  const GridItemComponent = ({ item }: { item: GridItem }) => {
    if (!tileDimensions.widthCm || !tileDimensions.heightCm) return null;

    let itemPixelWidth = 0;
    let itemPixelHeight = 0;
    let borderRadius = '0.25rem';

    if (item.shape === 'circle' && item.radiusM != null) {
        itemPixelWidth = (item.radiusM * 2) / (tileDimensions.widthCm / 100) * cellSize;
        itemPixelHeight = itemPixelWidth;
        borderRadius = '50%';
    } else if (item.widthM != null && item.heightM != null) {
        itemPixelWidth = (item.widthM / (tileDimensions.widthCm / 100)) * cellSize;
        itemPixelHeight = (item.heightM / (tileDimensions.heightCm / 100)) * cellSize;
    } else {
        return null;
    }

    const Icon = itemIcons[item.iconName || 'default'] || Box;
    const itemColor = item.color || item.itemTypeColor || '#cccccc';

    const currentStatus = statuses.find(s => s.id === item.status);
    const StatusIcon = statusIcons[currentStatus?.id || 'default'] || HelpCircle;
    const hasIncident = itemsWithIncidents.includes(item.id);
    
    return (
      <div
        className="absolute text-black p-1 flex flex-col items-center justify-center shadow-md active:cursor-grabbing border-2 border-neutral-700 bg-transparent transition-shadow"
        style={{
          left: item.x * cellSize,
          top: item.y * cellSize,
          width: itemPixelWidth,
          height: itemPixelHeight,
          borderRadius: borderRadius,
          cursor: isPanning ? 'grabbing' : 'grab',
          transformOrigin: 'top left',
          boxSizing: 'border-box',
          boxShadow: `inset 0 0 0 2px ${itemColor}`,
        }}
        onMouseDown={(e) => handleItemMouseDown(e, item)}
      >
        {item.status !== 'active' && (
          <div
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-white z-10"
            style={{ backgroundColor: getStatusColorHex(statuses, item.status) }}
          >
            <StatusIcon className="h-3 w-3" />
          </div>
        )}
        {hasIncident && (
           <div
            className="absolute -top-2 -left-2 h-5 w-5 rounded-full flex items-center justify-center text-white z-10 bg-red-600 animate-pulse"
          >
            <AlertTriangle className="h-3 w-3" />
          </div>
        )}
        <Icon className="w-4 h-4 mb-0.5 text-neutral-800" />
        <p className="text-[10px] leading-tight font-semibold text-center break-words text-neutral-800">{item.label}</p>
      </div>
    );
  };
  
  const toggleFullScreen = () => {
    if (!floorPlanRef.current) return;
    if (!document.fullscreenElement) {
      floorPlanRef.current.requestFullscreen().catch((err) => {
        toast({
          title: "Erro ao entrar em tela cheia",
          description: err.message,
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
    }
  };

  const allItems = React.useMemo(() => data.flatMap(b => b.rooms).flatMap(r => r.items), [data]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex-shrink-0 p-4 bg-card border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Footprint</h1>
          <div className="flex items-center gap-2">
            <Select value={activeRoomId ?? ''} onValueChange={setActiveRoomId} disabled={availableRooms.length === 0}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={availableRooms.length > 0 ? "Selecione uma sala" : "Nenhuma sala disponível"} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeRoom && hasPermission('page:buildings:view') && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditRoomOpen(true)}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Editar Sala</span>
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Slider
              value={[viewTransform.scale]}
              onValueChange={([val]) => setViewTransform(v => ({ ...v, scale: val }))}
              max={2.5}
              min={0.2}
              step={0.1}
              className="w-32"
            />
            <Button variant="outline" size="icon" onClick={resetView} title="Resetar Visualização"><RefreshCw/></Button>
            <Button variant="outline" size="icon" onClick={toggleFullScreen} title="Tela Cheia"><Maximize /></Button>
            <Button onClick={() => setIsAddItemOpen(true)} disabled={!activeRoom}>
                <Plus className="mr-2"/>Adicionar Item
            </Button>
        </div>
      </div>

      <div 
        ref={floorPlanRef}
        className="flex-grow w-full overflow-hidden bg-neutral-800 touch-none relative"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="absolute top-0 left-0"
          style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: 'top left' }}
        >
             <div className="relative bg-white shadow-2xl pointer-events-none" style={{ width: GRID_COLS * cellSize, height: GRID_ROWS * cellSize }}>
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                    const x = index % GRID_COLS;
                    const y = Math.floor(index / GRID_COLS);
                    return (
                        <div key={`cell-${x}-${y}`} className="absolute border-t border-l border-black/10 box-border flex items-center justify-center" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize }}>
                           <span className="text-xs text-gray-300 font-mono select-none">{getGridLabel(x, y, gridNaming.x, gridNaming.y)}</span>
                        </div>
                    );
                })}
                {Array.from({ length: GRID_COLS }).map((_, i) => <div key={`col-label-${i}`} className="absolute text-center font-bold text-gray-400" style={{ left: i * cellSize, top: -30, width: cellSize }}>{getGridLabel(i, -1, gridNaming.x, gridNaming.y)}</div>)}
                {Array.from({ length: GRID_ROWS }).map((_, i) => <div key={`row-label-${i}`} className="absolute text-center font-bold text-gray-400" style={{ top: i * cellSize, left: -40, height: cellSize, writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getGridLabel(-1, i, gridNaming.x, gridNaming.y)}</div>)}
             
                {exclusionZones.map(zone => (
                    <div
                        key={zone.id}
                        className="absolute bg-white"
                        style={{
                            left: zone.x * cellSize,
                            top: zone.y * cellSize,
                            width: zone.width * cellSize,
                            height: zone.height * cellSize,
                            zIndex: 1, 
                        }}
                    />
                ))}
             </div>

            {gridItems.map(item => <GridItemComponent key={item.id} item={item} />)}
        </div>
        <AllocationLobby items={unallocatedItems} onDragStart={handleLobbyDragStart} />
        
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="absolute bottom-4 right-4 z-10 rounded-full h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="p-4">
                    <h4 className="font-bold mb-2">Legenda</h4>
                    <ul className="space-y-2">
                        {statuses.map(status => {
                             const StatusIcon = statusIcons[status.id] || statusIcons.default;
                             return (
                                <li key={status.id} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colorMap[status.color] }}/>
                                    <StatusIcon className="h-4 w-4" style={{ color: colorMap[status.color] }}/>
                                    <span className="text-sm font-medium">{status.name}</span>
                                </li>
                            );
                        })}
                         <li className="flex items-center gap-2 pt-2 border-t">
                            <div className="h-3 w-3 rounded-full bg-red-600" />
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">Incidente Ativo</span>
                        </li>
                    </ul>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      </div>
      
       {editingItem && (
        <ItemDetailDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
          fullItemContext={{
            allItems: allItems,
          }}
          isFloorPlanContext={true}
        />
      )}

      {activeRoom && (
        <AddItemDialog
          room={activeRoom}
          open={isAddItemOpen}
          onOpenChange={setIsAddItemOpen}
          onItemAdded={handleItemAdded}
        />
      )}
      
      {activeRoom && (
        <ManageRoomDialog
          room={activeRoom}
          open={isEditRoomOpen}
          onOpenChange={setIsEditRoomOpen}
        />
      )}
    </div>
  );
}
