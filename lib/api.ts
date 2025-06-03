import { API_CONFIG, ModelType } from '@/config/api';
import { 
  QueryRequest, 
  QueryResponse, 
  LLMChatRequest, 
  LLMChatResponse, 
  ApiError 
} from './types';

class UnifiedApiService {
  private ragBaseUrl: string;
  private llmBaseUrl: string;

  constructor() {
    this.ragBaseUrl = API_CONFIG.RAG_API.BASE_URL;
    this.llmBaseUrl = API_CONFIG.LLM_API.BASE_URL;
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

  // RAG API Methods
  async ragQuery(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.ragBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.QUERY}`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || 'RAG query failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('RAG request timed out. Please try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred with RAG API');
    }
  }

  async ragHealthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.ragBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.HEALTH}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`RAG health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to connect to RAG API');
    }
  }

  // LLM API Methods
  async llmChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.CHAT}`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || 'LLM chat failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('LLM request timed out. Please try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred with LLM API');
    }
  }

  async llmHealthCheck(): Promise<{ message: string; model: string; active_sessions: number }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.HEALTH}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`LLM health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to connect to LLM API');
    }
  }

  // Unified method for both APIs
  async sendMessage(
    message: string, 
    modelType: ModelType, 
    options: {
      // RAG options
      k?: number;
      relevance_threshold?: number;
      // LLM options
      session_id?: string;
      max_tokens?: number;
      temperature?: number;
    } = {}
  ): Promise<{
    content: string;
    sources?: any[];
    sessionId?: string;
    messageCount?: number;
  }> {
    if (modelType === 'rag') {
      const response = await this.ragQuery({
        question: message,
        k: options.k,
        relevance_threshold: options.relevance_threshold,
      });
      return {
        content: response.answer,
        sources: response.sources,
      };
    } else {
      const response = await this.llmChat({
        message,
        session_id: options.session_id,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
      });
      return {
        content: response.response,
        sessionId: response.session_id,
        messageCount: response.message_count,
      };
    }
  }

  async healthCheck(modelType: ModelType): Promise<boolean> {
    try {
      if (modelType === 'rag') {
        await this.ragHealthCheck();
      } else {
        await this.llmHealthCheck();
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new UnifiedApiService();