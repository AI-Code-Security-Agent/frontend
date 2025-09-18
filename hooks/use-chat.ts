import { useState, useCallback } from "react";
import { ChatMessage, Session } from "@/types/types";
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
  const [messageCount, setMessageCount] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    Cookies.remove("sessionId");
    setError(null);
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
        feedback: null,
      };

      const loadingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
        modelType,
        feedback: null,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);
      setError(null);

     // console.log("current ses id:", currentSessionId);

      try {
        const response = await apiService.sendMessage(content, modelType, {
          ...settings,
          session_id:
            modelType === "llm" || modelType === "llm_demo"
              ? currentSessionId || undefined
              : undefined,
        });

        // console.log("response for look session id:", response);

        // Update session ID for LLM
        if (modelType === "llm" && response.sessionId) {
          setCurrentSessionId(response.sessionId);
          Cookies.set("sessionId", response.sessionId, { expires: 1 });
        }

        if (modelType === "llm_demo" && response.sessionId) {
          setCurrentSessionId(response.sessionId);
          Cookies.set("demo_sessionId", response.sessionId, { expires: 30 });
        }

        setMessageCount(response.messageCount ?? 0);

        console.log("response:", response);

        const assistantMessage: ChatMessage = {
          id: response.messageId || crypto.randomUUID(),
          role: "assistant",
          content: response.content,
          sources: response.sources,
          timestamp: new Date(),
          modelType,
          sessionId: response.sessionId,
          feedback:  null,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id ? assistantMessage : msg
          )
        );

        if (modelType !== "llm_demo") {
          fetchSessions(); // Refresh sessions after sending a message
        }
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

  const loadSessionMessages = useCallback(
    async (sessionId: string, mode: string) => {
      try {
        setIsLoading(true);
        let response;
        if (mode === "main") {
          response = await apiService.getSessionMessages(sessionId);
        } else {
          response = await apiService.getDemoSessionMessages(sessionId);
        }

        // console.log("response for load session messages:", response);

        const { session_messages, totalMessages } = response;

        const loadedMessages: ChatMessage[] = session_messages.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          modelType: msg.model || "llm",
          sessionId: msg.session,
          feedback: msg.feedback || null,
        }));

        setMessages(loadedMessages);
        setCurrentSessionId(sessionId);
        setMessageCount(totalMessages);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load session messages";
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
    messageCount,
  };
}
