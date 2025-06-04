"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  Bot, 
  User, 
  Database, 
  Brain, 
  ExternalLink, 
  Loader2, 
  Copy, 
  Check,
  Code,
  FileText,
  List,
  Hash
} from "lucide-react"
import { ChatMessage as ChatMessageType } from "@/lib/types"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Highlight } from 'prism-react-renderer' // Import Highlight for syntax highlighting

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showAllSources, setShowAllSources] = useState(false)
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set())
  const isUser = message.role === 'user'
  const isRAG = message.modelType === 'rag'
  
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const copyToClipboard = useCallback(async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBlocks(prev => new Set(prev).add(blockIndex))
      toast.success("Code copied to clipboard!")
      
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockIndex)
          return newSet
        })
      }, 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }, [])

  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.split('\n')
        const firstLine = lines[0].replace('```', '').trim()
        const language = firstLine || 'text'
        const code = lines.slice(1, -1).join('\n')
        
        return (
          <div key={index} className="my-4 group">
            <div className="relative">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {language}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(code, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedBlocks.has(index) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Highlight code={code} language={language}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre 
                    className={`prism-code ${className} bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg border border-t-0 overflow-x-auto`}
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        )
      } else {
        return (
          <div key={index} className="prose dark:prose-invert max-w-none">
            {formatTextContent(part)}
          </div>
        )
      }
    })
  }

  const formatTextContent = (text: string) => {
    if (!text.trim()) return null
    
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, pIndex) => {
      const trimmedParagraph = paragraph.trim()
      
      if (trimmedParagraph.startsWith('###')) {
        return (
          <div key={pIndex} className="mt-4 mb-3 flex items-center">
            <Hash className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {trimmedParagraph.replace(/^###\s*/, '')}
            </span>
          </div>
        )
      } else if (trimmedParagraph.startsWith('##')) {
        return (
          <div key={pIndex} className="mt-4 mb-3 flex items-center">
            <Hash className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {trimmedParagraph.replace(/^##\s*/, '')}
            </span>
          </div>
        )
      } else if (trimmedParagraph.startsWith('#')) {
        return (
          <div key={pIndex} className="mt-4 mb-3 flex items-center">
            <Hash className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {trimmedParagraph.replace(/^#\s*/, '')}
            </span>
          </div>
        )
      } else if (trimmedParagraph.match(/^\d+\.\s/)) {
        const items = trimmedParagraph.split(/\n(?=\d+\.)/g)
        return (
          <div key={pIndex} className="my-4">
            <div className="flex items-center mb-2">
              <List className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step-by-step process:
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-2 ml-6">
              {items.map((item, iIndex) => (
                <li key={iIndex} className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {formatInlineElements(item.replace(/^\d+\.\s*/, ''))}
                </li>
              ))}
            </ol>
          </div>
        )
      } else if (trimmedParagraph.match(/^[\-\*]\s/)) {
        const items = trimmedParagraph.split(/\n(?=[\-\*]\s)/g)
        return (
          <div key={pIndex} className="my-4">
            <ul className="list-disc list-inside space-y-1 ml-4">
              {items.map((item, iIndex) => (
                <li key={iIndex} className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {formatInlineElements(item.replace(/^[\-\*]\s*/, ''))}
                </li>
              ))}
            </ul>
          </div>
        )
      } else {
        return (
          <p key={pIndex} className="text-sm leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            {formatInlineElements(trimmedParagraph)}
          </p>
        )
      }
    })
  }

  const formatInlineElements = (text: string) => {
    // Handle both ** and * markdown, but prioritize ** (bold) over * (italic)
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        )
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="font-semibold text-gray-900 dark:text-gray-100">
            {part.slice(2, -2)}
          </span>
        )
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <span key={index} className="italic">
            {part.slice(1, -1)}
          </span>
        )
      } else {
        return <span key={index}>{part}</span>
      }
    })
  }

  const ModelIcon = isRAG ? Database : Brain
  const modelLabel = isRAG ? 'RAG' : 'LLM'
  const modelColor = isRAG ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'

  if (isUser) {
    return (
      <div className="flex justify-end space-x-3 mb-6">
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
          <div className="bg-primary text-primary-foreground p-4 rounded-lg rounded-br-sm shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex justify-start space-x-3 mb-6">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-muted">
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[85%] space-y-3">
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
          <div className="bg-muted p-4 rounded-lg rounded-bl-sm shadow-sm">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {isRAG ? 'Searching knowledge base...' : 'Generating response...'}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted/30 p-4 rounded-lg rounded-bl-sm shadow-sm border border-muted/40">
              <div className="space-y-2">
                {formatContent(message.content)}
              </div>
            </div>

            {isRAG && message.sources && message.sources.length > 0 && (
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Knowledge Sources ({message.sources.length})
                    </h4>
                    {message.sources.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSources(!showAllSources)}
                        className="text-xs h-7"
                      >
                        {showAllSources ? 'Show Less' : 'Show All'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {(showAllSources ? message.sources : message.sources.slice(0, 3)).map((source, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-background/80 hover:bg-background transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary truncate">
                              {source.source}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {(source.score * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
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
  )
}