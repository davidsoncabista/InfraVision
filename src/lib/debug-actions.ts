'use server';

import { apiFetch } from "./db";

/**
 * Interface compatível com o que o frontend do Hub espera.
 */
interface ColumnInfo {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  IS_NULLABLE: 'YES' | 'NO';
}

/**
 * Lista todas as tabelas e colunas consumindo a especificação OpenAPI do PostgREST.
 * Isso contorna a impossibilidade de ler information_schema via REST.
 */
export async function listAllTables() {
    try {
        // A raiz do PostgREST retorna o esquema OpenAPI (Swagger)
        const schema = await apiFetch('/');
        
        const columns: ColumnInfo[] = [];
        
        if (schema && schema.definitions) {
            Object.entries(schema.definitions).forEach(([tableName, definition]: [string, any]) => {
                if (definition.properties) {
                    Object.entries(definition.properties).forEach(([columnName, details]: [string, any]) => {
                        columns.push({
                            TABLE_SCHEMA: 'public',
                            TABLE_NAME: tableName,
                            COLUMN_NAME: columnName,
                            DATA_TYPE: details.type || 'unknown',
                            CHARACTER_MAXIMUM_LENGTH: details.maxLength || null,
                            IS_NULLABLE: (definition.required && definition.required.includes(columnName)) ? 'NO' : 'YES'
                        });
                    });
                }
            });
        }

        return { success: true, data: columns, error: null };
    } catch (error: any) {
        console.error("Erro ao listar esquema via OpenAPI:", error);
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Limpa o log de auditoria via REST.
 */
export async function clearAuditLog(): Promise<void> {
    try {
        await apiFetch('/auditlog', { method: 'DELETE' });
    } catch (error: any) {
        throw new Error(`Falha ao limpar log: ${error.message}`);
    }
}

/**
 * Teste simples de conectividade REST.
 */
export async function getMysqlTestConnection() {
    try {
        const result = await apiFetch('/users?limit=1');
        return { 
            success: true, 
            message: "Conexão com a API PostgREST (PostgreSQL) estabelecida com sucesso.", 
            data: result 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: `Falha na conexão REST: ${error.message}`, 
            data: null 
        };
    }
}
