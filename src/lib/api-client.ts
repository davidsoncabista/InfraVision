const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
      throw new Error(`API Error (${response.status}): ${errorBody}`);
    }

    // PostgREST pode retornar vazio em DELETE ou POST dependendo do header Prefer
    if (response.status === 204) return null;

    return response.json();
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      }
      url += `?${queryString.toString()}`;
    }
    return this.request(url, { method: 'GET' }) as Promise<T>;
  }

  async post<T = any>(endpoint: string, data: any, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      }
      url += `?${queryString.toString()}`;
    }
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }) as Promise<T>;
  }

  async patch<T = any>(endpoint: string, data: any, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      }
      url += `?${queryString.toString()}`;
    }
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<T>;
  }

  async delete<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      }
      url += `?${queryString.toString()}`;
    }
    return this.request(url, {
      method: 'DELETE',
    }) as Promise<T>;
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export const apiGet = apiClient.get.bind(apiClient);
export const apiPost = apiClient.post.bind(apiClient);
export const apiPatch = apiClient.patch.bind(apiClient);
export const apiDelete = apiClient.delete.bind(apiClient);

export default apiClient;