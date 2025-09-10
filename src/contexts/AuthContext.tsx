import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockData } from '../constants/mockApi';
import { authApi } from '../services/authApi';
import { profileApi } from '../services/profileApi';
import { SecurityManager } from '../utils/securityManager';

/**
 * User interface
 */
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  connectedAccounts: Array<{
    id: string;
    platform: string;
    username: string;
    isPrimary: boolean;
    avatar: string;
    status: string;
  }>;
  plan: string;
  notifications: boolean;
  createdAt: string;
  lastLogin: string;
}

/**
 * Login result interface
 */
interface LoginResult {
  success: boolean;
  redirectTo?: string;
}

/**
 * Auth context interface
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean; // Added for auth operation loading state
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  error: string | null;
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthLoading: false, // Added for auth operation loading state
  login: async () => ({ success: false }),
  signup: async () => false,
  logout: () => {},
  signout: async () => {},
  updateUser: () => {},
  clearError: () => {},
  error: null,
});

/**
 * Auth provider props interface
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component that manages authentication state
 * @param children - React children components
 * @returns Auth context provider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false); // Separate loading state for auth operations
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to success status
   */
  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsAuthLoading(true);
      setError(null);
      
      // Step 1: Login and get initial tokens
      const loginResponse = await authApi.login(email, password);
      const { access_token, refresh_token } = loginResponse.data;
      
      // Step 2: Get user groups
      const groupsResponse = await authApi.getGroups(access_token);
      const groups = groupsResponse.data;
      
      if (groups.length === 0) {
        throw new Error('No groups found for this user');
      }
      
      // Step 3: Refresh token with first group
      const firstGroup = groups[0];
      const finalResponse = await authApi.refreshTokenWithGroup(refresh_token, firstGroup.id);
      const finalTokens = finalResponse.data;
      
      // Step 4: Get user information from group memberships
      const membershipsResponse = await authApi.getGroupMemberships(finalTokens.access_token, firstGroup.id);
      const memberships = membershipsResponse.data;
      
      if (memberships.length === 0) {
        throw new Error('No user information found');
      }
      
      // Get the first membership (user's own membership)
      const userMembership = memberships[0];
      
      // Step 5: Create user object with actual name from API
      const userData: User = {
        ...mockData.user,
        id: email,
        email,
        name: userMembership.user_name || email.split('@')[0], // Use API name or fallback to email prefix
        lastLogin: new Date().toISOString(),
      };
      
      // Get token expiry time
      const expiryTime = SecurityManager.getTokenExpiry(finalTokens.access_token);
      if (!expiryTime) {
        throw new Error('Invalid token response');
      }
      
      // Store user and tokens securely
      setUser(userData);
      SecurityManager.storeUser(userData);
      SecurityManager.storeTokens({
        access_token: finalTokens.access_token,
        refresh_token: finalTokens.refresh_token,
        expires_at: expiryTime,
        group_id: firstGroup.id
      });
      
      // Step 5: Check for connected accounts
      try {
        const connectedAccountsResponse = await profileApi.getConnectedAccounts(firstGroup.id);
        const connectedAccounts = connectedAccountsResponse.data || [];
        
        // Check if user has any connected Instagram accounts
        const hasInstagramAccount = connectedAccounts.some(account => 
          account.platform === 'instagram' && 
          (account.state === 'connected' || account.state === 'token_available')
        );
        
        if (hasInstagramAccount) {
          return { success: true, redirectTo: '/automations' };
        } else {
          return { success: true, redirectTo: '/connect-accounts' };
        }
      } catch (accountError) {
        console.error('Failed to check connected accounts:', accountError);
        // If we can't check accounts, default to connect accounts page
        return { success: true, redirectTo: '/connect-accounts' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      return { success: false };
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Signup with name, email, and password
   * @param name - User name
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to success status
   */
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsAuthLoading(true);
      setError(null);
      
      // Call signup API
      await authApi.signup(email, password, name);
      
      // Return true on successful signup (user will be redirected to login)
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    setUser(null);
    setError(null);
    SecurityManager.clearAllData();
  };

  /**
   * Signout user with API call
   */
  const signout = async (): Promise<void> => {
    try {
      const tokens = SecurityManager.getTokens();
      
      if (tokens) {
        await authApi.signout(tokens.refresh_token, tokens.group_id);
      }
    } catch (error) {
      console.error('Signout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local data
      setUser(null);
      setError(null);
      SecurityManager.clearAllData();
    }
  };

  /**
   * Update user data
   * @param updates - Partial user data to update
   */
  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      SecurityManager.storeUser(updatedUser);
    }
  };

  useEffect(() => {
    // Check for existing user session on app load with security validation
    const validateAndLoadUser = () => {
      try {
        // Validate all stored data integrity
        const validation = SecurityManager.validateAllData();
        
        if (!validation.isValid) {
          console.warn('Data integrity validation failed:', validation.errors);
          SecurityManager.clearAllData();
          setIsLoading(false);
          return;
        }
        
        // Check if user is authenticated
        if (SecurityManager.isAuthenticated()) {
          const user = SecurityManager.getUser();
          if (user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error validating user session:', error);
        SecurityManager.clearAllData();
      }
      
      setIsLoading(false);
    };

    validateAndLoadUser();

    // Listen for logout events from secure API
    const handleLogout = (event: CustomEvent) => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogout as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAuthLoading,
    login,
    signup,
    logout,
    signout,
    updateUser,
    clearError: () => setError(null),
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns Auth context values
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 