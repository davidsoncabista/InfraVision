

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Settings, X, Loader2, Database, Trash, Download, CheckCircle, FileCode, Package, Sparkles, Trash2, Info, History } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
    populateBaseEntities,
    softCleanTestData,
    hardCleanDevBuilding,
    populateRooms,
    populateparent_items,
    populatechild_items,
    populatePortsAndConnections
} from '@/lib/dev-actions';
import { clearAuditLog } from '@/lib/debug-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


type TaskName = 'clean' | 'hard_clean' | 'base' | 'rooms' | 'parent_items' | 'child_items' | 'ports' | 'clearLog';


export const DeveloperMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    const [auditLogEnabled, setAuditLogEnabled] = useLocalStorage('dev_auditLogEnabled', false);
    const [activeTask, setActiveTask] = useState<TaskName | null>(null);
    
    const handleTask = async (taskName: TaskName, taskFn: () => Promise<any>, successMessage: string) => {
        setActiveTask(taskName);
        try {
            await taskFn();
            toast({ title: 'Sucesso', description: successMessage });
        } catch (error: any) {
            toast({ title: `Erro ao executar: ${taskName}`, description: error.message, variant: 'destructive' });
        } finally {
            setActiveTask(null);
        }
    }
    
    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button size="icon" onClick={() => setIsOpen(true)} title="Menu do Desenvolvedor">
                    <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: '5s' }}/>
                </Button>
            </div>
        )
    }

    const isAnyTaskRunning = activeTask !== null;

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-96 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Dev Menu</CardTitle>
                    <CardDescription className="text-xs">Controles de desenvolvimento</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2 border-t pt-4">
                    <Label className="text-sm font-medium">Controles Gerais</Label>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="audit-log-switch" className="flex flex-col space-y-1">
                            <span>Log de Auditoria</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                               Ative para gravar e exibir ações no log.
                            </span>
                        </Label>
                        <Switch
                            id="audit-log-switch"
                            checked={auditLogEnabled}
                            onCheckedChange={setAuditLogEnabled}
                        />
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full mt-2" disabled={isAnyTaskRunning}>
                               {activeTask === 'clearLog' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                               Limpar Log de Auditoria
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação é irreversível e excluirá permanentemente **TODOS** os registros da tabela de auditoria.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleTask('clearLog', clearAuditLog, 'O log de auditoria foi limpo com sucesso.')}>
                                    Sim, limpar log
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Separator className="my-2"/>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Popular Dados de Teste (Fracionado)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => handleTask('base', populateBaseEntities, 'Usuários e Prédios de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'base' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "1."} Pop. Base
                        </Button>
                         <Button onClick={() => handleTask('rooms', populateRooms, 'Salas de teste criadas.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'rooms' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "2."} Pop. Salas
                        </Button>
                         <Button onClick={() => handleTask('parent_items', populateparent_items, 'Itens pais (racks) de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'parent_items' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "3."} Pop. Pais (Racks)
                        </Button>
                        <Button onClick={() => handleTask('child_items', populatechild_items, 'Itens filhos (equipamentos) de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'child_items' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "4."} Pop. Filhos (Eqp)
                        </Button>
                        <Button onClick={() => handleTask('ports', populatePortsAndConnections, 'Portas de equipamento e conexões de teste foram criadas.')} disabled={isAnyTaskRunning} className="col-span-2">
                            {activeTask === 'ports' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "5."} Pop. Conexões e Portas
                        </Button>
                    </div>
                </div>

            </CardContent>
            
            <Separator className="my-2"/>
            <CardFooter className="flex flex-col gap-2 !p-4">
                 <div className="grid w-full grid-cols-2 gap-2">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button variant="outline" onClick={() => handleTask('clean', softCleanTestData, 'Apenas os dados de teste gerados automaticamente foram removidos.')} disabled={isAnyTaskRunning} className="w-full">
                                    {activeTask === 'clean' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                                    Limpeza Leve
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                                <p>Apaga apenas os dados criados pelos scripts de população.</p>
                            </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                    
                    <AlertDialog>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isAnyTaskRunning} className="w-full">
                                            {activeTask === 'hard_clean' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Limpeza Pesada
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                    <p>Apaga TUDO dentro do "Prédio Dev".</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação é irreversível e excluirá permanentemente **TODOS** os itens (incluindo os criados manualmente) dentro do "Prédio Dev".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleTask('hard_clean', hardCleanDevBuilding, 'O Prédio Dev foi completamente limpo.')}>
                                    Sim, limpar tudo
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Button variant="outline" asChild className="w-full">
                    <a href="/infra_setup.sql" download>
                        <FileCode className="mr-2 h-4 w-4" />
                        Baixar Script de Infra (.sql)
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
