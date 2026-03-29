"use client";

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';

interface ConfirmPopulationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: { name: string; [key: string]: any }[];
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ConfirmPopulationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  items,
  onConfirm,
  isProcessing,
}: ConfirmPopulationDialogProps) {

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="relative my-4">
            <ScrollArea className="h-60 w-full rounded-md border p-4">
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="text-sm flex justify-between items-center p-1 hover:bg-muted/50 rounded-md">
                            <span>{item.name}</span>
                            {item.manufacturerName && <Badge variant="outline">{item.manufacturerName}</Badge>}
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar e Popular
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
