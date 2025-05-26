"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Github, 
  LogOut, 
  MessageSquarePlus, 
  User, 
  Send, 
  Trash2, 
  AlertCircle,
  Settings,
  X
} from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { apiService } from "@/lib/api"

export default function DashboardPage() {
  const { messages, sendMessage, clearChat, isLoading, error, clearError } = useChat();
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [querySettings, setQuerySettings] = useState({
    k: 3,
    relevance_threshold: 0.3
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiService.healthCheck();
        setIsConnected(true);
        setConnectionError(null);
      } catch (err) {
        setIsConnected(false);
        setConnectionError(err instanceof Error ? err.message : 'Failed to connect to API');
      }
    };

    checkConnection();
    // Check connection periodically
    const interval = setInterval(checkConnection, 30000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isConnected) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message, querySettings);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4">
          <Bot className="h-6 w-6" />
          <span className="ml-2 font-bold">RAG Assistant</span>
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
              Query Settings
            </Button>

            {showSettings && (
              <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-3">
                <div>
                  <Label htmlFor="k-setting" className="text-xs">
                    Results (k): {querySettings.k}
                  </Label>
                  <Input
                    id="k-setting"
                    type="range"
                    min="1"
                    max="10"
                    value={querySettings.k}
                    onChange={(e) => setQuerySettings(prev => ({ 
                      ...prev, 
                      k: parseInt(e.target.value) 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="threshold-setting" className="text-xs">
                    Relevance: {querySettings.relevance_threshold}
                  </Label>
                  <Input
                    id="threshold-setting"
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={querySettings.relevance_threshold}
                    onChange={(e) => setQuerySettings(prev => ({ 
                      ...prev, 
                      relevance_threshold: parseFloat(e.target.value) 
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <Separator className="my-4" />
            
            {/* Connection Status */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Connection Status</h2>
              <div className={`text-sm px-2 py-1 rounded ${
                isConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm"
                onClick={() => sendMessage("What topics can you help me with?")}
                disabled={isLoading || !isConnected}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Available Topics
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm"
                onClick={() => sendMessage("Give me a summary of the most important information.")}
                disabled={isLoading || !isConnected}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Key Information
              </Button>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-6 w-6" />
                <span className="ml-2">User</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
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

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
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
                !isConnected 
                  ? "Waiting for connection..." 
                  : isLoading 
                    ? "Waiting for response..." 
                    : "Ask me anything..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={isLoading || !isConnected}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !isConnected || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 1 && (
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
            <span>{input.length}/1000</span>
          </div>
        </div>
      </div>
    </div>
  )
}