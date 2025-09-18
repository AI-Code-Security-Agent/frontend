export interface UserTypes {
  _id?: string;
  fullname: string;
  email: string;
  password?: string;
  gitAccessToken?: string;
}


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
  message_id:string;
}

export interface GetSessionMessagesResponse {
  session_messages: ChatMessage[];
  totalMessages: number;
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
  feedback: 'like' | 'dislike' | null;
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

// Session Types
export interface Session {
  _id: string;
  user: string;
  title: string;
  createdAt: string;
}

// user profile and settings types
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

// Dashboard Types
export interface AdminUser {
  _id: string;
  fullname: string;
  email: string;
  role: "admin";
}

export interface AdminDashboardContent {
  totalUsers: number;
  totalAdmins: number;
  totalChats: number;
  totalUserChats: number;
  totalAssistantChats: number;
  totalSessions: number;
  totalDemoSessions: number;
  totalLikes: number;
  totalDislikes: number;
  adminData: AdminUser[];
}

