import { secureApi } from './secureApi';

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
    return this.makeRequest<Platform[]>('/profile/oauth/');
  },

  /**
   * Get OAuth URL for specific platform
   */
  async getOAuthUrl(platformId: number, groupId: number): Promise<ApiResponse<OAuthUrlResponse>> {
    return this.makeRequest<OAuthUrlResponse>(`/profile/oauth/${platformId}/?group_id=${groupId}`);
  },



  /**
   * Complete OAuth redirect with code and state
   */
  async completeOAuthRedirect(code: string, state: string): Promise<ApiResponse<void>> {
    const payload: OAuthRedirectRequest = { code, state };
    
    return this.makeRequest<void>('/profile/oauth/auth_redirection/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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