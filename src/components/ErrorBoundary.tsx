import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Also automatically captures errors in PostHog for monitoring.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * Called when an error is caught by the error boundary
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Capture error in PostHog if available
    this.captureErrorInPostHog(error, errorInfo);
  }

  /**
   * Capture error in PostHog for monitoring and analytics
   */
  private captureErrorInPostHog(error: Error, errorInfo: ErrorInfo): void {
    try {
      // Check if PostHog is available
      if (typeof window !== 'undefined' && (window as any).posthog) {
        const posthog = (window as any).posthog;
        
        // Capture the error as a custom event
        posthog.capture('React Error Boundary', {
          error_message: error.message,
          error_stack: error.stack,
          error_name: error.name,
          component_stack: errorInfo.componentStack,
          error_boundary: 'ErrorBoundary',
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          severity: 'error'
        });
      }
    } catch (posthogError) {
      // Don't let PostHog errors break the error boundary
      console.error('Failed to capture error in PostHog:', posthogError);
    }
  }

  /**
   * Handle retry action
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Handle navigation to home
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Render fallback UI
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details (Development):
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-700 dark:text-red-300 mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help?{' '}
                <a
                  href="/help-support"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
