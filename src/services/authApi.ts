import { API_CONFIG } from '../config/api';

// Type definitions
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface OtpRequest {
  credential_type: string;
  credential: string;
  otp_action: 'generate_otp' | 'validate_otp';
  otp?: string;
  send_otp: boolean;
}

interface OtpResponse {
  access_token: string;
  refresh_token: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
}

interface RefreshTokenRequest {
  refresh_token: string;
  group: number;
}

interface SignoutRequest {
  refresh_token: string;
  group: number;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Make API request with standardized error handling
   */
  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (data.status !== 1) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Generate OTP for email
   */
  async generateOtp(email: string): Promise<ApiResponse<void>> {
    const payload: OtpRequest = {
      credential_type: 'email_id',
      credential: email,
      otp_action: 'generate_otp',
      send_otp: true,
    };

    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.OTP_AUTHENTICATION, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Validate OTP and get tokens
   */
  async validateOtp(email: string, otp: string): Promise<ApiResponse<OtpResponse>> {
    const payload: OtpRequest = {
      credential_type: 'email_id',
      credential: email,
      otp_action: 'validate_otp',
      otp,
      send_otp: false,
    };

    return this.makeRequest<OtpResponse>(API_CONFIG.ENDPOINTS.AUTH.OTP_AUTHENTICATION, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get user groups
   */
  async getGroups(accessToken: string): Promise<ApiResponse<Group[]>> {
    return this.makeRequest<Group[]>(API_CONFIG.ENDPOINTS.GROUPS, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  /**
   * Refresh token with group
   */
  async refreshTokenWithGroup(refreshToken: string, groupId: number): Promise<ApiResponse<OtpResponse>> {
    const payload: RefreshTokenRequest = {
      refresh_token: refreshToken,
      group: groupId,
    };

    return this.makeRequest<OtpResponse>(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Signout user
   */
  async signout(refreshToken: string, groupId: number): Promise<ApiResponse<void>> {
    const payload: SignoutRequest = {
      refresh_token: refreshToken,
      group: groupId,
    };

    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.SIGNOUT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
}; 