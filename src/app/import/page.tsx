
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, HardDrive, Puzzle, Link2, FileUp, Video, FileText, Bot, Sparkles, Loader2, Camera, CircleDot, VideoOff, Play, Square, ListChecks, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeImport } from '@/ai/flows/analyze-import-flow';
import type { AnalyzeImportInput } from '@/ai/flows/analyze-import-flow';
import { AnalysisReviewModal } from '@/components/import/analysis-review-modal';
import { importchild_items, importparent_items, importConnections } from '@/lib/import-actions';
import { useBuilding } from '@/components/building-provider';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertTitle as AlertTitleShadCN } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type DataType = AnalyzeImportInput['dataType'];

const DATA_TYPE_CONFIGS: Record<DataType, { title: string; description: string; placeholder: string; }> = {
    child_items: {
        title: "Opção 1: Importar Equipamentos Aninhados",
        description: "Cole dados de servidores, switches, etc. A IA espera colunas como: label;tipo;fabricante;modelo;n_serie;tamanhoU;rackPai.",
        placeholder: `Exemplo:\nSW-CORE-01;Switch;CISCO;Catalyst 9300;CAT123;1;RACK-A01\nSRV-WEB-02;Servidor;DELL;PowerEdge R740;DELL456;2;RACK-A01`
    },
    parent_items: {
        title: "Opção 1: Importar Itens de Planta",
        description: "Cole dados de Racks, QDFs, etc. A IA espera colunas como: label;tipo;localizacao.",
        placeholder: `Exemplo:\nRACK-B03;Rack 42U;A01\nQDF-01;QDF;B02`
    },
    connections: {
        title: "Opção 1: Importar Conexões (De/Para)",
        description: "Cole dados de conexões. A IA espera colunas como: de_equipamento;de_porta;para_equipamento;para_porta.",
        placeholder: `Exemplo:\nSW-CORE-01;GE-0/1;PATCH-A01-01;P01\nSW-CORE-01;GE-0/2;SRV-WEB-02;eth0`
    }
}


const ImportFromFileCard = ({ dataType, onAnalysisStart, onAnalysisComplete }: { dataType: DataType; onAnalysisStart: () => void; onAnalysisComplete: (data: any[]) => void; }) => {
    const { toast } = useToast();
    const [rawData, setRawData] = useState("");
    const [fileName, setFileName] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const config = DATA_TYPE_CONFIGS[dataType];
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setRawData(content);
            };
            reader.onerror = () => {
                toast({ variant: 'destructive', title: "Erro de Leitura", description: "Não foi possível ler o arquivo selecionado." });
            }
            reader.readAsText(file);
        }
    };

    const handleAnalyze = async () => {
        if (!rawData.trim()) {
            toast({ variant: 'destructive', title: "Dados Vazios", description: "Por favor, cole os dados ou selecione um arquivo para análise." });
            return;
        }

        setIsAnalyzing(true);
        onAnalysisStart();

        try {
            const result = await analyzeImport({ dataType, rawData });
            if (result.structuredData && Array.isArray(result.structuredData) && result.structuredData.length > 0) {
                 onAnalysisComplete(result.structuredData);
            } else {
                 toast({ variant: 'destructive', title: "Análise Inconclusiva", description: "A IA não conseguiu extrair dados estruturados. Verifique o conteúdo do arquivo." });
            }
           
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setIsAnalyzing(false);
        }
    }
    
    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText />
                    {config.title}
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor={`file-upload-${dataType}`}>Enviar Arquivo</Label>
                    <Input id={`file-upload-${dataType}`} type="file" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                    {fileName && <p className="text-xs text-muted-foreground">Arquivo selecionado: {fileName}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`paste-data-${dataType}`}>Ou Cole os Dados Aqui</Label>
                    <Textarea 
                      id={`paste-data-${dataType}`} 
                      placeholder={config.placeholder}
                      rows={5} 
                      value={rawData} 
                      onChange={(e) => setRawData(e.target.value)}
                    />
                </div>
                 <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analisar com IA
                </Button>
            </CardContent>
        </Card>
    );
};

