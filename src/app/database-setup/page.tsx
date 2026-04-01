'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllTables, clearAuditLog } from "@/lib/debug-actions";
import { CheckCircle, AlertCircle, Database, Server, ListTree, Loader2, BrickWall, Trash2, History, Download, FileCode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TestDataManager } from "@/components/database-setup/test-data-manager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ColumnInfo {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  IS_NULLABLE: 'YES' | 'NO';
}

interface TableWithColumns {
    name: string;
    columns: ColumnInfo[];
}

export default function DatabaseSetupPage() {
  const [schemaResult, setSchemaResult] = useState<{ success: boolean; data: ColumnInfo[] | null; error: string | null } | null>(null);
  const [isSchemaPending, startSchemaTransition] = useTransition();
  const [isLogClearing, startLogClearingTransition] = useTransition();
  const { toast } = useToast();

  const handleListTables = () => {
    startSchemaTransition(async () => {
        const result = await listAllTables();
        setSchemaResult(result);
    });
  }

  const handleClearLog = () => {
    startLogClearingTransition(async () => {
      try {
        await clearAuditLog();
        toast({
          title: "Sucesso!",
          description: "O log de auditoria foi limpo.",
          variant: "default",
        });
      } catch (e: any) {
        toast({
          title: "Erro ao Limpar Log",
          description: e.message,
          variant: "destructive",
        });
      }
    });
  }

  const tablesWithColumns = useMemo(() => {
    if (!schemaResult?.success || !schemaResult.data) {
      return [];
    }
    const tablesMap = new Map<string, TableWithColumns>();
    for (const column of schemaResult.data) {
      if (!tablesMap.has(column.TABLE_NAME)) {
        tablesMap.set(column.TABLE_NAME, { name: column.TABLE_NAME, columns: [] });
      }
      tablesMap.get(column.TABLE_NAME)!.columns.push(column);
    }
    // Ordena as tabelas em ordem alfabética
    return Array.from(tablesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [schemaResult]);


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Hub do Banco de Dados (PostgreSQL / PostgREST)</h1>
      
      <TestDataManager />
      
      <Card>
        <CardHeader>
          <CardTitle>Inspetor de Schema (OpenAPI)</CardTitle>
          <CardDescription>
            Busca a estrutura do banco de dados através da definição OpenAPI exposta pelo PostgREST.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleListTables} disabled={isSchemaPending}>
                {isSchemaPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Inspecionar Recursos da API
            </Button>

            {schemaResult && (
                schemaResult.success && tablesWithColumns.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                       {tablesWithColumns.map(table => (
                        <AccordionItem value={table.name} key={table.name}>
                             <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <BrickWall className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-base">/{table.name}</span>
                                    <Badge variant="outline">{table.columns.length} campos</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="overflow-x-auto border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Campo</TableHead>
                                                <TableHead>Tipo de Dado</TableHead>
                                                <TableHead>Nulo?</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {table.columns.map(col => (
                                                <TableRow key={col.COLUMN_NAME}>
                                                    <TableCell className="font-mono">{col.COLUMN_NAME}</TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {col.DATA_TYPE}
                                                        {col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}
                                                    </TableCell>
                                                    <TableCell>{col.IS_NULLABLE === 'YES' ? 'Sim' : 'Não'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                       ))}
                    </Accordion>
                ) : schemaResult.error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Falha ao Inspecionar API</AlertTitle>
                        <AlertDescription>
                            <p>Ocorreu um erro ao tentar buscar as definições de recursos do PostgREST.</p>
                            <pre className="mt-2 p-2 bg-destructive/10 rounded-md text-xs font-mono">
                                {schemaResult.error}
                            </pre>
                        </AlertDescription>
                    </Alert>
                ) : null
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Limpeza de Dados</CardTitle>
            <CardDescription>
                Ações para manutenção rápida do banco de dados.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLogClearing}>
                        {isLogClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                        Limpar Log de Auditoria
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é irreversível e excluirá permanentemente os registros do recurso /auditlog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLog}>
                            Sim, limpar log
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
            <CardTitle>Referência de Schema</CardTitle>
            <CardDescription>
                Baixe os scripts SQL utilizados na migração para referência local.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                    <a href="/infra_setup.sql" download>
                        <FileCode className="mr-2 h-4 w-4" />
                        Baixar Script PostgreSQL (.sql)
                    </a>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}