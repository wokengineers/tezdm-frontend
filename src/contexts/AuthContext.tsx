import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockData } from '../constants/mockApi';

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
  updateUser: (updates: Partial<User>) => void;
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
  updateUser: () => {},
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
    localStorage.removeItem('user');
  };

  /**
   * Update user data
   * @param updates - Partial user data to update
   */
  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    // Check for existing user session on app load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
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