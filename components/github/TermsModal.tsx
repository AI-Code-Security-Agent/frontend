'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { githubService } from '@/lib/github.service';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  open,
  onOpenChange,
  onAccept,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await githubService.acceptTerms();
      
      toast({
        title: 'Terms Accepted',
        description: 'You can now connect your repositories.',
      });
      
      onAccept();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to accept terms:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept terms.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAccepted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>GitHub Integration - Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please review and accept the terms to connect your GitHub account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                By connecting your GitHub account to this service, you agree to the following
                terms and conditions. This integration allows us to access your GitHub
                repositories for the purpose of indexing and providing RAG (Retrieval Augmented
                Generation) capabilities.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Data Access and Usage</h3>
              <p className="text-muted-foreground mb-2">
                When you connect your GitHub account, we will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Access repository contents for indexing purposes</li>
                <li>Store repository metadata and file contents in our RAG database</li>
                <li>Create webhooks to receive updates when your repositories change</li>
                <li>Process code, documentation, and other repository files</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Security and Privacy</h3>
              <p className="text-muted-foreground mb-2">
                We take security seriously:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Your GitHub access tokens are encrypted using industry-standard AES-256-GCM encryption</li>
                <li>We only access repositories you explicitly select</li>
                <li>We use OAuth for authentication - we never see your GitHub password</li>
                <li>Webhook secrets are uniquely generated for each repository</li>
                <li>You can disconnect your GitHub account at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Permissions</h3>
              <p className="text-muted-foreground mb-2">
                The GitHub OAuth integration requests the following permissions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>repo</strong>: Full access to repositories (required for private repos)</li>
                <li><strong>user:email</strong>: Access to your email address</li>
                <li><strong>read:org</strong>: Read access to organization memberships</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Webhooks</h3>
              <p className="text-muted-foreground">
                We create webhooks on your selected repositories to receive notifications about
                code changes (push events) and pull requests. This allows us to keep the indexed
                content up-to-date automatically. Webhooks are deleted when you disconnect a
                repository.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Data Retention</h3>
              <p className="text-muted-foreground">
                Repository data is stored until you disconnect the repository or your GitHub
                account. When you disconnect, we delete all associated data including indexed
                content, metadata, and access tokens.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Acceptable Use</h3>
              <p className="text-muted-foreground mb-2">
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Only connect repositories you have permission to access</li>
                <li>Not attempt to bypass security measures</li>
                <li>Not use the service for any illegal purposes</li>
                <li>Comply with GitHub's Terms of Service</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                This service is provided "as is" without warranties of any kind. We are not
                responsible for any data loss, service interruptions, or other issues that may
                arise from using this integration.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the
                GitHub integration after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Disconnection</h3>
              <p className="text-muted-foreground">
                You may disconnect your GitHub account at any time from the settings menu. This
                will remove all webhooks, delete your access tokens, and remove indexed data
                from our systems.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the terms and conditions
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!accepted || loading}>
            {loading ? 'Accepting...' : 'Accept and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
