

"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getitem_types, ItemType } from "@/lib/item-types-actions";
import { ManageItemTypeMenu } from '@/components/manage-item-type-menu';
import { Skeleton } from '../ui/skeleton';

interface item_typesTableProps {
    isParentTypeTable: boolean;
}

export function item_typesTable({ isParentTypeTable }: item_typesTableProps) {
    const [item_types, setitem_types] = React.useState<ItemType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        getitem_types(isParentTypeTable).then(data => {
            setitem_types(data);
            setIsLoading(false);
        })
    }, [isParentTypeTable]);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dimensões Padrão (L x A)</TableHead>
                    {isParentTypeTable && <TableHead>Capacidades</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {item_types.length > 0 ? (
                    item_types.map((type) => (
                    <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.category}</TableCell>
                        <TableCell>{type.defaultwidth_m}m x {type.defaultHeightM}m</TableCell>
                        {isParentTypeTable && (
                            <TableCell className="space-x-2">
                                {type.isResizable && <Badge variant="outline">Redimensionável</Badge>}
                                {type.canHaveChildren && <Badge variant="outline">Aninha Itens</Badge>}
                            </TableCell>
                        )}
                        <TableCell className="text-right">
                        <ManageItemTypeMenu itemType={type} isParentType={isParentTypeTable} />
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={isParentTypeTable ? 5 : 4} className="h-24 text-center">
                        Nenhum tipo de item encontrado.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}
