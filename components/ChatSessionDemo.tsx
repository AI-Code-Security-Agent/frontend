"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Send, X } from "lucide-react";
import { useUnifiedChat } from "@/hooks/use-chat";

export function ChatSessionDemo({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, clearChat, isLoading, error, clearError } =
    useUnifiedChat();

  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const model = "llm";

    try {
      await sendMessage(input.trim(), model, {
        max_tokens: 1000,
        temperature: 0.7,
      });
      setInput("");
    } catch (e) {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onClearChat = () => {
    clearChat();
    setInput("");
    clearError();
  };

  return (
    <div
      className="
        w-[75vw] max-w-5xl
        h-[700px]
        bg-background border border-gray-300 dark:border-gray-700
        rounded-xl shadow-lg flex flex-col overflow-hidden
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-demo-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 id="chat-demo-title" className="font-bold text-lg">
          Chat Demo (LLM)
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-sm flex justify-between items-center">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearError}
            aria-label="Clear error"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-grow p-4 space-y-3 overflow-y-auto pr-1 scrollbar-hide relative bg-gray-50 dark:bg-gray-900"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No messages yet. Start chatting!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-lg break-words whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-purple-600 text-white self-end"
                : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 dark:text-gray-400 italic">
            LLM is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2"
      >
        <Textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 resize-none"
        />
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onClearChat}
            title="Clear Chat"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-purple-600 text-white hover:bg-purple-700"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
