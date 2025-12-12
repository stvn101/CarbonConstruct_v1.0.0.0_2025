/**
 * Tests for AuthContext
 * 
 * Priority 1 - Critical Business Logic
 * Tests authentication state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@/lib/__tests__/setup';
import type { ReactNode } from 'react';

// Create mock functions we can track
const mockSignOut = vi.fn(() => Promise.resolve());
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

// Mock supabase before importing AuthContext
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        mockOnAuthStateChange(callback);
        // Simulate subscription
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn()
            }
          }
        };
      }
    }
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

// Import after mocking
import { AuthProvider, useAuth } from '../AuthContext';

describe('AuthContext', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    created_at: '2025-01-01T00:00:00Z'
  };

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    user: mockUser,
    expires_at: Date.now() + 3600000
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initialization', () => {
    it('should initialize with loading=true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Initially loading while checking session
      expect(result.current.loading).toBe(true);
    });

    it('should set loading=false after session check', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should have null user when not authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should have user when session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('Auth State Changes', () => {
    it('should subscribe to auth state changes on mount', () => {
      renderHook(() => useAuth(), { wrapper });
      
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it('should update user when auth state changes', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      let authCallback: (event: string, session: unknown) => void = () => {};
      mockOnAuthStateChange.mockImplementation((cb) => {
        authCallback = cb;
        return {
          data: {
            subscription: { unsubscribe: vi.fn() }
          }
        };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate sign in
      act(() => {
        authCallback('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should clear user when signed out', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      let authCallback: (event: string, session: unknown) => void = () => {};
      mockOnAuthStateChange.mockImplementation((cb) => {
        authCallback = cb;
        return {
          data: {
            subscription: { unsubscribe: vi.fn() }
          }
        };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate sign out
      act(() => {
        authCallback('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Sign Out', () => {
    it('should expose signOut function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signOut).toBeInstanceOf(Function);
    });

    it('should call supabase signOut when signOut is called', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle session fetch errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not throw, user should be null
      expect(result.current.user).toBeNull();
    });
  });

  describe('Context Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });
  });

  describe('Session Persistence', () => {
    it('should check for existing session on mount', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });
  });
});