const ImportFromVideoCard = ({ dataType, onAnalysisStart, onAnalysisComplete, aggregatedResults, onReview }: { dataType: DataType; onAnalysisStart: () => void; onAnalysisComplete: (data: any[]) => void; aggregatedResults: any[], onReview: () => void }) => {
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const openCamera = useCallback(async (deviceId: string = '') => {
        // Stop any existing stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setIsCameraOpen(true);
        setCameraError(null);

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = devices.filter(d => d.kind === 'videoinput');
            setVideoDevices(videoDevs);
            
            const selectedId = deviceId || (videoDevs.find(d => d.label.toLowerCase().includes('back'))?.deviceId) || videoDevs[0]?.deviceId;
            setSelectedDeviceId(selectedId);

            if (!selectedId) {
                setCameraError("Nenhuma câmera encontrada.");
                return;
            }

            const constraints: MediaStreamConstraints = {
                video: { deviceId: { exact: selectedId } }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            setCameraError("Permissão para acessar a câmera foi negada ou o dispositivo não foi encontrado.");
        }
    }, []);
    
    const stopScanner = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsScannerActive(false);
    }, []);

    const closeCamera = useCallback(() => {
        stopScanner();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    }, [stopScanner]);

    const handleAnalyzeFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzingFrame) {
            return;
        }
        
        setIsAnalyzingFrame(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setIsAnalyzingFrame(false);
            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURI = canvas.toDataURL('image/jpeg');
        
        try {
            const result = await analyzeImport({ dataType, imageDataUri: dataURI });
            if (result.structuredData && Array.isArray(result.structuredData) && result.structuredData.length > 0) {
                 onAnalysisComplete(result.structuredData);
            }
        } catch (error: any) {
            console.error("Erro na análise do frame:", error.message);
        } finally {
            setIsAnalyzingFrame(false);
        }
    }, [dataType, isAnalyzingFrame, onAnalysisComplete]);
    
    const startScanner = () => {
        onAnalysisStart();
        setIsScannerActive(true);
        handleAnalyzeFrame(); // Analisa o primeiro frame imediatamente
        intervalRef.current = setInterval(handleAnalyzeFrame, 2000);
    };

    const handleReviewClick = () => {
        closeCamera();
        onReview();
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    return (
        <>
            <Card className="border-primary/50 ring-1 ring-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Video className="text-primary"/>
                        Opção 2: Scanner de Vídeo
                    </CardTitle>
                    <CardDescription>Aponte a câmera para um rack ou patch panel para uma análise contínua em tempo real.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                     <Button size="lg" onClick={() => openCamera()}>
                        <Bot className="mr-2 h-4 w-4"/>
                        Iniciar Scanner
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
                <AlertDialogContent className="max-w-5xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Scanner de Vídeo Ativo</AlertDialogTitle>
                    <AlertDialogDescription>
                        Aponte a câmera para as etiquetas. A IA irá capturar e agregar os dados automaticamente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2 relative w-full aspect-video bg-black rounded-md flex items-center justify-center">
                            {cameraError ? (
                                 <Alert variant="destructive" className="m-4">
                                    <VideoOff className="h-4 w-4" />
                                    <AlertTitleShadCN>Erro na Câmera</AlertTitleShadCN>
                                    <AlertDescription>{cameraError}</AlertDescription>
                                </Alert>
                            ) : (
                                <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
                            )}
                            <canvas ref={canvasRef} className="hidden" />

                            {isScannerActive && (
                                 <div className="absolute bottom-2 left-2 flex items-center gap-2 p-2 bg-black/50 rounded-md">
                                    {isAnalyzingFrame ? <Loader2 className="h-4 w-4 animate-spin text-white"/> : <Camera className="h-4 w-4 text-green-400"/>}
                                    <span className="text-xs font-medium text-white">{isAnalyzingFrame ? 'Analisando...' : 'Scanner Ativo'}</span>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-1 h-[60vh] md:h-auto max-h-[60vh] flex flex-col gap-2">
                             <div className="space-y-1.5">
                                <Label htmlFor="camera-select">Câmera</Label>
                                <Select value={selectedDeviceId} onValueChange={openCamera} disabled={videoDevices.length <= 1}>
                                    <SelectTrigger id="camera-select"><SelectValue placeholder="Selecione uma câmera..." /></SelectTrigger>
                                    <SelectContent>
                                        {videoDevices.map(device => <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Câmera ${device.deviceId.substring(0, 6)}`}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             </div>
                             <h4 className="font-semibold text-sm">Itens Capturados ({aggregatedResults.length})</h4>
                            <ScrollArea className="flex-grow border rounded-md p-2 bg-muted/40">
                               {aggregatedResults.length === 0 ? (
                                   <p className="text-xs text-center text-muted-foreground py-4">Aguardando resultados...</p>
                               ) : (
                                   <ul className="space-y-1">
                                       {aggregatedResults.map((item, index) => (
                                           <li key={index} className="text-xs p-1 bg-background rounded-sm truncate">
                                               {item.label || item.from_equipment || 'Item sem nome'}
                                           </li>
                                       ))}
                                   </ul>
                               )}
                            </ScrollArea>
                             <Button onClick={handleReviewClick} disabled={aggregatedResults.length === 0 || isScannerActive}>
                                <ListChecks className="mr-2 h-4 w-4" />
                                Revisar e Importar
                            </Button>
                        </div>
                    </div>
                <AlertDialogFooter className="mt-4">
                    <Button variant="secondary" onClick={closeCamera}>Fechar</Button>
                    {!isScannerActive ? (
                         <Button onClick={startScanner} disabled={!!cameraError}>
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar Análise
                        </Button>
                    ) : (
                         <Button variant="destructive" onClick={stopScanner}>
                            <Square className="mr-2 h-4 w-4" />
                            Parar Análise
                        </Button>
                    )}
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<DataType>('child_items');
  const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);
  const [aggregatedResults, setAggregatedResults] = useState<any[]>([]);
  const { activebuilding_id } = useBuilding();
  const { toast } = useToast();

  const handleAnalysisResult = (newData: any[]) => {
    setAggregatedResults(prev => {
        // Usa uma chave mais genérica para desduplicação
        const existingKeys = new Set(prev.map(item => item.label || item.from_equipment));
        const uniqueNewItems = newData.filter(item => {
            const newKey = item.label || item.from_equipment;
            return newKey && !existingKeys.has(newKey);
        });
        
        if (uniqueNewItems.length > 0) {
            toast({
                title: `${uniqueNewItems.length} novo(s) item(ns) encontrado(s)!`,
                description: "Continue escaneando ou revise a lista para importar.",
            });
        }
        
        return [...prev, ...uniqueNewItems];
    });
  };
  
  const handleOpenReviewModal = () => {
      if (aggregatedResults.length === 0) {
          toast({ variant: 'destructive', title: "Nenhum item para revisar", description: "Use uma das opções de análise para adicionar itens à lista." });
          return;
      }
      setAnalysisResult(aggregatedResults);
  }

  const handleClearAggregatedResults = () => {
      setAggregatedResults([]);
      setAnalysisResult(null);
  }
  
  const handleOnModalOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
          setAnalysisResult(null);
      }
  }

  const handleTabChange = (value: string) => {
      setActiveTab(value as DataType);
      handleClearAggregatedResults();
  }

  const getImportFunction = () => {
    switch(activeTab) {
        case 'child_items':
            return (data: any[]) => importchild_items(data, activebuilding_id);
        case 'parent_items':
            return (data: any[]) => importparent_items(data);
        case 'connections':
            return (data: any[]) => importConnections(data, activebuilding_id);
        default:
            return async () => { 
                throw new Error("Tipo de importação não suportado ainda.");
            };
    }
  }

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Assistente de Importação com IA</h1>
        {aggregatedResults.length > 0 && (
            <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={handleClearAggregatedResults}>
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Limpar Lista ({aggregatedResults.length})
                </Button>
                <Button onClick={handleOpenReviewModal}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Revisar e Importar Itens
                </Button>
            </div>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload />
            Central de Importação e Captura
          </CardTitle>
          <CardDescription>
            Selecione o tipo de dado que deseja importar para o prédio ativo. A IA irá auxiliar no processo de upload de arquivos ou captura por vídeo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="child_items">
                <HardDrive className="mr-2 h-4 w-4"/>
                Equipamentos Aninhados
              </TabsTrigger>
              <TabsTrigger value="parent_items">
                 <Puzzle className="mr-2 h-4 w-4"/>
                 Itens de Planta (Racks)
              </TabsTrigger>
              <TabsTrigger value="connections">
                 <Link2 className="mr-2 h-4 w-4"/>
                 Conexões (De/Para)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="child_items" className="mt-6">
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <ImportFromFileCard dataType="child_items" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} />
                    <ImportFromVideoCard dataType="child_items" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} aggregatedResults={aggregatedResults} onReview={handleOpenReviewModal} />
                </div>
            </TabsContent>
            
            <TabsContent value="parent_items" className="mt-6">
                 <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <ImportFromFileCard dataType="parent_items" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} />
                    <ImportFromVideoCard dataType="parent_items" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} aggregatedResults={aggregatedResults} onReview={handleOpenReviewModal} />
                </div>
            </TabsContent>

            <TabsContent value="connections" className="mt-6">
                 <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <ImportFromFileCard dataType="connections" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} />
                    <ImportFromVideoCard dataType="connections" onAnalysisStart={handleClearAggregatedResults} onAnalysisComplete={handleAnalysisResult} aggregatedResults={aggregatedResults} onReview={handleOpenReviewModal} />
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    
    <AnalysisReviewModal
        isOpen={!!analysisResult}
        onOpenChange={handleOnModalOpenChange}
        data={analysisResult || []}
        dataType={activeTab}
        onConfirmImport={async (editedData) => {
            const result = await getImportFunction()(editedData);
            handleClearAggregatedResults();
            return result;
        }}
    />
    </>
  );
}
