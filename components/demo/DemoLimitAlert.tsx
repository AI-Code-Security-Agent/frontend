"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { formatDemoLimitMessage } from "@/lib/demoMockData";

interface DemoLimitAlertProps {
  messageLimit: number;
  onSignIn: () => void;
}

export function DemoLimitAlert({ messageLimit, onSignIn }: DemoLimitAlertProps) {
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-orange-800 dark:text-orange-200">
            {formatDemoLimitMessage(messageLimit)}
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Sign in to continue chatting
          </p>
        </div>
        <Button 
          onClick={onSignIn}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Sign In
        </Button>
      </AlertDescription>
    </Alert>
  );
}