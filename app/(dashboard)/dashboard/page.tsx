"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModelSettings } from "@/components/model-settings"
import {
  Bot,
  LogOut,
  MessageSquarePlus,
  User,
  Send,
  Trash2,
  AlertCircle,
  Settings,
  X,
  Menu,
  ChevronLeft,
  ChevronDown,
  Database,
  Brain
} from "lucide-react"
import { useUnifiedChat } from "@/hooks/use-chat"
import { apiService } from "@/lib/api"
import { ModelType } from "@/config/api"
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function DashboardPage() {
  const router = useRouter();
  const { messages, sendMessage, clearChat, isLoading, error, clearError } = useUnifiedChat();
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>('rag');
  const [ragConnected, setRagConnected] = useState(false);
  const [llmConnected, setLlmConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Settings state
  const [ragSettings, setRagSettings] = useState({
    k: 5,
    relevance_threshold: 0.1
  });

  const [llmSettings, setLlmSettings] = useState({
    max_tokens: 1000,
    temperature: 0.7
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check API connections on mount
  useEffect(() => {
    const checkConnections = async () => {
      try {
        const [ragStatus, llmStatus] = await Promise.allSettled([
          apiService.healthCheck('rag'),
          apiService.healthCheck('llm')
        ]);

        setRagConnected(ragStatus.status === 'fulfilled' && ragStatus.value);
        setLlmConnected(llmStatus.status === 'fulfilled' && llmStatus.value);

        if (ragStatus.status === 'rejected' && llmStatus.status === 'rejected') {
          setConnectionError('Both RAG and LLM APIs are unavailable');
        } else if (ragStatus.status === 'rejected') {
          setConnectionError('RAG API is unavailable');
        } else if (llmStatus.status === 'rejected') {
          setConnectionError('LLM API is unavailable');
        } else {
          setConnectionError(null);
        }
      } catch (err) {
        setRagConnected(false);
        setLlmConnected(false);
        setConnectionError('Failed to check API connections');
      }
    };

    checkConnections();
    // Check connections periodically
    const interval = setInterval(checkConnections, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus textarea when not loading
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Switch to available model if current is unavailable
  useEffect(() => {
    if (selectedModel === 'rag' && !ragConnected && llmConnected) {
      setSelectedModel('llm');
    } else if (selectedModel === 'llm' && !llmConnected && ragConnected) {
      setSelectedModel('rag');
    }
  }, [selectedModel, ragConnected, llmConnected]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 5 * 24; // 5 lines * line height
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentModelConnected = selectedModel === 'rag' ? ragConnected : llmConnected;
    if (!currentModelConnected) return;

    const message = input.trim();
    setInput("");

    const settings = selectedModel === 'rag' ? ragSettings : llmSettings;
    await sendMessage(message, selectedModel, settings);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleLogout = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const token = Cookies.get("accessToken");
    if (!token) {
      console.log("Access token not found.");
      return;
    }
    try {
      const response = await fetch(`${baseURL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.isSuccess) {
        Cookies.remove("accessToken");
        Cookies.remove("userName");
        router.push("/");
        toast.success(data.message);
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (err) {
      console.log("error :", err);
      toast.error("An error occurred while logging out.");
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const isCurrentModelConnected = selectedModel === 'rag' ? ragConnected : llmConnected;

  const ModelIcon = selectedModel === 'rag' ? Database : Brain;
  const modelLabel = selectedModel === 'rag' ? 'RAG' : 'LLM';
  const modelDescription = selectedModel === 'rag' ? 'Knowledge Base' : 'Conversational AI';

  return (
    <div className="flex h-screen max-w-full bg-background">
      {/* Sidebar */}
      <div className={`${sidebarVisible ? 'w-64' : 'w-0'} border-r bg-muted/40 transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <Bot className="h-6 w-6" />
            <span className="ml-2 font-bold">Code Guardian</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-auto p-4">
            <Button
              variant="outline"
              className="w-full justify-start mb-3 rounded-full"
              onClick={clearChat}
              disabled={isLoading}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Chat
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start mb-3 rounded-full"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Model Settings
            </Button>

            {showSettings && (
              <ModelSettings
                selectedModel={selectedModel}
                ragSettings={ragSettings}
                llmSettings={llmSettings}
                onRagSettingsChange={setRagSettings}
                onLLMSettingsChange={setLlmSettings}
              />
            )}

            <Separator className="my-4" />

            {/* Connection Status */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Connection Status</h2>
              <div className="space-y-1">
                <div className={`text-xs px-4 py-1 rounded flex items-center justify-between rounded-full ${ragConnected
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  <span>RAG API</span>
                  <span>{ragConnected ? '🟢' : '🔴'}</span>
                </div>
                <div className={`text-xs px-4 py-1 rounded flex items-center justify-between rounded-full ${llmConnected
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  <span>LLM API</span>
                  <span>{llmConnected ? '🟢' : '🔴'}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  const message = selectedModel === 'rag'
                    ? "What topics can you help me with?"
                    : "Hello! What can you help me with?";
                  sendMessage(message, selectedModel, selectedModel === 'rag' ? ragSettings : llmSettings);
                }}
                disabled={isLoading || !isCurrentModelConnected}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {selectedModel === 'rag' ? 'Available Topics' : 'Greeting'}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  const message = selectedModel === 'rag'
                    ? "Give me a summary of the most important information."
                    : "Can you explain what you're capable of?";
                  sendMessage(message, selectedModel, selectedModel === 'rag' ? ragSettings : llmSettings);
                }}
                disabled={isLoading || !isCurrentModelConnected}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {selectedModel === 'rag' ? 'Key Information' : 'Capabilities'}
              </Button>
            </div>
          </div>

          {/* User Menu */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-4 w-4" />
                <span className="ml-2">User</span>
              </div>
              <div className="flex items-center space-x-2">
                {sidebarVisible && <ThemeToggle />}
                <Button variant="ghost" title="Log Out" size="icon" onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header when sidebar is hidden */}
        {!sidebarVisible && (
          <div className="flex items-center justify-between h-14 border-b px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 mr-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Bot className="h-6 w-6" />
              <span className="ml-2 font-bold">Code Guardian</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" title="Log Out" size="icon" onClick={handleLogout} className="cursor-pointer">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(error || connectionError) && (
          <Alert className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error || connectionError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearError();
                  setConnectionError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto px-4 py-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-40">
                  {/* <Bot className="h-16 w-16 mx-auto mb-6 opacity-50" /> */}
                  <h1 className="text-3xl font-bold mb-4 text-foreground">
                    What can I help with?
                  </h1>
                  <p className="text-md mb-8">
                    Choose between RAG (Knowledge Base) or LLM (Conversational AI) mode and start chatting!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        const message = "What topics can you help me with?";
                        sendMessage(message, selectedModel, selectedModel === 'rag' ? ragSettings : llmSettings);
                      }}>
                      <h3 className="font-semibold mb-2">Explore Topics</h3>
                      <p className="text-sm text-muted-foreground">Discover what I can help you with</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        const message = selectedModel === 'rag'
                          ? "Give me a summary of the most important information."
                          : "Can you explain what you're capable of?";
                        sendMessage(message, selectedModel, selectedModel === 'rag' ? ragSettings : llmSettings);
                      }}>
                      <h3 className="font-semibold mb-2">Get Started</h3>
                      <p className="text-sm text-muted-foreground">Learn about my capabilities</p>
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
                    !isCurrentModelConnected
                      ? `${selectedModel.toUpperCase()} API not connected...`
                      : isLoading
                        ? "Waiting for response..."
                        : `Message ${modelLabel}...`
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[52px] max-h-[120px] p-3 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  disabled={isLoading || !isCurrentModelConnected}
                  maxLength={1000}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
                  }}
                />
                {/* Buttons Row */}
                <div className="flex justify-between items-center p-2">
                  {/* Left-Aligned Model Selector */}
                  <div className="flex items-center space-x-2">
                    <DropdownMenu
                      open={isModelDropdownOpen}
                      onOpenChange={setIsModelDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-4 text-xs font-medium hover:bg-muted/50 rounded-full"
                          disabled={isLoading}
                        >
                          <ModelIcon className="h-3 w-3 mr-2" />
                          <span>{modelLabel}</span>
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedModel("rag");
                            setIsModelDropdownOpen(false);
                          }}
                          disabled={!ragConnected}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">RAG</div>
                              <div className="text-xs text-muted-foreground">
                                Knowledge Base Search
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${ragConnected ? "bg-green-500" : "bg-red-500"
                              }`}
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedModel("llm");
                            setIsModelDropdownOpen(false);
                          }}
                          disabled={!llmConnected}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">LLM</div>
                              <div className="text-xs text-muted-foreground">
                                Conversational AI
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${llmConnected ? "bg-green-500" : "bg-red-500"
                              }`}
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Right-Aligned Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {messages.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearChat}
                        disabled={isLoading}
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted/50"
                        title="Clear Chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading || !isCurrentModelConnected || !input.trim()}
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
            <div className="flex justify-center items-center mt-3 text-xs text-muted-foreground">
              <span className="flex items-center space-x-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>•</span>
                <span>{input.length}/1000</span>
                <span>•</span>
                <span className="flex items-center">
                  <ModelIcon className="h-3 w-3 mr-1" />
                  {modelDescription}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}