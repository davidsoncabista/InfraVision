
"use client";

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
import { getIncidents, Incident } from "@/lib/incident-service";
import { getEvidenceForEntity } from "@/lib/evidence-actions";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Info, ShieldQuestion, Loader2, FileWarning, MessageSquare } from "lucide-react";
import * as React from "react";
import { ManageIncidentDialog } from "@/components/incidents/manage-incident-dialog";
import { useBuilding } from "@/components/building-provider";
import { ManageEvidenceDialog } from "@/components/incidents/manage-evidence-dialog";
import { Button } from "@/components/ui/button";

const colorVariants: Record<string, string> = {
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
};

const StatusBadge = ({ status, color, iconName }: { status: string, color: string, iconName: string | null }) => {
    const IconComponent = iconName ? iconMap[iconName] || Info : Info;
    return (
        <Badge variant="outline" className={cn("capitalize", colorVariants[color] || colorVariants.gray)}>
            <IconComponent className="h-4 w-4 mr-2" />
            {status}
        </Badge>
    )
}

const groupIncidentsByType = (incidents: Incident[]): Record<string, Incident[]> => {
    return incidents.reduce((acc, incident) => {
        const type = incident.typeName || 'Não Categorizado';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(incident);
        return acc;
    }, {} as Record<string, Incident[]>);
};

export default function IncidentsPage() {
  const { activeBuildingId } = useBuilding();
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [evidenceCounts, setEvidenceCounts] = React.useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = React.useState(false);


  const fetchIncidents = React.useCallback(async () => {
    if (!activeBuildingId) {
      setIncidents([]);
      setIsLoading(false);
      return;
    }
      setIsLoading(true);
      try {
          const incidentData = await getIncidents(activeBuildingId);
          setIncidents(incidentData);

          // Busca a contagem de evidências para cada incidente
          const counts: Record<string, number> = {};
          for (const incident of incidentData) {
              const evidence = await getEvidenceForEntity(incident.id, 'Incidents');
              counts[incident.id] = evidence.length;
          }
          setEvidenceCounts(counts);

      } catch (error) {
          console.error("Erro ao buscar incidentes ou evidências:", error);
      } finally {
          setIsLoading(false);
      }
  }, [activeBuildingId]);

  React.useEffect(() => {
      fetchIncidents();
  }, [fetchIncidents]);

  const handleUpdateSuccess = () => {
    setSelectedIncident(null);
    setIsEvidenceModalOpen(false);
    fetchIncidents();
  };
  
  const openEvidenceModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsEvidenceModalOpen(true);
  }

  const openResolutionModal = (incident: Incident) => {
    setSelectedIncident(incident);
  }

  const groupedIncidents = groupIncidentsByType(incidents);

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Central de Incidentes</h1>
      </div>
       <CardDescription>
          Acompanhe e gerencie as inconsistências de dados e alertas operacionais detectados automaticamente no prédio selecionado. Clique em uma linha para gerenciá-lo.
      </CardDescription>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(groupedIncidents).length > 0 ? (
        Object.entries(groupedIncidents).map(([type, incidentsOfType]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning />
                {type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição do Incidente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Detectado Em</TableHead>
                      <TableHead className="text-center">Evidências</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidentsOfType.map((incident) => (
                      <TableRow key={incident.id} onClick={() => openResolutionModal(incident)} className="cursor-pointer">
                        <TableCell>
                          <p className="font-medium">{incident.description}</p>
                          <p className="text-xs text-muted-foreground font-mono">ID: {incident.id}</p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={incident.status} color={incident.statusColor} iconName={incident.statusIcon} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize", colorVariants[incident.severityColor] || colorVariants.gray)}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(incident.detectedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); openEvidenceModal(incident); }}
                                className="relative"
                            >
                                <MessageSquare className="h-4 w-4 mr-2"/>
                                {evidenceCounts[incident.id] > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                        {evidenceCounts[incident.id]}
                                    </span>
                                )}
                                Ver
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
            <ShieldQuestion className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 font-semibold text-muted-foreground">Nenhum incidente encontrado.</p>
            <p className="mt-1 text-sm text-muted-foreground/80">
                A integridade dos dados neste prédio está ótima!
            </p>
        </div>
      )}
    </div>
    {selectedIncident && (
        <ManageIncidentDialog 
            incident={selectedIncident}
            isOpen={!!selectedIncident && !isEvidenceModalOpen}
            onOpenChange={() => setSelectedIncident(null)}
            onSuccess={handleUpdateSuccess}
        />
    )}
     {selectedIncident && (
        <ManageEvidenceDialog
            incident={selectedIncident}
            isOpen={isEvidenceModalOpen}
            onOpenChange={() => setIsEvidenceModalOpen(false)}
            onSuccess={handleUpdateSuccess}
        />
     )}
    </>
  );
}
