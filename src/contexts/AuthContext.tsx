import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockData } from '../constants/mockApi';
import { authApi } from '../services/authApi';
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
 * Auth context interface
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  // New OTP methods
  generateOtp: (email: string) => Promise<boolean>;
  validateOtp: (email: string, otp: string) => Promise<boolean>;
  otpStep: 'email' | 'otp' | 'loading' | 'success';
  currentEmail: string | null;
  error: string | null;
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  signout: async () => {},
  updateUser: () => {},
  // New OTP methods
  generateOtp: async () => false,
  validateOtp: async () => false,
  otpStep: 'email',
  currentEmail: null,
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
  const [otpStep, setOtpStep] = useState<'email' | 'otp' | 'loading' | 'success'>('email');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Simulate login process
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to success status
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      if (email === 'demo@example.com' && password === 'password') {
        setUser(mockData.user);
        localStorage.setItem('user', JSON.stringify(mockData.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Simulate signup process
   * @param name - User name
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to success status
   */
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock signup logic
      const newUser: User = {
        ...mockData.user,
        id: `user_${Date.now()}`,
        name,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    setUser(null);
    setOtpStep('email');
    setCurrentEmail(null);
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
      setOtpStep('email');
      setCurrentEmail(null);
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

  /**
   * Generate OTP for email
   * @param email - User email
   * @returns Promise resolving to success status
   */
  const generateOtp = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setOtpStep('loading');
      
      await authApi.generateOtp(email);
      
      setCurrentEmail(email);
      setOtpStep('otp');
      return true;
    } catch (error) {
      console.error('Generate OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate OTP');
      setOtpStep('email');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate OTP and complete authentication
   * @param email - User email
   * @param otp - OTP code
   * @returns Promise resolving to success status
   */
  const validateOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setOtpStep('loading');
      
      // Step 1: Validate OTP and get initial tokens
      const otpResponse = await authApi.validateOtp(email, otp);
      const { access_token, refresh_token } = otpResponse.data;
      
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
      
      // Step 4: Create user object and store tokens securely
      const userData: User = {
        ...mockData.user,
        id: email,
        email,
        name: email.split('@')[0], // Use email prefix as name
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
      
      setOtpStep('success');
      return true;
    } catch (error) {
      console.error('Validate OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to validate OTP');
      setOtpStep('otp');
      return false;
    } finally {
      setIsLoading(false);
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
      console.log('Received logout event:', event.detail);
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
    login,
    signup,
    logout,
    signout,
    updateUser,
    generateOtp,
    validateOtp,
    otpStep,
    currentEmail,
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