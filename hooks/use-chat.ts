import { useState, useCallback } from "react";
import { ChatMessage, Session } from "@/lib/types";
import { apiService } from "@/lib/api";
import { ModelType } from "@/config/api";
import Cookies from "js-cookie";

interface UseChatOptions {
  onError?: (error: string) => void;
}

export function useUnifiedChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
const [sessions, setSessions] = useState<Session[]>([]);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
    Cookies.remove("sessionId");
  }, []);

  const sendMessage = useCallback(
    async (
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
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        modelType,
      };

      const loadingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
        modelType,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.sendMessage(content, modelType, {
          ...settings,
          session_id:
            modelType === "llm" ? currentSessionId || undefined : undefined,
        });

        // console.log("response for look session id:", response);

        // Update session ID for LLM
        if (modelType === "llm" && response.sessionId) {
          setCurrentSessionId(response.sessionId);
          Cookies.set("sessionId", response.sessionId, { expires: 1 });
        }



        // console.log("content:", response);

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.content,
          sources: response.sources,
          timestamp: new Date(),
          modelType,
          sessionId: response.sessionId,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id ? assistantMessage : msg
          )
        );

        fetchSessions(); // Refresh sessions after sending a message

        // Clear loading message
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessage.id)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        options.onError?.(errorMessage);

        // Remove loading message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessage.id)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, options]
  );

  const fetchSessions = async () => {
    const sessions = await apiService.fetchSessions();
    setSessions(sessions);
  };

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.getSessionMessages(sessionId);
      const loadedMessages: ChatMessage[] = response.map((msg: any) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        modelType: msg.model || "llm",
        sessionId: msg.session,
      }));

      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load session messages";
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // console.log("messages", messages);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    clearError,
    currentSessionId,
    loadSessionMessages,
    fetchSessions,
    sessions,
    setSessions,
  };
}
