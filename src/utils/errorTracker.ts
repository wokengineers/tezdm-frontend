import { usePostHog } from '../hooks/usePostHog';

/**
 * Error tracking utility for consistent error reporting
 * Provides methods to capture different types of errors in PostHog
 */

/**
 * Capture a generic JavaScript error
 * @param error - Error object
 * @param context - Additional context about where the error occurred
 */
export const trackError = (error: Error, context?: Record<string, any>): void => {
  try {
    // Get PostHog instance (this will work in components that use the hook)
    // For global error handlers, we'll use the window.posthog directly
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      const errorProperties = {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'error',
        error_type: 'javascript_error',
        ...context,
      };
      
      posthog.capture('JavaScript Error', errorProperties);
    }
  } catch (posthogError) {
    console.error('Failed to track error in PostHog:', posthogError);
  }
};

/**
 * Capture an API error
 * @param error - Error object
 * @param endpoint - API endpoint that failed
 * @param method - HTTP method
 * @param statusCode - HTTP status code
 * @param requestData - Request data that was sent
 */
export const trackApiError = (
  error: Error, 
  endpoint: string, 
  method: string, 
  statusCode?: number,
  requestData?: any
): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      const errorProperties = {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        api_endpoint: endpoint,
        api_method: method,
        http_status_code: statusCode,
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'error',
        error_type: 'api_error',
        ...(requestData && { request_data: requestData }),
      };
      
      posthog.capture('API Error', errorProperties);
    }
  } catch (posthogError) {
    console.error('Failed to track API error in PostHog:', posthogError);
  }
};

/**
 * Capture a React component error
 * @param error - Error object
 * @param componentName - Name of the component where error occurred
 * @param props - Component props (sanitized)
 */
export const trackComponentError = (
  error: Error, 
  componentName: string, 
  props?: Record<string, any>
): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      const errorProperties = {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        component_name: componentName,
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'error',
        error_type: 'component_error',
        ...(props && { component_props: props }),
      };
      
      posthog.capture('Component Error', errorProperties);
    }
  } catch (posthogError) {
    console.error('Failed to track component error in PostHog:', posthogError);
  }
};

/**
 * Capture a validation error
 * @param error - Error object
 * @param formName - Name of the form
 * @param fieldName - Name of the field that failed validation
 * @param value - Value that failed validation
 */
export const trackValidationError = (
  error: Error, 
  formName: string, 
  fieldName?: string, 
  value?: any
): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      const errorProperties = {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        form_name: formName,
        field_name: fieldName,
        validation_value: value,
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'warning',
        error_type: 'validation_error',
      };
      
      posthog.capture('Validation Error', errorProperties);
    }
  } catch (posthogError) {
    console.error('Failed to track validation error in PostHog:', posthogError);
  }
};

/**
 * Capture a performance issue
 * @param issue - Description of the performance issue
 * @param metrics - Performance metrics
 * @param context - Additional context
 */
export const trackPerformanceIssue = (
  issue: string, 
  metrics?: Record<string, number>, 
  context?: Record<string, any>
): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      const errorProperties = {
        issue_description: issue,
        domain: window.location.hostname,
        subdomain: window.location.hostname.includes('app.') ? 'app' : 'landing',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'warning',
        error_type: 'performance_issue',
        ...(metrics && { performance_metrics: metrics }),
        ...context,
      };
      
      posthog.capture('Performance Issue', errorProperties);
    }
  } catch (posthogError) {
    console.error('Failed to track performance issue in PostHog:', posthogError);
  }
};

/**
 * Setup global error handlers for automatic error capture
 * This should be called once during app initialization
 */
export const setupGlobalErrorHandlers = (): void => {
  // Capture unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    trackError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error_type: 'unhandled_error',
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    trackError(error, {
      error_type: 'unhandled_promise_rejection',
      promise_reason: event.reason,
    });
  });

  // Capture console errors (optional)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    
    // Only track if it looks like an error object
    const errorArg = args.find(arg => arg instanceof Error);
    if (errorArg) {
      trackError(errorArg, {
        error_type: 'console_error',
        console_args: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ),
      });
    }
  };
};
