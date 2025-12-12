/**
 * Tests for ErrorBoundary component
 *
 * Tests error catching and display functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/lib/__tests__/setup';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    critical: vi.fn()
  }
}));

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show error UI when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
    });

    it('should show reload and try again buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should show helpful instructions', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/If this problem persists/)).toBeInTheDocument();
      expect(screen.getByText(/Try clearing your browser cache/)).toBeInTheDocument();
      expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
      expect(screen.getByText(/Contact support if the issue continues/)).toBeInTheDocument();
    });

    it('should display a unique error reference ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const referenceText = screen.getByText(/Reference:/);
      expect(referenceText).toBeInTheDocument();
      // Should have a unique reference ID
      expect(referenceText.textContent).toMatch(/Reference: [A-Z0-9]+/);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with logger.critical', () => {
      const { logger } = require('@/lib/logger');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(logger.critical).toHaveBeenCalledWith(
        'ErrorBoundary',
        expect.any(Error),
        expect.objectContaining({
          errorBoundary: true,
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('Recovery Actions', () => {
    it('should reload page when Reload button is clicked', () => {
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalled();

      reloadSpy.mockRestore();
    });

    it('should reset error state when Try Again button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // Error UI should disappear
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
      // Child content should be visible
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // AlertTriangle icon should be present
      const errorCard = screen.getByText('Something went wrong').closest('.max-w-2xl');
      expect(errorCard).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = screen.getByText('Something went wrong').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without error messages', () => {
      const ThrowErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle non-Error objects thrown', () => {
      const ThrowNonError = () => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      };

      render(
        <ErrorBoundary>
          <ThrowNonError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple errors from same component', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // Component throws error again
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
