
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage-actions';
import { Loader2, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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


export function TestUploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadedUrl(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'Nenhum arquivo selecionado',
                description: 'Por favor, escolha um arquivo para fazer o upload.',
            });
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const compressedDataURI = await resizeAndCompressImage(file);
             if (!compressedDataURI) {
                throw new Error("Falha ao otimizar a imagem.");
            }
            
            const blobName = `test-upload-${Date.now()}.jpg`;
            const url = await uploadImage(compressedDataURI, blobName);
            
            setUploadedUrl(url);
            toast({
                title: 'Upload Concluído!',
                description: 'Sua imagem foi enviada com sucesso.',
            });

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido durante o upload.');
            toast({
                variant: 'destructive',
                title: 'Erro de Upload',
                description: err.message || 'Não foi possível enviar a imagem.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Teste de Upload para o Azure Blob Storage</CardTitle>
                <CardDescription>
                    Selecione uma imagem e clique em "Enviar" para testar a conexão com o Azure Storage. A imagem será otimizada antes do envio.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} disabled={isUploading} />
                
                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Enviar Imagem
                        </>
                    )}
                </Button>
                
                {uploadedUrl && (
                    <Alert variant="default">
                        <LinkIcon className="h-4 w-4" />
                        <AlertTitle>Sucesso!</AlertTitle>
                        <AlertDescription className="break-all">
                           URL da Imagem: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">{uploadedUrl}</a>
                           <img src={uploadedUrl} alt="Preview do Upload" className="mt-2 rounded-md border max-w-full h-auto" />
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
