
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Server, WifiOff, Loader2 } from "lucide-react";
import { getConnectableEquipmentSummary, EquipmentSummary } from "@/lib/connection-actions";
import { Progress } from '@/components/ui/progress';
import { equipment_portsDialog } from '@/components/connections/equipment-ports-dialog';
import { useBuilding } from '@/components/building-provider';

export default function ConnectionsPage() {
  const { activebuilding_id } = useBuilding();
  const [equipments, setEquipments] = React.useState<EquipmentSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedEquipment, setSelectedEquipment] = React.useState<EquipmentSummary | null>(null);

  React.useEffect(() => {
    if (!activebuilding_id) {
        setEquipments([]);
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    getConnectableEquipmentSummary(activebuilding_id)
      .then(setEquipments)
      .finally(() => setIsLoading(false));
  }, [activebuilding_id]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Inventário de Equipamentos Conectáveis</h1>
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento Central</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os equipamentos do seu inventário que possuem portas de conexão. Clique em um equipamento para ver os detalhes das portas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-[200px]">Uso de Portas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/>
                        </TableCell>
                    </TableRow>
                  ) : equipments.length > 0 ? (
                    equipments.map(equipment => (
                      <TableRow key={equipment.id} className="cursor-pointer" onClick={() => setSelectedEquipment(equipment)}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground"/>
                            {equipment.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Server className="h-4 w-4"/>
                            {equipment.parentName || <span className="italic">Não alocado</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{equipment.type}</Badge>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                                <Progress value={(equipment.usedPorts / equipment.totalPorts) * 100} className="w-24"/>
                                <span className="text-xs text-muted-foreground">{equipment.usedPorts} / {equipment.totalPorts}</span>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <WifiOff className="h-12 w-12 text-muted-foreground/50" />
                            <p className="font-semibold text-muted-foreground">Nenhum equipamento com portas foi encontrado neste prédio.</p>
                            <p className="text-sm text-muted-foreground/80">
                            Adicione modelos com configuração de portas e crie equipamentos aninhados para começar.
                            </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEquipment && (
        <equipment_portsDialog
            equipment={selectedEquipment}
            isOpen={!!selectedEquipment}
            onOpenChange={() => setSelectedEquipment(null)}
        />
      )}
    </>
  );
}
