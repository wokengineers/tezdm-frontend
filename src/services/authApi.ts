import { API_CONFIG } from '../config/api';

// Type definitions
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface LoginRequest {
  credential: string;
  password: string;
  confirm_password: string;
}

interface SignupRequest {
  credential: string;
  password: string;
  name: string;
}

interface ForgotPasswordRequest {
  credential: string;
}

interface ResetPasswordRequest {
  password: string;
  confirm_password: string;
  otp_token: string;
  hmac_signature_b64: string;
  credential: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
}

interface GroupMembership {
  id: number;
  user: string;
  group: {
    id: number;
    name: string;
  };
  role: string;
  permissions: string[];
  user_name: string;
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
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const payload: LoginRequest = {
      credential: email,
      password: password,
      confirm_password: password, // Same as password for login
    };

    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Signup with email, password, and name
   */
  async signup(email: string, password: string, name: string): Promise<ApiResponse<void>> {
    const payload: SignupRequest = {
      credential: email,
      password: password,
      name: name,
    };

    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Forgot password - send reset link to email
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const payload: ForgotPasswordRequest = {
      credential: email,
    };

    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Reset password with token and signature
   */
  async resetPassword(
    password: string,
    confirmPassword: string,
    otpToken: string,
    hmacSignature: string,
    credential: string
  ): Promise<ApiResponse<void>> {
    const payload: ResetPasswordRequest = {
      password: password,
      confirm_password: confirmPassword,
      otp_token: otpToken,
      hmac_signature_b64: hmacSignature,
      credential: credential,
    };

    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
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
   * Get group memberships to fetch user information
   */
  async getGroupMemberships(accessToken: string, groupId: number): Promise<ApiResponse<GroupMembership[]>> {
    const url = `${API_CONFIG.ENDPOINTS.GROUP_MEMBERSHIPS}?group=${groupId}`;
    return this.makeRequest<GroupMembership[]>(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  /**
   * Refresh token with group
   */
  async refreshTokenWithGroup(refreshToken: string, groupId: number): Promise<ApiResponse<LoginResponse>> {
    const payload: RefreshTokenRequest = {
      refresh_token: refreshToken,
      group: groupId,
    };

    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
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