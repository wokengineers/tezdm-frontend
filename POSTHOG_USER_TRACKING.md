# PostHog User Tracking Implementation

## Overview

This document describes the implementation of user identification and activity tracking in PostHog for the TezDM frontend application. This allows you to see which user is performing what activities in your PostHog analytics dashboard.

## Implementation Details

### 1. PostHog Hook (`src/hooks/usePostHog.ts`)

A custom React hook that provides PostHog integration with user identification capabilities:

#### Features:
- **Automatic User Identification**: Identifies users when they log in and resets when they log out
- **Event Tracking**: Track custom events with user context
- **Page View Tracking**: Track page views with user information
- **User Properties Management**: Update user properties dynamically

#### Key Methods:
- `identifyUser(userData)`: Identifies a user with PostHog
- `resetUser()`: Resets user identification (on logout)
- `trackEvent(eventName, properties)`: Track custom events
- `trackPageView(pageName, properties)`: Track page views
- `updateUserProperties(properties)`: Update user properties

### 2. AuthContext Integration (`src/contexts/AuthContext.tsx`)

The authentication context has been enhanced with PostHog tracking:

#### Automatic Events Tracked:
- **User Login**: Tracked when user successfully logs in
- **User Signup**: Tracked when user creates a new account
- **User Logout**: Tracked when user logs out manually
- **User Signout**: Tracked when user signs out via API
- **User Profile Updated**: Tracked when user profile is updated

#### User Properties Tracked:
- `name`: User's display name
- `email`: User's email address
- `plan`: User's subscription plan
- `connectedAccountsCount`: Number of connected Instagram accounts
- `createdAt`: Account creation date
- `lastLogin`: Last login timestamp

### 3. Configuration (`src/index.tsx`)

PostHog is configured with:
- Environment variables for API key and host
- Cross-subdomain cookie support (`cross_subdomain_cookie: true`)
- LocalStorage + cookie persistence
- Automatic SPA pageview tracking

#### Cross-Subdomain Setup

The configuration supports tracking users across multiple subdomains:
- **Landing Page**: `tezdm.com` (anonymous users)
- **Product App**: `app.tezdm.com` (authenticated users)

With `cross_subdomain_cookie: true`, PostHog maintains the same user identity across both domains, allowing you to track the complete user journey from landing page to product usage.

## Usage Examples

### Basic Event Tracking

```typescript
import { usePostHog } from '../hooks/usePostHog';

const MyComponent: React.FC = () => {
  const { trackEvent } = usePostHog();

  const handleButtonClick = () => {
    trackEvent('Button Clicked', {
      buttonName: 'create-automation',
      page: 'dashboard',
    });
  };

  return <button onClick={handleButtonClick}>Create Automation</button>;
};
```

### Page View Tracking

```typescript
import { usePostHog } from '../hooks/usePostHog';

const MyPage: React.FC = () => {
  const { trackPageView } = usePostHog();

  useEffect(() => {
    trackPageView('Automation Builder', {
      section: 'new-automation',
    });
  }, []);

  return <div>Page content</div>;
};
```

### User Properties Update

```typescript
import { usePostHog } from '../hooks/usePostHog';

const ProfileComponent: React.FC = () => {
  const { updateUserProperties } = usePostHog();

  const handlePlanUpdate = (newPlan: string) => {
    updateUserProperties({
      plan: newPlan,
    });
  };

  return <div>Profile content</div>;
};
```

### Cross-Subdomain Tracking (Landing Page)

For your landing page (`tezdm.com`), use anonymous tracking:

```typescript
import { usePostHog } from '../hooks/usePostHog';

const LandingPageComponent: React.FC = () => {
  const { trackAnonymousEvent, trackPageView } = usePostHog();

  useEffect(() => {
    // Track landing page view
    trackPageView('Landing Page', {
      section: 'homepage',
    });
  }, []);

  const handleCTAClick = () => {
    trackAnonymousEvent('CTA Clicked', {
      ctaType: 'get-started',
      ctaLocation: 'hero-section',
    });
  };

  return (
    <button onClick={handleCTAClick}>
      Get Started
    </button>
  );
};
```

## Analytics Dashboard Benefits

With this implementation, you can now see in your PostHog dashboard:

### User Identification
- **User Profiles**: Each user is identified with their email, name, and plan
- **User Journey**: Track individual user behavior across sessions
- **User Segmentation**: Filter analytics by user properties (plan, connected accounts, etc.)

### Event Tracking
- **Authentication Events**: Login, signup, logout patterns
- **User Actions**: Button clicks, page views, feature usage
- **Custom Events**: Any business-specific events you want to track

### Insights You Can Get
- Which users are most active
- What features are most popular
- User behavior patterns by plan type
- Conversion funnel analysis
- User retention metrics
- **Cross-subdomain user journey**: Track users from landing page to product usage
- **Anonymous to identified conversion**: See which anonymous users become customers

## Environment Variables

Make sure these environment variables are set:

```bash
VITE_POSTHOG_KEY=your_posthog_api_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

## Security Considerations

- User identification uses email as the unique identifier
- No sensitive data (passwords, tokens) is sent to PostHog
- User properties are sanitized before sending
- PostHog data is subject to your PostHog privacy settings

## Troubleshooting

### Check User Identification
```typescript
const { isUserIdentified } = usePostHog();
console.log('User identified:', isUserIdentified);
```

### Debug Event Tracking
All PostHog events are logged to the console with ✅/❌ indicators for easy debugging.

### Common Issues
1. **User not identified**: Check if user is logged in and PostHog is initialized
2. **Events not appearing**: Check browser console for error messages
3. **Missing user properties**: Ensure user data is properly loaded in AuthContext

## Next Steps

1. **Add More Events**: Track specific business events (automation creation, account connections, etc.)
2. **Funnel Analysis**: Set up conversion funnels for key user journeys
3. **Cohort Analysis**: Analyze user behavior by signup date, plan type, etc.
4. **A/B Testing**: Use PostHog's feature flags for experimentation
5. **Retention Analysis**: Track user retention and engagement patterns
