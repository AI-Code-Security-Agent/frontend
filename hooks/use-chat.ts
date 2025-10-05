import { useState, useCallback } from "react";
import { ChatMessage, Session } from "@/types/types";
import { apiService } from "@/lib/api";
import { ModelType } from "@/config/api";
import Cookies from "js-cookie";
import { toast } from "sonner"; // Add this import

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

  // Add the regenerate title function
  const regenerateTitle = useCallback(async (sessionId: string) => {
    try {
      const result = await apiService.regenerateTitle(sessionId);
      
      if (result.isSuccess && result.content) {
        toast.success("Title regenerated successfully");
        
        // Update the sessions list with new title
        setSessions((prev) =>
          prev.map((session) =>
            session._id === sessionId
              ? { ...session, title: result.content!.title }
              : session
          )
        );
        
        return result.content.title;
      } else {
        toast.error(result.message || "Failed to regenerate title");
        return null;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate title");
      console.error("Regenerate title error:", error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      modelType: ModelType,
      settings: {
        k?: number;
        relevance_threshold?: number;
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

      try {
        const response = await apiService.sendMessage(content, modelType, {
          ...settings,
          session_id: currentSessionId || undefined,
        }, [...messages, userMessage]);

        if (response.sessionId) {
        setCurrentSessionId(response.sessionId);
        const cookieKey = modelType === "llm_demo" ? "demo_sessionId" : "sessionId";
        Cookies.set(cookieKey, response.sessionId, { expires: modelType === "llm_demo" ? 30 : 1 });
      }

        setMessageCount(response.messageCount ?? 0);

        const assistantMessage: ChatMessage = {
          id: response.messageId || crypto.randomUUID(),
          role: "assistant",
          content: response.content,
          sources: response.sources,
          timestamp: new Date(),
          modelType,
          sessionId: response.sessionId,
          feedback: null,
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
        setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));
    } catch (err:any) {
      const msg = err?.message || "An unexpected error occurred";
      setError(msg); options.onError?.(msg);
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));
    } finally {
      setIsLoading(false);
      }
    },
    [currentSessionId, messages, options]
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

        const { session_messages, totalMessages } = response;

        console.log('loaded session messages :',session_messages)
        console.log('total messages :',totalMessages)

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
    regenerateTitle, // Add this to the return object
  };
}