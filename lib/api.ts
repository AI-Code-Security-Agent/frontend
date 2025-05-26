import { API_CONFIG } from '@/config/api';
import { QueryRequest, QueryResponse, ApiError } from './types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = API_CONFIG.TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.QUERY}`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || 'Query failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`,
        { method: 'GET' },
      );

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to connect to API');
    }
  }
}

export const apiService = new ApiService();