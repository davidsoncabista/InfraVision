'use server';

import { apiFetch } from './db';
import { revalidatePath } from 'next/cache';

/**
 * Remove todos os dados marcados como teste no banco de dados via PostgREST.
 * Todos os endpoints em minúsculo.
 */
export async function softCleanTestData() {
    try {
        await apiFetch('/connections?istestdata=eq.true', { method: 'DELETE' });
        await apiFetch('/childitems?istestdata=eq.true', { method: 'DELETE' });
        await apiFetch('/parentitems?istestdata=eq.true', { method: 'DELETE' });
        await apiFetch('/rooms?istestdata=eq.true', { method: 'DELETE' });
        await apiFetch('/buildings?istestdata=eq.true', { method: 'DELETE' });
        await apiFetch('/users?istestdata=eq.true', { method: 'DELETE' });
        
        revalidatePath('/');
    } catch (error: any) {
        console.error('Erro na limpeza leve:', error.message);
        throw new Error('Falha ao remover dados de teste.');
    }
}

/**
 * Remove completamente o prédio de desenvolvimento e tudo dentro dele.
 */
export async function hardCleanDevBuilding() {
    try {
        const buildings = await apiFetch('/buildings?name=eq.Prédio Dev&select=id');
        if (buildings.length > 0) {
            await apiFetch(`/buildings?id=eq.${buildings[0].id}`, { method: 'DELETE' });
        }
        revalidatePath('/');
    } catch (error: any) {
        console.error('Erro na limpeza pesada:', error.message);
        throw new Error('Falha ao limpar o Prédio Dev.');
    }
}

/**
 * Popula entidades base (Prédio de Teste).
 */
export async function populateBaseEntities() {
    await apiFetch('/buildings', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ 
            id: 'B_DEV_01', 
            name: 'Prédio Dev', 
            address: 'Ambiente de Testes Automatizados', 
            istestdata: true 
        })
    });
}

/**
 * Popula salas de teste.
 */
export async function populateRooms() {
    await apiFetch('/rooms', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ 
            id: 'R_DEV_01A', 
            name: 'Sala de Teste 01', 
            buildingid: 'B_DEV_01', 
            widthm: 20, 
            depthm: 20, 
            istestdata: true 
        })
    });
}

/**
 * Popula itens de planta (Racks).
 */
export async function populateParentItems() {
    await apiFetch('/parentitems', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ 
            id: 'pitem_dev_001', 
            label: 'RACK-TESTE-01', 
            x: 2, 
            y: 2, 
            widthm: 0.6, 
            heightm: 1.2, 
            type: 'Rack 42U', 
            status: 'active', 
            roomid: 'R_DEV_01A', 
            istestdata: true 
        })
    });
}

/**
 * Popula equipamentos aninhados.
 */
export async function populateChildItems() {
    await apiFetch('/childitems', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ 
            id: 'citem_dev_001', 
            label: 'SRV-TESTE-01', 
            parentid: 'pitem_dev_001', 
            type: 'Servidor', 
            status: 'active', 
            modelo: 'PowerEdge R740', 
            istestdata: true 
        })
    });
}

export async function populatePortsAndConnections() {
    console.log("População de portas e conexões via PostgREST iniciada...");
}
