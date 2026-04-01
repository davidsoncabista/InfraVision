'use server';

import { apiFetch } from './db';
import type { UserRole } from '@/components/permissions-provider';
import { getRolePermissions } from './role-actions';

export interface UserPreferences {
  hiddenMenuItems?: string[];
  inventoryColumns?: Record<string, Record<string, boolean>>;
}

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  signature_url: string | null;
  role: UserRole;
  permissions: string[];
  accessible_building_ids: string[];
  last_login_at: string;
  preferences?: UserPreferences;
  is_test_data?: boolean;
}

export async function _ensureDatabaseSchema(): Promise<string> {
    try {
        await apiFetch('/users?limit=1');
        return "Conexão com a API PostgREST verificada com sucesso.";
    } catch (error: any) {
        console.error("Falha ao verificar API:", error);
        throw new Error(`Falha ao conectar à API do banco de dados: ${error.message}`);
    }
}

const parseUser = (dbRecord: any): User => {
    return {
      ...dbRecord,
      // Fazemos o fallback para minúsculo caso o Postgres tenha ignorado as aspas na criação
      display_name: dbRecord.display_name || dbRecord.display_name || null,
      photo_url: dbRecord.photo_url || dbRecord.photo_url || null,
      signature_url: dbRecord.signature_url || dbRecord.signature_url || null,
      last_login_at: dbRecord.last_login_at || dbRecord.last_login_at ? new Date(dbRecord.last_login_at || dbRecord.last_login_at).toISOString() : new Date().toISOString(),
      permissions: typeof dbRecord.permissions === 'string' ? JSON.parse(dbRecord.permissions) : (dbRecord.permissions || []),
      accessible_building_ids: typeof (dbRecord.accessible_building_ids || dbRecord.accessible_building_ids) === 'string' 
        ? JSON.parse(dbRecord.accessible_building_ids || dbRecord.accessible_building_ids) 
        : (dbRecord.accessible_building_ids || dbRecord.accessible_building_ids || []),
      preferences: typeof dbRecord.preferences === 'string' ? JSON.parse(dbRecord.preferences) : (dbRecord.preferences || {}),
      is_test_data: !!(dbRecord.is_test_data || dbRecord.is_test_data),
    };
};

export async function _getUserByEmail(email: string): Promise<User | null> {
    const data = await apiFetch(`/users?email=eq.${encodeURIComponent(email.toLowerCase())}`);
    return data.length > 0 ? parseUser(data[0]) : null;
}

export async function _getUserById(id: string): Promise<User | null> {
    const data = await apiFetch(`/users?id=eq.${id}`);
    return data.length > 0 ? parseUser(data[0]) : null;
}

export async function _getUsers(): Promise<User[]> {
    const data = await apiFetch('/users');
    const parsed = data.map(parseUser);
    return parsed.sort((a: User, b: User) => (a.display_name || '').localeCompare(b.display_name || ''));
}

export async function _updateUserInDb(userData: Partial<User>): Promise<User> {
    const rolePermissions = await getRolePermissions();
    const lookupId = userData.id;
    if (!lookupId) throw new Error("ID obrigatório.");

    const existingUser = await _getUserById(lookupId);

    if (existingUser) {
        const merged = { ...existingUser, ...userData };
        if (userData.role && userData.role !== existingUser.role) {
            merged.permissions = rolePermissions[userData.role] || [];
        }

        const dataForDb = {
            email: merged.email,
            role: merged.role,
            permissions: merged.permissions,
            preferences: merged.preferences || {},
            display_name: merged.display_name,
            photo_url: merged.photo_url,
            last_login_at: merged.last_login_at || new Date().toISOString(),
            accessible_building_ids: merged.accessible_building_ids,
            is_test_data: merged.is_test_data,
            signature_url: merged.signature_url
        };

        const result = await apiFetch(`/users?id=eq.${lookupId}`, {
            method: 'PATCH',
            body: JSON.stringify(dataForDb),
            headers: { 'Prefer': 'return=representation' }
        });
        
        return result && result.length > 0 ? parseUser(result[0]) : merged;
    } else {
        const role = userData.role || 'guest';
        const dataToInsert = {
            id: userData.id,
            email: userData.email?.toLowerCase(),
            display_name: userData.display_name || userData.email,
            photo_url: userData.photo_url || null,
            signature_url: userData.signature_url || null,
            role: role,
            last_login_at: new Date().toISOString(),
            permissions: rolePermissions[role] || [],
            accessible_building_ids: [],
            preferences: {},
            is_test_data: !!userData.is_test_data
        };

        const result = await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify(dataToInsert),
            headers: { 'Prefer': 'return=representation' }
        });
        
        return result && result.length > 0 ? parseUser(result[0]) : dataToInsert as User;
    }
}

export async function _deleteUser(user_id: string): Promise<void> {
    await apiFetch(`/users?id=eq.${user_id}`, {
        method: 'DELETE'
    });
}
