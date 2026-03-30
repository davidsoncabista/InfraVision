
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import type { GridItem } from '@/types/datacenter';
import type { ItemStatus } from '@/lib/status-actions';
import { ItemDetailDialog } from '@/components/item-detail-dialog';
import { Button } from '@/components/ui/button';

interface parent_itemsTableProps {
  items: GridItem[];
  allItems: GridItem[];
  statuses: ItemStatus[];
}

const statusColorClasses: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    pending_approval: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

type SortableKeys = keyof GridItem | 'location';

// Simples, elegante e funciona. De nada. - davidson.dev.br
export function parent_itemsTable({ items, allItems, statuses }: parent_itemsTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' } | null>({ key: 'label', direction: 'ascending' });

    const statusesById = useMemo(() => new Map(statuses.map(s => [s.id, s])), [statuses]);

    const sortedAndFilteredItems = useMemo(() => {
        let sortableItems = [...items];

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any, bValue: any;

                if (sortConfig.key === 'location') {
                    aValue = `${a.buildingName || ''} / ${a.roomName || ''}`;
                    bValue = `${b.buildingName || ''} / ${b.roomName || ''}`;
                } else {
                    aValue = a[sortConfig.key as keyof GridItem];
                    bValue = b[sortConfig.key as keyof GridItem];
                }

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    if (aValue.toLowerCase() < bValue.toLowerCase()) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue.toLowerCase() > bValue.toLowerCase()) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                } else {
                     if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                }
                return 0;
            });
        }
        
        return sortableItems.filter(item =>
          (item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (item.buildingName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (item.roomName || '').toLowerCase().includes(searchTerm.toLowerCase())
          ) &&
          (statusFilter === 'all' || item.status === statusFilter)
        );
    }, [items, searchTerm, statusFilter, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
        }
        return sortConfig.direction === 'ascending' ? 
            <ArrowUpDown className="ml-2 h-4 w-4" /> : 
            <ArrowUpDown className="ml-2 h-4 w-4" />;
    };
    
    const handleItemUpdate = (updatedItem: GridItem) => {
        setSelectedItem(updatedItem); 
        router.refresh(); 
    };

    const handleItemDelete = () => {
        setSelectedItem(null); 
        router.refresh(); 
    };

  return (
    <>
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou localização..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        {statuses.map(status => (
                          <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button asChild>
                    <Link href="/datacenter">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar na Planta
                    </Link>
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Button variant="ghost" onClick={() => requestSort('label')} className="group px-0">
                                Nome
                                {getSortIndicator('label')}
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => requestSort('location')} className="group px-0">
                                Localização
                                {getSortIndicator('location')}
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => requestSort('status')} className="group px-0">
                                Status
                                {getSortIndicator('status')}
                            </Button>
                        </TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nº de Série</TableHead>
                        <TableHead>Fabricante</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAndFilteredItems.length > 0 ? (
                    sortedAndFilteredItems.map(item => (
                        <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell>{item.buildingName && item.roomName ? `${item.buildingName} / ${item.roomName}` : 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("capitalize", statusColorClasses[statusesById.get(item.status)?.name.toLowerCase() || ''] || 'text-foreground')}>
                                {statusesById.get(item.status)?.name || item.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{item.serial_number || '-'}</TableCell>
                            <TableCell>{item.brand || '-'}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum item encontrado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
        {selectedItem && (
            <ItemDetailDialog
                item={selectedItem}
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
                onItemUpdate={handleItemUpdate}
                onItemDelete={handleItemDelete}
                fullItemContext={{ allItems }}
            />
        )}
    </>
  );
}
