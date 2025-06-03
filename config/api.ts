export const API_CONFIG = {
  RAG_API: {
    BASE_URL: process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
      QUERY: '/query',
      HEALTH: '/health',
    },
  },
  LLM_API: {
    BASE_URL: process.env.NEXT_PUBLIC_LLM_API_URL || 'http://localhost:8001',
    ENDPOINTS: {
      CHAT: '/chat',
      HEALTH: '/',
      SESSIONS: '/sessions',
    },
  },
  TIMEOUT: 30000, // 30 seconds
} as const;

export type ModelType = 'rag' | 'llm';