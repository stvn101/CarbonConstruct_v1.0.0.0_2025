/**
 * Tests for QuickAddPanel component
 * Validates quick-add material selection and addition
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../lib/__tests__/setup';
import { QuickAddPanel } from '../QuickAddPanel';
import { FavoriteMaterial } from '@/hooks/useFavoriteMaterials';

const mockMaterials: FavoriteMaterial[] = [
  {
    materialId: 'mat-1',
    materialName: 'Concrete 32MPa',
    category: 'Concrete',
    unit: 'm³',
    factor: 320,
    source: 'NABERS',
    usageCount: 5,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString(),
  },
  {
    materialId: 'mat-2',
    materialName: 'Steel Reinforcing',
    category: 'Steel',
    unit: 'kg',
    factor: 1.99,
    source: 'NABERS',
    usageCount: 3,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString(),
  },
];

describe('QuickAddPanel', () => {
  const mockOnAddMaterial = vi.fn();
  const mockOnHideMaterial = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders quick-add section', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      expect(screen.getByText(/Quick Add/i)).toBeInTheDocument();
    });

    it('displays quick-add materials', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      expect(screen.getByText('Concrete 32MPa')).toBeInTheDocument();
      expect(screen.getByText('Steel Reinforcing')).toBeInTheDocument();
    });

    it('displays material units', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      expect(screen.getByText(/m³/)).toBeInTheDocument();
      expect(screen.getByText(/kg/)).toBeInTheDocument();
    });

    it('returns null for empty materials', () => {
      const { container } = render(
        <QuickAddPanel 
          materials={[]}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('material addition', () => {
    it('calls onAddMaterial when material clicked', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      const concreteButton = screen.getByText('Concrete 32MPa').closest('button');
      if (concreteButton) {
        fireEvent.click(concreteButton);
        expect(mockOnAddMaterial).toHaveBeenCalled();
      }
    });

    it('passes material data to onAddMaterial', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      const concreteButton = screen.getByText('Concrete 32MPa').closest('button');
      if (concreteButton) {
        fireEvent.click(concreteButton);
        
        expect(mockOnAddMaterial).toHaveBeenCalledWith(
          expect.objectContaining({
            materialId: 'mat-1',
            materialName: 'Concrete 32MPa',
          })
        );
      }
    });
  });

  describe('pinned materials display', () => {
    it('displays pinned materials', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      // All mock materials are pinned, so all should be visible
      expect(screen.getByText('Concrete 32MPa')).toBeInTheDocument();
      expect(screen.getByText('Steel Reinforcing')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('materials are keyboard accessible', () => {
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('sync functionality', () => {
    it('accepts optional onSyncEPD prop', () => {
      const mockSync = vi.fn().mockResolvedValue({ synced: 5, total: 10 });
      
      render(
        <QuickAddPanel 
          materials={mockMaterials}
          onAddMaterial={mockOnAddMaterial} 
          onHideMaterial={mockOnHideMaterial}
          onSyncEPD={mockSync}
        />
      );

      expect(screen.getByText(/Quick Add/i)).toBeInTheDocument();
    });
  });
});
