
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getIncidentTypes, IncidentType } from '@/lib/incident-attributes-actions';
import { ManageIncidentTypeMenu } from './manage-incident-type-menu';

export function IncidentTypesTable() {
    const [types, setTypes] = React.useState<IncidentType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getIncidentTypes().then(data => {
            setTypes(data);
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
                        <TableHead>Nome do Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Severidade Padrão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {types.length > 0 ? (
                        types.map(type => (
                            <TableRow key={type.id}>
                                <TableCell className="font-medium">{type.name}</TableCell>
                                <TableCell className="text-muted-foreground">{type.description}</TableCell>
                                <TableCell>
                                    {type.defaultSeverityId ? (
                                        <Badge variant="secondary">{type.defaultSeverityId}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground italic text-xs">Nenhuma</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManageIncidentTypeMenu type={type} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Nenhum tipo de incidente encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
