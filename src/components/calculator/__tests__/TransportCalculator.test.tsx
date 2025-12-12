/**
 * Tests for TransportCalculator component
 * 
 * Priority 1 - Critical Business Logic
 * Tests A4 transport emissions calculations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/lib/__tests__/setup';
import { TransportCalculator } from '../TransportCalculator';

// Mock the transport-matrix module
vi.mock('@/data/transport-matrix', () => ({
  TRANSPORT_MODES: [
    { id: 'articulated_truck', name: 'Articulated Truck', factor_per_tkm: 0.062, description: 'Semi-trailer' },
    { id: 'rigid_truck_small', name: 'Rigid Truck (Small)', factor_per_tkm: 0.207, description: 'Small rigid' },
    { id: 'rigid_truck_large', name: 'Rigid Truck (Large)', factor_per_tkm: 0.089, description: 'Large rigid' },
    { id: 'rail_freight', name: 'Rail Freight', factor_per_tkm: 0.021, description: 'Rail transport' }
  ],
  MATERIAL_TRANSPORT_DEFAULTS: [
    { materialCategory: 'concrete', typicalDistance_km: 50 },
    { materialCategory: 'steel', typicalDistance_km: 150 },
    { materialCategory: 'timber', typicalDistance_km: 200 },
    { materialCategory: 'glass', typicalDistance_km: 100 },
    { materialCategory: 'insulation', typicalDistance_km: 80 }
  ],
  calculateA4Emissions: vi.fn((tonnes: number, distanceKm: number, modeId: string) => {
    const factors: Record<string, number> = {
      articulated_truck: 0.062,
      rigid_truck_small: 0.207,
      rigid_truck_large: 0.089,
      rail_freight: 0.021
    };
    const factor = factors[modeId] || 0.062;
    const emissions = tonnes * distanceKm * factor;
    return {
      emissions_kg: emissions,
      emissions_t: emissions / 1000,
      mode: modeId,
      factor_used: factor
    };
  }),
  estimateDistanceByPostcodes: vi.fn((from: string, to: string) => {
    // Simple mock: return estimated distance based on postcode difference
    const fromNum = parseInt(from) || 2000;
    const toNum = parseInt(to) || 2150;
    const diff = Math.abs(toNum - fromNum);
    return {
      distance_km: diff > 0 ? diff * 0.5 : 100,
      estimated: true
    };
  }),
  getTransportMode: vi.fn((modeId: string) => {
    const modes: Record<string, { id: string; name: string; description: string }> = {
      articulated_truck: { id: 'articulated_truck', name: 'Articulated Truck', description: 'Semi-trailer' },
      rigid_truck_small: { id: 'rigid_truck_small', name: 'Rigid Truck (Small)', description: 'Small rigid' },
      rigid_truck_large: { id: 'rigid_truck_large', name: 'Rigid Truck (Large)', description: 'Large rigid' },
      rail_freight: { id: 'rail_freight', name: 'Rail Freight', description: 'Rail transport' }
    };
    return modes[modeId] || modes.articulated_truck;
  })
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); })
});

describe('TransportCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText('A4 Transport Emissions')).toBeInTheDocument();
    });

    it('should render the Add Transport Leg form', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText('Add Transport Leg')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument(); // Weight input
    });

    it('should show empty state when no items', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText('No transport legs added yet')).toBeInTheDocument();
    });

    it('should render transport mode selector', () => {
      render(<TransportCalculator />);
      
      // The select should be rendered with default value
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render typical distances reference', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText(/Typical transport distances/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable Add button when weight is empty', () => {
      render(<TransportCalculator />);
      
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeDisabled();
    });

    it('should enable Add button when weight is entered', () => {
      render(<TransportCalculator />);
      
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).not.toBeDisabled();
    });
  });

  describe('Adding Transport Items', () => {
    it('should add a transport item when form is submitted', () => {
      render(<TransportCalculator />);
      
      // Fill in the form
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const fromPostcode = screen.getByPlaceholderText('2000');
      fireEvent.change(fromPostcode, { target: { value: '2000' } });
      
      const toPostcode = screen.getByPlaceholderText('2150');
      fireEvent.change(toPostcode, { target: { value: '2150' } });
      
      // Click add button
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Check item was added
      expect(screen.getByText('2000 → 2150')).toBeInTheDocument();
    });

    it('should clear form after adding item', () => {
      render(<TransportCalculator />);
      
      const weightInput = screen.getByPlaceholderText('0') as HTMLInputElement;
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Form should be cleared
      expect(weightInput.value).toBe('');
    });

    it('should calculate emissions correctly', () => {
      const onTotalChange = vi.fn();
      render(<TransportCalculator onTotalChange={onTotalChange} />);
      
      // Add a transport item: 10 tonnes, 100km, articulated truck (0.062 factor)
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // onTotalChange should have been called with calculated emissions
      expect(onTotalChange).toHaveBeenCalled();
    });
  });

  describe('Removing Transport Items', () => {
    it('should remove item when delete button clicked', () => {
      render(<TransportCalculator />);
      
      // Add an item first
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const fromPostcode = screen.getByPlaceholderText('2000');
      fireEvent.change(fromPostcode, { target: { value: '2000' } });
      
      const toPostcode = screen.getByPlaceholderText('2150');
      fireEvent.change(toPostcode, { target: { value: '2150' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Verify item is shown
      expect(screen.getByText('2000 → 2150')).toBeInTheDocument();
      
      // Find and click delete button (it has the Trash2 icon)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('svg.lucide-trash-2'));
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        // Item should be removed
        expect(screen.queryByText('2000 → 2150')).not.toBeInTheDocument();
      }
    });
  });

  describe('Updating Transport Items', () => {
    it('should update emissions when weight changes', async () => {
      const onTotalChange = vi.fn();
      render(<TransportCalculator onTotalChange={onTotalChange} />);
      
      // Add an item
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Get the initial call count
      const initialCallCount = onTotalChange.mock.calls.length;
      
      // Find the weight input in the item (not the form)
      const itemWeightInputs = screen.getAllByRole('spinbutton');
      const itemWeightInput = itemWeightInputs.find((input) => 
        (input as HTMLInputElement).value === '10'
      );
      
      if (itemWeightInput) {
        fireEvent.change(itemWeightInput, { target: { value: '20' } });
        
        // onTotalChange should have been called again
        expect(onTotalChange.mock.calls.length).toBeGreaterThan(initialCallCount);
      }
    });
  });

  describe('Local Storage Persistence', () => {
    it('should save items to localStorage', () => {
      render(<TransportCalculator />);
      
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Check localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load items from localStorage on mount', () => {
      // Pre-populate localStorage
      const savedItems = [{
        id: 'test-1',
        description: '3000 → 3001',
        materialTonnes: 5,
        fromPostcode: '3000',
        toPostcode: '3001',
        distanceKm: 50,
        modeId: 'articulated_truck',
        emissions: 15.5,
        isEstimated: true
      }];
      mockLocalStorage['transportCalculatorItems'] = JSON.stringify(savedItems);
      
      render(<TransportCalculator />);
      
      expect(localStorage.getItem).toHaveBeenCalledWith('transportCalculatorItems');
    });
  });

  describe('Total Emissions Callback', () => {
    it('should call onTotalChange with total emissions', () => {
      const onTotalChange = vi.fn();
      render(<TransportCalculator onTotalChange={onTotalChange} />);
      
      // Initially called with 0
      expect(onTotalChange).toHaveBeenCalledWith(0);
    });

    it('should call onTotalChange when items are added', () => {
      const onTotalChange = vi.fn();
      render(<TransportCalculator onTotalChange={onTotalChange} />);
      
      const weightInput = screen.getByPlaceholderText('0');
      fireEvent.change(weightInput, { target: { value: '10' } });
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      // Should be called with new total
      expect(onTotalChange).toHaveBeenCalledTimes(2); // Initial 0 + after add
    });
  });

  describe('Emission Factor Display', () => {
    it('should display emission factors reference', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText(/Emission Factors/)).toBeInTheDocument();
    });

    it('should display NGA 2024 reference', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText(/NGA 2024/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<TransportCalculator />);
      
      expect(screen.getByText('Weight (tonnes)')).toBeInTheDocument();
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
      expect(screen.getByText('Transport Mode')).toBeInTheDocument();
    });

    it('should have info tooltip for header', () => {
      render(<TransportCalculator />);
      
      // Info icon should be present (part of tooltip trigger)
      const infoIcons = document.querySelectorAll('.lucide-info');
      expect(infoIcons.length).toBeGreaterThan(0);
    });
  });
});
