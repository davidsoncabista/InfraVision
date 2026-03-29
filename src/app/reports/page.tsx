
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HardDrive, FileText, Download, Sparkles, Cable, Puzzle, Loader2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { exportData } from "./actions";
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { toast } = useToast();
  const [includeSignatures, setIncludeSignatures] = React.useState(true);
  const [selectedExport, setSelectedExport] = React.useState<string[]>(['parent_items', 'child_items', 'connections']);
  const [isExporting, setIsExporting] = React.useState(false);

  const toggleExportSelection = (item: string) => {
    setSelectedExport(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleExport = async () => {
      if (selectedExport.length === 0) {
        toast({ variant: 'destructive', title: "Nenhum dado selecionado", description: "Por favor, selecione pelo menos um tipo de dado para exportar."});
        return;
      }
      setIsExporting(true);
      try {
        const fileData = await exportData(selectedExport);
        if (fileData) {
            const wb = XLSX.read(fileData, { type: 'base64' });
            XLSX.writeFile(wb, "InfraVision_Export.xlsx");
            toast({ title: "Sucesso!", description: "Seu arquivo foi gerado e o download iniciado."});
        } else {
             toast({ variant: 'destructive', title: "Nenhum dado", description: "Não foram encontrados dados para os tipos selecionados." });
        }
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Erro na Exportação", description: error.message });
      } finally {
          setIsExporting(false);
      }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Relatórios</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText />
              Relatório Completo (PDF/Impressão)
            </CardTitle>
            <CardDescription>
              Gere um documento HTML com todos os dados, fotos e assinaturas, ideal para salvar como PDF ou imprimir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center space-x-2">
                <Checkbox id="include-signatures" checked={includeSignatures} onCheckedChange={(checked) => setIncludeSignatures(!!checked)} />
                <Label htmlFor="include-signatures">Incluir Assinaturas</Label>
            </div>
            <Button className="w-full" asChild>
                <Link href={`/reports/printable?signatures=${includeSignatures}`} target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório HTML
                </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Download />
                Exportar para Excel
            </CardTitle>
            <CardDescription>
              Exporte os dados brutos para usar em outros sistemas ou planilhas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Button 
                    variant={selectedExport.includes('parent_items') ? "secondary" : "outline"}
                    onClick={() => toggleExportSelection('parent_items')}
                    className="flex-1"
                >
                    <Puzzle className="mr-2 h-4 w-4" /> Itens
                </Button>
                 <Button 
                    variant={selectedExport.includes('child_items') ? "secondary" : "outline"}
                    onClick={() => toggleExportSelection('child_items')}
                    className="flex-1"
                >
                    <HardDrive className="mr-2 h-4 w-4" /> Equipamentos
                </Button>
                 <Button 
                    variant={selectedExport.includes('connections') ? "secondary" : "outline"}
                    onClick={() => toggleExportSelection('connections')}
                    className="flex-1"
                >
                    <Cable className="mr-2 h-4 w-4" /> Conexões
                </Button>
            </div>
             <Button className="w-full" disabled={isExporting} onClick={handleExport}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Exportar Selecionados (.xlsx)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles />
            Assistente de Relatórios IA
          </CardTitle>
          <CardDescription>
            Faça uma pergunta ou dê um comando para a IA gerar um relatório com base nas evidências coletadas na Central de Evidências.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="ia-prompt">Seu Comando (Prompt)</Label>
                <Textarea 
                    id="ia-prompt"
                    placeholder="Ex: 'Gere um resumo de todos os eventos de superaquecimento no último mês.' ou 'Liste todas as instalações de novos equipamentos em maio.'" 
                    rows={4}
                />
            </div>
             <Button className="mt-4">
                Gerar Relatório com IA
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}
