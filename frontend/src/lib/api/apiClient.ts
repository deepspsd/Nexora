import { tokenManager } from '@/lib/auth/tokenManager';

// API Client with automatic token refresh

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retryOnAuthError?: boolean;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, retryOnAuthError = true, ...fetchConfig } = config;

    // Get valid token (will refresh if needed)
    let token: string | null = null;
    if (!skipAuth) {
      token = await tokenManager.getValidToken();
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuth && retryOnAuthError) {
      try {
        // Try to refresh token
        const newToken = await tokenManager.refreshAccessToken();
        
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...fetchConfig,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      } catch (error) {
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // HTTP Methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, config?: RequestConfig): Promise<T> {
    const token = await tokenManager.getValidToken();
    
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...config,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
