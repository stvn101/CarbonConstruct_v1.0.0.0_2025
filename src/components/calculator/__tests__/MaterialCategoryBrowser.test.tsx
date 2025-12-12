/**
 * Tests for MaterialCategoryBrowser component
 * Validates category navigation, selection, and filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../lib/__tests__/setup';
import { MaterialCategoryBrowser } from '../MaterialCategoryBrowser';

const mockCategories = [
  { category: 'Concrete', count: 150 },
  { category: 'Steel', count: 120 },
  { category: 'Timber', count: 80 },
  { category: 'Insulation', count: 45 },
  { category: 'Glass', count: 30 },
];

describe('MaterialCategoryBrowser', () => {
  const mockOnSelectCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all categories', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      expect(screen.getByText('Concrete')).toBeInTheDocument();
      expect(screen.getByText('Steel')).toBeInTheDocument();
      expect(screen.getByText('Timber')).toBeInTheDocument();
      expect(screen.getByText('Insulation')).toBeInTheDocument();
      expect(screen.getByText('Glass')).toBeInTheDocument();
    });

    it('displays category counts', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      expect(screen.getByText('(150)')).toBeInTheDocument();
      expect(screen.getByText('(120)')).toBeInTheDocument();
      expect(screen.getByText('(80)')).toBeInTheDocument();
    });

    it('displays total materials and category count', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      expect(screen.getByText(/5 categories/)).toBeInTheDocument();
      expect(screen.getByText(/425 materials/)).toBeInTheDocument();
    });

    it('renders browse label', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={100}
        />
      );

      expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    });
  });

  describe('category selection', () => {
    it('calls onSelectCategory when category clicked', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      fireEvent.click(screen.getByText('Steel'));
      expect(mockOnSelectCategory).toHaveBeenCalledWith('Steel');
    });

    it('deselects category when same category clicked again', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory="Steel"
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      fireEvent.click(screen.getByText('Steel'));
      expect(mockOnSelectCategory).toHaveBeenCalledWith(null);
    });

    it('shows clear button when category is selected', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory="Concrete"
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('does not show clear button when no category selected', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('clears selection when clear button clicked', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory="Timber"
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      fireEvent.click(screen.getByText('Clear'));
      expect(mockOnSelectCategory).toHaveBeenCalledWith(null);
    });
  });

  describe('visual states', () => {
    it('applies selected styling to selected category', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory="Steel"
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      const steelButton = screen.getByRole('button', { name: /Steel/ });
      expect(steelButton.className).toContain('bg-primary');
    });

    it('applies default styling to unselected categories', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory="Steel"
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      const concreteButton = screen.getByRole('button', { name: /Concrete/ });
      expect(concreteButton.className).not.toContain('bg-primary');
    });
  });

  describe('category icons', () => {
    it('renders appropriate icons for known categories', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      // Icons are rendered as SVG elements within buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have an SVG icon
        const svg = button.querySelector('svg');
        if (button.textContent !== 'Clear') {
          expect(svg).toBeInTheDocument();
        }
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty categories array', () => {
      render(
        <MaterialCategoryBrowser
          categories={[]}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={0}
        />
      );

      expect(screen.getByText(/0 categories/)).toBeInTheDocument();
      expect(screen.getByText(/0 materials/)).toBeInTheDocument();
    });

    it('handles unknown category names with fallback icon', () => {
      render(
        <MaterialCategoryBrowser
          categories={[{ category: 'CustomMaterial', count: 10 }]}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={10}
        />
      );

      expect(screen.getByText('CustomMaterial')).toBeInTheDocument();
      // Should render with Package fallback icon
      const button = screen.getByRole('button', { name: /CustomMaterial/ });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('handles large category counts', () => {
      render(
        <MaterialCategoryBrowser
          categories={[{ category: 'Concrete', count: 10000 }]}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={10000}
        />
      );

      expect(screen.getByText('(10000)')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('all category buttons are accessible', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockCategories.length);
    });

    it('buttons are keyboard focusable', () => {
      render(
        <MaterialCategoryBrowser
          categories={mockCategories}
          selectedCategory={null}
          onSelectCategory={mockOnSelectCategory}
          totalMaterials={425}
        />
      );

      const button = screen.getByRole('button', { name: /Concrete/ });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });
});
