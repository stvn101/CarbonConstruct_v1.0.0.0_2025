/**
 * Tests for ModuleDCalculator component
 * Validates recycling, reuse, and energy recovery credit calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../lib/__tests__/setup';
import { ModuleDCalculator } from '../ModuleDCalculator';

describe('ModuleDCalculator', () => {
  const mockOnTotalsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders calculator card', () => {
      render(<ModuleDCalculator />);

      expect(screen.getByRole('heading', { name: /Module D/i })).toBeInTheDocument();
    });

    it('displays recycling section', () => {
      render(<ModuleDCalculator />);

      expect(screen.getAllByText(/Recycling/i)[0]).toBeInTheDocument();
    });

    it('displays reuse section', () => {
      render(<ModuleDCalculator />);

      expect(screen.getAllByText(/Reuse/i)[0]).toBeInTheDocument();
    });

    it('displays energy recovery section', () => {
      render(<ModuleDCalculator />);

      expect(screen.getAllByText(/Energy Recovery/i)[0]).toBeInTheDocument();
    });
  });

  describe('emissions calculation', () => {
    it('calls onTotalsChange with calculated credits', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      expect(mockOnTotalsChange).toHaveBeenCalled();
      
      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('recycling_credits');
      expect(lastCall).toHaveProperty('reuse_credits');
      expect(lastCall).toHaveProperty('energy_recovery_credits');
      expect(lastCall).toHaveProperty('total');
    });

    it('returns ModuleDEmissions structure', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      
      expect(typeof lastCall.recycling_credits).toBe('number');
      expect(typeof lastCall.reuse_credits).toBe('number');
      expect(typeof lastCall.energy_recovery_credits).toBe('number');
      expect(typeof lastCall.total).toBe('number');
    });

    it('total equals sum of all credits', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      const expectedTotal = lastCall.recycling_credits + lastCall.reuse_credits + lastCall.energy_recovery_credits;
      expect(lastCall.total).toBeCloseTo(expectedTotal, 1);
    });
  });

  describe('credit values (negative = benefit)', () => {
    it('recycling credits are non-positive (negative or zero)', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      expect(lastCall.recycling_credits).toBeLessThanOrEqual(0);
    });

    it('reuse credits are non-positive', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      expect(lastCall.reuse_credits).toBeLessThanOrEqual(0);
    });

    it('energy recovery credits are non-positive', () => {
      render(<ModuleDCalculator onTotalsChange={mockOnTotalsChange} />);

      const lastCall = mockOnTotalsChange.mock.calls[mockOnTotalsChange.mock.calls.length - 1][0];
      expect(lastCall.energy_recovery_credits).toBeLessThanOrEqual(0);
    });
  });

  describe('localStorage persistence', () => {
    it('persists data to localStorage', () => {
      render(<ModuleDCalculator />);

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('material types', () => {
    it('includes steel in recycling materials', () => {
      render(<ModuleDCalculator />);

      expect(screen.getAllByText(/Steel/i)[0]).toBeInTheDocument();
    });

    it('includes aluminium in recycling materials', () => {
      render(<ModuleDCalculator />);

      expect(screen.getAllByText(/Aluminium/i)[0]).toBeInTheDocument();
    });

    it('includes timber in multiple sections', () => {
      render(<ModuleDCalculator />);

      const timberElements = screen.getAllByText(/Timber/i);
      expect(timberElements.length).toBeGreaterThan(0);
    });
  });
});
