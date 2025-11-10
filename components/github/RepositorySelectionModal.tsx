'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { githubService, GitHubRepository } from '@/lib/github.service';
import { Search, Star, GitFork, Lock, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RepositorySelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRepository: (repository: GitHubRepository) => void;
}

export const RepositorySelectionModal: React.FC<RepositorySelectionModalProps> = ({
  open,
  onOpenChange,
  onSelectRepository,
}) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadRepositories();
    }
  }, [open]);

  useEffect(() => {
    filterRepositories();
  }, [searchQuery, repositories]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const repos = await githubService.getRepositories(1, 100);
      setRepositories(repos);
      setFilteredRepos(repos);
    } catch (error: any) {
      console.error('Failed to load repositories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load repositories.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRepositories = () => {
    if (!searchQuery.trim()) {
      setFilteredRepos(repositories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.fullName.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.language && repo.language.toLowerCase().includes(query))
    );
    setFilteredRepos(filtered);
  };

  const handleSelectRepository = (repo: GitHubRepository) => {
    if (repo.isConnected) {
      toast({
        title: 'Already Connected',
        description: 'This repository is already connected to RAG.',
        variant: 'destructive',
      });
      return;
    }
    onSelectRepository(repo);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Repository</DialogTitle>
          <DialogDescription>
            Choose a repository to connect for RAG indexing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories by name, description, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Repository List */}
          <ScrollArea className="h-[450px] w-full rounded-md border">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                {searchQuery ? (
                  <div className="text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No repositories match your search</p>
                    <p className="text-sm mt-2">Try different keywords</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p>No repositories found</p>
                    <p className="text-sm mt-2">
                      Make sure you have repositories in your GitHub account
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`
                      p-4 rounded-lg border transition-all cursor-pointer
                      ${
                        repo.isConnected
                          ? 'bg-muted border-muted-foreground/20 cursor-not-allowed'
                          : 'hover:border-primary hover:shadow-sm'
                      }
                    `}
                    onClick={() => !repo.isConnected && handleSelectRepository(repo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Repository Name */}
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base">{repo.name}</h4>
                          {repo.private && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          {repo.isConnected && (
                            <Badge variant="secondary" className="ml-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>

                        {/* Full Name */}
                        <p className="text-sm text-muted-foreground">{repo.fullName}</p>

                        {/* Description */}
                        {repo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {repo.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{repo.stargazersCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            <span>{repo.forksCount}</span>
                          </div>
                          <span>Updated {formatDate(repo.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Select Button */}
                      {!repo.isConnected && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRepository(repo);
                          }}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Repository Count */}
          {!loading && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredRepos.length} of {repositories.length} repositories
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
