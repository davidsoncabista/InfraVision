
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { getport_types, port_type } from '@/lib/port-types-actions';
import { ManagePortTypeMenu } from './manage-port-type-menu';
import { ShieldAlert } from 'lucide-react';

export function PortTypesTable() {
    const [port_types, setport_types] = React.useState<port_type[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getport_types().then(data => {
            setport_types(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
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
                        <TableHead>Nome do Tipo de Porta</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {port_types.length > 0 ? (
                        port_types.map(port_type => (
                            <TableRow key={port_type.id}>
                                <TableCell className="font-medium">{port_type.name}</TableCell>
                                <TableCell>
                                     <p className="text-sm text-muted-foreground">{port_type.description}</p>
                                    {port_type.isDefault && (
                                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                                            <ShieldAlert className="h-3 w-3"/>
                                            <span>Tipo padrão. Não pode ser editado ou excluído.</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManagePortTypeMenu port_type={port_type} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Nenhum tipo de porta encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

    