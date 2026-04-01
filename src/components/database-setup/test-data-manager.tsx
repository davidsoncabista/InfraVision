'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { populateTestData, clearTestData, countTestData } from '@/lib/test-data-actions';
import { Badge } from '@/components/ui/badge';

export function TestDataManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [testDataCount, setTestDataCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar count ao montar
  const refreshCount = async () => {
    setIsLoading(true);
    try {
      const count = await countTestData();
      setTestDataCount(count);
    } catch (error) {
      console.error('Erro ao contar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulate = () => {
    startTransition(async () => {
      try {
        const result = await populateTestData();
        setTestDataCount((prev) => prev + result.totalItems);
        toast({
          title: 'Sucesso!',
          description: `Dados de teste criados: ${result.buildingsCreated} prédios, ${result.roomsCreated} salas, ${result.racksCreated} racks, ${result.equipmentCreated} equipamentos.`,
          variant: 'default',
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao Popular Dados',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      try {
        const result = await clearTestData();
        setTestDataCount(0);
        toast({
          title: 'Sucesso!',
          description: `${result.itemsDeleted} itens de teste foram removidos.`,
          variant: 'default',
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao Limpar Dados',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciador de Dados de Teste
        </CardTitle>
        <CardDescription>
          Popule ou limpe dados de teste sem afetar dados reais. Os dados de teste podem ser identificados pelo prefixo "TEST_AUTO_".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testDataCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dados de Teste Existentes</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Há <Badge>{testDataCount} itens</Badge> de teste no banco de dados.
              </span>
              <Button variant="ghost" size="sm" onClick={refreshCount} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handlePopulate}
            disabled={isPending}
            className="flex items-center gap-2"
            size="lg"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Popula com Dados de Teste
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isPending || testDataCount === 0}
                size="lg"
                className="flex items-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Limpar Dados de Teste
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar Dados de Teste?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a remover {testDataCount} itens de teste do banco de dados. Esta ação é irreversível. Apenas dados marcados com prefixo "TEST_AUTO_" serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-destructive">
                  Sim, limpar dados
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Estrutura de Dados de Teste</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li><strong>2 Prédios</strong> de teste</li>
              <li><strong>3 Salas</strong> em cada prédio (6 salas total)</li>
              <li><strong>2 Racks</strong> em cada sala (12 racks total)</li>
              <li><strong>3 Equipamentos</strong> em cada rack (36 equipamentos total)</li>
              <li>Total: <strong>56 itens</strong> de teste</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
