'use server';

import { apiFetch } from "@/lib/db";
import * as XLSX from 'xlsx';

/**
 * Busca todos os itens de planta baixa que não são dados de teste.
 */
async function getParentItems() {
    const data = await apiFetch('/parentitems?istestdata=eq.false&select=*,rooms(name,buildings(name))');
    return (data || []).map((item: any) => ({
        ...item,
        roomName: item.rooms?.name,
        buildingName: item.rooms?.buildings?.name,
    }));
}

/**
 * Busca todos os equipamentos aninhados que não são dados de teste.
 */
async function getChildItems() {
    const data = await apiFetch('/childitems?istestdata=eq.false&select=*,parentitems(label)');
    return (data || []).map((item: any) => ({
        ...item,
        parentName: item.parentitems?.label
    }));
}

/**
 * Busca todas as conexões ativas que não são dados de teste.
 */
async function getConnections() {
    const data = await apiFetch('/connections?istestdata=eq.false&select=*,portA:portA_id(label,childitems(label,parentitems(label))),portB:portB_id(label,childitems(label,parentitems(label))),connectiontypes(name)');
    
    return (data || []).map((c: any) => ({
        id: c.id,
        itemA_label: c.portA?.childitems?.label || 'N/A',
        itemA_parentName: c.portA?.childitems?.parentitems?.label || null,
        portA_label: c.portA?.label || 'N/A',
        itemB_label: c.portB?.childitems?.label || null,
        itemB_parentName: c.portB?.childitems?.parentitems?.label || null,
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
        const data = await getParentItems();
        if (data.length > 0) {
            const mappedData = data.map(item => ({
                'ID': item.id,
                'Nome': item.label,
                'Tipo': item.type,
                'Status': item.status,
                'Sala': item.roomName,
                'Prédio': item.buildingName,
                'Nº de Série': item.serialnumber,
                'Fabricante': item.brand,
                'Modelo': item.modelo,
                'Tamanho (U)': item.tamanhou,
                'Potência (W)': item.potenciaw,
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
        const data = await getChildItems();
        if (data.length > 0) {
            const mappedData = data.map(item => ({
                'ID': item.id,
                'Nome': item.label,
                'Tipo': item.type,
                'Status': item.status,
                'Item Pai (Rack)': item.parentName,
                'Nº de Série': item.serialnumber,
                'Fabricante': item.brand,
                'Modelo': item.modelo,
                'Tamanho (U)': item.tamanhou,
                'Posição (U)': item.posicaou,
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
