/**
 * Tests for useSubscriptionStatus hook
 * 
 * Priority 4 - Subscription Status Checking
 * Tests Stripe subscription status verification via edge function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/lib/__tests__/setup';

// Mock dependencies
const mockInvoke = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
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

import { useSubscriptionStatus } from '../useSubscriptionStatus';

describe('useSubscriptionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
        },
      },
    });
  });

  describe('initial state', () => {
    it('should have default unsubscribed state', () => {
      mockInvoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSubscriptionStatus());

      expect(result.current.subscribed).toBe(false);
      expect(result.current.tier_name).toBe('Free');
      expect(result.current.is_admin).toBe(false);
    });

    it('should start in loading state', () => {
      mockInvoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSubscriptionStatus());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('subscription check', () => {
    it('should update status when subscribed', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          tier_name: 'Pro',
          product_id: 'prod_123',
          price_id: 'price_123',
          subscription_end: '2025-12-31T00:00:00Z',
          trial_end: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscriptionStatus());

      await waitFor(() => {
        expect(result.current.subscribed).toBe(true);
        expect(result.current.tier_name).toBe('Pro');
      }, { timeout: 3000 });
    });

    it('should include authorization header with JWT token', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: null });

      renderHook(() => useSubscriptionStatus());

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('check-subscription', {
          headers: {
            Authorization: 'Bearer test-token',
          },
        });
      }, { timeout: 3000 });
    });
  });

  describe('refetch functionality', () => {
    it('should provide refetch function', () => {
      mockInvoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSubscriptionStatus());

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('subscription data fields', () => {
    it('should return product_id', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          tier_name: 'Pro',
          product_id: 'prod_123',
          price_id: 'price_123',
          subscription_end: '2025-12-31T00:00:00Z',
          trial_end: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscriptionStatus());

      await waitFor(() => {
        expect(result.current.product_id).toBe('prod_123');
      }, { timeout: 3000 });
    });

    it('should return subscription_end date', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          tier_name: 'Pro',
          product_id: 'prod_123',
          price_id: 'price_123',
          subscription_end: '2025-12-31T00:00:00Z',
          trial_end: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscriptionStatus());

      await waitFor(() => {
        expect(result.current.subscription_end).toBe('2025-12-31T00:00:00Z');
      }, { timeout: 3000 });
    });
  });
});
