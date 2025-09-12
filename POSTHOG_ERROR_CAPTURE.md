# PostHog Error Capture Setup

This document describes the comprehensive error capture system implemented in the application using PostHog for monitoring and analytics.

## Overview

The error capture system automatically tracks and reports various types of errors to PostHog, providing insights into application health and user experience issues.

## Components

### 1. Global Error Handlers (`src/index.tsx`)

Automatic capture of:
- **Unhandled JavaScript errors** - Syntax errors, runtime errors, etc.
- **Unhandled promise rejections** - Async operation failures
- **Console errors** - Errors logged to console

```typescript
// Automatically setup on app initialization
setupGlobalErrorHandlers();
```

### 2. Error Boundary Component (`src/components/ErrorBoundary.tsx`)

Catches React component errors and provides:
- **Graceful error UI** - User-friendly error display
- **Automatic error capture** - Sends errors to PostHog
- **Retry functionality** - Allows users to recover
- **Development details** - Shows error details in dev mode

### 3. PostHog Hook Extensions (`src/hooks/usePostHog.ts`)

Enhanced with error tracking methods:
- `captureError(error, context)` - Capture generic errors
- `captureApiError(error, endpoint, method, statusCode)` - Capture API errors

### 4. Error Tracker Utility (`src/utils/errorTracker.ts`)

Comprehensive error tracking functions:
- `trackError()` - Generic JavaScript errors
- `trackApiError()` - API-related errors
- `trackComponentError()` - React component errors
- `trackValidationError()` - Form validation errors
- `trackPerformanceIssue()` - Performance-related issues

## Error Types Captured

### 1. JavaScript Errors
```typescript
// Automatic capture
throw new Error('Something went wrong');

// Manual capture
trackError(error, { context: 'user_action' });
```

### 2. API Errors
```typescript
// Automatic capture in API calls
trackApiError(error, '/api/users', 'POST', 500, requestData);
```

### 3. Component Errors
```typescript
// Automatic capture via Error Boundary
// Manual capture
trackComponentError(error, 'UserProfile', props);
```

### 4. Validation Errors
```typescript
// Form validation failures
trackValidationError(error, 'login_form', 'email', 'invalid-email');
```

### 5. Performance Issues
```typescript
// Slow operations, memory issues, etc.
trackPerformanceIssue('Slow API Response', { responseTime: 5000 });
```

## PostHog Configuration

### Error Capture Settings
```typescript
const posthogOptions: Partial<PostHogConfig> = {
  // ... other options
  
  // Error Capture Configuration
  capture_pageview: true,
  capture_pageleave: true,
  capture_performance: true,
  
  // Automatic error capture
  autocapture: {
    dom_event_allowlist: ['click', 'change', 'submit'],
    url_allowlist: ['.*'],
    element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
    css_selector_allowlist: ['.btn', '.button', '[role="button"]']
  },
  
  // Session recording (optional)
  session_recording: {
    maskAllInputs: true,
    maskInputOptions: {
      password: true,
      email: true,
      phone: true
    },
    recordCrossOriginIframes: false
  }
};
```

## Error Properties Captured

Each error includes comprehensive context:

```typescript
{
  // Error Details
  error_message: string,
  error_name: string,
  error_stack: string,
  
  // User Context (if authenticated)
  userId: string,
  userName: string,
  userPlan: string,
  
  // Environment Context
  domain: string,
  subdomain: string,
  url: string,
  user_agent: string,
  timestamp: string,
  
  // Error Classification
  severity: 'error' | 'warning',
  error_type: string,
  
  // Additional Context
  ...customProperties
}
```

## PostHog Events

The system creates the following events in PostHog:

1. **`JavaScript Error`** - Generic JavaScript errors
2. **`API Error`** - API-related errors
3. **`Component Error`** - React component errors
4. **`Validation Error`** - Form validation errors
5. **`Performance Issue`** - Performance-related issues
6. **`React Error Boundary`** - Errors caught by Error Boundary

## Testing Error Capture

### Development Testing

A test component is available in development mode:

```typescript
// Only visible in development
<ErrorTestComponent />
```

Provides buttons to trigger different error types:
- JavaScript Error
- API Error
- Validation Error
- Unhandled Error
- Promise Rejection
- Component Error

### Manual Testing

```typescript
import { trackError } from '../utils/errorTracker';

// Test error capture
const testError = new Error('Test error');
trackError(testError, { test: true });
```

## PostHog Dashboard

### Error Insights

1. **Error Frequency** - How often errors occur
2. **Error Types** - Breakdown by error category
3. **User Impact** - Which users are affected
4. **Error Trends** - Error patterns over time
5. **Performance Impact** - How errors affect performance

### Filters and Segmentation

- Filter by error type
- Filter by user properties
- Filter by domain/subdomain
- Filter by severity level
- Filter by time range

### Alerts

Set up alerts for:
- High error rates
- New error types
- Critical errors
- Performance degradation

## Best Practices

### 1. Error Context
Always provide meaningful context:
```typescript
trackError(error, {
  component: 'UserProfile',
  action: 'save_profile',
  userId: user.id
});
```

### 2. Sensitive Data
Never include sensitive information:
```typescript
// ❌ Don't do this
trackError(error, { password: userPassword });

// ✅ Do this instead
trackError(error, { hasPassword: !!userPassword });
```

### 3. Error Classification
Use consistent error types:
- `javascript_error`
- `api_error`
- `component_error`
- `validation_error`
- `performance_issue`

### 4. Severity Levels
- `error` - Critical issues that break functionality
- `warning` - Non-critical issues that should be monitored

## Monitoring and Alerts

### PostHog Insights

Create insights for:
- Error rate trends
- Most common error types
- Error distribution by user segment
- Performance impact of errors

### PostHog Alerts

Set up alerts for:
- Error rate exceeding threshold
- New error types appearing
- Critical errors affecting multiple users
- Performance degradation

## Integration with Existing Systems

### Logger Integration
```typescript
// In logger.ts
if (level === LogLevel.ERROR) {
  trackError(new Error(message), { logger: true });
}
```

### API Integration
```typescript
// In API services
try {
  const response = await apiCall();
} catch (error) {
  trackApiError(error, endpoint, method, statusCode);
  throw error;
}
```

## Security Considerations

### Data Privacy
- No sensitive user data in error reports
- Sanitized error messages
- Masked input values in session recordings

### Error Sanitization
```typescript
const sanitizedError = {
  message: error.message.replace(/password|token|key/gi, '[REDACTED]'),
  stack: error.stack?.replace(/password|token|key/gi, '[REDACTED]')
};
```

## Troubleshooting

### Common Issues

1. **Errors not appearing in PostHog**
   - Check PostHog configuration
   - Verify API key and host
   - Check browser console for PostHog errors

2. **Too many error events**
   - Implement error deduplication
   - Add error rate limiting
   - Filter out non-critical errors

3. **Performance impact**
   - Use async error capture
   - Implement error batching
   - Monitor PostHog usage

### Debug Mode

Enable debug mode for PostHog:
```typescript
const posthogOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ... other options
};
```

## Future Enhancements

### Planned Features
1. **Error Deduplication** - Prevent duplicate error reports
2. **Error Rate Limiting** - Limit error capture frequency
3. **Custom Error Categories** - User-defined error types
4. **Error Recovery Suggestions** - Automated error resolution
5. **Integration with External Services** - Slack, email notifications

### Advanced Analytics
1. **Error Correlation** - Find related errors
2. **User Journey Impact** - How errors affect user flows
3. **Predictive Error Detection** - ML-based error prediction
4. **Automated Error Resolution** - Self-healing systems
