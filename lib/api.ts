import { API_CONFIG, ModelType } from "@/config/api";
import {
  QueryRequest,
  QueryResponse,
  LLMChatRequest,
  LLMChatResponse,
  ApiError,
  Session,
  ApiResponse,
  AdminUser,
  AdminDashboardContent,
} from "../types/types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ChatMessage, GetSessionMessagesResponse } from "@/types/types";
import {
  UserProfile,
  PersonalInfoFormData,
  SecurityFormData,
} from "@/types/types";
import { promises } from "node:dns";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

function toTurns(
  history: import("@/types/types").ChatMessage[]
): { role: "user" | "assistant"; content: string }[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
}

export interface RAGChatPayload {
  question: string;
  k?: number;
  relevance_threshold?: number;
  code_focused?: boolean;
  session_id?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  selected_repositories?: string[]; // Updated to match RAG API schema
}

class UnifiedApiService {
  private ragBaseUrl: string;
  private llmBaseUrl: string;

  constructor() {
    this.ragBaseUrl = API_CONFIG.RAG_API.BASE_URL;
    this.llmBaseUrl = API_CONFIG.LLM_API.BASE_URL;
  }

  // Helper method to get auth token
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return Cookies.get("accessToken") || null;
    }
    return null;
  }

  // Helper method for fetch with timeout
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

  // ================================
  // TITLE GENERATION METHODS - ADD THESE
  // ================================

  async regenerateTitle(
    sessionId: string
  ): Promise<ApiResponse<{ title: string }>> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return {
          isSuccess: false,
          message: "Authentication required",
          content: null,
        };
      }

      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.SESSION_API.ENDPOINTS.REGENERATE_TITLE}/${sessionId}/regenerate-title`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || "Failed to regenerate title",
          content: null,
        };
      }

      return {
        isSuccess: true,
        message: data.message,
        content: { title: data.title },
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || "Network error",
        content: null,
      };
    }
  }

  async generateTitle(
    message: string
  ): Promise<ApiResponse<{ title: string }>> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return {
          isSuccess: false,
          message: "Authentication required",
          content: null,
        };
      }

      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.GENERATE_TITLE}`,
        {
          method: "POST",
          body: JSON.stringify({
            message,
            temperature: 0.3,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || "Failed to generate title",
          content: null,
        };
      }

      return {
        isSuccess: true,
        message: "Title generated successfully",
        content: { title: data.response },
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || "Network error",
        content: null,
      };
    }
  }

  // ================================
  // EXISTING METHODS - KEEP ALL OF THESE UNCHANGED
  // ================================

  // Non-Streaming Methods -Chat

  async ragQuery(request: RAGChatPayload): Promise<{
    response: string;
    sources: any[];
    session_id: string;
    message_count: number;
    message_id: string;
  }> {
    try {
      const response = await fetchWithAuth(
        `${this.ragBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.QUERY}`,
        { method: "POST", body: JSON.stringify(request) }
      );
      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(err.detail || "RAG query failed");
      }
      return await response.json();
    } catch (e: any) {
      if (e.name === "AbortError")
        throw new Error("RAG request timed out. Please try again.");
      throw e;
    }
  }

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

  async llmChatDemo(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.DEMO_CHAT}`;
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

  async sendMessage(
    message: string,
    modelType: ModelType,
    options: {
      k?: number;
      relevance_threshold?: number;
      session_id?: string;
      max_tokens?: number;
      temperature?: number;
      repository_id?: string; // Keep for backward compatibility
    } = {},
    currentMessages?: ChatMessage[]
  ): Promise<{
    content: string;
    sources?: any[];
    sessionId?: string;
    messageCount?: number;
    messageId?: string;
  }> {
    if (modelType === "rag") {
      const resp = await this.ragQuery({
        question: message,
        k: options.k,
        relevance_threshold: options.relevance_threshold,
        session_id: options.session_id,
        selected_repositories: options.repository_id ? [options.repository_id] : undefined, // Convert to array
        messages: currentMessages ? toTurns(currentMessages) : [],
      });
      return {
        content: resp.response,
        sources: resp.sources,
        sessionId: resp.session_id,
        messageCount: resp.message_count,
        messageId: resp.message_id,
      };
    } else if (modelType === "llm") {
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
        messageId: response.message_id,
      };
    } else {
      const response = await this.llmChatDemo({
        message,
        session_id: options.session_id,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
      });
      return {
        content: response.response,
        sessionId: response.session_id,
        messageCount: response.message_count,
        messageId: response.message_id,
      };
    }
  }

  // Edit chat message and resend
  async editMessage(
    messageId: string,
    newContent: string,
    modelType: ModelType,
    options: {
      session_id?: string;
      max_tokens?: number;
      temperature?: number;
    } = {}
  ): Promise<{
     content: string;
    sources?: any[];
    sessionId?: string;
    messageCount?: number;
    messageId?: string;
  }> {
    try {
      // ✅ Choose the correct endpoint
      const url = `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.EDIT_MESSAGE}`;

      // ✅ Create request body
      const body = {
        messageId: messageId,
        newContent: newContent,
        model_type: modelType,
        session_id: options.session_id,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
      };

      // ✅ Send request
      const response = await fetchWithAuth(url, {
        method: "POST", // or "POST" depending on your backend
        body: JSON.stringify(body),
      });

      // ✅ Handle errors
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || "Edit message failed");
      }

      // ✅ Return updated message
      const data = await response.json();
      return {
        content: data.response,
        sessionId: data.session_id,
        messageCount: data.message_count,
        messageId: data.message_id,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Message edit request timed out. Please try again.");
        }
        throw error;
      }
      throw new Error("An unexpected error occurred while editing message.");
    }
  }

  // Update chat feedback
  async updateFeedback(
    messageId: string,
    newFeedback: "like" | "dislike" | null
  ): Promise<any> {
    try {
      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.LLM_API.ENDPOINTS.MESSAGE_FEEDBACK}/${messageId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: newFeedback }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update feedback");
      }

      return result;
    } catch (error: any) {
      console.error("Error updating feedback:", error);
      throw new Error(error.message || "Failed to update feedback");
    }
  }

  // Streaming Methods

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

  private async readSSE(
    resp: Response,
    handlers: {
      onToken?: (t: string) => void;
      onMeta?: (m: any) => void;
      onDone?: () => void;
      onError?: (e: string) => void;
    }
  ) {
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

      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (!part.trim()) continue;

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
            const p = JSON.parse(dataLine);
            if (p.token) handlers.onToken?.(p.token);
          } catch {
            /* ignore */
          }
        } else if (eventType === "meta" && dataLine) {
          try {
            handlers.onMeta?.(JSON.parse(dataLine));
          } catch {
            /* ignore */
          }
        } else if (eventType === "error" && dataLine) {
          try {
            const p = JSON.parse(dataLine);
            handlers.onError?.(p.detail || "Stream error");
          } catch {
            handlers.onError?.("Stream error");
          }
        }
      }
    }
    handlers.onDone?.();
  }

  async ragQueryStream(
    request: QueryRequest,
    handlers: {
      onToken: (text: string) => void;
      onMeta?: (meta: {
        sources?: any[];
        functions_found?: string[];
        classes_found?: string[];
      }) => void;
      onDone?: () => void;
      onError?: (err: string) => void;
    }
  ): Promise<void> {
    const url = `${this.ragBaseUrl}${API_CONFIG.RAG_API.ENDPOINTS.QUERY_STREAM}`;
    const resp = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    await this.readSSE(resp, handlers);
  }

  // Health Check Methods

  async ragHealthCheck(): Promise<{ status: string }> {
    try {
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

  // Session API Methods

  async getSessionMessages(
    sessionId: string
  ): Promise<GetSessionMessagesResponse> {
    try {
      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.SESSION_API.ENDPOINTS.SESSIONS_CHATS}/${sessionId}/messages`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch session messages: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching session messages:", error);
      throw new Error("Failed to fetch session messages.");
    }
  }

  async getDemoSessionMessages(
    sessionId: string
  ): Promise<GetSessionMessagesResponse> {
    try {
      const response = await fetch(
        `${this.llmBaseUrl}${API_CONFIG.SESSION_API.ENDPOINTS.SESSIONS_CHATS}/${sessionId}/messages/demo`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch session messages: ${response.statusText}`
        );
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
      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.SESSION_API.ENDPOINTS.SESSIONS}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw new Error("Failed to fetching sessions");
    }
  }

  async deleteSession(
    sessionId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetchWithAuth(
        `${baseURL}${API_CONFIG.SESSION_API.ENDPOINTS.SESSION_DELETE}/${sessionId}`,
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

  // Profile API Methods

  async getProfileData(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.PROFILE_API.BASE_URL}${API_CONFIG.PROFILE_API.ENDPOINTS.GETUSERDATA}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching profile data:", error);

      return {
        isSuccess: false,
        message: "Failed to fetch profile data",
        content: null,
      };
    }
  }

  async updatePersonalData(
    data: PersonalInfoFormData
  ): Promise<ApiResponse<PersonalInfoFormData>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.PROFILE_API.BASE_URL}${API_CONFIG.PROFILE_API.ENDPOINTS.UPDATEPERSONALDATA}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update personal data");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating personal data:", error);

      return {
        isSuccess: false,
        message: "Failed to update personal data",
        content: null,
      };
    }
  }

  async updatePassword(
    data: SecurityFormData
  ): Promise<ApiResponse<SecurityFormData>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.PROFILE_API.BASE_URL}${API_CONFIG.PROFILE_API.ENDPOINTS.UPDATEPASSWORD}`,
        {
          method: "POST",
          body: JSON.stringify({
            newPassword: data.newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating password:", error);

      return {
        isSuccess: false,
        message: "Failed to update password",
        content: null,
      };
    }
  }

  async getAdminDashboardData(): Promise<ApiResponse<AdminDashboardContent>> {
    try {
      const response = await fetchWithAuth(
        `${this.llmBaseUrl}${API_CONFIG.ADDMIN_DASHBOARD_API.ENDPOINTS.DASHBOARDDATA}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return {
        isSuccess: false,
        message: "Failed to fetch dashboard data",
        content: null,
      };
    }
  }
}

export const apiService = new UnifiedApiService();
