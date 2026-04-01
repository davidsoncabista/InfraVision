'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface IncidentStatus {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon_name: string | null;
  isDefault: boolean;
}

export interface IncidentSeverity {
  id: string;
  name: string;
  description: string | null;
  color: string;
  rank: number;
  isDefault: boolean;
}

export interface IncidentType {
  id: string;
  name: string;
  description: string | null;
  defaultSeverityId: string | null;
  isDefault: boolean;
}

// --- Status ---

export async function getIncidentStatuses(): Promise<IncidentStatus[]> {
  try {
    const data = await apiFetch('/incident_statuses?order=is_default.desc,name.asc');
    return (data || []).map((s: any) => ({
        ...s,
        icon_name: s.icon_name,
        isDefault: !!s.isdefault
    }));
  } catch (error) {
    return [];
  }
}

export async function addIncidentStatus(data: any) {
  const newId = `istatus_${Date.now()}`;
  try {
    await apiFetch('/incident_statuses', {
        method: 'POST',
        body: JSON.stringify({ 
            id: newId, 
            name: data.name, 
            description: data.description, 
            color: data.color, 
            icon_name: data.icon_name,
            is_default: false 
        })
    });
    revalidatePath('/system');
  } catch (error: any) {
    throw new Error('Falha ao adicionar status: ' + error.message);
  }
}

export async function updateIncidentStatus(id: string, data: any) {
    try {
        const dbData: any = {};
        if(data.name) dbData.name = data.name;
        if(data.description) dbData.description = data.description;
        if(data.color) dbData.color = data.color;
        if(data.icon_name) dbData.icon_name = data.icon_name;

        await apiFetch(`/incident_statuses?id=eq.${id}&is_default=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(dbData)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar status.');
    }
}

export async function deleteIncidentStatus(id: string) {
    try {
        await apiFetch(`/incident_statuses?id=eq.${id}&is_default=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir status.');
    }
}

// --- Severidades ---

export async function getIncidentSeverities(): Promise<IncidentSeverity[]> {
  try {
    const data = await apiFetch('/incident_severities?order=rank.asc');
    return (data || []).map((s: any) => ({
        ...s,
        isDefault: !!s.isdefault
    }));
  } catch (error) {
    return [];
  }
}

export async function addIncidentSeverity(data: any) {
    const newId = `isev_${Date.now()}`;
    try {
        await apiFetch('/incident_severities', {
            method: 'POST',
            body: JSON.stringify({ id: newId, ...data, is_default: false })
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao adicionar severidade.');
    }
}

export async function updateIncidentSeverity(id: string, data: any) {
    try {
        await apiFetch(`/incident_severities?id=eq.${id}&is_default=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar severidade.');
    }
}

export async function deleteIncidentSeverity(id: string) {
    try {
        await apiFetch(`/incident_severities?id=eq.${id}&is_default=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir severidade.');
    }
}

// --- Tipos ---

export async function getIncidentTypes(): Promise<IncidentType[]> {
  try {
    const data = await apiFetch('/incident_types?order=is_default.desc,name.asc');
    return (data || []).map((t: any) => ({
        ...t,
        defaultSeverityId: t.defaultseverityid,
        isDefault: !!t.isdefault
    }));
  } catch (error) {
    return [];
  }
}

export async function addIncidentType(data: any) {
    const newId = `itype_${Date.now()}`;
    try {
        await apiFetch('/incident_types', {
            method: 'POST',
            body: JSON.stringify({ 
                id: newId, 
                name: data.name, 
                description: data.description, 
                defaultseverityid: data.defaultSeverityId || null,
                is_default: false 
            })
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao adicionar tipo.');
    }
}

export async function updateIncidentType(id: string, data: any) {
    try {
        const dbData: any = {};
        if(data.name) dbData.name = data.name;
        if(data.description) dbData.description = data.description;
        if(data.defaultSeverityId !== undefined) dbData.defaultseverityid = data.defaultSeverityId;

        await apiFetch(`/incident_types?id=eq.${id}&is_default=eq.false`, {
            method: 'PATCH',
            body: JSON.stringify(dbData)
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao atualizar tipo.');
    }
}

export async function deleteIncidentType(id: string) {
    try {
        await apiFetch(`/incident_types?id=eq.${id}&is_default=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo.');
    }
}
