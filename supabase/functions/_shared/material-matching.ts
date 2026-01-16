/**
 * Material Matching Logic for BOQ Parser
 * Extracted for testability and reuse
 * 
 * CRITICAL: Implements source priority hierarchy to prevent NGER worst-case
 * factors from dominating over more representative EPiC/ICE data.
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
  // Outlier detection fields
  isOutlier?: boolean;
  outlierReason?: string;
}

// Australian states for filtering
export const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

/**
 * Source Priority Hierarchy
 * Lower number = higher priority (more reliable for building LCA)
 * 
 * Rationale:
 * - EPiC: Australian academic lifecycle data, product-specific
 * - ICE: Global standard with granular kg-based factors
 * - ICM: Australian LCI with good coverage
 * - NABERS: Building-specific, Australian context
 * - Australian Standard: Generic but reliable
 * - NGER: National reporting factors - worst-case supply chain assumptions
 *         (e.g., assumes Chinese aluminium smelting with coal grid)
 */
export const SOURCE_PRIORITY: Record<string, number> = {
  'EPiC Database 2024': 1,
  'ICE V4.1 - Circular Ecology': 2,
  'ICM Database 2019 (AusLCI)': 3,
  'NABERS 2025 Emission Factors': 4,
  'Australian Standard Materials Database v2025': 5,
  'NGER Materials Database v2025.1': 6,
};

/**
 * Get priority for a data source (lower = better)
 */
export function getSourcePriority(source: string): number {
  // Check for exact match first
  if (SOURCE_PRIORITY[source] !== undefined) {
    return SOURCE_PRIORITY[source];
  }
  // Check for partial matches
  const sourceLower = source.toLowerCase();
  if (sourceLower.includes('epic')) return 1;
  if (sourceLower.includes('ice')) return 2;
  if (sourceLower.includes('icm') || sourceLower.includes('auslci')) return 3;
  if (sourceLower.includes('nabers')) return 4;
  if (sourceLower.includes('nger')) return 6;
  // Default to mid-priority for unknown sources
  return 5;
}

/**
 * Global reference sources that should ALWAYS be included
 * These provide high-quality lifecycle data regardless of region flags
 */
export const GLOBAL_REFERENCE_SOURCES = [
  'ICE V4.1 - Circular Ecology',
  'EPiC Database 2024',
];

/**
 * Check if a material should be included in Australian matching
 * 
 * Includes:
 * 1. Materials with Australian state/region flags
 * 2. Materials from global reference sources (ICE, EPiC) - always included
 * 3. Materials with no region info (default assume Australian)
 */
