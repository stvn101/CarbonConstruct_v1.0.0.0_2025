/**
 * Tests for useUsageTracking hook
 * 
 * Priority 4 - Usage Tracking
 * Tests usage limits, action permissions, and usage tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({
              data: [
                { metric_type: 'projects', count: 2 },
                { metric_type: 'reports_per_month', count: 3 },
              ],
              error: null,
            })),
          })),
          head: vi.fn(() => Promise.resolve({
            count: 2,
            error: null,
          })),
          maybeSingle: vi.fn(() => Promise.resolve({
            data: null,
            error: null,
          })),
        })),
        count: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            count: 2,
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    currentTier: {
      name: 'Free',
      limits: {
        projects: 3,
        reports_per_month: 5,
        lca_calculations: false,
      },
    },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(({ queryKey }) => {
    if (queryKey[0] === 'current-usage') {
      return {
        data: {
          projects: 2,
          reports_per_month: 3,
          lca_calculations: 0,
        },
        isLoading: false,
      };
    }
    if (queryKey[0] === 'project-count') {
      return {
        data: 2,
        isLoading: false,
      };
    }
    return { data: null, isLoading: false };
  }),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

import { useUsageTracking } from '../useUsageTracking';

describe('useUsageTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('current usage', () => {
    it('should return current usage metrics', () => {
      const { result } = renderHook(() => useUsageTracking());

      expect(result.current.currentUsage).toBeDefined();
      expect(result.current.currentUsage?.projects).toBe(2);
      expect(result.current.currentUsage?.reports_per_month).toBe(3);
    });

    it('should return project count', () => {
      const { result } = renderHook(() => useUsageTracking());

      expect(result.current.projectCount).toBe(2);
    });
  });

  describe('canPerformAction', () => {
    it('should allow action when under limit', () => {
      const { result } = renderHook(() => useUsageTracking());

      const canCreate = result.current.canPerformAction('projects');
      expect(canCreate.allowed).toBe(true);
    });

    it('should deny boolean action when not enabled', () => {
      const { result } = renderHook(() => useUsageTracking());

      const canUse = result.current.canPerformAction('lca_calculations');
      expect(canUse.allowed).toBe(false);
      expect(canUse.reason).toContain('not available');
    });

    it('should provide reason when action denied', () => {
      const { result } = renderHook(() => useUsageTracking());

      const canUse = result.current.canPerformAction('lca_calculations');
      expect(canUse.reason).toBeDefined();
      expect(typeof canUse.reason).toBe('string');
    });
  });

  describe('trackUsage', () => {
    it('should provide trackUsage function', () => {
      const { result } = renderHook(() => useUsageTracking());

      expect(typeof result.current.trackUsage).toBe('function');
    });
  });

  describe('loading state', () => {
    it('should return isLoading state', () => {
      const { result } = renderHook(() => useUsageTracking());

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
