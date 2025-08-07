import { useState, useCallback, useRef } from 'react';
import { useLoadingState } from './useLoadingState';

interface UseApiHandlerOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Generic API handler hook for consistent API call patterns
 */
export const useApiHandler = <T = any>(options: UseApiHandlerOptions<T> = {}) => {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  // Use refs to store callbacks to prevent infinite re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const errorMessageRef = useRef(errorMessage);
  
  // Update refs when options change
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  errorMessageRef.current = errorMessage;
  
  const {
    isLoading,
    loadingItems,
    isItemLoading,
    executeWithLoading,
    clearLoading
  } = useLoadingState();

  /**
   * Execute API call with loading state and error handling
   */
  const execute = useCallback(async <R = T>(
    apiCall: () => Promise<R>,
    itemId?: string | number
  ): Promise<R | null> => {
    try {
      setError(null);
      const result = await executeWithLoading(apiCall, itemId);
      
      if (result) {
        setData(result as T);
        onSuccessRef.current?.(result as T);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      const message = errorMessageRef.current || error.message;
      
      setError(message);
      onErrorRef.current?.(error);
      
      return null;
    }
  }, [executeWithLoading]);

  /**
   * Execute API call for specific item
   */
  const executeForItem = useCallback(async <R = T>(
    itemId: string | number,
    apiCall: () => Promise<R>
  ): Promise<R | null> => {
    return execute(apiCall, itemId);
  }, [execute]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setError(null);
    setData(null);
    clearLoading();
  }, [clearLoading]);

  return {
    // Data
    data,
    error,
    
    // Loading states
    isLoading,
    loadingItems,
    isItemLoading,
    
    // Actions
    execute,
    executeForItem,
    clearError,
    reset,
    
    // Utilities
    hasError: !!error,
    hasData: !!data,
  };
}; 