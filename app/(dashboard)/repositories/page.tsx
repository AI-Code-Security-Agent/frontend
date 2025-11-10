'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

interface Repository {
  id: string;
  name: string;
  full_name: string;
  provider: string;
  default_branch: string;
  indexing_status: 'pending' | 'in_progress' | 'fully_indexed' | 'failed';
  indexed_files: number;
  total_files: number;
  last_indexed_at?: string;
  created_at: string;
}

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [provider, setProvider] = useState<'github' | 'gitlab'>('github');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.REPOSITORIES.LIST);
      
      if (!response.ok) {
        throw new Error('Failed to load repositories');
      }
      
      const data = await response.json();
      setRepositories(data.repositories || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      // Parse repository URL
      const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/i) ||
                      repoUrl.match(/gitlab\.com\/([^\/]+)\/([^\/\.]+)/i);
      
      if (!urlMatch) {
        throw new Error('Invalid repository URL. Please provide a GitHub or GitLab URL.');
      }

      const [, owner, repoName] = urlMatch;
      const fullName = `${owner}/${repoName}`;

      const response = await fetchWithAuth(API_ENDPOINTS.REPOSITORIES.CONNECT, {
        method: 'POST',
        body: JSON.stringify({
          name: repoName,
          full_name: fullName,
          clone_url: repoUrl.endsWith('.git') ? repoUrl : `${repoUrl}.git`,
          default_branch: branch,
          provider: provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to connect repository');
      }

      // Reset form and reload repositories
      setRepoUrl('');
      setBranch('main');
      setShowAddForm(false);
      await loadRepositories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repository');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRepository = async (repoId: string) => {
    if (!confirm('Are you sure you want to disconnect this repository? All indexed data will be deleted.')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.REPOSITORIES.BASE}/${repoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }

      await loadRepositories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete repository');
    }
  };

  const handleReindex = async (repoId: string) => {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.REPOSITORIES.BASE}/${repoId}/reindex`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger reindexing');
      }

      await loadRepositories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger reindexing');
    }
  };

  const getStatusIcon = (status: Repository['indexing_status']) => {
    switch (status) {
      case 'fully_indexed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Repository['indexing_status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      fully_indexed: 'default',
      in_progress: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const calculateProgress = (repo: Repository) => {
    if (repo.total_files === 0) return 0;
    return Math.round((repo.indexed_files / repo.total_files) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your connected repositories for security analysis
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Connect New Repository</CardTitle>
            <CardDescription>
              Add a GitHub or GitLab repository for security analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRepository} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Default Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <select
                    id="provider"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'github' | 'gitlab')}
                  >
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Connecting...' : 'Connect Repository'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Repositories</TabsTrigger>
          <TabsTrigger value="indexing">Indexing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">Loading repositories...</div>
              </CardContent>
            </Card>
          ) : repositories.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No repositories connected. Click "Connect Repository" to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            repositories.map((repo) => (
              <Card key={repo.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <GitBranch className="h-8 w-8 text-muted-foreground mt-1" />
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{repo.full_name}</h3>
                          {getStatusBadge(repo.indexing_status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Provider:</span> {repo.provider}
                          </div>
                          <div>
                            <span className="font-medium">Branch:</span> {repo.default_branch}
                          </div>
                          <div>
                            <span className="font-medium">Files Indexed:</span>{' '}
                            {repo.indexed_files} / {repo.total_files}
                          </div>
                          {repo.last_indexed_at && (
                            <div>
                              <span className="font-medium">Last Indexed:</span>{' '}
                              {new Date(repo.last_indexed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {repo.indexing_status !== 'fully_indexed' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Indexing Progress</span>
                              <span>{calculateProgress(repo)}%</span>
                            </div>
                            <Progress value={calculateProgress(repo)} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleReindex(repo.id)}
                        title="Reindex repository"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRepository(repo.id)}
                        title="Delete repository"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="indexing">
          {repositories
            .filter((r) => r.indexing_status === 'in_progress')
            .map((repo) => (
              <Card key={repo.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{repo.full_name}</h3>
                      <Progress value={calculateProgress(repo)} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="ready">
          {repositories
            .filter((r) => r.indexing_status === 'fully_indexed')
            .map((repo) => (
              <Card key={repo.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold">{repo.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {repo.indexed_files} files indexed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
