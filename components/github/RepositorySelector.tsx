'use client';

import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, GitBranch, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { githubService } from '@/lib/github.service';

interface ConnectedRepository {
  repositoryId: string;
  name: string;
  fullName: string;
  branch: string;
  ragRepositoryId: string;
  indexingStatus: string;
  totalFiles: number;
  indexedFiles: number;
  progress: number;
}

interface RepositorySelectorProps {
  onRepositoryChange?: (repository: ConnectedRepository | null) => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  onRepositoryChange
}) => {
  const [repositories, setRepositories] = useState<ConnectedRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<ConnectedRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRepositories();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadRepositories, 10000);
    
    // Listen for repository connection events
    const handleRepoConnected = () => {
      console.log('Repository connected event received, reloading...');
      loadRepositories();
    };
    
    window.addEventListener('repository-connected', handleRepoConnected);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('repository-connected', handleRepoConnected);
    };
  }, []);

  const loadRepositories = async () => {
    try {
      const response = await githubService.getConnectedRepositories();
      setRepositories(response.repositories);
      setGithubConnected(response.githubConnected || false);
      
      // Set selected repository from backend
      if (response.selectedRepository) {
        const selected = response.repositories.find(
          (r: ConnectedRepository) => r.repositoryId === response.selectedRepository.repositoryId
        );
        if (selected) {
          setSelectedRepo(selected);
          onRepositoryChange?.(selected);
        }
      } else if (response.repositories.length > 0 && !selectedRepo) {
        // Auto-select first repo if none selected
        await handleSelectRepository(response.repositories[0]);
      }
    } catch (error: any) {
      console.error('Failed to load repositories:', error);
      // Don't show error toast - repositories might just not be available yet
    }
  };

  const handleSelectRepository = async (repo: ConnectedRepository) => {
    try {
      setLoading(true);
      await githubService.selectRepository(repo.repositoryId);
      setSelectedRepo(repo);
      onRepositoryChange?.(repo);
      
      toast({
        title: 'Repository Selected',
        description: `Now querying from ${repo.fullName}`,
      });
    } catch (error: any) {
      console.error('Failed to select repository:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to select repository',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FULLY_INDEXED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
      case 'PARTIALLY_INDEXED':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'PENDING':
        return <Loader2 className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'FULLY_INDEXED':
        return 'Indexed';
      case 'IN_PROGRESS':
        return 'Indexing';
      case 'PARTIALLY_INDEXED':
        return 'Partial';
      case 'PENDING':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (repositories.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          No repositories connected
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[280px] justify-between"
          disabled={loading}
        >
          {selectedRepo ? (
            <div className="flex items-center gap-2 flex-1 mr-2">
              <GitBranch className="h-4 w-4" />
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium text-sm truncate max-w-[180px]">
                  {selectedRepo.name}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {selectedRepo.branch}
                  {!githubConnected && ' • (GitHub Disconnected)'}
                </span>
              </div>
              {getStatusIcon(selectedRepo.indexingStatus)}
            </div>
          ) : (
            <span>Select Repository</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px]">
        <DropdownMenuLabel>
          Connected Repositories
          {!githubConnected && ' (GitHub Disconnected)'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {repositories.map((repo) => (
          <DropdownMenuItem
            key={repo.repositoryId}
            onClick={() => handleSelectRepository(repo)}
            className="flex-col items-start gap-2 py-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GitBranch className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-sm truncate">
                    {repo.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {repo.fullName} • {repo.branch}
                  </span>
                </div>
              </div>
              <Badge variant={repo.repositoryId === selectedRepo?.repositoryId ? 'default' : 'outline'}>
                {getStatusText(repo.indexingStatus)}
              </Badge>
            </div>
            
            {(repo.indexingStatus === 'IN_PROGRESS' || repo.indexingStatus === 'PARTIALLY_INDEXED') && (
              <div className="w-full space-y-1">
                <Progress value={repo.progress} className="h-1" />
                <span className="text-xs text-muted-foreground">
                  {repo.indexedFiles} / {repo.totalFiles} files indexed
                </span>
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
