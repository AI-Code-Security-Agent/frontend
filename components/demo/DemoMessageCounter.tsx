"use client";

import { Badge } from "@/components/ui/badge";
import { formatDemoMessageCount } from "@/lib/demoMockData";

interface DemoMessageCounterProps {
  currentCount: number;
  maxCount: number;
}

export function DemoMessageCounter({ currentCount, maxCount }: DemoMessageCounterProps) {
  const isNearLimit = currentCount >= maxCount * 0.8;
  const isAtLimit = currentCount >= maxCount;

  return (
    <Badge 
      variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
      className="text-xs"
    >
      {formatDemoMessageCount(currentCount, maxCount)}
    </Badge>
  );
}