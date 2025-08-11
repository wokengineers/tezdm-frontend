import { API_CONFIG } from '../config/api';
import { SecurityManager } from '../utils/securityManager';
import { authApi } from './authApi';

// Types
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface ApiError {
  status: number;
  message: string;
  code?: string;
}

/**
 * Secure API Service with automatic token refresh
 */
export class SecureApiService {
  private static instance: SecureApiService;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  private constructor() {}

  static getInstance(): SecureApiService {
    if (!SecureApiService.instance) {
      SecureApiService.instance = new SecureApiService();
    }
    return SecureApiService.instance;
  }

  /**
   * Make API request with automatic token refresh
   */
  async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get valid access token
      let accessToken = SecurityManager.getValidAccessToken();
      
      // If no valid token, try to refresh
      if (!accessToken) {
        accessToken = await this.refreshTokenIfNeeded();
        if (!accessToken) {
          throw new Error('Authentication required');
        }
      }

      // Make the request
      const response = await this.makeAuthenticatedRequest<T>(endpoint, accessToken, options);
      return response;
    } catch (error) {
      // Handle 401 errors with token refresh
      if (this.isAuthError(error)) {
        const refreshedToken = await this.handleAuthError();
        if (refreshedToken) {
          // Retry the request with new token
          return this.makeAuthenticatedRequest<T>(endpoint, refreshedToken, options);
        }
      }
      
      throw error;
    }
  }

  /**
   * Make authenticated request
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (response.status === 401) {
      throw new Error('Authentication failed');
    }

    if (data.status !== 1) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Check if error is authentication related
   */
  private isAuthError(error: any): boolean {
    return (
      error.message === 'Authentication failed' ||
      error.message === 'Authentication required' ||
      (error.status && error.status === 401)
    );
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError(): Promise<string | null> {
    return this.refreshTokenIfNeeded();
  }

  /**
   * Refresh token if needed
   */
  private async refreshTokenIfNeeded(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      const tokens = SecurityManager.getTokens();
      if (!tokens) {
        console.error('No tokens found for refresh');
        this.handleLogout();
        return null;
      }

      // Check if refresh token is also expired
      if (SecurityManager.isTokenExpired(tokens.refresh_token)) {
        console.error('Refresh token is expired');
        this.handleLogout();
        return null;
      }

      console.log('Refreshing access token...');
      
      // Call refresh token API
      const response = await authApi.refreshTokenWithGroup(
        tokens.refresh_token, 
        tokens.group_id
      );

      const newTokens = response.data;
      const expiryTime = SecurityManager.getTokenExpiry(newTokens.access_token);

      if (!expiryTime) {
        throw new Error('Invalid token response');
      }

      // Store new tokens securely
      SecurityManager.storeTokens({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: expiryTime,
        group_id: tokens.group_id
      });

      console.log('Token refreshed successfully');
      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleLogout();
      return null;
    }
  }

  /**
   * Handle logout when token refresh fails
   */
  private handleLogout(): void {
    console.log('Handling logout due to authentication failure');
    SecurityManager.clearAllData();
    
    // Dispatch logout event for components to handle
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { reason: 'token_refresh_failed' }
    }));
  }

  /**
   * Validate current authentication state
   */
  validateAuth(): { isValid: boolean; errors: string[] } {
    return SecurityManager.validateAllData();
  }

  /**
   * Get current access token (for debugging)
   */
  getCurrentToken(): string | null {
    return SecurityManager.getValidAccessToken();
  }
}

// Export singleton instance
export const secureApi = SecureApiService.getInstance(); 