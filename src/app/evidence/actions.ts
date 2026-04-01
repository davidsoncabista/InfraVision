'use server';

import { apiFetch } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit-actions';
import { _getUserById } from '@/lib/user-service';
import { uploadImage } from '@/lib/storage-actions';

export interface Evidence {
    id: string;
    entity_id: string;
    entity_type: string;
    user_id: string;
    userdisplay_name: string;
    userphoto_url?: string | null;
    timestamp: string;
    type: 'note' | 'image' | 'file';
    data: {
        text?: string;
        url?: string;
        fileName?: string;
    };
}

interface SubmitEvidencePayload {
  description: string;
  image_urls: string[]; 
  user_id: string;
}

export async function submitEvidence(payload: SubmitEvidencePayload) {
  const { description, image_urls, user_id } = payload;
  const user = await _getUserById(user_id);

  if (!user) {
    throw new Error("Usuário não autenticado. Não é possível registrar a evidência.");
  }
  
  if (!description && image_urls.length === 0) {
      throw new Error("É necessário fornecer uma descrição ou pelo menos uma imagem.");
  }

  const uploadedFileUrls: string[] = [];

  try {
    for (let i = 0; i < image_urls.length; i++) {
        const dataURI = image_urls[i];
        const blobName = `evidence-general-${user.id}-${Date.now()}-${i}.jpg`;
        const url = await uploadImage(dataURI, blobName);
        uploadedFileUrls.push(url);
    }
    
    const evidenceId = `evid_${Date.now()}`;
    const dataToStore = {
        description: description,
        images: uploadedFileUrls,
    };

    // PostgREST: Endpoint e campos em minúsculo
    await apiFetch('/evidence', {
        method: 'POST',
        body: JSON.stringify({
            id: evidenceId,
            user_id: user.id,
            timestamp: new Date().toISOString(),
            type: 'general_report',
            data: dataToStore,
            entity_type: 'General',
            entity_id: `gen_${Date.now()}`
        })
    });

    await logAuditEvent({
        user,
        action: 'EVIDENCE_SUBMITTED',
        entity_type: 'evidence',
        entity_id: evidenceId,
        details: { description, imageCount: uploadedFileUrls.length }
    });

  } catch (error: any) {
    console.error("Erro ao submeter evidência:", error);
    throw new Error("Não foi possível salvar a evidência. Tente novamente.");
  }
}

export async function getRecentIncidentEvidence(): Promise<Evidence[]> {
    try {
        // PostgREST: Resource Embedding para simular o JOIN
        // Buscamos evidências de incidentes, trazendo display_name do usuário e descrição do incidente
        const url = `/evidence?entity_type=eq.Incidents&select=*,users:user_id(display_name,photo_url)&order=timestamp.desc&limit=20`;
        
        const data = await apiFetch(url);

        return (data || []).map((record: any) => ({
            id: record.id,
            entity_id: record.entity_id,
            entity_type: record.entity_type,
            user_id: record.user_id,
            userdisplay_name: record.users?.display_name || record.user_id,
            userphoto_url: record.users?.photo_url || null,
            timestamp: new Date(record.timestamp).toISOString(),
            type: record.type,
            // PostgREST retorna JSON como objeto se a coluna for JSONB, senão fazemos o parse
            data: typeof record.data === 'string' ? JSON.parse(record.data) : record.data,
        }));

    } catch (error) {
        console.error(`Erro ao buscar evidências de incidentes:`, error);
        return [];
    }
}
