
"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/user-service";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ManageUserButton } from "@/components/manage-user-button";
import { AddUserDialog } from "@/components/add-user-dialog";
import type { UserRole } from "@/components/permissions-provider";
import { USER_ROLES } from "@/components/permissions-provider";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { getUsers } from '@/lib/user-actions';
import { Skeleton } from '@/components/ui/skeleton';

const roleLabels: Record<UserRole, string> = {
  developer: 'Desenvolvedor',
  manager: 'Gerente',
  project_manager: 'Gerente de Projeto',
  supervisor_1: 'Supervisor 1',
  supervisor_2: 'Supervisor 2',
  technician_1: 'Técnico 1',
  technician_2: 'Técnico 2',
  guest: 'Convidado',
};

const roleStyles: Record<UserRole, string> = {
  developer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manager: "bg-red-500/20 text-red-400 border-red-500/30",
  project_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  supervisor_1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  supervisor_2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  technician_1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  technician_2: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  guest: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

type SortableKeys = keyof User | 'displayName';

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys, direction: 'ascending' | 'descending' } | null>({ key: 'displayName', direction: 'ascending' });

  React.useEffect(() => {
    setIsLoading(true);
    getUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

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

  const filteredAndSortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];

    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof User] ?? '';
        const bValue = b[sortConfig.key as keyof User] ?? '';
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableUsers.filter(user =>
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === 'all' || user.role === roleFilter)
    );
  }, [users, searchTerm, roleFilter, sortConfig]);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Usuários</h1>
        <AddUserDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Cargos</SelectItem>
                {USER_ROLES.map(role => (
                  <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('displayName')} className="group px-0">
                      Usuário{getSortIndicator('displayName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('email')} className="group px-0">
                      Email{getSortIndicator('email')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('role')} className="group px-0">
                      Cargo{getSortIndicator('role')}
                    </Button>
                  </TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  </>
                ) : filteredAndSortedUsers.length > 0 ? (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.displayName || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize", roleStyles[user.role])}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.lastLoginAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <ManageUserButton user={user} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
