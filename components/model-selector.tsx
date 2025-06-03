"use client"

import { ModelType } from '@/config/api';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Database } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  ragConnected: boolean;
  llmConnected: boolean;
  disabled?: boolean;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  ragConnected, 
  llmConnected,
  disabled = false 
}: ModelSelectorProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Model:</span>
      
      <div className="flex space-x-1">
        <Button
          variant={selectedModel === 'rag' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModelChange('rag')}
          disabled={disabled || !ragConnected}
          className="flex items-center space-x-1"
        >
          <Database className="h-3 w-3" />
          <span>RAG</span>
          <div className={`w-2 h-2 rounded-full ${
            ragConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </Button>
        
        <Button
          variant={selectedModel === 'llm' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModelChange('llm')}
          disabled={disabled || !llmConnected}
          className="flex items-center space-x-1"
        >
          <Brain className="h-3 w-3" />
          <span>LLM</span>
          <div className={`w-2 h-2 rounded-full ${
            llmConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </Button>
      </div>
      
      <Badge variant="secondary" className="text-xs">
        {selectedModel === 'rag' ? 'Knowledge Base' : 'Conversational AI'}
      </Badge>
    </div>
  );
}