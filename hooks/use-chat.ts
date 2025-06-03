import { useState, useCallback } from 'react';
import { ChatMessage } from '@/lib/types';
import { apiService } from '@/lib/api';
import { ModelType } from '@/config/api';

interface UseChatOptions {
  onError?: (error: string) => void;
}

export function useUnifiedChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    modelType: ModelType,
    settings: {
      // RAG settings
      k?: number;
      relevance_threshold?: number;
      // LLM settings
      max_tokens?: number;
      temperature?: number;
    } = {}
  ) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      modelType,
    };

    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      modelType,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.sendMessage(content, modelType, {
        ...settings,
        session_id: modelType === 'llm' ? currentSessionId || undefined : undefined,
      });

      // Update session ID for LLM
      if (modelType === 'llm' && response.sessionId) {
        setCurrentSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        sources: response.sources,
        timestamp: new Date(),
        modelType,
        sessionId: response.sessionId,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? assistantMessage : msg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);

      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, options]);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    clearError,
    currentSessionId,
  };
}