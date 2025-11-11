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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { githubService, GitHubRepository, GitHubBranch } from '@/lib/github.service';
import { GitBranch, Shield, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BranchSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: GitHubRepository | null;
  onSelectBranch: (branch: string) => void;
  isConnecting?: boolean;
}

export const BranchSelectionModal: React.FC<BranchSelectionModalProps> = ({
  open,
  onOpenChange,
  repository,
  onSelectBranch,
  isConnecting = false,
}) => {
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && repository) {
      loadBranches();
      // Pre-select default branch
      setSelectedBranch(repository.defaultBranch);
    }
  }, [open, repository]);

  const loadBranches = async () => {
    if (!repository) return;

    try {
      setLoading(true);
      const [owner, repo] = repository.fullName.split('/');
      const branchList = await githubService.getRepositoryBranches(owner, repo);
      setBranches(branchList);
    } catch (error: any) {
      console.error('Failed to load branches:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load branches.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
  };

  const handleConnect = () => {
    if (!selectedBranch) {
      toast({
        title: 'Branch Required',
        description: 'Please select a branch to continue.',
        variant: 'destructive',
      });
      return;
    }
    onSelectBranch(selectedBranch);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Branch</DialogTitle>
          <DialogDescription>
            Choose which branch to index for <strong>{repository.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Repository Info */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="space-y-1">
              <h4 className="font-semibold">{repository.name}</h4>
              <p className="text-sm text-muted-foreground">{repository.fullName}</p>
              {repository.description && (
                <p className="text-sm text-muted-foreground">{repository.description}</p>
              )}
            </div>
          </div>

          {/* Branch List */}
          <ScrollArea className="h-[350px] w-full rounded-md border">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : branches.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                <div className="text-center">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No branches found</p>
                  <p className="text-sm mt-2">This repository may be empty</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {branches.map((branch) => {
                  const isSelected = selectedBranch === branch.name;
                  const isDefault = branch.name === repository.defaultBranch;

                  return (
                    <div
                      key={branch.name}
                      className={`
                        p-4 rounded-lg border transition-all cursor-pointer
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => handleSelectBranch(branch.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          {/* Branch Name */}
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">{branch.name}</h4>
                            {isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                            {branch.protected && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Protected
                              </Badge>
                            )}
                          </div>

                          {/* Commit SHA */}
                          {branch.commitSha && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{branch.commitSha.substring(0, 7)}</span>
                            </div>
                          )}
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Branch Count */}
          {!loading && branches.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {branches.length} branch{branches.length !== 1 ? 'es' : ''} available
            </div>
          )}

          {/* Selected Branch Info */}
          {selectedBranch && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedBranch}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConnecting}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={!selectedBranch || loading || isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Repository'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
