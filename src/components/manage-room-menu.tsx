"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Room } from "@/app/buildings/page";
import { ManageRoomDialog } from "./manage-room-dialog"; // ATUALIZADO
import { DeleteRoomDialog } from "./delete-room-dialog";

interface ManageRoomMenuProps {
  room: Room;
}

export function ManageRoomMenu({ room }: ManageRoomMenuProps) {
  const [isManageOpen, setManageOpen] = useState(false); // Renomeado
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Sala</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setManageOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Sala e Zonas
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ManageRoomDialog // ATUALIZADO
        room={room}
        open={isManageOpen}
        onOpenChange={setManageOpen}
      />

      <DeleteRoomDialog
        room={room}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
