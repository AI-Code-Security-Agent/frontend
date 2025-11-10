'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const github_error = searchParams.get('github_error');
    const github_auth = searchParams.get('github_auth');
    const errorDescription = searchParams.get('error_description');

    if (error || github_error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'github-oauth-error',
            error: errorDescription || error || 'Authentication failed',
          },
          window.location.origin
        );
      }
      return;
    }

    if (github_auth === 'success') {
      // Backend successfully processed OAuth - send success to parent
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'github-oauth-success',
          },
          window.location.origin
        );
      }
      return;
    }

    if (code && state) {
      // GitHub redirected here - backend will handle the OAuth exchange
      // Just let it continue, backend will redirect back with github_auth=success
      return;
    }
    
    // Invalid callback
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'github-oauth-error',
          error: 'Invalid OAuth callback parameters',
        },
        window.location.origin
      );
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Completing GitHub authentication...</p>
        <p className="text-sm text-muted-foreground">This window will close automatically.</p>
      </div>
    </div>
  );
}
