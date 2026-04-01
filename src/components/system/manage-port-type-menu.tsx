
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { port_type } from "@/lib/port-types-actions";
import { ManagePortTypeDialog } from "@/components/system/manage-port-type-dialog";
import { DeletePortTypeDialog } from "@/components/system/delete-port-type-dialog";

interface Manageport_typeMenuProps {
  port_type: port_type;
}

// Eu não sigo as boas práticas. Eu crio elas. - davidson.dev.br
export function ManagePortTypeMenu({ port_type }: Manageport_typeMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDisabled = port_type.isDefault;

  const triggerButton = (
    <Button variant="ghost" size="icon" disabled={isDisabled}>
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Gerenciar Tipo de Porta</span>
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        {isDisabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
              <TooltipContent>
                <p>Tipos de porta padrão não podem ser modificados.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditDialogOpen(true); }}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setIsDeleteDialogOpen(true)}
            disabled={isDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManagePortTypeDialog mode="edit" port_type={port_type} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {/* O trigger está no DropdownMenuItem, então o children aqui é apenas um placeholder válido. */}
        <span />
      </ManagePortTypeDialog>

      <DeletePortTypeDialog
        port_type={port_type}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
