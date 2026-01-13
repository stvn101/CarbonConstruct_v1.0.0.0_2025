/**
 * Material Matching Logic for BOQ Parser
 * Extracted for testability and reuse
 */

export interface DBMaterial {
  id: string;
  material_name: string;
  material_category: string;
  subcategory: string | null;
  unit: string;
  ef_total: number;
  data_source: string;
  epd_number: string | null;
  manufacturer: string | null;
  state: string | null;
  region: string | null;
}

export interface ParsedMaterial {
  category: string;
  typeId: string;
  name: string;
  quantity: number;
  unit: string;
  factor: number | null;
  isCustom: boolean;
  source: string;
  epdNumber: string | null;
  confidenceLevel: 'high' | 'medium' | 'low';
  unitConversionApplied?: boolean;
  requiresReview: boolean;
  reviewReason?: string;
  proxyMaterialId?: string;
  proxyMaterialName?: string;
  manufacturer?: string;
}

// Australian states for filtering
export const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

/**
 * Check if a material is Australian based on state/region fields
 */
export function isAustralianMaterial(mat: DBMaterial): boolean {
  if (mat.state && AUSTRALIAN_STATES.includes(mat.state.toUpperCase())) return true;
  if (mat.region && mat.region.toLowerCase().includes('australia')) return true;
  // Default to true if no region info (assume Australian for local DB)
  if (!mat.state && !mat.region) return true;
  return false;
}

/**
 * Filter materials to Australian sources only
 */
export function filterAustralianMaterials(materials: DBMaterial[]): DBMaterial[] {
  return materials.filter(isAustralianMaterial);
}

/**
 * Find exact material match by UUID
 */
export function findExactMatch(
  typeId: string,
  dbMaterials: DBMaterial[]
): DBMaterial | undefined {
  if (!typeId || typeof typeId !== 'string') return undefined;
  if (typeId.length !== 36 || !typeId.includes('-')) return undefined;
  return dbMaterials.find(m => m.id === typeId);
}

/**
 * Find category match for a material (deterministic - highest ef_total)
 */
export function findCategoryMatch(
  category: string,
  unit: string,
  dbMaterials: DBMaterial[]
): DBMaterial | undefined {
  const catLower = category.toLowerCase();
  const unitLower = unit.toLowerCase();

  const matches = dbMaterials
    .filter(m =>
      m.material_category?.toLowerCase() === catLower &&
      m.unit?.toLowerCase() === unitLower
    )
    .sort((a, b) => (b.ef_total || 0) - (a.ef_total || 0));

  return matches[0];
}

/**
 * Find keyword-based proxy match (deterministic - highest ef_total)
 */
export function findKeywordMatch(
  name: string,
  category: string,
  unit: string,
  dbMaterials: DBMaterial[]
): DBMaterial | undefined {
  const nameLower = name.toLowerCase();
  const catLower = category.toLowerCase();
  const unitLower = unit.toLowerCase();

  const keywords = [
    'steel', 'concrete', 'timber', 'plasterboard', 'insulation',
    'glass', 'aluminium', 'brick', 'masonry', 'carpet', 'vinyl',
    'copper', 'pvc', 'roofing', 'cladding'
  ];

  for (const keyword of keywords) {
    if (nameLower.includes(keyword) || catLower.includes(keyword)) {
      const matches = dbMaterials
        .filter(m =>
          (m.material_category?.toLowerCase().includes(keyword) ||
           m.material_name?.toLowerCase().includes(keyword)) &&
          m.unit?.toLowerCase() === unitLower
        )
        .sort((a, b) => (b.ef_total || 0) - (a.ef_total || 0));

      if (matches[0]) return matches[0];
    }
  }

  return undefined;
}

/**
 * Check if material is structural steel requiring manual review
 */
export function isStructuralSteelInLinearMetres(name: string, unit: string): boolean {
  const nameLower = name.toLowerCase();
  const unitLower = unit.toLowerCase();

  // Check for linear metre units
  const isLinearMetre = ['m', 'metres', 'meter', 'meters', 'lm'].includes(unitLower);
  if (!isLinearMetre) return false;

  // Check for steel
  if (!nameLower.includes('steel')) return false;

  // Exclude light gauge framing (these can be converted)
  if (nameLower.match(/stud|track|furring|light gauge|ceiling/)) return false;

  return true;
}

