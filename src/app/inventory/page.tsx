
"use client";

import * as React from 'react';
import { getInventoryData } from "@/lib/inventory-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parent_itemsTable } from "@/components/inventory/parent-items-table";
import { child_itemsTable } from "@/components/inventory/child-items-table";
import { HardDrive, Puzzle, Loader2 } from "lucide-react";
import { useBuilding } from '@/components/building-provider';
import type { GridItem } from '@/types/datacenter';
import type { ItemStatus } from '@/lib/status-actions';

interface InventoryData {
  parent_items: GridItem[];
  child_items: GridItem[];
  allItems: GridItem[];
  statuses: ItemStatus[];
}

export default function InventoryPage() {
  const { activebuildingid } = useBuilding();
  const [inventoryData, setInventoryData] = React.useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (activebuildingid) {
      setIsLoading(true);
      getInventoryData(activebuildingid)
        .then(setInventoryData)
        .finally(() => setIsLoading(false));
    } else {
      // Se nenhum prédio estiver selecionado (pode acontecer durante o carregamento inicial)
      setIsLoading(false);
      setInventoryData(null);
    }
  }, [activebuildingid]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Equipamentos</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      ) : !inventoryData ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Prédio Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Por favor, selecione um prédio no menu superior para visualizar o inventário.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bloco para Equipamentos Aninhados (Filhos) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <HardDrive className="h-6 w-6" />
                <CardTitle>Equipamentos Aninhados</CardTitle>
              </div>
              <CardDescription>
                Servidores, switches, patch panels e outros dispositivos que residem dentro de um item pai (como um rack).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <child_itemsTable items={inventoryData.child_items} allItems={inventoryData.allItems} statuses={inventoryData.statuses} />
            </CardContent>
          </Card>

          {/* Bloco para Itens de Planta Baixa (Pais) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Puzzle className="h-6 w-6" />
                <CardTitle>Itens de Planta Baixa</CardTitle>
              </div>
              <CardDescription>
                Equipamentos estruturais que aparecem diretamente no mapa do datacenter, como racks, QDFs e equipamentos de climatização.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <parent_itemsTable items={inventoryData.parent_items} allItems={inventoryData.allItems} statuses={inventoryData.statuses} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
