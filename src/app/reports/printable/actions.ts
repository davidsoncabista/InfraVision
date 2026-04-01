'use server';

import { apiFetch } from "@/lib/db";
import { getGridLabel } from "@/lib/geometry";

interface ReportItem {
    id: string;
    label: string;
    type: string;
    statusName: string;
    gridPosition: string;
    brand: string | null;
    modelo: string | null;
    serial_number: string | null;
    tag: string | null;
    child_items?: ReportItem[];
}

interface ReportRoom {
    id: string;
    name: string;
    items: ReportItem[];
}

interface ReportBuilding {
    id: string;
    name: string;
    rooms: ReportRoom[];
}

interface ReportConnection {
    id: string;
    itemA_label: string;
    itemA_parentName: string | null;
    portA_label: string;
    itemB_label: string | null;
    itemB_parentName: string | null;
    portB_label: string | null;
    connectionType: string;
}

interface ReportUser {
    id: string;
    display_name: string;
    role: string;
    signature_url: string | null;
}

export interface PrintableReportData {
    buildings: ReportBuilding[];
    connections: ReportConnection[];
    usersWithSignatures: ReportUser[];
}

/**
 * Coleta todos os dados para o relatório completo de impressão.
 * Utiliza o Resource Embedding do PostgREST para reduzir o número de chamadas.
 */
export async function getPrintableReportData(): Promise<PrintableReportData> {
    try {
        const [
            buildingsResult, roomsResult, parent_itemsResult, child_itemsResult,
            connectionsResult, usersResult, statusesResult
        ] = await Promise.all([
            apiFetch('/buildings?select=id,name&order=name.asc'),
            apiFetch('/rooms?select=id,name,building_id,x_axis_naming,y_axis_naming&order=name.asc'),
            apiFetch('/parent_items?status=not.in.(decommissioned,deleted)'),
            apiFetch('/child_items?status=not.in.(decommissioned,deleted)'),
            apiFetch('/connections?select=*,portA:port_a_id(label,child_items(label,parent_items(label))),portB:port_b_id(label,child_items(label,parent_items(label))),connectiontypes(name)'),
            apiFetch('/users?signature_url=not.is.null&select=id,display_name,role,signature_url&order=display_name.asc'),
            apiFetch('/item_statuses?select=id,name')
        ]);

        const statusMap = new Map((statusesResult || []).map((s: any) => [s.id, s.name]));

        // Agrupamos itens filhos por pai
        const child_itemsByParent = (child_itemsResult || []).reduce((acc: any, item: any) => {
            const parent_id = item.parent_id;
            if (!acc[parent_id]) acc[parent_id] = [];
            acc[parent_id].push({
                ...item,
                serial_number: item.serial_number,
                statusName: statusMap.get(item.status) || item.status,
            });
            return acc;
        }, {} as Record<string, any[]>);

        // Agrupamos itens pais por sala
        const parent_itemsByRoom = (parent_itemsResult || []).reduce((acc: any, item: any) => {
            const room_id = item.room_id;
            if (!acc[room_id]) acc[room_id] = [];
            acc[room_id].push({
                ...item,
                serial_number: item.serial_number,
                statusName: statusMap.get(item.status) || item.status,
                child_items: child_itemsByParent[item.id] || []
            });
            return acc;
        }, {} as Record<string, any[]>);

        // Montamos as salas
        const roomsByBuilding = (roomsResult || []).reduce((acc: any, room: any) => {
            const building_id = room.building_id;
            if (!acc[building_id]) acc[building_id] = [];
            const itemsInRoom = (parent_itemsByRoom[room.id] || []).map((pItem: any) => ({
                 ...pItem,
                 gridPosition: getGridLabel(pItem.x, pItem.y, room.x_axis_naming, room.y_axis_naming),
            }));

            acc[building_id].push({ id: room.id, name: room.name, items: itemsInRoom });
            return acc;
        }, {} as Record<string, any[]>);

        // Mapeamos conexões
        const mappedConnections = (connectionsResult || []).map((c: any) => ({
            id: c.id,
            itemA_label: c.portA?.child_items?.label || 'N/A',
            itemA_parentName: c.portA?.child_items?.parent_items?.label || null,
            portA_label: c.portA?.label || 'N/A',
            itemB_label: c.portB?.child_items?.label || null,
            itemB_parentName: c.portB?.child_items?.parent_items?.label || null,
            portB_label: c.portB?.label || null,
            connectionType: c.connectiontypes?.name || 'N/A',
        }));

        // Mapeamos usuários
        const mappedUsers = (usersResult || []).map((u: any) => ({
            id: u.id,
            display_name: u.display_name,
            role: u.role,
            signature_url: u.signature_url
        }));

        const buildings = (buildingsResult || []).map((building: any) => ({
            ...building,
            rooms: roomsByBuilding[building.id] || []
        }));

        return {
            buildings,
            connections: mappedConnections,
            usersWithSignatures: mappedUsers,
        };

    } catch (error) {
        console.error("Erro ao gerar dados para o relatório via API:", error);
        throw new Error("Não foi possível buscar os dados do inventário.");
    }
}
