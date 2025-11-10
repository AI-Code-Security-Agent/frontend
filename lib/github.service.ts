import { fetchWithAuth } from './fetchWithAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  termsAccepted?: boolean;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
  cloneUrl: string;
  isConnected?: boolean;
}

export interface GitHubBranch {
  name: string;
  commitSha: string;
  protected: boolean;
}

export interface ConnectRepositoryRequest {
  repositoryId: number;
  name: string;
  fullName: string;
  branch: string;
  private: boolean;
  cloneUrl?: string;  // Optional - backend will generate if not provided
}

export interface ConnectRepositoryResponse {
  success: boolean;
  repository: {
    id: string;
    user_id: string;
    name: string;
    full_name: string;
    clone_url: string;
    default_branch: string;
    branch: string;
    provider: string;
    indexing_status: string;
    total_files: number;
    indexed_files: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

class GitHubService {
  /**
   * Initiate GitHub OAuth flow
   */
  async initiateAuth(): Promise<string> {
    const response = await fetchWithAuth(`${API_BASE_URL}/github/auth/initiate`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate GitHub authentication');
    }
    
    const data = await response.json();
    return data.authUrl;
  }

  /**
   * Get GitHub connection status
   */
  async getStatus(): Promise<GitHubStatus> {
    const response = await fetchWithAuth(`${API_BASE_URL}/github/status`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get GitHub status');
    }
    
    return await response.json();
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms(): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/github/terms/accept`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept terms');
    }
  }

  /**
   * Get user's GitHub repositories
   */
  async getRepositories(page: number = 1, perPage: number = 30): Promise<GitHubRepository[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/github/repositories?page=${page}&per_page=${perPage}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch repositories');
    }
    
    const data = await response.json();
    return data.repositories;
  }

  /**
   * Get branches for a repository
   */
  async getRepositoryBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/github/repositories/${owner}/${repo}/branches`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch branches');
    }
    
    const data = await response.json();
    return data.branches;
  }

  /**
   * Connect a repository for RAG indexing
   */
  async connectRepository(request: ConnectRepositoryRequest): Promise<ConnectRepositoryResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/github/repositories/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect repository');
    }
    
    return await response.json();
  }

  /**
   * Disconnect a repository
   */
  async disconnectRepository(repositoryId: number): Promise<void> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/github/repositories/${repositoryId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect repository');
    }
  }

  /**
   * Get connected repositories with indexing status
   */
  async getConnectedRepositories(): Promise<{
    repositories: Array<{
      repositoryId: string;
      name: string;
      fullName: string;
      branch: string;
      ragRepositoryId: string;
      indexingStatus: string;
      totalFiles: number;
      indexedFiles: number;
      progress: number;
    }>;
    selectedRepository: any;
  }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/github/repositories/connected`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch connected repositories');
    }
    
    return await response.json();
  }

  /**
   * Select a repository for RAG queries
   */
  async selectRepository(repositoryId: string): Promise<void> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/github/repositories/select`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositoryId }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to select repository');
    }
  }

  /**
   * Disconnect GitHub integration
   */
  async disconnect(): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/github/disconnect`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect GitHub');
    }
  }
}

export const githubService = new GitHubService();
