
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import type { AnalyzeImportInput } from '@/ai/flows/analyze-import-flow';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import type { ImportResult } from '@/lib/import-actions';

interface AnalysisReviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  data: any[];
  dataType: AnalyzeImportInput['dataType'];
  onConfirmImport: (editedData: any[]) => Promise<ImportResult>;
}

const DATA_TYPE_TITLES: Record<AnalyzeImportInput['dataType'], string> = {
  child_items: 'Revisão de Equipamentos Aninhados',
  parent_items: 'Revisão de Itens de Planta (Racks)',
  connections: 'Revisão de Conexões (De/Para)',
};

export function AnalysisReviewModal({ isOpen, onOpenChange, data, dataType, onConfirmImport }: AnalysisReviewModalProps) {
  const [editedData, setEditedData] = useState(data);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const headers = useMemo(() => {
    if (!editedData || editedData.length === 0) return [];
    return Object.keys(editedData[0]);
  }, [editedData]);

  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    const newData = [...editedData];
    // Converte para número se o campo for um dos numéricos conhecidos
    const numericFields = ['sizeu', 'posicao_u'];
    const lowerCaseHeader = header.toLowerCase();
    
    if(numericFields.includes(lowerCaseHeader)) {
        const numValue = value === '' ? null : Number(value);
        newData[rowIndex] = { ...newData[rowIndex], [header]: isNaN(numValue!) ? value : numValue };
    } else {
        newData[rowIndex] = { ...newData[rowIndex], [header]: value };
    }
    setEditedData(newData);
  };

  const handleRemoveRow = (rowIndex: number) => {
    const newData = editedData.filter((_, index) => index !== rowIndex);
    setEditedData(newData);
  };

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
        const result = await onConfirmImport(editedData);
        toast({
            title: "Importação Concluída!",
            description: `${result.successCount} de ${result.totalCount} itens foram importados com sucesso.`
        });
        if (result.errorCount > 0) {
            toast({
                variant: 'destructive',
                title: 'Erros na Importação',
                description: `${result.errorCount} itens não puderam ser importados. Verifique o console para detalhes.`
            })
        }
        onOpenChange(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Erro na Importação",
            description: error.message
        });
    } finally {
        setIsImporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            {DATA_TYPE_TITLES[dataType] || 'Revisão da Análise'}
          </DialogTitle>
          <DialogDescription>
            A IA analisou seu arquivo. Revise os dados abaixo, edite as células ou remova linhas antes de importar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
            <ScrollArea className="h-[50vh] border rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            {headers.map((header) => <TableHead key={header} className="capitalize">{header.replace(/_/g, ' ')}</TableHead>)}
                            <TableHead className="w-[50px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {editedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {headers.map(header => (
                                    <TableCell key={`${rowIndex}-${header}`} className="text-sm p-1">
                                        <Input 
                                            value={row[header] ?? ''} 
                                            onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="p-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(rowIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isImporting || editedData.length === 0}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Confirmar e Importar ({editedData.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
