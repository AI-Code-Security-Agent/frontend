'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { githubService } from '../../lib/github.service';

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  termsAccepted?: boolean;
}

interface GitHubConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  onConnectClick?: () => void;
}

export const GitHubConnectButton: React.FC<GitHubConnectButtonProps> = ({
  onConnectionChange,
  onConnectClick,
}) => {
  const [status, setStatus] = useState<GitHubStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      setLoading(true);
      const statusData = await githubService.getStatus();
      setStatus(statusData);
      onConnectionChange?.(statusData.connected);
    } catch (error: any) {
      console.error('Failed to check GitHub status:', error);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // First, initiate the OAuth flow
      const authUrl = await githubService.initiateAuth();
      
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'GitHub Authentication',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'github-oauth-success') {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          
          // Refresh status
          await checkGitHubStatus();
          
          toast({
            title: 'GitHub Connected',
            description: 'Successfully connected your GitHub account.',
          });
          
          // Trigger the connection flow (terms, repo selection, etc.)
          onConnectClick?.();
        } else if (event.data.type === 'github-oauth-error') {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          
          toast({
            title: 'Connection Failed',
            description: event.data.error || 'Failed to connect GitHub account.',
            variant: 'destructive',
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup || popup.closed) {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups for this site to connect GitHub.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to initiate GitHub OAuth:', error);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to start GitHub authentication.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await githubService.disconnect();
      await checkGitHubStatus();
      
      toast({
        title: 'GitHub Disconnected',
        description: 'Successfully disconnected your GitHub account.',
      });
    } catch (error: any) {
      console.error('Failed to disconnect GitHub:', error);
      toast({
        title: 'Disconnect Failed',
        description: error.message || 'Failed to disconnect GitHub account.',
        variant: 'destructive',
      });
    }
  };

  const handleManageRepositories = () => {
    onConnectClick?.();
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Github className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (!status.connected) {
    return (
      <Button variant="outline" size="sm" onClick={handleConnect}>
        <Github className="mr-2 h-4 w-4" />
        Connect GitHub
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={status.avatarUrl} alt={status.username} />
            <AvatarFallback>
              <Github className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>{status.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>GitHub Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleManageRepositories}>
          Manage Repositories
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
