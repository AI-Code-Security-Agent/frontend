"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatMessage } from "@/components/chat/chat-message";
import { DemoMessageCounter } from "./DemoMessageCounter";
import { DemoLimitAlert } from "./DemoLimitAlert";
import {
  Brain,
  Send,
  Trash2,
  MessageSquarePlus,
  AlertCircle,
  Loader2,
  Code,
} from "lucide-react";
import { useUnifiedChat } from "@/hooks/use-chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { mockRootProps } from "@/lib/mock-data/demoMockData";
import { ProjectLogo } from "../common/ProjectLogo";
import Cookies from "js-cookie";

interface CreateDemoChatSessionProps {
  messageLimit?: number;
  onLimitReached?: () => void;
  redirectPath?: string;
}

export function CreateDemoChatSession({
  messageLimit = mockRootProps.demoMessageLimit,
  redirectPath = mockRootProps.redirectPath,
  onLimitReached,
}: CreateDemoChatSessionProps) {
  const router = useRouter();
  const {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    clearError,
    loadSessionMessages,
    currentSessionId,
    messageCount,
  } = useUnifiedChat();

  const [input, setInput] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const cookieSessionId = Cookies.get("demo_sessionId");
    if (cookieSessionId) {
      loadSessionMessages(cookieSessionId, "demo");
    }
  }, [loadSessionMessages, currentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messageCount > userMessageCount) {
      setUserMessageCount(messageCount);
    }
  }, [messageCount]);

  // Focus textarea when not loading
  useEffect(() => {
    if (!isLoading && textareaRef.current && !isLimitReached) {
      textareaRef.current.focus();
    }
  }, [isLoading, isLimitReached]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 5 * 24; // 5 lines * line height
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  }, [input]);

  // Check if limit is reached
  useEffect(() => {
    if (userMessageCount >= messageLimit && !isLimitReached) {
      setIsLimitReached(true);
      onLimitReached?.();
      toast.info(`Demo limit reached! Sign in to continue chatting.`);
    }
  }, [userMessageCount, messageLimit, isLimitReached, onLimitReached]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isLimitReached) return;

    const message = input.trim();
    setInput("");
    setUserMessageCount((prev) => prev + 1);

    const settings = mockRootProps.llmSettings;
    await sendMessage(message, "llm_demo", settings);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = () => {
    clearChat();
    setUserMessageCount(0);
    setIsLimitReached(false);
    setInput("");
    clearError();
  };

  const handleSignIn = () => {
    router.push(redirectPath);
  };

  const handleQuickAction = (message: string) => {
    if (isLimitReached || isLoading) return;

    setUserMessageCount((prev) => prev + 1);
    const settings = mockRootProps.llmSettings;
    sendMessage(message, "llm_demo", settings);
  };

  return (
    <div className="flex h-screen max-w-full bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between h-14 border-b px-4">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ProjectLogo size="sm" clickable={false} />
            <span className="font-bold text-foreground">CodeShield</span>
          </Link>
          <div className="flex items-center space-x-2">
            <DemoMessageCounter
              currentCount={userMessageCount}
              maxCount={messageLimit}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Limit Alert */}
        {isLimitReached && (
          <div className="m-4 mb-0">
            <DemoLimitAlert
              messageLimit={messageLimit}
              onSignIn={handleSignIn}
            />
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto px-4 py-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-40">
                  <h1 className="text-3xl font-bold mb-4 text-foreground">
                    What can I help with?
                  </h1>
                  <p className="text-md mb-8">
                    Try our LLM (Conversational AI) in demo mode!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        handleQuickAction("Hello! What can you help me with?")
                      }
                    >
                      <h3 className="font-semibold mb-2">Get Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with a friendly greeting
                      </p>
                    </div>
                    <div
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        handleQuickAction(
                          "Can you explain what you're capable of?"
                        )
                      }
                    >
                      <h3 className="font-semibold mb-2">
                        Explore Capabilities
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn about AI capabilities
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-background">
          <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex flex-col bg-background border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                {/* Input Textarea */}
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    isLimitReached
                      ? "Demo limit reached. Sign in to continue..."
                      : isLoading
                      ? "Waiting for response..."
                      : "Message LLM..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[52px] max-h-[120px] p-3 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  disabled={isLoading || isLimitReached}
                  maxLength={1000}
                />

                {/* Buttons Row */}
                <div className="flex justify-between items-center p-2">
                  {/* Left-Aligned Model Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Brain className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                        LLM
                      </span>
                    </div>
                  </div>

                  {/* Right-Aligned Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="submit"
                      disabled={isLoading || isLimitReached || !input.trim()}
                      size="sm"
                      className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                      title="Send Message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Info */}
            <div className="flex flex-wrap justify-center items-center mt-3 text-xs text-muted-foreground gap-2 text-center">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>•</span>
              <span>{input.length}/1000</span>
              <span>•</span>
              <span className="flex items-center justify-center">
                <Brain className="h-3 w-3 mr-1" />
                Conversational AI
              </span>
              <span>•</span>
              <span>Demo Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
