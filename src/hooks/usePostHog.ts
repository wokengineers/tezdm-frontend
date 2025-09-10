import { usePostHog as usePostHogReact } from 'posthog-js/react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

/**
 * PostHog user properties interface
 */
interface PostHogUserProperties {
  name: string;
  email: string;
  plan: string;
  connectedAccountsCount: number;
  createdAt: string;
  lastLogin: string;
}

/**
 * Custom PostHog hook that integrates with authentication
 * Provides user identification and event tracking capabilities
 * @returns PostHog instance with user identification methods
 */
export const usePostHog = () => {
  const posthog = usePostHogReact();
  const { user, isAuthenticated } = useAuth();

  /**
   * Identify user with PostHog
   * @param userData - User data from AuthContext
   */
  const identifyUser = (userData: typeof user): void => {
    if (!posthog || !userData) return;

    try {
      // Set user properties for analytics
      const userProperties: PostHogUserProperties = {
        name: userData.name,
        email: userData.email,
        plan: userData.plan,
        connectedAccountsCount: userData.connectedAccounts.length,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      };

      // Identify the user with PostHog
      posthog.identify(userData.id, userProperties);
    } catch (error) {
      console.error('❌ PostHog user identification failed:', error);
    }
  };

  /**
   * Reset user identification (on logout)
   */
  const resetUser = (): void => {
    if (!posthog) return;

    try {
      posthog.reset();
    } catch (error) {
      console.error('❌ PostHog user reset failed:', error);
    }
  };

  /**
   * Track custom event with user context
   * @param eventName - Name of the event to track
   * @param properties - Additional event properties
   */
  const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
    if (!posthog) return;

    try {
      const eventProperties = {
        ...properties,
        // Always include user context if available
        ...(user && {
          userId: user.id,
          userName: user.name,
          userPlan: user.plan,
        }),
        // Include domain context for cross-subdomain tracking
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
      };

      posthog.capture(eventName, eventProperties);
    } catch (error) {
      console.error('❌ PostHog event tracking failed:', error);
    }
  };

  /**
   * Track page view with user context
   * @param pageName - Name of the page
   * @param properties - Additional page properties
   */
  const trackPageView = (pageName: string, properties?: Record<string, any>): void => {
    if (!posthog) return;

    try {
      const pageProperties = {
        page: pageName,
        ...properties,
        // Always include user context if available
        ...(user && {
          userId: user.id,
          userName: user.name,
          userPlan: user.plan,
        }),
        // Include domain context for cross-subdomain tracking
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
      };

      posthog.capture('$pageview', pageProperties);
    } catch (error) {
      console.error('❌ PostHog page view tracking failed:', error);
    }
  };

  /**
   * Update user properties
   * @param properties - Properties to update
   */
  const updateUserProperties = (properties: Partial<PostHogUserProperties>): void => {
    if (!posthog || !user) return;

    try {
      posthog.people.set(properties);
    } catch (error) {
      console.error('❌ PostHog user properties update failed:', error);
    }
  };

  /**
   * Track anonymous user activity (for landing page)
   * @param eventName - Name of the event to track
   * @param properties - Additional event properties
   */
  const trackAnonymousEvent = (eventName: string, properties?: Record<string, any>): void => {
    if (!posthog) return;

    try {
      const eventProperties = {
        ...properties,
        // Include domain context for cross-subdomain tracking
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        isAnonymous: true,
      };

      posthog.capture(eventName, eventProperties);
    } catch (error) {
      console.error('❌ PostHog anonymous event tracking failed:', error);
    }
  };

  // Automatically identify user when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      identifyUser(user);
    } else if (!isAuthenticated) {
      resetUser();
    }
  }, [isAuthenticated, user]);

  return {
    posthog,
    identifyUser,
    resetUser,
    trackEvent,
    trackPageView,
    updateUserProperties,
    trackAnonymousEvent,
    isUserIdentified: isAuthenticated && !!user,
  };
};
