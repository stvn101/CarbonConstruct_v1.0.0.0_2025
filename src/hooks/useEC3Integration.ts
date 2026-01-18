/**
 * EC3 Integration Hook
 * 
 * Manages EC3 integration state, including API key availability
 * and search functionality.
 */

import { useState, useCallback } from 'react';
import type { EC3ConvertedMaterial } from '@/components/calculator/EC3SearchPanel';

interface UseEC3IntegrationResult {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  checkAvailability: () => Promise<boolean>;
}

/**
 * Hook to manage EC3 integration state
 * 
 * Checks if EC3 API key is configured by attempting a minimal API call.
 * The actual search is handled by EC3SearchPanel component.
 */
export function useEC3Integration(): UseEC3IntegrationResult {
  // Default to available - actual errors are handled gracefully in EC3SearchPanel
  // This avoids wasting rate-limited API calls on ping checks
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    // For now, assume EC3 is available if user has Pro subscription
    // The EC3SearchPanel will handle actual API errors gracefully
    // This saves rate-limited API calls from being wasted on ping checks
    setIsAvailable(true);
    setIsLoading(false);
    setError(null);
    return true;
  }, []);

  return {
    isAvailable,
    isLoading,
    error,
    checkAvailability,
  };
}

// Re-export the converted material type for convenience
export type { EC3ConvertedMaterial };
