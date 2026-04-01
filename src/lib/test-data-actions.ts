'use server';

import { revalidatePath } from 'next/cache';
import { apiPost, apiDelete, apiGet } from './api-client';

/**
 * Prefixo único para marcar dados de teste
 * Permite filtrar e limpar apenas dados de teste sem afetar dados reais
 */
const TEST_DATA_PREFIX = 'TEST_AUTO_';

interface TestDataSummary {
  buildingsCreated: number;
  roomsCreated: number;
  racksCreated: number;
  equipmentCreated: number;
  totalItems: number;
}

/**
 * Popula o banco de dados com dados de teste estruturados
 * Cria 2 prédios, 3 salas em cada, racks e equipamentos
 */
export async function populateTestData(): Promise<TestDataSummary> {
  try {
    const summary: TestDataSummary = {
      buildingsCreated: 0,
      roomsCreated: 0,
      racksCreated: 0,
      equipmentCreated: 0,
      totalItems: 0,
    };

    // Criar 2 prédios de teste
    const buildings = [];
    for (let b = 1; b <= 2; b++) {
      const buildingId = `${TEST_DATA_PREFIX}BLDG_${b}`;
      await apiPost('/buildings', {
        id: buildingId,
        name: `${TEST_DATA_PREFIX}Prédio ${b} (Teste)`,
        address: `${TEST_DATA_PREFIX}Av. de Teste ${b}, 1000`,
        is_test_data: true,
      });
      buildings.push(buildingId);
      summary.buildingsCreated++;
    }

    // Criar 3 salas em cada prédio
    const rooms: string[] = [];
    for (const buildingId of buildings) {
      for (let r = 1; r <= 3; r++) {
        const roomId = `${TEST_DATA_PREFIX}ROOM_${buildingId}_${r}`;
        await apiPost('/rooms', {
          id: roomId,
          name: `${TEST_DATA_PREFIX}Sala ${r} (Teste)`,
          building_id: buildingId,
          width_m: 5 + r,
          height_m: 6 + r,
          tile_width_cm: 60,
          tile_height_cm: 60,
          x_axis_naming: r % 2 === 0 ? 'alpha' : 'numeric',
          y_axis_naming: r % 2 === 0 ? 'numeric' : 'alpha',
          is_test_data: true,
        });
        rooms.push(roomId);
        summary.roomsCreated++;
      }
    }

    // Criar racks (parent_items) em cada sala
    for (const roomId of rooms) {
      for (let rack = 1; rack <= 2; rack++) {
        const rackId = `${TEST_DATA_PREFIX}RACK_${roomId}_${rack}`;
        await apiPost('/parent_items', {
          id: rackId,
          label: `${TEST_DATA_PREFIX}Rack ${rack}`,
          type: 'Rack 42U',
          room_id: roomId,
          x: rack * 2,
          y: 1,
          width_m: 0.6,
          height_m: 2.0,
          shape: 'rectangle',
          color: '#4f46e5',
          is_test_data: true,
          status: 'active',
        });
        summary.racksCreated++;

        // Criar 3 equipamentos em cada rack
        for (let eq = 1; eq <= 3; eq++) {
          const equipmentId = `${TEST_DATA_PREFIX}EQ_${rackId}_${eq}`;
          await apiPost('/child_items', {
            id: equipmentId,
            label: `${TEST_DATA_PREFIX}Servidor ${eq}`,
            parent_id: rackId,
            type: 'Servidor 2U',
            brand: 'Dell',
            modelo: 'PowerEdge R750',
            serial_number: `${TEST_DATA_PREFIX}SN-${rackId}-${eq}`,
            tamanho_u: 2,
            posicao_u: eq * 2,
            status: 'active',
            is_test_data: true,
          });
          summary.equipmentCreated++;
        }
      }
    }

    summary.totalItems = summary.buildingsCreated + summary.roomsCreated + summary.racksCreated + summary.equipmentCreated;
    
    revalidatePath('/database-setup');
    revalidatePath('/buildings');
    revalidatePath('/datacenter');
    revalidatePath('/inventory');
    
    return summary;
  } catch (error: any) {
    console.error('Erro ao popular dados de teste:', error);
    throw new Error(`Falha ao popular dados de teste: ${error.message}`);
  }
}

/**
 * Remove todos os dados de teste marcados com TEST_DATA_PREFIX
 */
export async function clearTestData(): Promise<{ itemsDeleted: number }> {
  try {
    let itemsDeleted = 0;

    // Limpar child_items de teste
    const childItems = await apiGet('/child_items', {
      label: `ilike.${TEST_DATA_PREFIX}%`,
      select: 'id',
    });
    if (childItems && childItems.length > 0) {
      for (const item of childItems) {
        await apiDelete(`/child_items?id=eq.${item.id}`);
        itemsDeleted++;
      }
    }

    // Limpar parent_items de teste
    const parentItems = await apiGet('/parent_items', {
      label: `ilike.${TEST_DATA_PREFIX}%`,
      select: 'id',
    });
    if (parentItems && parentItems.length > 0) {
      for (const item of parentItems) {
        await apiDelete(`/parent_items?id=eq.${item.id}`);
        itemsDeleted++;
      }
    }

    // Limpar rooms de teste
    const rooms = await apiGet('/rooms', {
      name: `ilike.${TEST_DATA_PREFIX}%`,
      select: 'id',
    });
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        await apiDelete(`/rooms?id=eq.${room.id}`);
        itemsDeleted++;
      }
    }

    // Limpar buildings de teste
    const buildings = await apiGet('/buildings', {
      name: `ilike.${TEST_DATA_PREFIX}%`,
      select: 'id',
    });
    if (buildings && buildings.length > 0) {
      for (const building of buildings) {
        await apiDelete(`/buildings?id=eq.${building.id}`);
        itemsDeleted++;
      }
    }

    revalidatePath('/database-setup');
    revalidatePath('/buildings');
    revalidatePath('/datacenter');
    revalidatePath('/inventory');

    return { itemsDeleted };
  } catch (error: any) {
    console.error('Erro ao limpar dados de teste:', error);
    throw new Error(`Falha ao limpar dados de teste: ${error.message}`);
  }
}

/**
 * Conta quantos itens de teste existem no banco
 */
export async function countTestData(): Promise<number> {
  try {
    const [buildings, rooms, parentItems, childItems] = await Promise.all([
      apiGet('/buildings', { name: `ilike.${TEST_DATA_PREFIX}%`, select: 'id' }),
      apiGet('/rooms', { name: `ilike.${TEST_DATA_PREFIX}%`, select: 'id' }),
      apiGet('/parent_items', { label: `ilike.${TEST_DATA_PREFIX}%`, select: 'id' }),
      apiGet('/child_items', { label: `ilike.${TEST_DATA_PREFIX}%`, select: 'id' }),
    ]);

    const count =
      (buildings?.length || 0) +
      (rooms?.length || 0) +
      (parentItems?.length || 0) +
      (childItems?.length || 0);

    return count;
  } catch (error) {
    console.error('Erro ao contar dados de teste:', error);
    return 0;
  }
}
