/**
 * Quantity Validation Utility
 * Provides warnings for unusually high material quantities
 * Based on typical construction project scales
 */

export interface QuantityWarning {
  level: 'info' | 'warning' | 'critical';
  message: string;
  suggestion?: string;
}

interface QuantityThreshold {
  warn: number;
  critical: number;
  typicalRange: string;
}

// Thresholds per unit type - based on typical single-project material quantities
const QUANTITY_THRESHOLDS: Record<string, QuantityThreshold> = {
  // Weight-based units
  'tonne': { warn: 100, critical: 500, typicalRange: '1-50 tonnes' },
  'tonnes': { warn: 100, critical: 500, typicalRange: '1-50 tonnes' },
  't': { warn: 100, critical: 500, typicalRange: '1-50 tonnes' },
  'kg': { warn: 50000, critical: 200000, typicalRange: '100-10,000 kg' },
  
  // Area-based units  
  'm²': { warn: 10000, critical: 50000, typicalRange: '100-5,000 m²' },
  'm2': { warn: 10000, critical: 50000, typicalRange: '100-5,000 m²' },
  'sqm': { warn: 10000, critical: 50000, typicalRange: '100-5,000 m²' },
  
  // Volume-based units
  'm³': { warn: 1000, critical: 5000, typicalRange: '10-500 m³' },
  'm3': { warn: 1000, critical: 5000, typicalRange: '10-500 m³' },
  'L': { warn: 50000, critical: 200000, typicalRange: '100-10,000 L' },
  'kL': { warn: 100, critical: 500, typicalRange: '1-50 kL' },
  
  // Linear units
  'm': { warn: 5000, critical: 20000, typicalRange: '10-1,000 m' },
  'lm': { warn: 5000, critical: 20000, typicalRange: '10-1,000 lm' },
  
  // Count-based units
  'unit': { warn: 1000, critical: 5000, typicalRange: '1-200 units' },
  'units': { warn: 1000, critical: 5000, typicalRange: '1-200 units' },
  'no.': { warn: 1000, critical: 5000, typicalRange: '1-200 items' },
  'each': { warn: 1000, critical: 5000, typicalRange: '1-200 items' },
};

// Category-specific overrides for materials with known high quantities
const CATEGORY_OVERRIDES: Record<string, Partial<Record<string, QuantityThreshold>>> = {
  'Concrete': {
    'm³': { warn: 2000, critical: 10000, typicalRange: '50-1,000 m³' },
    'm3': { warn: 2000, critical: 10000, typicalRange: '50-1,000 m³' },
  },
  'Steel': {
    'tonne': { warn: 50, critical: 200, typicalRange: '1-30 tonnes' },
    'tonnes': { warn: 50, critical: 200, typicalRange: '1-30 tonnes' },
    't': { warn: 50, critical: 200, typicalRange: '1-30 tonnes' },
    'kg': { warn: 20000, critical: 100000, typicalRange: '100-10,000 kg' },
  },
  'Timber': {
    'm³': { warn: 500, critical: 2000, typicalRange: '10-200 m³' },
    'm3': { warn: 500, critical: 2000, typicalRange: '10-200 m³' },
  },
  'Insulation': {
    'm²': { warn: 5000, critical: 20000, typicalRange: '100-2,000 m²' },
    'm2': { warn: 5000, critical: 20000, typicalRange: '100-2,000 m²' },
    'kg': { warn: 5000, critical: 20000, typicalRange: '50-2,000 kg' },
  },
  'Plasterboard': {
    'm²': { warn: 5000, critical: 20000, typicalRange: '100-2,000 m²' },
    'm2': { warn: 5000, critical: 20000, typicalRange: '100-2,000 m²' },
  },
};

/**
 * Validate material quantity and return warning if unusually high
 */
export function validateQuantity(
  quantity: number,
  unit: string,
  category?: string
): QuantityWarning | null {
  if (!quantity || quantity <= 0) return null;
  
  const normalizedUnit = unit?.toLowerCase().trim() || '';
  const normalizedCategory = category?.trim() || '';
  
  // Get thresholds - check category override first, then fall back to general
  let threshold: QuantityThreshold | undefined;
  
  if (normalizedCategory && CATEGORY_OVERRIDES[normalizedCategory]) {
    threshold = CATEGORY_OVERRIDES[normalizedCategory][unit] || 
                CATEGORY_OVERRIDES[normalizedCategory][normalizedUnit];
  }
  
  if (!threshold) {
    threshold = QUANTITY_THRESHOLDS[unit] || QUANTITY_THRESHOLDS[normalizedUnit];
  }
  
  if (!threshold) return null;
  
  // Check against thresholds
  if (quantity >= threshold.critical) {
    return {
      level: 'critical',
      message: `Unusually high quantity: ${quantity.toLocaleString()} ${unit}`,
      suggestion: `Typical range for this material: ${threshold.typicalRange}. Please verify this is correct.`
    };
  }
  
  if (quantity >= threshold.warn) {
    return {
      level: 'warning',
      message: `High quantity: ${quantity.toLocaleString()} ${unit}`,
      suggestion: `Typical range: ${threshold.typicalRange}. Double-check the value.`
    };
  }
  
  return null;
}

/**
 * Get the warning color class based on level
 */
export function getWarningColorClass(level: QuantityWarning['level']): string {
  switch (level) {
    case 'critical':
      return 'text-destructive border-destructive bg-destructive/10';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/30';
    case 'info':
      return 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-50 dark:bg-blue-950/30';
    default:
      return '';
  }
}

/**
 * Get the warning icon color class
 */
export function getWarningIconClass(level: QuantityWarning['level']): string {
  switch (level) {
    case 'critical':
      return 'text-destructive';
    case 'warning':
      return 'text-amber-500';
    case 'info':
      return 'text-blue-500';
    default:
      return '';
  }
}
