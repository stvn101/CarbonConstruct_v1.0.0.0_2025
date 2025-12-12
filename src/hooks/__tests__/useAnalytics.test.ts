/**
 * Tests for useAnalytics hook
 * 
 * Priority 5 - Monitoring/Analytics
 * Tests analytics event tracking and page view logging
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/test',
    search: '',
  }),
}));

// Mock gtag
const mockGtag = vi.fn();
(global as any).gtag = mockGtag;

import { useAnalytics } from '../useAnalytics';

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockInvoke.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('hook initialization', () => {
    it('should return trackEvent function', () => {
      const { result } = renderHook(() => useAnalytics());

      expect(typeof result.current.trackEvent).toBe('function');
    });
  });

  describe('trackEvent', () => {
    it('should call log-analytics edge function', async () => {
      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        result.current.trackEvent('button_click', { button: 'submit' });
      });

      // Events are batched, so we need to wait for flush
      await act(async () => {
        vi.advanceTimersByTime(10000); // EVENTS_FLUSH_INTERVAL
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-analytics', expect.objectContaining({
        body: expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              event_name: 'button_click',
            }),
          ]),
        }),
      }));
    });

    it('should include event data', async () => {
      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        result.current.trackEvent('test_event', { key: 'value' });
      });

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-analytics', expect.objectContaining({
        body: expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              event_data: { key: 'value' },
            }),
          ]),
        }),
      }));
    });

    it('should track page view events', async () => {
      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        result.current.trackEvent('page_view', { path: '/calculator' });
      });

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockInvoke).toHaveBeenCalled();
    });
  });
});
