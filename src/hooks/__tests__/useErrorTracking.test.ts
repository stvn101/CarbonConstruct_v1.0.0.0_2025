/**
 * Tests for useErrorTracking hook
 * 
 * Priority 5 - Monitoring
 * Tests error tracking, batching, and edge function integration
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

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-agent',
    language: 'en-US',
    platform: 'test-platform',
    connection: { effectiveType: '4g' },
    sendBeacon: vi.fn(),
  },
  writable: true,
});

import { useErrorTracking, initializeErrorTracking, trackErrorGlobal } from '../useErrorTracking';

describe('useErrorTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockInvoke.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('hook initialization', () => {
    it('should return trackError function', () => {
      const { result } = renderHook(() => useErrorTracking());

      expect(typeof result.current.trackError).toBe('function');
    });
  });

  describe('trackError', () => {
    it('should queue errors for batch sending', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError({
          error_type: 'test_error',
          error_message: 'Test error message',
        });
      });

      // Should not send immediately for non-critical
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should send critical errors immediately', async () => {
      const { result } = renderHook(() => useErrorTracking());

      await act(async () => {
        result.current.trackError({
          error_type: 'critical_error',
          error_message: 'Critical error occurred',
          severity: 'critical',
        });
        await vi.runAllTimersAsync();
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-error', expect.objectContaining({
        body: expect.objectContaining({
          error_type: 'critical_error',
          severity: 'critical',
        }),
      }));
    });

    it('should include stack trace when provided', async () => {
      const { result } = renderHook(() => useErrorTracking());

      await act(async () => {
        result.current.trackError({
          error_type: 'error_with_stack',
          error_message: 'Error with stack',
          stack_trace: 'Error at line 42',
          severity: 'critical',
        });
        await vi.runAllTimersAsync();
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-error', expect.objectContaining({
        body: expect.objectContaining({
          stack_trace: 'Error at line 42',
        }),
      }));
    });

    it('should include metadata when provided', async () => {
      const { result } = renderHook(() => useErrorTracking());

      await act(async () => {
        result.current.trackError({
          error_type: 'error_with_metadata',
          error_message: 'Error with metadata',
          severity: 'critical',
          metadata: { component: 'Calculator', action: 'submit' },
        });
        await vi.runAllTimersAsync();
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-error', expect.objectContaining({
        body: expect.objectContaining({
          metadata: { component: 'Calculator', action: 'submit' },
        }),
      }));
    });
  });

  describe('batch flushing', () => {
    it('should flush after timeout', async () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError({
          error_type: 'batch_error_1',
          error_message: 'Batch error 1',
        });
      });

      expect(mockInvoke).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe('severity levels', () => {
    it('should accept info severity', async () => {
      const { result } = renderHook(() => useErrorTracking());

      await act(async () => {
        result.current.trackError({
          error_type: 'info_event',
          error_message: 'Info message',
          severity: 'info',
        });
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-error', expect.objectContaining({
        body: expect.objectContaining({
          severity: 'info',
        }),
      }));
    });

    it('should accept warning severity', async () => {
      const { result } = renderHook(() => useErrorTracking());

      await act(async () => {
        result.current.trackError({
          error_type: 'warning_event',
          error_message: 'Warning message',
          severity: 'warning',
        });
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(mockInvoke).toHaveBeenCalledWith('log-error', expect.objectContaining({
        body: expect.objectContaining({
          severity: 'warning',
        }),
      }));
    });
  });
});

describe('Global error tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ data: null, error: null });
  });

  describe('initializeErrorTracking', () => {
    it('should initialize global error tracking', () => {
      expect(() => initializeErrorTracking()).not.toThrow();
    });
  });

  describe('trackErrorGlobal', () => {
    it('should be callable after initialization', async () => {
      initializeErrorTracking();

      await act(async () => {
        trackErrorGlobal({
          error_type: 'global_error',
          error_message: 'Global error message',
        });
      });

      expect(mockInvoke).toHaveBeenCalled();
    });
  });
});
