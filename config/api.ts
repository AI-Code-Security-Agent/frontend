
export const API_CONFIG = {
  RAG_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      QUERY: '/chat/query',
      QUERY_STREAM: '/chat/query/stream', 
      HEALTH: '/chat/health_rag',
    },
  },
  LLM_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      CHAT: '/chat/messages_llm',
      EDIT_MESSAGE: '/chat/edit_message', 
      HEALTH: '/chat/health_llm',
      CHAT_STREAM: '/chat/stream',
      DEMO_CHAT_STREAM:'/chat/demo/stream',
      DEMO_CHAT:'/chat/demo/messages_llm', // demo llm chat endpoint
      MESSAGE_FEEDBACK: '/chat/messages/feedback', // /chat/messages/feedback/:messageId
      GENERATE_TITLE: '/chat/generate-title',
      
    },
  },
  SESSION_API:{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS :{
      SESSIONS: '/chat/sessions',
      SESSIONS_CHATS: '/chat/sessions', //chat/sessions/:sessionId/messages     || chat/sessions/:sessionId/messages/demo
      SESSION_DELETE: '/chat/delete_session', ///chat/delete_session/:sessionId
      REGENERATE_TITLE: '/chat/sessions',
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
  ADDMIN_DASHBOARD_API:{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS :{
      DASHBOARDDATA: '/admin/dashboard',
    }
  },
  REPOSITORIES_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      LIST: '/repositories',
      CONNECT: '/repositories/connect',
      DISCONNECT: '/repositories', // /:id
      REINDEX: '/repositories', // /:id/reindex
      PROGRESS: '/repositories', // /:id/progress
    }
  },
  GITHUB_API: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
    ENDPOINTS: {
      INITIATE_AUTH: '/github/auth/initiate',
      CALLBACK: '/github/auth/callback',
      STATUS: '/github/status',
      ACCEPT_TERMS: '/github/terms/accept',
      REPOSITORIES: '/github/repositories',
      BRANCHES: '/github/repositories', // /:owner/:repo/branches
      CONNECT_REPO: '/github/repositories/connect',
      DISCONNECT_REPO: '/github/repositories', // /:repositoryId
      DISCONNECT: '/github/disconnect',
    }
  },
  TIMEOUT: 120000, // 60 seconds
} as const;

// Helper to build API endpoints
export const API_ENDPOINTS = {
  REPOSITORIES: {
    BASE: `${API_CONFIG.REPOSITORIES_API.BASE_URL}${API_CONFIG.REPOSITORIES_API.ENDPOINTS.LIST}`,
    LIST: `${API_CONFIG.REPOSITORIES_API.BASE_URL}${API_CONFIG.REPOSITORIES_API.ENDPOINTS.LIST}`,
    CONNECT: `${API_CONFIG.REPOSITORIES_API.BASE_URL}${API_CONFIG.REPOSITORIES_API.ENDPOINTS.CONNECT}`,
  },
  CHAT: {
    QUERY: `${API_CONFIG.RAG_API.BASE_URL}${API_CONFIG.RAG_API.ENDPOINTS.QUERY}`,
    STREAM: `${API_CONFIG.RAG_API.BASE_URL}${API_CONFIG.RAG_API.ENDPOINTS.QUERY_STREAM}`,
  }
} as const;

export type ModelType = 'rag' | 'llm' | 'llm_demo';