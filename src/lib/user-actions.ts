
'use server';

import { revalidatePath } from 'next/cache';
import { _getUsers, _getUserByEmail, _updateUserInDb, User, _deleteUser, _ensureDatabaseSchema, _getUserById, UserPreferences } from "./user-service";
import { logAuditEvent } from './audit-actions';

async function getAdminUser() {
    return { id: 'system_admin', display_name: 'System Admin', email: 'admin@system.local' } as User;
}

export async function ensureDatabaseSchema(): Promise<string> {
    return _ensureDatabaseSchema();
}

export async function getUsers(): Promise<User[]> {
    return _getUsers();
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return _getUserByEmail(email);
}

export async function getUserById(id: string): Promise<User | null> {
    if (!id) return null;
    return _getUserById(id);
}

export async function updateUser(userData: Partial<User>): Promise<User> {
    if (!userData.email && !userData.id) {
        throw new Error("O email ou ID do usuário é obrigatório para a operação.");
    }
    const adminUser = await getAdminUser();
    
    const isCreating = userData.id ? !(await _getUserById(userData.id)) : !(await _getUserByEmail(userData.email!));

    try {
        const savedUser = await _updateUserInDb(userData);
        
        const keysBeingUpdated = Object.keys(userData);
        const isOnlyLoginUpdate = keysBeingUpdated.length === 2 && keysBeingUpdated.includes('id') && keysBeingUpdated.includes('last_login_at');

        if (!isOnlyLoginUpdate) {
            await logAuditEvent({
                user: adminUser,
                action: isCreating ? 'USER_CREATED' : 'USER_UPDATED',
                entity_type: 'User',
                entity_id: savedUser.id,
                details: { data: { email: savedUser.email, role: savedUser.role } }
            });
        }
        
        revalidatePath('/users');
        revalidatePath('/profile');
        return savedUser;

    } catch (error: any) {
        console.error(`Falha na operação de ${isCreating ? 'criação' : 'atualização'} do usuário:`, error);
        throw new Error(error.message);
    }
}

export async function deleteUser(user_id: string): Promise<void> {
    if (!user_id) {
        throw new Error("O ID do usuário é obrigatório para a exclusão.");
    }
    
    const adminUser = await getAdminUser();
    const userToDelete = await _getUserById(user_id); 
    
    if (userToDelete) {
        await _deleteUser(userToDelete.id);
        
        await logAuditEvent({
            user: adminUser,
            action: 'USER_DELETED',
            entity_type: 'User',
            entity_id: user_id,
            details: { email: userToDelete.email, display_name: userToDelete.display_name }
        });
        
        revalidatePath('/users');
    } else {
        throw new Error('Usuário não encontrado no banco de dados para exclusão.');
    }
}

export async function updateUserPreferences(user_id: string, preferences: UserPreferences): Promise<void> {
  if (!user_id) {
    throw new Error('O ID do usuário é obrigatório para atualizar as preferências.');
  }
  
  try {
    await _updateUserInDb({ id: user_id, preferences: preferences } as User);
    revalidatePath('/inventory');
    revalidatePath('/settings');
    revalidatePath('/users');
  } catch (error: any) {
    throw new Error(error.message);
  }
}
