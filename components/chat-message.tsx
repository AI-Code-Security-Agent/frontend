import { ChatMessage as ChatMessageType } from '@/lib/types';
import { SourceDisplay } from './source-display';
import { formatTimestamp } from '@/lib/utils';
import { Bot, User, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${!isAssistant ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isAssistant
              ? 'bg-muted border'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {message.isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            <span className="text-sm font-medium">
              {isAssistant ? 'Assistant' : 'You'}
            </span>
            <span className="text-xs opacity-70">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {message.sources && <SourceDisplay sources={message.sources} />}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}