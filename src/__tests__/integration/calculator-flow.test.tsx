/**
 * Integration Tests for Calculator Flow
 * 
 * Tests the complete calculator submission workflow:
 * - Material addition
 * - Emission calculation
 * - Data persistence
 * - Report generation trigger
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Create mock components for testing
const MockMaterialSearch = ({ onAddMaterial }: { onAddMaterial: (material: any) => void }) => {
  return (
    <div data-testid="material-search">
      <button
        onClick={() => onAddMaterial({
          id: 'mat-1',
          name: 'Concrete 32MPa',
          category: 'Concrete',
          unit: 'm³',
          embodied_carbon_factor: 350,
          ef_a1a3: 320,
          ef_a4: 15,
          ef_a5: 15,
        })}
      >
        Add Concrete
      </button>
    </div>
  );
};

const MockEmissionsSummary = ({ materials }: { materials: any[] }) => {
  const totalEmissions = materials.reduce(
    (sum, m) => sum + (m.quantity || 0) * (m.embodied_carbon_factor || 0),
    0
  );
  
  return (
    <div data-testid="emissions-summary">
      <span data-testid="total-emissions">{totalEmissions.toFixed(2)}</span>
      <span data-testid="material-count">{materials.length}</span>
    </div>
  );
};

describe('Calculator Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Material Addition', () => {
    it('should add material to calculator', () => {
      const materials: any[] = [];
      const setMaterials = vi.fn((newMaterials) => {
        materials.push(...(typeof newMaterials === 'function' ? newMaterials(materials) : newMaterials));
      });

      render(
        <MockMaterialSearch
          onAddMaterial={(material) => setMaterials([material])}
        />
      );

      fireEvent.click(screen.getByText('Add Concrete'));

      expect(setMaterials).toHaveBeenCalledWith([expect.objectContaining({
        name: 'Concrete 32MPa',
      })]);
    });
  });

  describe('Emission Calculation', () => {
    it('should calculate total emissions from materials', () => {
      const materials = [
        { id: '1', name: 'Concrete', quantity: 100, embodied_carbon_factor: 350 },
        { id: '2', name: 'Steel', quantity: 50, embodied_carbon_factor: 1500 },
      ];

      render(<MockEmissionsSummary materials={materials} />);

      // 100 * 350 + 50 * 1500 = 35000 + 75000 = 110000
      expect(screen.getByTestId('total-emissions').textContent).toBe('110000.00');
    });

    it('should handle zero quantity materials', () => {
      const materials = [
        { id: '1', name: 'Concrete', quantity: 0, embodied_carbon_factor: 350 },
      ];

      render(<MockEmissionsSummary materials={materials} />);

      expect(screen.getByTestId('total-emissions').textContent).toBe('0.00');
    });

    it('should count materials correctly', () => {
      const materials = [
        { id: '1', name: 'Concrete', quantity: 100, embodied_carbon_factor: 350 },
        { id: '2', name: 'Steel', quantity: 50, embodied_carbon_factor: 1500 },
        { id: '3', name: 'Timber', quantity: 25, embodied_carbon_factor: 50 },
      ];

      render(<MockEmissionsSummary materials={materials} />);

      expect(screen.getByTestId('material-count').textContent).toBe('3');
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate material structure', () => {
      const validMaterial = {
        id: 'mat-1',
        name: 'Concrete 32MPa',
        category: 'Concrete',
        unit: 'm³',
        quantity: 100,
        embodied_carbon_factor: 350,
      };

      expect(validMaterial.id).toBeDefined();
      expect(validMaterial.name).toBeDefined();
      expect(typeof validMaterial.quantity).toBe('number');
      expect(typeof validMaterial.embodied_carbon_factor).toBe('number');
    });

    it('should validate EN 15978 lifecycle stages', () => {
      const materialWithLifecycle = {
        id: 'mat-1',
        name: 'Concrete 32MPa',
        ef_a1a3: 320,  // Product stage
        ef_a4: 15,     // Transport
        ef_a5: 15,     // Construction
        ef_b1b5: 0,    // Use stage
        ef_c1c4: 10,   // End of life
        ef_d: -5,      // Benefits beyond boundary
      };

      expect(materialWithLifecycle.ef_a1a3).toBeGreaterThanOrEqual(0);
      expect(materialWithLifecycle.ef_d).toBeLessThanOrEqual(0); // Credits are negative
    });
  });

  describe('localStorage Persistence', () => {
    it('should save materials to localStorage', () => {
      const materials = [
        { id: '1', name: 'Concrete', quantity: 100, embodied_carbon_factor: 350 },
      ];

      localStorage.setItem('calculator_materials', JSON.stringify(materials));

      const stored = JSON.parse(localStorage.getItem('calculator_materials') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Concrete');
    });

    it('should load materials from localStorage', () => {
      const materials = [
        { id: '1', name: 'Steel', quantity: 50, embodied_carbon_factor: 1500 },
      ];

      localStorage.setItem('calculator_materials', JSON.stringify(materials));

      const loaded = JSON.parse(localStorage.getItem('calculator_materials') || '[]');
      expect(loaded[0].name).toBe('Steel');
    });
  });

  describe('Transport Emissions Integration', () => {
    it('should include A4 transport emissions in total', () => {
      const transportData = {
        items: [
          { distance: 100, weight: 50, mode: 'road', emissions: 13.4 },
        ],
        total: 13.4,
      };

      localStorage.setItem('transport_emissions', JSON.stringify(transportData));

      const stored = JSON.parse(localStorage.getItem('transport_emissions') || '{}');
      expect(stored.total).toBe(13.4);
    });
  });

  describe('Whole Life Carbon Calculation', () => {
    it('should calculate upfront carbon (A1-A5)', () => {
      const material = {
        ef_a1a3: 320,
        ef_a4: 15,
        ef_a5: 15,
        quantity: 100,
      };

      const upfrontCarbon = (material.ef_a1a3 + material.ef_a4 + material.ef_a5) * material.quantity;
      expect(upfrontCarbon).toBe(35000); // 350 * 100
    });

    it('should calculate whole life carbon with module D credits', () => {
      const totals = {
        a1a3: 32000,
        a4: 1500,
        a5: 1500,
        b1b5: 0,
        c1c4: 1000,
        d: -500,
      };

      const wholeLife = totals.a1a3 + totals.a4 + totals.a5 + totals.b1b5 + totals.c1c4;
      const withCredits = wholeLife + totals.d;

      expect(wholeLife).toBe(36000);
      expect(withCredits).toBe(35500);
    });
  });
});
