// Demo chat session types and mock data
export enum DemoStatus {
  ACTIVE = "active",
  LIMIT_REACHED = "limit_reached"
}

export enum DemoMessageType {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system"
}


export const formatDemoLimitMessage = (limit: number): string => {
  return `You've reached the demo limit of ${limit} messages.`;
};

// Mock data for demo chat session
export const mockRootProps = {
  demoMessageLimit: 10,
  redirectPath: "/login",
  llmSettings: {
    max_tokens: 1000,
    temperature: 0.7
  }
};