
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ManageIncidentStatusDialog } from '@/components/system/manage-incident-status-dialog';

export function AddIncidentStatusButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2" />
                Adicionar Status
            </Button>
            <ManageIncidentStatusDialog mode="add" open={isOpen} onOpenChange={setIsOpen}/>
        </>
    )
}
