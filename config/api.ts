// export const API_CONFIG = {
//   RAG_API: {
//     BASE_URL: process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000',
//     ENDPOINTS: {
//       QUERY: '/query',
//       HEALTH: '/health',
//     },
//   },
//   LLM_API: {
//     BASE_URL: process.env.NEXT_PUBLIC_LLM_API_URL || 'http://localhost:8001',
//     ENDPOINTS: {
//       CHAT: '/chat',
//       HEALTH: '/',
//       SESSIONS: '/sessions',
//     },
//   },
//   TIMEOUT: 30000, // 30 seconds
// } as const;

export const API_CONFIG = {
  RAG_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      QUERY: '/query',
      HEALTH: '/chat/health_rag',
    },
  },
  LLM_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      CHAT: '/chat/messages_llm',
      HEALTH: '/chat/health_llm',
      CHAT_STREAM: '/chat/stream',
      
    },
  },
  COMMON_API:{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS :{
      SESSIONS: '/chat/sessions',
      SESSIONS_CHATS: '/chat/sessions', //chat/sessions/:sessionId/messages
      SESSION_DELETE: '/chat/delete_session' ///chat/delete_session/:sessionId
    }
  },
  TIMEOUT: 30000, // 30 seconds
} as const;
 
export type ModelType = 'rag' | 'llm';