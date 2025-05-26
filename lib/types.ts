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
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: DocumentSource[];
    timestamp: Date;
    isLoading?: boolean;
  }
  
  export interface ApiError {
    detail: string;
    error?: string;
  }