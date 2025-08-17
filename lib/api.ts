import { API_CONFIG, ModelType } from "@/config/api";
import {
  QueryRequest,
  QueryResponse,
  LLMChatRequest,
  LLMChatResponse,
  ApiError,
  Session
} from "./types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ChatMessage } from '@/lib/types';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

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
          "Content-Type": "application/json",
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
          method: "POST",
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || "RAG query failed");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("RAG request timed out. Please try again.");
        }
        throw error;
      }
      throw new Error("An unexpected error occurred with RAG API");
    }
  }

  // LLM API Methods
  async llmChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {

      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.CHAT}`;
      const response = await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || "LLM chat failed");
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("LLM request timed out. Please try again.");
        }
        throw error;
      }
      throw new Error("An unexpected error occurred with LLM API");
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
    if (modelType === "rag") {
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

  async llmChatStream(
    request: LLMChatRequest,
    handlers: {
      onToken: (text: string) => void;
      onDone?: (meta?: { session_id?: string; message_count?: number }) => void;
      onError?: (err: string) => void;
    }
  ): Promise<void> {
    try {
      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.CHAT_STREAM}`;
      const resp = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          // Important: accept SSE
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!resp.ok || !resp.body) {
        const errText = await resp.text().catch(() => "");
        throw new Error(errText || `HTTP ${resp.status}: ${resp.statusText}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames separated by \n\n
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataLine = "";

          for (const l of lines) {
            if (l.startsWith("event:")) eventType = l.slice(6).trim();
            if (l.startsWith("data:")) dataLine = l.slice(5).trim();
          }

          if (dataLine === "[DONE]") {
            handlers.onDone?.();
            return;
          }

          if (eventType === "token" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              if (payload.token) handlers.onToken(payload.token);
            } catch {
              // ignore malformed
            }
          } else if (eventType === "meta" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              handlers.onDone?.(payload);
            } catch {
              handlers.onDone?.();
            }
          } else if (eventType === "error" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              handlers.onError?.(payload.detail || "Stream error");
            } catch {
              handlers.onError?.("Stream error");
            }
          }
        }
      }
      handlers.onDone?.();
    } catch (e: any) {
      handlers.onError?.(e?.message || "LLM stream failed");
    }
  }

   async sendMessageStream(
    message: string,
    options: { session_id?: string; max_tokens?: number; temperature?: number },
    handlers: {
      onToken: (text: string) => void;
      onDone?: (meta?: { session_id?: string; message_count?: number }) => void;
      onError?: (err: string) => void;
    }
  ) {
    return this.llmChatStream(
      {
        message,
        session_id: options.session_id,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
      },
      handlers
    );
  }

  async llmDemoChatStream(
    request: LLMChatRequest,
    handlers: {
      onToken: (text: string) => void;
      onDone?: (meta?: { session_id?: string; message_count?: number }) => void;
      onError?: (err: string) => void;
    }
  ): Promise<void> {
    try {
      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.DEMO_CHAT_STREAM}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          // Important: accept SSE
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!resp.ok || !resp.body) {
        const errText = await resp.text().catch(() => "");
        throw new Error(errText || `HTTP ${resp.status}: ${resp.statusText}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames separated by \n\n
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataLine = "";

          for (const l of lines) {
            if (l.startsWith("event:")) eventType = l.slice(6).trim();
            if (l.startsWith("data:")) dataLine = l.slice(5).trim();
          }

          if (dataLine === "[DONE]") {
            handlers.onDone?.();
            return;
          }

          if (eventType === "token" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              if (payload.token) handlers.onToken(payload.token);
            } catch {
              // ignore malformed
            }
          } else if (eventType === "meta" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              handlers.onDone?.(payload);
            } catch {
              handlers.onDone?.();
            }
          } else if (eventType === "error" && dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              handlers.onError?.(payload.detail || "Stream error");
            } catch {
              handlers.onError?.("Stream error");
            }
          }
        }
      }
      handlers.onDone?.();
    } catch (e: any) {
      handlers.onError?.(e?.message || "LLM stream failed");
    }
  }
   async sendDemoMessageStream(
    message: string,
    options: { session_id?: string; max_tokens?: number; temperature?: number },
    handlers: {
      onToken: (text: string) => void;
      onDone?: (meta?: { session_id?: string; message_count?: number }) => void;
      onError?: (err: string) => void;
    }
  ) {
    console.log("Sending Demo Message Stream in api:", message, options);
    return this.llmDemoChatStream(
      {
        message,
        session_id: options.session_id,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
      },
      handlers
    );
  }

 

  // updated RAG healthcheck function
  async ragHealthCheck(): Promise<{ status: string }> {
    try {
      // const response = await fetch(
      //   `${this.ragBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.HEALTH}`,
      //   { method: "GET" }
      // );

      const url = `${this.llmBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.HEALTH}`;
      const response = await fetchWithAuth(url, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`RAG health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error("Failed to connect to RAG API");
    }
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.COMMON_API.ENDPOINTS.SESSIONS_CHATS}/${sessionId}/messages`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch session messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching session messages:", error);
      throw new Error("Failed to fetch session messages.");
    }
  }

  async fetchSessions(): Promise<Session[]> {
    try {
      const response = await fetchWithAuth(`${this.llmBaseUrl}${API_CONFIG.COMMON_API.ENDPOINTS.SESSIONS}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw new Error("Failed to fetching sessions");
    }
  }

  async deleteSession(sessionId: string): Promise<{ isSuccess: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(
      `${baseURL}${API_CONFIG.COMMON_API.ENDPOINTS.SESSION_DELETE}/${sessionId}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete session");
    }

    return result;
  } catch (error: any) {
    console.error("Error deleting sessions:", error);
    throw new Error(error.message || "Failed to delete session");
  }
}

  
  // updated LLM healthcheck function
  async llmHealthCheck(): Promise<{
    message: string;
    model: string;
    active_sessions: number;
  }> {
    try {
      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.HEALTH}`;
      const response = await fetchWithAuth(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`LLM health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in LLM Health Check:", error);
      throw new Error("Failed to connect to LLM API");
    }
  }

  async healthCheck(modelType: ModelType): Promise<boolean> {
    try {
      if (modelType === "rag") {
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
