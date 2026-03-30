'use server';

import { apiFetch } from "@/lib/db";
import * as XLSX from 'xlsx';

/**
 * Busca todos os itens de planta baixa que não são dados de teste.
 */
async function getparent_items() {
    const data = await apiFetch('/parent_items?is_test_data=eq.false&select=*,rooms(name,buildings(name))');
    return (data || []).map((item: any) => ({
        ...item,
        roomName: item.rooms?.name,
        buildingName: item.rooms?.buildings?.name,
    }));
}

/**
 * Busca todos os equipamentos aninhados que não são dados de teste.
 */
async function getchild_items() {
    const data = await apiFetch('/child_items?is_test_data=eq.false&select=*,parent_items(label)');
    return (data || []).map((item: any) => ({
        ...item,
        parentName: item.parent_items?.label
    }));
}

/**
 * Busca todas as conexões ativas que não são dados de teste.
 */
async function getConnections() {
    const data = await apiFetch('/connections?is_test_data=eq.false&select=*,portA:portA_id(label,child_items(label,parent_items(label))),portB:portB_id(label,child_items(label,parent_items(label))),connectiontypes(name)');
    
    return (data || []).map((c: any) => ({
        id: c.id,
        itemA_label: c.portA?.child_items?.label || 'N/A',
        itemA_parentName: c.portA?.child_items?.parent_items?.label || null,
        portA_label: c.portA?.label || 'N/A',
        itemB_label: c.portB?.child_items?.label || null,
        itemB_parentName: c.portB?.child_items?.parent_items?.label || null,
        portB_label: c.portB?.label || null,
        connectionType: c.connectiontypes?.name || 'N/A',
        status: c.status,
    }));
}

/**
 * Exporta os dados selecionados para um arquivo Excel em formato base64.
 */
export async function exportData(dataTypes: string[]): Promise<string | null> {
    if (!dataTypes || dataTypes.length === 0) {
        throw new Error("Nenhum tipo de dado selecionado para exportação.");
    }
    
    const wb = XLSX.utils.book_new();
    let hasData = false;

    if (dataTypes.includes('parent_items')) {
        const data = await getparent_items();
        if (data.length > 0) {
            const mappedData = data.map(item => ({
                'ID': item.id,
                'Nome': item.label,
                'Tipo': item.type,
                'Status': item.status,
                'Sala': item.roomName,
                'Prédio': item.buildingName,
                'Nº de Série': item.serial_number,
                'Fabricante': item.brand,
                'Modelo': item.modelo,
                'Tamanho (U)': item.tamanho_u,
                'Potência (W)': item.potencia_w,
                'TAG': item.tag,
                'Proprietário (Email)': item.owneremail,
                'Descrição': item.description,
            }));
            const ws = XLSX.utils.json_to_sheet(mappedData);
            XLSX.utils.book_append_sheet(wb, ws, 'Itens de Planta');
            hasData = true;
        }
    }

    if (dataTypes.includes('child_items')) {
        const data = await getchild_items();
        if (data.length > 0) {
            const mappedData = data.map(item => ({
                'ID': item.id,
                'Nome': item.label,
                'Tipo': item.type,
                'Status': item.status,
                'Item Pai (Rack)': item.parentName,
                'Nº de Série': item.serial_number,
                'Fabricante': item.brand,
                'Modelo': item.modelo,
                'Tamanho (U)': item.tamanho_u,
                'Posição (U)': item.posicao_u,
            }));
            const ws = XLSX.utils.json_to_sheet(mappedData);
            XLSX.utils.book_append_sheet(wb, ws, 'Equipamentos Aninhados');
            hasData = true;
        }
    }
    
    if (dataTypes.includes('connections')) {
        const data = await getConnections();
        if (data.length > 0) {
            const mappedData = data.map(item => ({
                'ID': item.id,
                'Origem (Equipamento)': item.itemA_label,
                'Origem (Rack)': item.itemA_parentName,
                'Origem (Porta)': item.portA_label,
                'Destino (Equipamento)': item.itemB_label,
                'Destino (Rack)': item.itemB_parentName,
                'Destino (Porta)': item.portB_label,
                'Tipo de Conexão': item.connectionType,
                'Status': item.status,
            }));
            const ws = XLSX.utils.json_to_sheet(mappedData);
            XLSX.utils.book_append_sheet(wb, ws, 'Conexoes');
            hasData = true;
        }
    }
    
    if (!hasData) return null;

    // Gera o arquivo em memória como uma string base64 para o download no cliente
    return XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
}
