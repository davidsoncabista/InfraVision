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
  displayName: string | null;
  photoURL: string | null;
  signatureUrl: string | null;
  role: UserRole;
  permissions: string[];
  accessiblebuilding_ids: string[];
  lastLoginAt: string;
  preferences?: UserPreferences;
  isTestData?: boolean;
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
      displayName: dbRecord.displayName || dbRecord.displayname || null,
      photoURL: dbRecord.photoURL || dbRecord.photourl || null,
      signatureUrl: dbRecord.signatureUrl || dbRecord.signatureurl || null,
      lastLoginAt: dbRecord.lastLoginAt || dbRecord.lastloginat ? new Date(dbRecord.lastLoginAt || dbRecord.lastloginat).toISOString() : new Date().toISOString(),
      permissions: typeof dbRecord.permissions === 'string' ? JSON.parse(dbRecord.permissions) : (dbRecord.permissions || []),
      accessiblebuilding_ids: typeof (dbRecord.accessiblebuilding_ids || dbRecord.accessiblebuilding_ids) === 'string' 
        ? JSON.parse(dbRecord.accessiblebuilding_ids || dbRecord.accessiblebuilding_ids) 
        : (dbRecord.accessiblebuilding_ids || dbRecord.accessiblebuilding_ids || []),
      preferences: typeof dbRecord.preferences === 'string' ? JSON.parse(dbRecord.preferences) : (dbRecord.preferences || {}),
      isTestData: !!(dbRecord.isTestData || dbRecord.istestdata),
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
    return parsed.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
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
            displayName: merged.displayName,
            photoURL: merged.photoURL,
            lastLoginAt: merged.lastLoginAt || new Date().toISOString(),
            accessiblebuilding_ids: merged.accessiblebuilding_ids,
            isTestData: merged.isTestData,
            signatureUrl: merged.signatureUrl
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
            displayName: userData.displayName || userData.email,
            photoURL: userData.photoURL || null,
            role: role,
            lastLoginAt: new Date().toISOString(),
            permissions: rolePermissions[role] || [],
            accessiblebuilding_ids: [],
            preferences: {},
            isTestData: !!userData.isTestData
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
