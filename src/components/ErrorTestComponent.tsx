import React, { useState } from 'react';
import { usePostHog } from '../hooks/usePostHog';
import { trackError, trackApiError, trackValidationError } from '../utils/errorTracker';

/**
 * Test component for error capture functionality
 * This component provides buttons to trigger different types of errors
 * for testing PostHog error capture
 * 
 * ⚠️ This component should only be used in development/testing environments
 */
const ErrorTestComponent: React.FC = () => {
  const { captureError, captureApiError } = usePostHog();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const triggerJavaScriptError = () => {
    try {
      throw new Error('Test JavaScript Error - This is intentional for testing');
    } catch (error) {
      captureError(error as Error, {
        test_context: 'error_test_component',
        error_source: 'manual_trigger',
      });
    }
  };

  const triggerApiError = () => {
    const error = new Error('Test API Error - This is intentional for testing');
    captureApiError(error, '/test/endpoint', 'POST', 500);
  };

  const triggerValidationError = () => {
    const error = new Error('Test Validation Error - This is intentional for testing');
    trackValidationError(error, 'test_form', 'email', 'invalid-email');
  };

  const triggerUnhandledError = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      throw new Error('Test Unhandled Error - This is intentional for testing');
    }, 100);
  };

  const triggerUnhandledPromiseRejection = () => {
    // This will trigger the global promise rejection handler
    Promise.reject(new Error('Test Unhandled Promise Rejection - This is intentional for testing'));
  };

  const triggerComponentError = () => {
    // This will trigger the Error Boundary
    throw new Error('Test Component Error - This is intentional for testing');
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          🐛 Error Tests
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Error Tests
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={triggerJavaScriptError}
          className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
        >
          JS Error
        </button>
        
        <button
          onClick={triggerApiError}
          className="w-full px-3 py-2 text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors"
        >
          API Error
        </button>
        
        <button
          onClick={triggerValidationError}
          className="w-full px-3 py-2 text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
        >
          Validation Error
        </button>
        
        <button
          onClick={triggerUnhandledError}
          className="w-full px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
        >
          Unhandled Error
        </button>
        
        <button
          onClick={triggerUnhandledPromiseRejection}
          className="w-full px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-colors"
        >
          Promise Rejection
        </button>
        
        <button
          onClick={triggerComponentError}
          className="w-full px-3 py-2 text-sm bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors"
        >
          Component Error
        </button>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Check PostHog dashboard for captured errors
        </p>
      </div>
    </div>
  );
};

export default ErrorTestComponent;
