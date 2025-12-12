/**
 * Tests for ProjectContext
 *
 * Tests project management state and operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@/lib/__tests__/setup';
import { ProjectProvider, useProject } from '../ProjectContext';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              id: 'project-1',
              name: 'Test Project 1',
              description: 'Test Description',
              location: 'Sydney',
              project_type: 'residential',
              status: 'active',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z'
            }
          ],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'new-project',
              name: 'New Project',
              project_type: 'commercial',
              status: 'planning',
              created_at: '2025-01-02T00:00:00Z',
              updated_at: '2025-01-02T00:00:00Z'
            },
            error: null
          }))
        }))
      }))
    }))
  }
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-123',
      email: 'test@example.com'
    },
    session: null,
    loading: false
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('ProjectContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ProjectProvider>{children}</ProjectProvider>
  );

  describe('Initialization', () => {
    it('should provide default values', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.projects).toBeDefined();
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load projects on mount', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects.length).toBeGreaterThan(0);
      });
    });

    it('should auto-select first project if none selected', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentProject).toBeTruthy();
        expect(result.current.currentProject?.id).toBe('project-1');
      });
    });
  });

  describe('Project Selection', () => {
    it('should select a project by ID', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.selectProject('project-1');
      });

      expect(result.current.currentProject?.id).toBe('project-1');
    });

    it('should not change selection if project ID not found', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentProject).toBeTruthy();
      });

      const previousProject = result.current.currentProject;

      act(() => {
        result.current.selectProject('non-existent-id');
      });

      expect(result.current.currentProject).toBe(previousProject);
    });
  });

  describe('Project Creation', () => {
    it('should create a new project successfully', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      let success = false;

      await act(async () => {
        success = await result.current.createProject({
          name: 'New Project',
          description: 'A new test project',
          location: 'Melbourne',
          project_type: 'commercial',
          status: 'planning'
        });
      });

      expect(success).toBe(true);
    });

    it('should validate project name is required', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      let success = false;

      await act(async () => {
        success = await result.current.createProject({
          name: '', // Empty name should fail validation
          project_type: 'commercial',
          status: 'planning'
        });
      });

      expect(success).toBe(false);
    });

    it('should validate project name length', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      let success = false;

      await act(async () => {
        success = await result.current.createProject({
          name: 'a'.repeat(101), // More than 100 characters
          project_type: 'commercial',
          status: 'planning'
        });
      });

      expect(success).toBe(false);
    });

    it('should respect usage limits when provided', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      const checkLimits = () => ({
        allowed: false,
        reason: 'You have reached your project limit'
      });

      let success = false;

      await act(async () => {
        success = await result.current.createProject({
          name: 'New Project',
          project_type: 'commercial',
          status: 'planning'
        }, checkLimits);
      });

      expect(success).toBe(false);
    });

    it('should allow creation when limits check passes', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      const checkLimits = () => ({
        allowed: true
      });

      let success = false;

      await act(async () => {
        success = await result.current.createProject({
          name: 'New Project',
          project_type: 'commercial',
          status: 'planning'
        }, checkLimits);
      });

      expect(success).toBe(true);
    });
  });

  describe('Project Refresh', () => {
    it('should refresh projects list', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.refreshProjects();
      });

      expect(result.current.projects).toBeDefined();
    });

    it('should set loading state during refresh', async () => {
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const refreshPromise = act(async () => {
        await result.current.refreshProjects();
      });

      // Loading should be true during refresh
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await refreshPromise;

      // Loading should be false after refresh
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when creating project', async () => {
      // Mock will throw error
      const { result } = renderHook(() => useProject(), { wrapper });

      await waitFor(() => {
        expect(result.current.projects).toBeDefined();
      });

      // Creating with invalid data should not throw
      await expect(
        act(async () => {
          await result.current.createProject({
            name: 'Test',
            project_type: 'invalid-type' as any,
            status: 'active'
          });
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Context Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useProject());
      }).toThrow('useProject must be used within a ProjectProvider');
    });
  });
});
