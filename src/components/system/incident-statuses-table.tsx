
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getIncidentStatuses, IncidentStatus } from '@/lib/incident-attributes-actions';
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { ManageIncidentStatusMenu } from './manage-incident-status-menu';

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

const StatusBadge = ({ status, color, icon_name }: { status: string, color: string, icon_name: string | null }) => {
    const IconComponent = icon_name ? iconMap[icon_name] || Info : Info;
    return (
        <Badge variant="outline" className={cn("capitalize", colorVariants[color] || colorVariants.gray)}>
            <IconComponent className="h-4 w-4 mr-2" />
            {status}
        </Badge>
    )
}

export function IncidentStatusesTable() {
    const [statuses, setStatuses] = React.useState<IncidentStatus[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getIncidentStatuses().then(data => {
            setStatuses(data);
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
                        <TableHead>Status</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {statuses.length > 0 ? (
                        statuses.map(status => (
                            <TableRow key={status.id}>
                                <TableCell>
                                    <StatusBadge status={status.name} color={status.color} icon_name={status.icon_name} />
                                </TableCell>
                                <TableCell className="text-muted-foreground">{status.description}</TableCell>
                                <TableCell className="text-right">
                                    <ManageIncidentStatusMenu status={status} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Nenhum status encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
