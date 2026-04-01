'use server';

import { apiDelete, apiPost, apiGet } from './api-client';
import { revalidatePath } from 'next/cache';

/**
 * Remove todos os dados marcados como teste no banco de dados via PostgREST.
 * Todos os endpoints em minúsculo.
 */
export async function softCleanTestData() {
    try {
        await apiDelete('/connections', { is_test_data: 'eq.true' });
        await apiDelete('/child_items', { is_test_data: 'eq.true' });
        await apiDelete('/parent_items', { is_test_data: 'eq.true' });
        await apiDelete('/rooms', { is_test_data: 'eq.true' });
        await apiDelete('/buildings', { is_test_data: 'eq.true' });
        await apiDelete('/users', { is_test_data: 'eq.true' });
        
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
        const buildings = await apiGet('/buildings', { name: 'eq.Prédio Dev', select: 'id' });
        if (buildings.length > 0) {
            await apiDelete('/buildings', { id: `eq.${buildings[0].id}` });
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
    await apiPost('/buildings', { 
        id: 'B_DEV_01', 
        name: 'Prédio Dev', 
        address: 'Ambiente de Testes Automatizados', 
        is_test_data: true 
    }, undefined, { headers: { 'Prefer': 'resolution=merge-duplicates' } });
}

/**
 * Popula salas de teste.
 */
export async function populateRooms() {
    await apiPost('/rooms', { 
        id: 'R_DEV_01A', 
        name: 'Sala de Teste 01', 
        building_id: 'B_DEV_01', 
        width_m: 20,
        height_m: 20,
        tile_width_cm: 50,
        tile_height_cm: 50,
        x_axis_naming: 'alpha',
        y_axis_naming: 'numeric',
        is_test_data: true 
    }, undefined, { headers: { 'Prefer': 'resolution=merge-duplicates' } });
}

/**
 * Popula itens de planta (Racks).
 */
export async function populateparent_items() {
    await apiPost('/parent_items', { 
        id: 'pitem_dev_001', 
        label: 'RACK-TESTE-01', 
        x: 2, 
        y: 2, 
        width_m: 0.6, 
        height_m: 1.2, 
        type: 'Rack 42U', 
        status: 'active', 
        room_id: 'R_DEV_01A', 
        is_test_data: true 
    }, undefined, { headers: { 'Prefer': 'resolution=merge-duplicates' } });
}

/**
 * Popula equipamentos aninhados.
 */
export async function populatechild_items() {
    await apiPost('/child_items', { 
        id: 'citem_dev_001', 
        label: 'SRV-TESTE-01', 
        parent_id: 'pitem_dev_001', 
        type: 'Servidor', 
        status: 'active', 
        modelo: 'PowerEdge R740', 
        is_test_data: true 
    }, undefined, { headers: { 'Prefer': 'resolution=merge-duplicates' } });
}

export async function populatePortsAndConnections() {
    console.log("População de portas e conexões via PostgREST iniciada...");
}
