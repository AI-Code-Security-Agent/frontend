"use client"

import { ModelType } from '@/config/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ModelSettingsProps {
  selectedModel: ModelType;
  ragSettings: {
    k: number;
    relevance_threshold: number;
  };
  llmSettings: {
    max_tokens: number;
    temperature: number;
  };
  onRagSettingsChange: (settings: { k: number; relevance_threshold: number }) => void;
  onLLMSettingsChange: (settings: { max_tokens: number; temperature: number }) => void;
}

export function ModelSettings({
  selectedModel,
  ragSettings,
  llmSettings,
  onRagSettingsChange,
  onLLMSettingsChange,
}: ModelSettingsProps) {
  if (selectedModel === 'rag') {
    return (
      <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-3">
        <h3 className="text-sm font-semibold">RAG Settings</h3>
        <div>
          <Label htmlFor="k-setting" className="text-xs">
            Results (k): {ragSettings.k}
          </Label>
          <Input
            id="k-setting"
            type="range"
            min="1"
            max="10"
            value={ragSettings.k}
            onChange={(e) => onRagSettingsChange({ 
              ...ragSettings, 
              k: parseInt(e.target.value) 
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="threshold-setting" className="text-xs">
            Relevance: {ragSettings.relevance_threshold}
          </Label>
          <Input
            id="threshold-setting"
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={ragSettings.relevance_threshold}
            onChange={(e) => onRagSettingsChange({ 
              ...ragSettings, 
              relevance_threshold: parseFloat(e.target.value) 
            })}
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-3">
      <h3 className="text-sm font-semibold">LLM Settings</h3>
      <div>
        <Label htmlFor="max-tokens-setting" className="text-xs">
          Max Tokens: {llmSettings.max_tokens}
        </Label>
        <Input
          id="max-tokens-setting"
          type="range"
          min="100"
          max="2000"
          step="100"
          value={llmSettings.max_tokens}
          onChange={(e) => onLLMSettingsChange({ 
            ...llmSettings, 
            max_tokens: parseInt(e.target.value) 
          })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="temperature-setting" className="text-xs">
          Temperature: {llmSettings.temperature}
        </Label>
        <Input
          id="temperature-setting"
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={llmSettings.temperature}
          onChange={(e) => onLLMSettingsChange({ 
            ...llmSettings, 
            temperature: parseFloat(e.target.value) 
          })}
          className="mt-1"
        />
      </div>
    </div>
  );
}