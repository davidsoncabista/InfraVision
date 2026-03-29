'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface IncidentStatus {
  id: string;
  name: string;
  description: string | null;
  color: string;
  iconName: string | null;
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
    const data = await apiFetch('/incidentstatuses?order=isdefault.desc,name.asc');
    return (data || []).map((s: any) => ({
        ...s,
        iconName: s.iconname,
        isDefault: !!s.isdefault
    }));
  } catch (error) {
    return [];
  }
}

export async function addIncidentStatus(data: any) {
  const newId = `istatus_${Date.now()}`;
  try {
    await apiFetch('/incidentstatuses', {
        method: 'POST',
        body: JSON.stringify({ 
            id: newId, 
            name: data.name, 
            description: data.description, 
            color: data.color, 
            iconname: data.iconName,
            isdefault: false 
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
        if(data.iconName) dbData.iconname = data.iconName;

        await apiFetch(`/incidentstatuses?id=eq.${id}&isdefault=eq.false`, {
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
        await apiFetch(`/incidentstatuses?id=eq.${id}&isdefault=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir status.');
    }
}

// --- Severidades ---

export async function getIncidentSeverities(): Promise<IncidentSeverity[]> {
  try {
    const data = await apiFetch('/incidentseverities?order=rank.asc');
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
        await apiFetch('/incidentseverities', {
            method: 'POST',
            body: JSON.stringify({ id: newId, ...data, isdefault: false })
        });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao adicionar severidade.');
    }
}

export async function updateIncidentSeverity(id: string, data: any) {
    try {
        await apiFetch(`/incidentseverities?id=eq.${id}&isdefault=eq.false`, {
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
        await apiFetch(`/incidentseverities?id=eq.${id}&isdefault=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir severidade.');
    }
}

// --- Tipos ---

export async function getIncidentTypes(): Promise<IncidentType[]> {
  try {
    const data = await apiFetch('/incidenttypes?order=isdefault.desc,name.asc');
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
        await apiFetch('/incidenttypes', {
            method: 'POST',
            body: JSON.stringify({ 
                id: newId, 
                name: data.name, 
                description: data.description, 
                defaultseverityid: data.defaultSeverityId || null,
                isdefault: false 
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

        await apiFetch(`/incidenttypes?id=eq.${id}&isdefault=eq.false`, {
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
        await apiFetch(`/incidenttypes?id=eq.${id}&isdefault=eq.false`, { method: 'DELETE' });
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir tipo.');
    }
}
