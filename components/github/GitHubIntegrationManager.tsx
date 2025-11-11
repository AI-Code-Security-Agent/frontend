'use client';

import React, { useState } from 'react';
import { GitHubConnectButton } from './GitHubConnectButton';
import { TermsModal } from './TermsModal';
import { RepositorySelectionModal } from './RepositorySelectionModal';
import { BranchSelectionModal } from './BranchSelectionModal';
import { githubService, GitHubRepository } from '@/lib/github.service';
import { useToast } from '@/hooks/use-toast';

type FlowStep = 'idle' | 'terms' | 'repositories' | 'branches' | 'connecting';

export const GitHubIntegrationManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const { toast } = useToast();

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleConnectClick = async () => {
    try {
      // Check if terms are already accepted
      const status = await githubService.getStatus();
      
      if (status.connected) {
        if (status.termsAccepted) {
          // Skip terms, go straight to repository selection
          setCurrentStep('repositories');
        } else {
          // Show terms modal
          setCurrentStep('terms');
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
      // If error, assume we need to show terms
      setCurrentStep('terms');
    }
  };

  const handleTermsAccept = () => {
    setCurrentStep('repositories');
  };

  const handleRepositorySelect = (repository: GitHubRepository) => {
    setSelectedRepository(repository);
    setCurrentStep('branches');
  };

  const handleBranchSelect = async (branch: string) => {
    if (!selectedRepository) return;

    try {
      setCurrentStep('connecting');

      // Connect the repository
      await githubService.connectRepository({
        repositoryId: selectedRepository.id,
        name: selectedRepository.name,
        fullName: selectedRepository.fullName,
        branch: branch,
        private: selectedRepository.private,
        cloneUrl: selectedRepository.cloneUrl,
      });

      toast({
        title: 'Repository Connected',
        description: `${selectedRepository.name} (${branch}) is now being indexed.`,
      });

      // Dispatch event to notify components that a repository was connected
      window.dispatchEvent(new CustomEvent('repository-connected'));

      // Reset state
      setSelectedRepository(null);
      setCurrentStep('idle');
    } catch (error: any) {
      console.error('Failed to connect repository:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect repository.',
        variant: 'destructive',
      });
      setCurrentStep('branches'); // Stay on branch selection to allow retry
    }
  };

  const handleCloseModals = () => {
    setCurrentStep('idle');
    setSelectedRepository(null);
  };

  return (
    <>
      {/* GitHub Connect Button */}
      <GitHubConnectButton
        onConnectionChange={handleConnectionChange}
        onConnectClick={handleConnectClick}
      />

      {/* Terms and Conditions Modal */}
      <TermsModal
        open={currentStep === 'terms'}
        onOpenChange={(open) => !open && handleCloseModals()}
        onAccept={handleTermsAccept}
      />

      {/* Repository Selection Modal */}
      <RepositorySelectionModal
        open={currentStep === 'repositories'}
        onOpenChange={(open) => !open && handleCloseModals()}
        onSelectRepository={handleRepositorySelect}
      />

      {/* Branch Selection Modal */}
      <BranchSelectionModal
        open={currentStep === 'branches' || currentStep === 'connecting'}
        onOpenChange={(open) => !open && handleCloseModals()}
        repository={selectedRepository}
        onSelectBranch={handleBranchSelect}
        isConnecting={currentStep === 'connecting'}
      />
    </>
  );
};