export function isAustralianMaterial(mat: DBMaterial): boolean {
  // Always include global reference sources (ICE, EPiC) - high quality data
  if (mat.data_source) {
    const sourceLower = mat.data_source.toLowerCase();
    if (sourceLower.includes('ice') || sourceLower.includes('epic')) {
      return true;
    }
  }
  
  // Check for Australian state
  if (mat.state && AUSTRALIAN_STATES.includes(mat.state.toUpperCase())) return true;
  
  // Check for Australia in region
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
 * Get the best match from a list using source priority hierarchy
 * 1. Group by source priority tier
 * 2. Select from the highest-priority (lowest number) tier
 * 3. Take median within that tier for representative value
 */
export function getBestMatchBySourcePriority(matches: DBMaterial[]): DBMaterial | undefined {
  if (!matches || matches.length === 0) return undefined;

  // Group by source priority
  const byPriority = new Map<number, DBMaterial[]>();
  for (const m of matches) {
    const priority = getSourcePriority(m.data_source);
    if (!byPriority.has(priority)) byPriority.set(priority, []);
    byPriority.get(priority)!.push(m);
  }

  // Get the highest priority tier (lowest number)
  const sortedPriorities = [...byPriority.keys()].sort((a, b) => a - b);
  const bestTier = byPriority.get(sortedPriorities[0])!;

  // Take median within the best tier for representative value
  const sorted = [...bestTier].sort((a, b) => (a.ef_total || 0) - (b.ef_total || 0));
  const medianIndex = Math.floor(sorted.length / 2);
  return sorted[medianIndex];
}

/**
 * Calculate category median for outlier detection
 */
export function getCategoryMedian(
  category: string,
  unit: string,
  dbMaterials: DBMaterial[]
): number | null {
  const catLower = category.toLowerCase();
  const unitLower = unit.toLowerCase();

  const categoryMatches = dbMaterials.filter(
    m => m.material_category?.toLowerCase() === catLower &&
         m.unit?.toLowerCase() === unitLower
  );

  if (categoryMatches.length < 3) return null; // Not enough data for meaningful median

  const factors = categoryMatches.map(m => m.ef_total).sort((a, b) => a - b);
  return factors[Math.floor(factors.length / 2)];
}

/**
 * Check if a factor is an outlier (>2x category median)
 */
export function isOutlierFactor(
  factor: number,
  category: string,
  unit: string,
  dbMaterials: DBMaterial[]
): { isOutlier: boolean; reason?: string; categoryMedian?: number } {
  const categoryMedian = getCategoryMedian(category, unit, dbMaterials);
  
  if (categoryMedian === null) {
    return { isOutlier: false };
  }

  const ratio = factor / categoryMedian;
  
  if (ratio > 2) {
    return {
      isOutlier: true,
      reason: `Factor ${factor.toFixed(0)} is ${ratio.toFixed(1)}x the category median (${categoryMedian.toFixed(0)}). Consider reviewing or selecting a lower-emission alternative.`,
      categoryMedian
    };
  }

  return { isOutlier: false, categoryMedian };
}

/**
 * Find category match for a material using source priority hierarchy
 */
export function findCategoryMatch(
  category: string,
  unit: string,
  dbMaterials: DBMaterial[]
): DBMaterial | undefined {
  const catLower = category.toLowerCase();
  const unitLower = unit.toLowerCase();

  const matches = dbMaterials.filter(m =>
    m.material_category?.toLowerCase() === catLower &&
    m.unit?.toLowerCase() === unitLower
  );

  // Use source priority hierarchy instead of just taking highest ef_total
  return getBestMatchBySourcePriority(matches);
}

/**
 * Find keyword-based proxy match using source priority hierarchy
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
    'glass', 'aluminium', 'aluminum', 'brick', 'masonry', 'carpet', 'vinyl',
    'copper', 'pvc', 'roofing', 'cladding', 'ceiling', 'louvre', 'louver',
    'window', 'door', 'frame', 'panel'
  ];

  for (const keyword of keywords) {
    if (nameLower.includes(keyword) || catLower.includes(keyword)) {
      const matches = dbMaterials.filter(m =>
        (m.material_category?.toLowerCase().includes(keyword) ||
         m.material_name?.toLowerCase().includes(keyword)) &&
        m.unit?.toLowerCase() === unitLower
      );

      // Use source priority hierarchy
      const bestMatch = getBestMatchBySourcePriority(matches);
      if (bestMatch) return bestMatch;
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
 * Uses source priority hierarchy to prevent NGER from dominating
 */
export function validateMaterial(
  mat: Partial<ParsedMaterial>,
  dbMaterials: DBMaterial[],
  allDbMaterials?: DBMaterial[] // Optional: for outlier detection across all sources
): ParsedMaterial {
  const typeId = mat.typeId as string | undefined;
  const name = (mat.name as string) || '';
  const category = (mat.category as string) || '';
  const unit = (mat.unit as string) || '';
  const materialsForOutlierCheck = allDbMaterials || dbMaterials;

  // Try exact match first
  if (typeId) {
    const dbMatch = findExactMatch(typeId, dbMaterials);
    if (dbMatch) {
      // Check for outlier even on exact match
      const outlierCheck = isOutlierFactor(
        dbMatch.ef_total,
        dbMatch.material_category,
        dbMatch.unit,
        materialsForOutlierCheck
      );

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
        requiresReview: outlierCheck.isOutlier,
        reviewReason: outlierCheck.isOutlier ? outlierCheck.reason : undefined,
        isOutlier: outlierCheck.isOutlier,
        outlierReason: outlierCheck.reason
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

  // Try category match with source priority
  const categoryMatch = findCategoryMatch(category, unit, dbMaterials);
  if (categoryMatch) {
    const outlierCheck = isOutlierFactor(
      categoryMatch.ef_total,
      category,
      unit,
      materialsForOutlierCheck
    );

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
      requiresReview: outlierCheck.isOutlier,
      reviewReason: outlierCheck.isOutlier ? outlierCheck.reason : undefined,
      isOutlier: outlierCheck.isOutlier,
      outlierReason: outlierCheck.reason
    } as ParsedMaterial;
  }

  // Try keyword match with source priority
  const keywordMatch = findKeywordMatch(name, category, unit, dbMaterials);
  if (keywordMatch) {
    const outlierCheck = isOutlierFactor(
      keywordMatch.ef_total,
      category,
      unit,
      materialsForOutlierCheck
    );

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
      requiresReview: outlierCheck.isOutlier,
      reviewReason: outlierCheck.isOutlier ? outlierCheck.reason : undefined,
      isOutlier: outlierCheck.isOutlier,
      outlierReason: outlierCheck.reason
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
  dbMaterials: DBMaterial[],
  allDbMaterials?: DBMaterial[]
): ParsedMaterial[] {
  // Filter to Australian materials for matching
  const australianMaterials = filterAustralianMaterials(dbMaterials);
  return materials.map(m => validateMaterial(m, australianMaterials, allDbMaterials));
}
