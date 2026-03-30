
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Cable, HardDrive, Puzzle, Loader2, Link, Unlink, Camera, ChevronDown, WifiOff, Search, Info, ArrowUpDown } from 'lucide-react';
import { getConnectablechild_items, getPortsByChildItemId, createConnection, EquipmentPort, ConnectionDetail, getAllConnections, disconnectConnection } from '@/lib/connection-actions';
import { getConnectionTypes, ConnectionType } from '@/lib/connection-types-actions';
import type { ConnectableItem } from '@/lib/connection-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddConnectionDialog } from '@/components/depara/add-connection-dialog';
import { usePermissions } from '@/components/permissions-provider';
import { useBuilding } from '@/components/building-provider';
import { Input } from '../ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';


const PortList = ({
    ports,
    selectedPortId,
    onPortSelect,
    isLoading,
    side
}: {
    ports: EquipmentPort[];
    selectedPortId: string | null;
    onPortSelect: (portId: string) => void;
    isLoading: boolean;
    side: 'A' | 'B';
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    if (ports.length === 0) {
        return (
            <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma porta encontrada para este equipamento.
            </p>
        );
    }

    return (
        <ScrollArea className="h-56 pr-3">
             <RadioGroup value={selectedPortId || ""} onValueChange={onPortSelect} className="space-y-2">
                {ports.map(port => {
                    const isDisabled = !!port.connectedToPortId;
                    const id = `port-${side}-${port.id}`;
                    return (
                        <div key={id} className="flex items-center">
                            <RadioGroupItem value={port.id} id={id} disabled={isDisabled} />
                             <Label htmlFor={id} className={cn("ml-2 flex justify-between items-center w-full p-2 rounded-md", isDisabled ? "cursor-not-allowed text-muted-foreground/50 bg-muted/20" : "cursor-pointer hover:bg-muted/50")}>
                                <span>{port.label} <span className="text-xs text-muted-foreground">({port.port_typeName})</span></span>
                                {isDisabled && <span className="text-xs text-red-500/70">Ocupada</span>}
                            </Label>
                        </div>
                    )
                })}
            </RadioGroup>
        </ScrollArea>
    )
}

type SortableKeys = keyof ConnectionDetail;

export function DeParaClient() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = usePermissions();
    const { activebuildingid } = useBuilding();

    const [isLoading, setIsLoading] = useState(true);
    const [connectableItems, setConnectableItems] = useState<ConnectableItem[]>([]);
    const [connections, setConnections] = useState<ConnectionDetail[]>([]);
    const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);

    const [sideA, setSideA] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });
    const [sideB, setSideB] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });
    const [connection_type_id, setconnection_type_id] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

    // Estados para filtragem e ordenação da tabela de conexões
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' } | null>({ key: 'itemA_label', direction: 'ascending' });
    const [connectionToDisconnect, setConnectionToDisconnect] = useState<ConnectionDetail | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);


    const fetchData = useCallback(async () => {
        if (!activebuildingid) {
            setIsLoading(false);
            setConnectableItems([]);
            setConnections([]);
            return;
        }
        setIsLoading(true);
        try {
            const [itemsData, connectionsData, typesData] = await Promise.all([
                getConnectablechild_items(activebuildingid),
                getAllConnections(activebuildingid),
                getConnectionTypes(),
            ]);
            setConnectableItems(itemsData);
            setConnections(connectionsData);
            setConnectionTypes(typesData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar os dados do prédio selecionado.' });
        } finally {
            setIsLoading(false);
        }
    }, [activebuildingid, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const sortedItems = useMemo(() => {
        return [...connectableItems].sort((a, b) => a.label.localeCompare(b.label));
    }, [connectableItems]);
    
    // Filtra a lista de equipamentos disponíveis para cada lado, evitando auto-conexão.
    const sideAOptions = useMemo(() => sideB.itemId ? sortedItems.filter(item => item.id !== sideB.itemId) : sortedItems, [sortedItems, sideB.itemId]);
    const sideBOptions = useMemo(() => sideA.itemId ? sortedItems.filter(item => item.id !== sideA.itemId) : sortedItems, [sortedItems, sideA.itemId]);

    useEffect(() => {
        if (sideA.itemId) {
            setSideA(s => ({ ...s, isLoading: true, portId: null, ports: [] }));
            getPortsByChildItemId(sideA.itemId).then(ports => {
                setSideA(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideA.itemId]);

    useEffect(() => {
        if (sideB.itemId) {
            setSideB(s => ({ ...s, isLoading: true, portId: null, ports: [] }));
            getPortsByChildItemId(sideB.itemId).then(ports => {
                setSideB(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideB.itemId]);


    const handleQuickConnect = async () => {
        if (!user || !connection_type_id || !sideA.portId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione pelo menos a Origem (Lado A) e o tipo de conexão.' });
            return;
        }

        setIsCreating(true);
        try {
            await createConnection({
                port_a_id: sideA.portId,
                port_b_id: sideB.portId,
                connection_type_id,
                user_id: user.id
            });
            toast({
                title: 'Sucesso!',
                description: 'A conexão rápida foi estabelecida.',
            });
            resetForm();
            fetchData(); 
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao conectar',
                description: error.message,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDisconnect = async () => {
        if (!connectionToDisconnect || !user) return;
        setIsDisconnecting(true);
        try {
            await disconnectConnection(connectionToDisconnect.id, user.id);
            toast({ title: "Sucesso!", description: "A conexão foi desfeita."});
            setConnectionToDisconnect(null);
            fetchData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro ao desconectar', description: error.message });
        } finally {
            setIsDisconnecting(false);
        }
    }

    const resetForm = () => {
        setSideA({ itemId: null, portId: null, ports: [], isLoading: false });
        setSideB({ itemId: null, portId: null, ports: [], isLoading: false });
        setconnection_type_id(null);
    }
    
    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };


    const filteredAndSortedConnections = useMemo(() => {
        let filtered = connections
            .filter(conn => statusFilter === 'all' || conn.status === statusFilter)
            .filter(conn => typeFilter === 'all' || conn.connection_type_id === typeFilter)
            .filter(conn => {
                const term = searchTerm.toLowerCase();
                return (
                    conn.itemA_label.toLowerCase().includes(term) ||
                    conn.portA_label.toLowerCase().includes(term) ||
                    (conn.itemB_label || '').toLowerCase().includes(term) ||
                    (conn.portB_label || '').toLowerCase().includes(term) ||
                    (conn.itemA_parentName || '').toLowerCase().includes(term) ||
                    (conn.itemB_parentName || '').toLowerCase().includes(term)
                );
            });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [connections, searchTerm, statusFilter, typeFilter, sortConfig]);


    const selectedItemA = connectableItems.find(i => i.id === sideA.itemId);
    const selectedItemB = connectableItems.find(i => i.id === sideB.itemId);
    
    const canConnectWithEvidence = sideA.portId && sideB.portId && connection_type_id && !isCreating;
    const canQuickConnect = sideA.portId && connection_type_id && !isCreating;
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
    }

    if (!activebuildingid) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
                <p className="font-semibold text-muted-foreground">Selecione um prédio</p>
                <p className="text-sm text-muted-foreground/80">
                    Escolha um prédio no seletor do cabeçalho para gerenciar as conexões.
                </p>
            </div>
        )
    }

    return (
        <TooltipProvider>
        <>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold font-headline">De/Para de Conexões</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Mapeamento de Conexões Físicas</CardTitle>
                        <CardDescription>
                            Selecione um equipamento em cada lado, suas respectivas portas e o tipo de conexão.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
                        {/* Coluna Lado A (Origem) */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Origem (Lado A)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select onValueChange={(value) => setSideA(s => ({ ...s, itemId: value }))} value={sideA.itemId || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o equipamento de origem..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sideAOptions.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.label} ({item.parentName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                
                                {selectedItemA && (
                                    <div className="p-4 border rounded-md bg-muted/50 min-h-[250px]">
                                       <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                            <HardDrive className="h-4 w-4" />
                                            <span>{selectedItemA.label}</span>
                                            <span className="text-xs">/</span>
                                            <Puzzle className="h-4 w-4" />
                                            <span>{selectedItemA.parentName}</span>
                                       </div>
                                        <PortList 
                                            ports={sideA.ports} 
                                            isLoading={sideA.isLoading} 
                                            selectedPortId={sideA.portId} 
                                            onPortSelect={(portId) => setSideA(s => ({...s, portId}))}
                                            side="A"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
    
                        {/* Ícone e Seletor de Conexão */}
                        <div className="flex flex-col items-center justify-start pt-16 gap-4">
                             <Button variant="ghost" size="icon" className="h-12 w-12" disabled>
                                <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                            </Button>
                             <Select onValueChange={setconnection_type_id} value={connection_type_id || ''}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Tipo de Conexão..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {connectionTypes.map(type => (
                                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
    
                        {/* Coluna Lado B (Destino) */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Destino (Lado B)</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <Select onValueChange={(value) => setSideB(s => ({ ...s, itemId: value }))} value={sideB.itemId || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o equipamento de destino..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sideBOptions.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.label} ({item.parentName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
    
                                 {selectedItemB && (
                                    <div className="p-4 border rounded-md bg-muted/50 min-h-[250px]">
                                       <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                            <HardDrive className="h-4 w-4" />
                                            <span>{selectedItemB.label}</span>
                                            <span className="text-xs">/</span>
                                            <Puzzle className="h-4 w-4" />
                                            <span>{selectedItemB.parentName}</span>
                                       </div>
                                        <PortList 
                                            ports={sideB.ports} 
                                            isLoading={sideB.isLoading} 
                                            selectedPortId={sideB.portId} 
                                            onPortSelect={(portId) => setSideB(s => ({...s, portId}))}
                                            side="B"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardContent className="flex justify-center border-t pt-6">
                        <div className="inline-flex rounded-md shadow-sm">
                            <Button
                                size="lg"
                                onClick={() => setIsAdvancedModalOpen(true)}
                                disabled={!canConnectWithEvidence}
                                className="rounded-r-none"
                            >
                                {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Cable className="mr-2 h-5 w-5"/>}
                                Conectar com Evidência
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="lg" variant="outline" className="rounded-l-none px-3" disabled={isCreating}>
                                        <ChevronDown className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleQuickConnect} disabled={!canQuickConnect}>
                                        Conexão Rápida (Unilateral)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
    
                <Card>
                    <CardHeader>
                        <CardTitle>Conexões Ativas</CardTitle>
                        <CardDescription>
                           Visualize e gerencie todas as conexões físicas no prédio selecionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por equipamento, rack ou porta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Tipos</SelectItem>
                                    {connectionTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="active">Ativas</SelectItem>
                                    <SelectItem value="unresolved">Não Resolvidas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('itemA_label')} className="group px-0">Origem (A) {getSortIndicator('itemA_label')}</Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('itemB_label')} className="group px-0">Destino (B) {getSortIndicator('itemB_label')}</Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('connectionType')} className="group px-0">Tipo {getSortIndicator('connectionType')}</Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('status')} className="group px-0">Status {getSortIndicator('status')}</Button>
                                        </TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedConnections.length > 0 ? (
                                        filteredAndSortedConnections.map(conn => (
                                            <TableRow key={conn.id}>
                                                <TableCell>
                                                    <div className="font-semibold text-sm">{conn.itemA_label}</div>
                                                    <div className="text-xs text-muted-foreground">Rack: {conn.itemA_parentName || 'N/A'} / Porta: <span className="font-mono">{conn.portA_label}</span></div>
                                                </TableCell>
                                                 <TableCell>
                                                    {conn.itemB_label && conn.portB_label ? (
                                                         <>
                                                            <div className="font-semibold text-sm">{conn.itemB_label}</div>
                                                            <div className="text-xs text-muted-foreground">Rack: {conn.itemB_parentName || 'N/A'} / Porta: <span className="font-mono">{conn.portB_label}</span></div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">Não resolvido</span>
                                                    )}
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{conn.connectionType}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={conn.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">{conn.status}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => setConnectionToDisconnect(conn)} disabled={isDisconnecting || conn.status === 'unresolved'}>
                                                                {isDisconnecting && connectionToDisconnect?.id === conn.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Unlink className="h-4 w-4" />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Desconectar</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                     <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" disabled={!conn.image_url}>
                                                                <Camera className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {conn.image_url ? <img src={conn.image_url} alt="Evidência" className="h-48 w-auto rounded-md" data-ai-hint="cable connection"/> : <p>Sem evidência fotográfica</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                         <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Nenhuma conexão encontrada com os filtros atuais.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {canConnectWithEvidence && (
                <AddConnectionDialog
                    isOpen={isAdvancedModalOpen}
                    onOpenChange={setIsAdvancedModalOpen}
                    sideA={{ item: selectedItemA!, port: sideA.ports.find(p => p.id === sideA.portId)! }}
                    sideB={{ item: selectedItemB!, port: sideB.ports.find(p => p.id === sideB.portId)! }}
                    connection_type_id={connection_type_id!}
                    connectionTypeName={connectionTypes.find(c => c.id === connection_type_id)?.name || ''}
                    onSuccess={() => {
                        resetForm();
                        fetchData();
                    }}
                />
            )}
            <AlertDialog open={!!connectionToDisconnect} onOpenChange={() => setConnectionToDisconnect(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Desconexão?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você tem certeza que deseja desconectar a porta <span className="font-bold">{connectionToDisconnect?.portA_label}</span> de <span className="font-bold">{connectionToDisconnect?.itemA_label}</span> e a porta <span className="font-bold">{connectionToDisconnect?.portB_label}</span> de <span className="font-bold">{connectionToDisconnect?.itemB_label}</span>? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDisconnecting}>
                        {isDisconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Sim, Desconectar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
        </TooltipProvider>
    );
}
