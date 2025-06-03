"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Database, Brain, ExternalLink, Loader2 } from "lucide-react"
import { ChatMessage as ChatMessageType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const isUser = message.role === 'user';
  const isRAG = message.modelType === 'rag';
  
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const ModelIcon = isRAG ? Database : Brain;
  const modelLabel = isRAG ? 'RAG' : 'LLM';
  const modelColor = isRAG ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';

  if (isUser) {
    return (
      <div className="flex justify-end space-x-3">
        <div className="max-w-[80%] space-y-2">
          <div className="flex items-center justify-end space-x-2">
            <Badge variant="outline" className={modelColor}>
              <ModelIcon className="h-3 w-3 mr-1" />
              {modelLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-sm">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex justify-start space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] space-y-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={modelColor}>
            <ModelIcon className="h-3 w-3 mr-1" />
            {modelLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.sessionId && (
            <span className="text-xs text-muted-foreground">
              Session: {message.sessionId.slice(0, 8)}...
            </span>
          )}
        </div>

        {message.isLoading ? (
          <div className="bg-muted p-3 rounded-lg rounded-bl-sm">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {isRAG ? 'Searching knowledge base...' : 'Generating response...'}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted p-3 rounded-lg rounded-bl-sm">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* RAG Sources */}
            {isRAG && message.sources && message.sources.length > 0 && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sources ({message.sources.length})
                    </h4>
                    {message.sources.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSources(!showAllSources)}
                        className="text-xs"
                      >
                        {showAllSources ? 'Show Less' : 'Show All'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {(showAllSources ? message.sources : message.sources.slice(0, 3)).map((source, index) => (
                      <div key={index} className="border rounded p-2 bg-background/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-primary">
                            {source.source}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Score: {source.score.toFixed(3)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {source.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}