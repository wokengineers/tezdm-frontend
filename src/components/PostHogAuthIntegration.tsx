import React, { useEffect } from 'react';
import { usePostHog } from '../hooks/usePostHog';
import { useAuth } from '../contexts/AuthContext';

/**
 * PostHog Authentication Integration Component
 * Handles PostHog tracking for authentication events
 * This component should be placed inside AuthProvider to avoid circular dependency
 * @returns PostHog authentication integration component
 */
const PostHogAuthIntegration: React.FC = () => {
  const { trackEvent, updateUserProperties } = usePostHog();
  const { user, isAuthenticated } = useAuth();

  /**
   * Track authentication state changes
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in - this will be handled by the usePostHog hook automatically
      console.log('🔐 PostHog: User authenticated', { userId: user.id, userName: user.name });
      
      // Track login event with additional context
      trackEvent('User Login', {
        loginMethod: 'email_password',
        userPlan: user.plan,
        connectedAccountsCount: user.connectedAccounts.length,
        timestamp: new Date().toISOString(),
      });
    } else if (!isAuthenticated) {
      // User logged out - this will be handled by the usePostHog hook automatically
      console.log('🔐 PostHog: User logged out');
    }
  }, [isAuthenticated, user, trackEvent]);

  /**
   * Track user profile updates
   */
  useEffect(() => {
    if (user) {
      // Update PostHog user properties when user data changes
      const userProperties = {
        name: user.name,
        email: user.email,
        plan: user.plan,
        connectedAccountsCount: user.connectedAccounts.length,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };
      
      updateUserProperties(userProperties);
    }
  }, [user, updateUserProperties]);

  // This component doesn't render anything visible
  return null;
};

export default PostHogAuthIntegration;
