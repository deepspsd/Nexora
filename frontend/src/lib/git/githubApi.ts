import { apiClient } from '@/lib/api/apiClient';

export interface GitHubRepo {
  name: string;
  description: string;
  private: boolean;
  url: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  repos_url: string;
}

// Create a new GitHub repository
export const createGitHubRepo = async (
  name: string,
  description: string,
  isPrivate: boolean = false
): Promise<GitHubRepo> => {
  return await apiClient.post<GitHubRepo>('/api/git/create-repo', {
    name,
    description,
    private: isPrivate,
  });
};

// Push project files to GitHub
export const pushToGitHub = async (
  repoName: string,
  files: Record<string, string>,
  commitMessage: string = 'Initial commit from NEXORA'
): Promise<{ success: boolean; url: string }> => {
  return await apiClient.post('/api/git/push', {
    repoName,
    files,
    commitMessage,
  });
};

// Get user's GitHub repositories
export const getUserRepos = async (): Promise<GitHubRepo[]> => {
  return await apiClient.get<GitHubRepo[]>('/api/git/repos');
};

// Check if user has connected GitHub
export const isGitHubConnected = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ connected: boolean }>('/api/git/status');
    return response.connected;
  } catch {
    return false;
  }
};

// Connect GitHub account
export const connectGitHub = (): void => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  const scope = 'repo user:email';
  
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
};

// Create and push project in one step
export const exportToGitHub = async (
  projectName: string,
  files: Record<string, string>,
  description: string = 'Created with NEXORA AI',
  isPrivate: boolean = false
): Promise<{ success: boolean; repoUrl: string }> => {
  try {
    // Create repository
    const repo = await createGitHubRepo(projectName, description, isPrivate);
    
    // Push files
    const result = await pushToGitHub(repo.name, files);
    
    return {
      success: result.success,
      repoUrl: result.url,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to export to GitHub');
  }
};
