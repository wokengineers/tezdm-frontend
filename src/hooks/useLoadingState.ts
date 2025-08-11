import { useState, useCallback } from 'react';

/**
 * Generic loading state hook for managing API call loading states
 * @param initialState - Initial loading state
 * @returns Loading state management functions
 */
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);
  const [loadingItems, setLoadingItems] = useState<Set<string | number>>(new Set());

  /**
   * Set global loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  /**
   * Add item to loading set
   */
  const addLoadingItem = useCallback((itemId: string | number) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
  }, []);

  /**
   * Remove item from loading set
   */
  const removeLoadingItem = useCallback((itemId: string | number) => {
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  /**
   * Check if specific item is loading
   */
  const isItemLoading = useCallback((itemId: string | number) => {
    return loadingItems.has(itemId);
  }, [loadingItems]);

  /**
   * Clear all loading states
   */
  const clearLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingItems(new Set());
  }, []);

  /**
   * Execute async function with loading state
   */
  const executeWithLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    itemId?: string | number
  ): Promise<T | null> => {
    try {
      if (itemId) {
        addLoadingItem(itemId);
      } else {
        setLoading(true);
      }
      
      const result = await asyncFn();
      return result;
    } catch (error) {
      throw error;
    } finally {
      if (itemId) {
        removeLoadingItem(itemId);
      } else {
        setLoading(false);
      }
    }
  }, [addLoadingItem, removeLoadingItem, setLoading]);

  return {
    isLoading,
    loadingItems,
    setLoading,
    addLoadingItem,
    removeLoadingItem,
    isItemLoading,
    clearLoading,
    executeWithLoading,
  };
}; 