/**
 * Validate and enhance a parsed material against the database
 */
export function validateMaterial(
  mat: Partial<ParsedMaterial>,
  dbMaterials: DBMaterial[]
): ParsedMaterial {
  const typeId = mat.typeId as string | undefined;
  const name = (mat.name as string) || '';
  const category = (mat.category as string) || '';
  const unit = (mat.unit as string) || '';

  // Try exact match first
  if (typeId) {
    const dbMatch = findExactMatch(typeId, dbMaterials);
    if (dbMatch) {
      return {
        ...mat,
        category: mat.category || dbMatch.material_category,
        typeId: dbMatch.id,
        name,
        quantity: mat.quantity || 0,
        unit: dbMatch.unit,
        factor: dbMatch.ef_total,
        isCustom: false,
        source: dbMatch.data_source,
        epdNumber: dbMatch.epd_number,
        manufacturer: dbMatch.manufacturer || undefined,
        confidenceLevel: 'high',
        requiresReview: false
      } as ParsedMaterial;
    }
  }

  // Check for structural steel in linear metres (requires review)
  if (isStructuralSteelInLinearMetres(name, unit)) {
    return {
      ...mat,
      category,
      typeId: 'custom',
      name,
      quantity: mat.quantity || 0,
      unit,
      factor: null,
      isCustom: true,
      source: 'N/A - requires specification',
      epdNumber: null,
      confidenceLevel: 'low',
      requiresReview: true,
      reviewReason: 'Structural steel in linear metres requires mass specification in tonnes - cannot estimate from linear metres alone. Please specify total tonnage or consult structural drawings.'
    } as ParsedMaterial;
  }

  // Try category match
  const categoryMatch = findCategoryMatch(category, unit, dbMaterials);
  if (categoryMatch) {
    return {
      ...mat,
      category,
      typeId: 'custom',
      name,
      quantity: mat.quantity || 0,
      unit: categoryMatch.unit,
      factor: categoryMatch.ef_total,
      isCustom: true,
      source: `${categoryMatch.data_source} (proxy match: ${categoryMatch.material_name})`,
      epdNumber: null,
      proxyMaterialId: categoryMatch.id,
      proxyMaterialName: categoryMatch.material_name,
      confidenceLevel: 'medium',
      requiresReview: false
    } as ParsedMaterial;
  }

  // Try keyword match
  const keywordMatch = findKeywordMatch(name, category, unit, dbMaterials);
  if (keywordMatch) {
    return {
      ...mat,
      category,
      typeId: 'custom',
      name,
      quantity: mat.quantity || 0,
      unit: keywordMatch.unit,
      factor: keywordMatch.ef_total,
      isCustom: true,
      source: `${keywordMatch.data_source} (proxy match: ${keywordMatch.material_name})`,
      epdNumber: null,
      proxyMaterialId: keywordMatch.id,
      proxyMaterialName: keywordMatch.material_name,
      confidenceLevel: 'medium',
      requiresReview: false
    } as ParsedMaterial;
  }

  // No match found - require review
  return {
    ...mat,
    category,
    typeId: 'custom',
    name,
    quantity: mat.quantity || 0,
    unit,
    factor: null,
    isCustom: true,
    source: 'N/A - requires selection',
    epdNumber: null,
    confidenceLevel: 'low',
    requiresReview: true,
    reviewReason: `No verified Australian material found for "${name}" in category "${category}" with unit "${unit}". Please select a material from the database.`
  } as ParsedMaterial;
}

/**
 * Validate all materials in a parsed BOQ
 */
export function validateAllMaterials(
  materials: Partial<ParsedMaterial>[],
  dbMaterials: DBMaterial[]
): ParsedMaterial[] {
  // Filter to Australian materials for matching
  const australianMaterials = filterAustralianMaterials(dbMaterials);
  return materials.map(m => validateMaterial(m, australianMaterials));
}
