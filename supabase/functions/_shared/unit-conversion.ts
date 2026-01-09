/**
 * Unit Conversion Utilities for BOQ Processing
 * 
 * Handles conversion between common construction units,
 * particularly for linear metre to weight conversions for steel framing.
 */

// Steel framing weight per linear metre (kg/m) by gauge
export const STEEL_FRAMING_KG_PER_METRE: Record<string, number> = {
  'light-gauge': 2.0,     // C35, 0.55-0.75mm BMT (e.g., Rondo furring channel)
  'medium-gauge': 3.5,    // C50/C75, 0.95-1.15mm BMT (e.g., Rondo wall studs)
  'heavy-gauge': 5.0,     // C100+, 1.50mm+ BMT (structural studs)
  'default': 2.5,         // Conservative average for unknown steel framing
};

// Density values for common materials (kg/m³)
export const MATERIAL_DENSITIES: Record<string, number> = {
  'concrete': 2400,       // Normal weight concrete
  'lightweight-concrete': 1850,
  'steel': 7850,
  'timber-softwood': 500,
  'timber-hardwood': 800,
  'plasterboard': 640,
  'glass': 2500,
  'aluminium': 2700,
  'copper': 8940,
  'insulation-glasswool': 25,
  'insulation-rockwool': 100,
};

// Unit categories and their base units
export const UNIT_CATEGORIES: Record<string, { baseUnit: string; factor: number }[]> = {
  'length': [
    { baseUnit: 'm', factor: 1 },
    { baseUnit: 'mm', factor: 0.001 },
    { baseUnit: 'cm', factor: 0.01 },
    { baseUnit: 'km', factor: 1000 },
  ],
  'area': [
    { baseUnit: 'm²', factor: 1 },
    { baseUnit: 'mm²', factor: 0.000001 },
    { baseUnit: 'cm²', factor: 0.0001 },
  ],
  'volume': [
    { baseUnit: 'm³', factor: 1 },
    { baseUnit: 'L', factor: 0.001 },
    { baseUnit: 'mL', factor: 0.000001 },
  ],
  'mass': [
    { baseUnit: 'kg', factor: 1 },
    { baseUnit: 'g', factor: 0.001 },
    { baseUnit: 't', factor: 1000 },
    { baseUnit: 'Tonnes', factor: 1000 },
    { baseUnit: 'tonne', factor: 1000 },
  ],
};

/**
 * Detects if a unit conversion is needed between BOQ unit and database unit
 */
export function detectUnitMismatch(boqUnit: string, dbUnit: string): boolean {
  const normalizedBoq = normalizeUnit(boqUnit);
  const normalizedDb = normalizeUnit(dbUnit);
  return normalizedBoq !== normalizedDb;
}

/**
 * Normalize unit strings for comparison
 */
export function normalizeUnit(unit: string): string {
  const normalized = unit
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/metres?/gi, 'm')
    .replace(/meters?/gi, 'm')
    .replace(/kilograms?/gi, 'kg')
    .replace(/tonnes?/gi, 't')
    .replace(/litres?/gi, 'L')
    .replace(/liters?/gi, 'L')
    .replace(/square\s*m/gi, 'm2')
    .replace(/cubic\s*m/gi, 'm3')
    .replace(/sqm/gi, 'm2')
    .replace(/cum/gi, 'm3');
  
  return normalized;
}

/**
 * Convert linear metres to kg for steel framing
 */
export function linearMetresToKg(
  metres: number, 
  gauge: 'light-gauge' | 'medium-gauge' | 'heavy-gauge' | 'default' = 'default'
): { kg: number; conversionFactor: number } {
  const factor = STEEL_FRAMING_KG_PER_METRE[gauge];
  return {
    kg: metres * factor,
    conversionFactor: factor
  };
}

/**
 * Detect material type from name for unit conversion purposes
 */
export function detectMaterialType(materialName: string): string | null {
  const name = materialName.toLowerCase();
  
  if (name.includes('steel') || name.includes('rondo') || name.includes('stud') || name.includes('furring')) {
    return 'steel-framing';
  }
  if (name.includes('concrete')) return 'concrete';
  if (name.includes('timber') || name.includes('wood')) return 'timber';
  if (name.includes('plasterboard') || name.includes('gyprock')) return 'plasterboard';
  if (name.includes('insulation')) return 'insulation';
  if (name.includes('glass')) return 'glass';
  if (name.includes('aluminium') || name.includes('aluminum')) return 'aluminium';
  
  return null;
}

/**
 * Attempt automatic unit conversion for a material
 */
export function convertUnitsIfNeeded(
  quantity: number,
  boqUnit: string,
  dbUnit: string,
  materialName: string
): { 
  convertedQuantity: number; 
  targetUnit: string; 
  conversionApplied: boolean; 
  conversionNote: string | null 
} {
  const normalizedBoq = normalizeUnit(boqUnit);
  const normalizedDb = normalizeUnit(dbUnit);
  
  // No conversion needed
  if (normalizedBoq === normalizedDb) {
    return {
      convertedQuantity: quantity,
      targetUnit: dbUnit,
      conversionApplied: false,
      conversionNote: null
    };
  }
  
  const materialType = detectMaterialType(materialName);
  
  // Steel framing: linear metres to kg
  if (materialType === 'steel-framing' && normalizedBoq === 'm' && (normalizedDb === 'kg' || normalizedDb === 't')) {
    const { kg, conversionFactor } = linearMetresToKg(quantity, 'default');
    const finalQuantity = normalizedDb === 't' ? kg / 1000 : kg;
    
    return {
      convertedQuantity: finalQuantity,
      targetUnit: dbUnit,
      conversionApplied: true,
      conversionNote: `Converted from ${quantity} linear metres using ${conversionFactor} kg/m`
    };
  }
  
  // Mass conversions: kg to tonnes or vice versa
  if ((normalizedBoq === 'kg' && normalizedDb === 't') || (normalizedBoq === 'kg' && normalizedDb === 'tonnes')) {
    return {
      convertedQuantity: quantity / 1000,
      targetUnit: dbUnit,
      conversionApplied: true,
      conversionNote: `Converted from ${quantity} kg to tonnes`
    };
  }
  
  if ((normalizedBoq === 't' || normalizedBoq === 'tonnes') && normalizedDb === 'kg') {
    return {
      convertedQuantity: quantity * 1000,
      targetUnit: dbUnit,
      conversionApplied: true,
      conversionNote: `Converted from ${quantity} tonnes to kg`
    };
  }
  
  // No automatic conversion available
  return {
    convertedQuantity: quantity,
    targetUnit: boqUnit,
    conversionApplied: false,
    conversionNote: `Warning: Unit mismatch (BOQ: ${boqUnit}, Database: ${dbUnit}) - manual review recommended`
  };
}

export interface UnitConversionResult {
  originalQuantity: number;
  originalUnit: string;
  convertedQuantity: number;
  targetUnit: string;
  conversionApplied: boolean;
  conversionNote: string | null;
}
