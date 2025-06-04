"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModelSelector } from "@/components/model-selector"
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
  ChevronLeft
} from "lucide-react"
import { useUnifiedChat } from "@/hooks/use-chat"
import { apiService } from "@/lib/api"
import { ModelType } from "@/config/api"
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation"

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
  
  // Settings state
  const [ragSettings, setRagSettings] = useState({
    k: 3,
    relevance_threshold: 0.1
  });
  
  const [llmSettings, setLlmSettings] = useState({
    max_tokens: 1000,
    temperature: 0.7
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
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

  return (
    <div className="flex max-h-screen max-w-full">
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
              className="w-full justify-start mb-3"
              onClick={clearChat}
              disabled={isLoading}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Chat
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start mb-3"
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
                <div className={`text-xs px-2 py-1 rounded flex items-center justify-between ${
                  ragConnected 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  <span>RAG API</span>
                  <span>{ragConnected ? '🟢' : '🔴'}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded flex items-center justify-between ${
                  llmConnected 
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
                {sidebarVisible && (
                  <ThemeToggle />)}
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
        {/* Header with sidebar toggle when sidebar is hidden */}
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

        {/* Model Selector */}
        <div className="border-b p-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            ragConnected={ragConnected}
            llmConnected={llmConnected}
            disabled={isLoading}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Welcome to AI Assistant
                  </h3>
                  <p className="text-sm mb-4">
                    Choose between RAG (Knowledge Base) or LLM (Conversational AI) mode and start chatting!
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Current mode: <span className="font-medium">
                      {selectedModel === 'rag' ? 'RAG - Knowledge Base Search' : 'LLM - Conversational AI'}
                    </span>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              placeholder={
                !isCurrentModelConnected 
                  ? `${selectedModel.toUpperCase()} API not connected...` 
                  : isLoading 
                    ? "Waiting for response..." 
                    : `Ask ${selectedModel.toUpperCase()} anything...`
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={isLoading || !isCurrentModelConnected}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !isCurrentModelConnected || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearChat}
                disabled={isLoading}
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </form>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center space-x-2">
              <span>{input.length}/1000</span>
              <span>•</span>
              <span className="font-medium">
                {selectedModel === 'rag' ? 'RAG Mode' : 'LLM Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}