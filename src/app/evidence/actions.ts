'use server';

import { apiFetch } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit-actions';
import { _getUserById } from '@/lib/user-service';
import { uploadImage } from '@/lib/storage-actions';

export interface Evidence {
    id: string;
    entityId: string;
    entityType: string;
    user_id: string;
    userDisplayName: string;
    userPhotoURL?: string | null;
    timestamp: string;
    type: 'note' | 'image' | 'file';
    data: {
        text?: string;
        url?: string;
        fileName?: string;
    };
    incidentDescription?: string;
}

interface SubmitEvidencePayload {
  description: string;
  imageUrls: string[]; 
  user_id: string;
}

export async function submitEvidence(payload: SubmitEvidencePayload) {
  const { description, imageUrls, user_id } = payload;
  const user = await _getUserById(user_id);

  if (!user) {
    throw new Error("Usuário não autenticado. Não é possível registrar a evidência.");
  }
  
  if (!description && imageUrls.length === 0) {
      throw new Error("É necessário fornecer uma descrição ou pelo menos uma imagem.");
  }

  const uploadedFileUrls: string[] = [];

  try {
    for (let i = 0; i < imageUrls.length; i++) {
        const dataURI = imageUrls[i];
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
            entitytype: 'General',
            entityid: `gen_${Date.now()}`
        })
    });

    await logAuditEvent({
        user,
        action: 'EVIDENCE_SUBMITTED',
        entityType: 'evidence',
        entityId: evidenceId,
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
        // Buscamos evidências de incidentes, trazendo displayname do usuário e descrição do incidente
        const url = `/evidence?entitytype=eq.Incidents&select=*,users:user_id(displayname,photourl),incidents:entityid(description)&order=timestamp.desc&limit=20`;
        
        const data = await apiFetch(url);

        return (data || []).map((record: any) => ({
            id: record.id,
            entityId: record.entityid,
            entityType: record.entitytype,
            user_id: record.user_id,
            userDisplayName: record.users?.displayname || record.user_id,
            userPhotoURL: record.users?.photourl || null,
            timestamp: new Date(record.timestamp).toISOString(),
            type: record.type,
            // PostgREST retorna JSON como objeto se a coluna for JSONB, senão fazemos o parse
            data: typeof record.data === 'string' ? JSON.parse(record.data) : record.data,
            incidentDescription: record.incidents?.description || 'Incidente não especificado',
        }));

    } catch (error) {
        console.error(`Erro ao buscar evidências de incidentes:`, error);
        return [];
    }
}
