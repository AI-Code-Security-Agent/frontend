
export const API_CONFIG = {
  RAG_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      QUERY: '/query',
      QUERY_STREAM: '/chat/query/stream', 
      HEALTH: '/chat/health_rag',
    },
  },
  LLM_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      CHAT: '/chat/messages_llm',
      HEALTH: '/chat/health_llm',
      CHAT_STREAM: '/chat/stream',
      DEMO_CHAT_STREAM:'/chat/demo/stream'
      
    },
  },
  SESSION_API:{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS :{
      SESSIONS: '/chat/sessions',
      SESSIONS_CHATS: '/chat/sessions', //chat/sessions/:sessionId/messages
      SESSION_DELETE: '/chat/delete_session' ///chat/delete_session/:sessionId
    }
  },
  PROFILE_API:{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS :{
      GETUSERDATA: '/profile/profile_data',
      UPDATEPERSONALDATA: '/profile/update_personal_data',
      DELETEPROFILE: '/profile/delete',
      UPDATEPASSWORD: '/profile/update_password'
    }
  },
  TIMEOUT: 30000, // 30 seconds
} as const;

export type ModelType = 'rag' | 'llm' | 'llm_demo';