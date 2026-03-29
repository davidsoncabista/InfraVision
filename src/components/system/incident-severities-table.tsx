
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getIncidentSeverities, IncidentSeverity } from '@/lib/incident-attributes-actions';
import { ManageIncidentSeverityMenu } from './manage-incident-severity-menu';

const colorVariants: Record<string, string> = {
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function IncidentSeveritiesTable() {
    const [severities, setSeverities] = React.useState<IncidentSeverity[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getIncidentSeverities().then(data => {
            setSeverities(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ranking</TableHead>
                        <TableHead>Nome da Severidade</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {severities.length > 0 ? (
                        severities.map(severity => (
                            <TableRow key={severity.id}>
                                <TableCell>{severity.rank}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("capitalize", colorVariants[severity.color] || colorVariants.gray)}>
                                        {severity.name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{severity.description}</TableCell>
                                <TableCell className="text-right">
                                    <ManageIncidentSeverityMenu severity={severity} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Nenhuma severidade encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
