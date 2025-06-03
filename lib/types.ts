export interface QueryRequest {
  question: string;
  k?: number;
  relevance_threshold?: number;
}

export interface DocumentSource {
  source: string;
  content: string;
  score: number;
}

export interface QueryResponse {
  answer: string;
  sources: DocumentSource[];
}

// LLM API Types
export interface LLMChatRequest {
  message: string;
  session_id?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface LLMChatResponse {
  response: string;
  session_id: string;
  message_count: number;
}

// Unified Message Type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: DocumentSource[];
  timestamp: Date;
  isLoading?: boolean;
  modelType: 'rag' | 'llm';
  sessionId?: string;
}

export interface ApiError {
  detail: string;
  error?: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  content: T | null;
}