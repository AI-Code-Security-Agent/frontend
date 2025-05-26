import { useState, useCallback } from 'react';
import { ChatMessage, QueryRequest } from '@/lib/types';
import { apiService } from '@/lib/api';
import { generateId } from '@/lib/utils';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you find information from your knowledge base. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, options?: Partial<QueryRequest>) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await apiService.query({
        question: content.trim(),
        k: options?.k || 3,
        relevance_threshold: options?.relevance_threshold || 0.3,
      });

      // Replace loading message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: response.answer,
                sources: response.sources,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Replace loading message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${errorMessage}`,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: "Hello! I'm your AI assistant. I can help you find information from your knowledge base. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}