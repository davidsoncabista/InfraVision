// Configuração centralizada da API PostgREST
// O banco de dados agora é acessado via chamadas REST HTTPS pelo túnel do Cloudflare.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro na API (${response.status}): ${errorBody}`);
    }

    // O PostgREST pode retornar vazio em DELETE ou POST dependendo do cabeçalho Prefer
    if (response.status === 204) return null;
    
    return response.json();
}
