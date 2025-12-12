/**
 * Tests for useSubscription hook
 * 
 * Priority 4 - Subscription Management
 * Tests subscription tier fetching, user subscription status, and usage tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [
              {
                id: 'tier-1',
                name: 'Free',
                stripe_price_id: null,
                stripe_price_id_yearly: null,
                price_monthly: 0,
                price_annual: 0,
                features: ['Basic features'],
                limits: { projects: 3, reports_per_month: 5, lca_calculations: false },
                display_order: 1,
              },
              {
                id: 'tier-2',
                name: 'Pro',
                stripe_price_id: 'price_123',
                stripe_price_id_yearly: 'price_456',
                price_monthly: 29,
                price_annual: 290,
                features: ['All features', 'Priority support'],
                limits: { projects: -1, reports_per_month: -1, lca_calculations: true },
                display_order: 2,
              },
            ],
            error: null,
          })),
          maybeSingle: vi.fn(() => Promise.resolve({
            data: {
              id: 'sub-1',
              tier_id: 'tier-2',
              status: 'active',
              trial_end: null,
              current_period_end: '2025-12-31T00:00:00Z',
              cancel_at_period_end: false,
            },
            error: null,
          })),
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'tier-2',
              name: 'Pro',
              stripe_price_id: 'price_123',
              stripe_price_id_yearly: 'price_456',
              price_monthly: 29,
              price_annual: 290,
              features: ['All features'],
              limits: { projects: -1, reports_per_month: -1, lca_calculations: true },
              display_order: 2,
            },
            error: null,
          })),
          gte: vi.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(({ queryKey }) => {
    if (queryKey[0] === 'subscription-tiers') {
      return {
        data: [
          {
            id: 'tier-1',
            name: 'Free',
            limits: { projects: 3, reports_per_month: 5, lca_calculations: false },
            display_order: 1,
          },
          {
            id: 'tier-2',
            name: 'Pro',
            limits: { projects: -1, reports_per_month: -1, lca_calculations: true },
            display_order: 2,
          },
        ],
        isLoading: false,
      };
    }
    if (queryKey[0] === 'user-subscription') {
      return {
        data: {
          id: 'sub-1',
          tier_id: 'tier-2',
          status: 'active',
          trial_end: null,
          current_period_end: '2025-12-31T00:00:00Z',
          cancel_at_period_end: false,
          subscription_tiers: {
            id: 'tier-2',
            name: 'Pro',
            limits: { projects: -1, reports_per_month: -1, lca_calculations: true },
          },
        },
        isLoading: false,
      };
    }
    if (queryKey[0] === 'usage-metrics') {
      return {
        data: [],
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

import { useSubscription } from '../useSubscription';

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tier data', () => {
    it('should return available subscription tiers', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.tiers).toBeDefined();
      expect(result.current.tiers?.length).toBeGreaterThan(0);
    });

    it('should include Free tier', () => {
      const { result } = renderHook(() => useSubscription());

      const freeTier = result.current.tiers?.find(t => t.name === 'Free');
      expect(freeTier).toBeDefined();
    });

    it('should include Pro tier with correct limits', () => {
      const { result } = renderHook(() => useSubscription());

      const proTier = result.current.tiers?.find(t => t.name === 'Pro');
      expect(proTier).toBeDefined();
      expect(proTier?.limits.lca_calculations).toBe(true);
    });
  });

  describe('current tier', () => {
    it('should return current tier for subscribed user', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.currentTier).toBeDefined();
      expect(result.current.currentTier?.name).toBe('Pro');
    });

    it('should return user subscription details', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.userSubscription).toBeDefined();
      expect(result.current.userSubscription?.status).toBe('active');
    });
  });

  describe('trial status', () => {
    it('should correctly identify non-trial subscription', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.isOnTrial).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should allow unlimited actions for -1 limit', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.canPerformAction('projects')).toBe(true);
    });

    it('should check boolean limits correctly', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.canPerformAction('lca_calculations')).toBe(true);
    });
  });

  describe('loading state', () => {
    it('should return loading false when data is loaded', () => {
      const { result } = renderHook(() => useSubscription());

      expect(result.current.loading).toBe(false);
    });
  });

  describe('incrementUsage', () => {
    it('should provide incrementUsage function', () => {
      const { result } = renderHook(() => useSubscription());

      expect(typeof result.current.incrementUsage).toBe('function');
    });
  });
});
