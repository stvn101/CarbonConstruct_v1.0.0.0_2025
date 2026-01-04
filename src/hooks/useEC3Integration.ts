/**
 * EC3 Integration Hook
 * 
 * Manages EC3 integration state, including API key availability
 * and search functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Make a minimal test call to check if API key is configured
      // The edge function will return a specific error if key is missing
      const { data, error: fnError } = await supabase.functions.invoke('search-ec3-materials', {
        body: { 
          query: '__ping__', // Test query
          page_size: 1 
        }
      });

      if (fnError) {
        // Network or function error
        console.error('[EC3] Availability check failed:', fnError);
        setIsAvailable(false);
        setError('EC3 service unavailable');
        return false;
      }

      if (data?.error) {
        // Check for API key not configured error
        if (data.error.includes('not configured') || data.status_code === 500) {
          setIsAvailable(false);
          setError('EC3 API key not configured');
          return false;
        }
        // Rate limit or other API error means key IS configured
        if (data.status_code === 429) {
          setIsAvailable(true);
          setError(null);
          return true;
        }
      }

      // Any successful response (even empty results) means EC3 is available
      setIsAvailable(true);
      setError(null);
      return true;

    } catch (err) {
      console.error('[EC3] Availability check error:', err);
      setIsAvailable(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check availability on mount (after short delay to not block initial render)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 2000); // Delay check to prioritize UI

    return () => clearTimeout(timer);
  }, [checkAvailability]);

  return {
    isAvailable,
    isLoading,
    error,
    checkAvailability,
  };
}

// Re-export the converted material type for convenience
export type { EC3ConvertedMaterial };
