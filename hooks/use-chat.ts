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
      settings: { k?: number; relevance_threshold?: number; max_tokens?: number; temperature?: number } = {}
    ) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        modelType,
      };

      // Prepare a loading/streaming assistant msg
      const assistantId = crypto.randomUUID();
      const loadingMessage: ChatMessage = {
        id: assistantId,
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
        if (modelType === "rag") {
          // keep existing non-stream path for RAG
          const response = await apiService.sendMessage(content, "rag", {
            k: settings.k,
            relevance_threshold: settings.relevance_threshold,
          });
          // finalize assistant
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isLoading: false, content: response.content, sources: response.sources }
                : m
            )
          );
        } else {
          // STREAMING for LLM
          const session_id = currentSessionId || undefined;

          await apiService.sendMessageStream(
            content,
            { session_id, max_tokens: settings.max_tokens, temperature: settings.temperature },
            {
              onToken: (token) => {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: (m.content || "") + token } : m
                  )
                );
              },
              onDone: (meta) => {
                // update session id if provided
                if (meta?.session_id) {
                  setCurrentSessionId(meta.session_id);
                  Cookies.set("sessionId", meta.session_id, { expires: 1 });
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, isLoading: false, sessionId: meta?.session_id || session_id }
                      : m
                  )
                );
                fetchSessions(); // refresh list
              },
              onError: (errMsg) => {
                setError(errMsg);
                options.onError?.(errMsg);
                // remove the streaming assistant bubble
                setMessages((prev) => prev.filter((m) => m.id !== assistantId));
              },
            }
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        options.onError?.(errorMessage);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
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
