import { secureApi } from './secureApi';
import { API_CONFIG } from '../config/api';

// Constants
const PRODUCT_CODE = 'tezdm';

// Type definitions
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface Platform {
  id: number;
  platform_type: string;
}



interface OAuthUrlResponse {
  url: string;
}

interface ConnectedAccount {
  id: number;
  platform: string;
  creation_date: string;
  name: string;
  tag: string | null;
  parent_profile_id: string;
  parent_profile_name: string;
  state: string;
  uuid: string;
  profile_link: string | null;
  group: number;
  profile_oauth_config: number;
}

interface OAuthRedirectRequest {
  code: string;
  state: string;
}

interface OAuthStatusResponse {
  state: string;
}

/**
 * Profile API service for OAuth connections
 */
export const profileApi = {
  /**
   * Make API request with automatic token refresh and security
   */
  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return secureApi.makeRequest<T>(endpoint, options);
  },

  /**
   * Get available OAuth platforms
   */
  async getOAuthPlatforms(): Promise<ApiResponse<Platform[]>> {
    return this.makeRequest<Platform[]>(`/profile/oauth/?product_code=${PRODUCT_CODE}`);
  },

  /**
   * Get OAuth URL for specific platform
   */
  async getOAuthUrl(platformId: number, groupId: number): Promise<ApiResponse<OAuthUrlResponse>> {
    return this.makeRequest<OAuthUrlResponse>(`/profile/oauth/${platformId}/?group_id=${groupId}&product_code=${PRODUCT_CODE}`);
  },



  /**
   * Complete OAuth redirect with code and state (Public - no auth required)
   */
  async completeOAuthRedirect(code: string, state: string): Promise<ApiResponse<void>> {
    const payload: OAuthRedirectRequest = { code, state };
    
    // Use direct API call without authentication for OAuth redirect
    const url = `${API_CONFIG.BASE_URL}/profile/oauth/auth_redirection/?product_code=${PRODUCT_CODE}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status !== 1) {
      throw new Error(data.message || 'OAuth completion failed');
    }

    return data;
  },

  /**
   * Get OAuth status (requires authentication)
   */
  async getOAuthStatus(state: string): Promise<ApiResponse<OAuthStatusResponse>> {
    return this.makeRequest<OAuthStatusResponse>(`/profile/oauth/auth_redirection/status/?state=${state}`);
  },

  /**
   * Get connected accounts
   */
  async getConnectedAccounts(groupId: number, page: number = 1): Promise<ApiResponse<ConnectedAccount[]>> {
    return this.makeRequest<ConnectedAccount[]>(`/profile/manage/listing/?group_id=${groupId}&page=${page}`);
  },

  /**
   * Delete connected account
   */
  async deleteConnectedAccount(accountId: number, groupId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/profile/manage/listing/${accountId}/?group_id=${groupId}`, {
      method: 'DELETE',
    });
  },
}; 