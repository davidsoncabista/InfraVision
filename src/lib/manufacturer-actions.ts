'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './db';

export interface Manufacturer {
  id: string;
  name: string;
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  return apiFetch('/manufacturers?order=name.asc');
}

export async function addManufacturer(data: { name: string }) {
  const newId = `man_${Date.now()}`;
  await apiFetch('/manufacturers', {
    method: 'POST',
    body: JSON.stringify({ id: newId, name: data.name })
  });
  revalidatePath('/system');
}

export async function updateManufacturer(id: string, data: { name: string }) {
    await apiFetch(`/manufacturers?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: data.name })
    });
    revalidatePath('/system');
}

export async function deleteManufacturer(id: string) {
    await apiFetch(`/manufacturers?id=eq.${id}`, { method: 'DELETE' });
    revalidatePath('/system');
}
