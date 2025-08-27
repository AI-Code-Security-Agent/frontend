export interface QueryRequest {
  question: string;
  k?: number;
  relevance_threshold?: number;
  code_focused?: boolean;
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
  modelType: 'rag' | 'llm' | 'llm_demo';
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

export interface Session {
  _id: string;
  user: string;
  title: string;
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  profilePicture?: string;
}

export interface PersonalInfoFormData {
  fullname: string;
  email: string;
}

export interface SecurityFormData {
  newPassword: string;
  confirmPassword: string;
}