export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
      QUERY: '/query',
      HEALTH: '/health',
    },
    TIMEOUT: 30000, // 30 seconds
  } as const;