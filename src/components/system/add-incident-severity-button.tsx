
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ManageIncidentSeverityDialog } from '@/components/system/manage-incident-severity-dialog';

export function AddIncidentSeverityButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2" />
                Adicionar Severidade
            </Button>
            <ManageIncidentSeverityDialog mode="add" open={isOpen} onOpenChange={setIsOpen}/>
        </>
    )
}
