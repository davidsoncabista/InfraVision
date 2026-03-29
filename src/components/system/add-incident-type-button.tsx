
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ManageIncidentTypeDialog } from '@/components/system/manage-incident-type-dialog';

export function AddIncidentTypeButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2" />
                Adicionar Tipo
            </Button>
            <ManageIncidentTypeDialog mode="add" open={isOpen} onOpenChange={setIsOpen}/>
        </>
    )
}
