/**
 * CarbonConstruct Materials Database Validation Framework v1.0
 * 
 * Implements 5-layer validation architecture:
 * - Layer 1: Data Integrity (null checks, type validation, unit consistency)
 * - Layer 2: EPD Registry Verification (S-P-XXXXX pattern matching, validity)
 * - Layer 3: NABERS Range Validation (expected ranges by category)
 * - Layer 4: Unit Consistency (per-category unit checks)
 * - Layer 5: Source Credibility (Tier 1/2/3 classification)
 */

// ============================================
// PART 1: SEVERITY LEVELS
// ============================================

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'verified' | 'documented' | 'industry_average' | 'needs_review';

export interface ValidationIssue {
  severity: SeverityLevel;
  layer: number;
  code: string;
  message: string;
  materialId?: string;
  materialName?: string;
  value?: number | string;
  expectedRange?: string;
  recommendedAction: string;
}

// ============================================
// PART 2: NABERS EXPECTED RANGES
// ============================================

export interface RangeSpec {
  min: number;
  max: number;
  unit: string;
  notes?: string;
}

/**
 * NABERS Range Validation Tolerance Thresholds
 * 
 * These constants define the acceptable variance from NABERS expected ranges
 * before a material is flagged as an outlier requiring review.
 * 
 * RATIONALE FOR 30% TOLERANCE:
 * - Regional variations: Australian grid mix varies by state (e.g., TAS hydro vs NSW coal)
 * - Manufacturing processes: Recycled content, energy mix, and transportation differences
 * - Supply chain factors: Import origin, local vs imported materials
 * - Temporal factors: Technology improvements, seasonal energy mix changes
 * 
 * ADJUSTMENT GUIDANCE:
 * - Increase tolerance (e.g., 1.4/0.6) for categories with high regional variance (e.g., Aluminium)
 * - Decrease tolerance (e.g., 1.2/0.8) for standardized products (e.g., Cement)
 * - Review quarterly as NABERS dataset evolves and manufacturing practices improve
 * 
 * @constant {number} NABERS_UPPER_TOLERANCE_MULTIPLIER - Multiplier for upper range threshold (130% = 1.3)
 * @constant {number} NABERS_LOWER_TOLERANCE_MULTIPLIER - Multiplier for lower range threshold (70% = 0.7)
 */
export const NABERS_UPPER_TOLERANCE_MULTIPLIER = 1.3; // 30% above maximum
export const NABERS_LOWER_TOLERANCE_MULTIPLIER = 0.7; // 30% below minimum

// NABERS v2025.1 expected ranges by category
export const NABERS_RANGES: Record<string, RangeSpec[]> = {
  // Concrete (Section 3.1)
  Concrete: [
    { min: 136, max: 364, unit: 'm³', notes: '10-20 MPa standard concretes' },
    { min: 149, max: 417, unit: 'm³', notes: '20-25 MPa common grades' },
    { min: 167, max: 459, unit: 'm³', notes: '25-32 MPa structural' },
    { min: 198, max: 545, unit: 'm³', notes: '32-40 MPa high strength' },
    { min: 101, max: 609, unit: 'm³', notes: '40-50 MPa premium' },
    { min: 205, max: 1270, unit: 'm³', notes: 'Specialty mortars/grouts (cement-rich)' },
  ],
  // Steel (Section 3.2)
  Steel: [
    { min: 2500, max: 3500, unit: 'tonne', notes: 'Virgin structural (hot-rolled)' },
    { min: 400, max: 1200, unit: 'tonne', notes: 'Recycled (scrap-based)' },
    { min: 3000, max: 4000, unit: 'tonne', notes: 'High-strength alloyed grades' },
  ],
  // Aluminium (Section 3.3)
  Aluminium: [
    { min: 8000, max: 20000, unit: 'tonne', notes: 'Primary (virgin)' },
    { min: 800, max: 3000, unit: 'tonne', notes: 'Recycled' },
    { min: 5000, max: 8000, unit: 'tonne', notes: 'Smelted (hydro-powered)' },
    { min: 12000, max: 28800, unit: 'tonne', notes: 'Smelted (coal-intensive grids: China/India)' },
  ],
  // Timber (Section 3.4)
  Timber: [
    { min: 113, max: 332, unit: 'm³', notes: 'Solid softwood (pine, radiata)' },
    { min: 104, max: 563, unit: 'm³', notes: 'Solid hardwood' },
    { min: 53, max: 706, unit: 'm³', notes: 'GLT/CLT engineered' },
    { min: 94, max: 402, unit: 'm³', notes: 'LVL engineered' },
    { min: 235, max: 922, unit: 'm³', notes: 'Plywood (adhesives + processing)' },
  ],
  // Glass (Section 3.5)
  Glass: [
    { min: 0.8, max: 2.5, unit: 'm²', notes: 'Float glass basic glazing' },
    { min: 2, max: 6, unit: 'm²', notes: 'Processed glass (tinted/coated)' },
    { min: 8, max: 20, unit: 'm²', notes: 'Insulated units (IGU)' },
  ],
  // Asphalt & Aggregates (Section 3.6)
  Asphalt: [
    { min: 40, max: 150, unit: 'tonne', notes: 'Road asphalt' },
    { min: 60, max: 180, unit: 'tonne', notes: 'Building asphalt' },
  ],
  Aggregates: [
    { min: 0, max: 20, unit: 'tonne', notes: 'Quarried aggregate minimal processing' },
  ],
  // Cement
  Cement: [
    { min: 700, max: 1000, unit: 'tonne', notes: 'Portland cement (GP)' },
    { min: 500, max: 800, unit: 'tonne', notes: 'Blended cement' },
  ],
  // Insulation
  Insulation: [
    { min: 1, max: 15, unit: 'm²', notes: 'Mineral wool' },
    { min: 2, max: 25, unit: 'm²', notes: 'EPS/XPS' },
    { min: 0.5, max: 8, unit: 'm²', notes: 'Cellulose' },
  ],
};

// ============================================
// PART 3: SOURCE CREDIBILITY TIERS
// ============================================

export type SourceTier = 1 | 2 | 3;

export interface SourceCredibility {
  tier: SourceTier;
  label: string;
  description: string;
}

export const SOURCE_TIER_MAP: Record<string, SourceCredibility> = {
  'EPD Australasia': { tier: 1, label: 'Tier 1: Verified', description: 'EPD Australasia registered, NABERS cross-referenced' },
  'NABERS': { tier: 1, label: 'Tier 1: Verified', description: 'NABERS official database, verified' },
  'NABERS EPD': { tier: 1, label: 'Tier 1: Verified', description: 'NABERS EPD cross-referenced' },
  'ICM Database': { tier: 2, label: 'Tier 2: Industry Average', description: 'Industry consensus method (ICM) 2019' },
  'ICM Database 2019': { tier: 2, label: 'Tier 2: Industry Average', description: 'Industry consensus method (ICM) 2019' },
  'EPD International': { tier: 2, label: 'Tier 2: International', description: 'International EPD with grid context needed' },
  'EC3': { tier: 2, label: 'Tier 2: International', description: 'Embodied Carbon in Construction Calculator' },
};

export function getSourceTier(dataSource: string | null | undefined): SourceCredibility {
  if (!dataSource) {
    return { tier: 3, label: 'Tier 3: Review Required', description: 'Unknown source, requires verification' };
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(SOURCE_TIER_MAP)) {
    if (dataSource.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(dataSource.toLowerCase())) {
      return value;
    }
  }
  
  // Default to Tier 3 for unknown sources
  return { tier: 3, label: 'Tier 3: Review Required', description: 'Source requires verification' };
}

// ============================================
// PART 4: CONFIDENCE LEVEL DETERMINATION
// ============================================

export interface MaterialValidation {
  confidenceLevel: ConfidenceLevel;
  confidenceLabel: string;
  confidenceColor: 'green' | 'yellow' | 'orange' | 'red';
  issues: ValidationIssue[];
  sourceTier: SourceTier;
  isOutlier: boolean;
  outlierReason?: string;
  validUntil?: string;
}

/**
 * Determines the confidence level for a material record based on validation framework rules (see Part 4).
 *
 * ## Return Value
 * Returns a {@link MaterialValidation} object with the following structure:
 * - `confidenceLevel` (`ConfidenceLevel`): The assigned confidence level for the material. One of:
 *    - `'verified'`: Data is from a registered EPD (Environmental Product Declaration) and cross-referenced with NABERS. Indicates the highest level of trust.
 *    - `'documented'`: Data is a documented regional or manufacturing variant, but not a registered EPD. Trusted, but with some caveats.
 *    - `'industry_average'`: Data is from an industry average source (e.g., ICM Database). Useful for benchmarking, but less specific.
 *    - `'needs_review'`: Data is an outlier or lacks sufficient documentation. Requires manual review before use.
 * - `confidenceLabel` (`string`): Human-readable label for the confidence level (e.g., "Verified EPD", "Industry Average").
 * - `confidenceColor` (`'green' | 'yellow' | 'orange' | 'red'`): Color code representing the confidence level for UI display.
 * - `issues` (`ValidationIssue[]`): List of validation issues found for the material, if any.
 * - `sourceTier` (`SourceTier`): Classification of the data source's credibility.
 * - `isOutlier` (`boolean`): Whether the material's data is considered a statistical outlier.
 * - `outlierReason` (`string | undefined`): Explanation if the material is an outlier.
 * - `validUntil` (`string | undefined`): Expiry date for the data, if applicable.
 *
 * ## Confidence Levels
 * - 🟢 **'verified'**: Data is from a registered EPD (Environmental Product Declaration) and cross-referenced with NABERS. Use with high confidence for compliance and reporting.
 * - 🟡 **'documented'**: Data is a documented regional or manufacturing variant, but not a registered EPD. Suitable for most use cases, but may require additional verification for compliance.
 * - 🟠 **'industry_average'**: Data is from an industry average source (e.g., ICM Database). Use for benchmarking or early design, but not for final compliance reporting.
 * - 🔴 **'needs_review'**: Data is an outlier or lacks sufficient documentation. Manual review is required before use in compliance or reporting.
 *
 * @param material - The material record to evaluate.
 * @returns {MaterialValidation} The validation result, including confidence level, issues, and source tier.
 */
export function determineConfidenceLevel(
  material: {
    epd_number?: string | null;
    data_source?: string | null;
    state?: string | null;
    manufacturer?: string | null;
    ef_total?: number | null;
    material_category?: string | null;
    unit?: string | null;
    expiry_date?: string | null;
  }
): MaterialValidation {
  const issues: ValidationIssue[] = [];
  let confidenceLevel: ConfidenceLevel = 'verified';
  let isOutlier = false;
  let outlierReason: string | undefined;
  
  const sourceTier = getSourceTier(material.data_source);
  
  // Layer 1: Data Integrity
  if (material.ef_total === null || material.ef_total === undefined) {
    issues.push({
      severity: 'critical',
      layer: 1,
      code: 'NULL_EF_TOTAL',
      message: 'Missing emission factor value',
      recommendedAction: 'Remove from database or correct source data'
    });
    confidenceLevel = 'needs_review';
  }
  
  if (material.ef_total !== null && material.ef_total !== undefined && material.ef_total < 0) {
    issues.push({
      severity: 'critical',
      layer: 1,
      code: 'NEGATIVE_FACTOR',
      message: 'Negative carbon factor (impossible)',
      recommendedAction: 'Remove from database immediately'
    });
    confidenceLevel = 'needs_review';
  }
  
  // Layer 2: EPD Registry Verification
  const hasValidEpdNumber = material.epd_number && /^S-P-\d{5}/.test(material.epd_number);
  if (sourceTier.tier === 1 && !hasValidEpdNumber) {
    issues.push({
      severity: 'high',
      layer: 2,
      code: 'MISSING_EPD_NUMBER',
      message: 'EPD-sourced material missing registration number',
      recommendedAction: 'Verify with EPD Australasia registry'
    });
    if (confidenceLevel === 'verified') confidenceLevel = 'documented';
  }
  
  // Check expiry date
  if (material.expiry_date) {
    const expiry = new Date(material.expiry_date);
    const now = new Date();
    if (expiry < now) {
      issues.push({
        severity: 'high',
        layer: 2,
        code: 'EXPIRED_EPD',
        message: `EPD expired on ${material.expiry_date}`,
        recommendedAction: 'Replace with current version'
      });
      if (confidenceLevel === 'verified') confidenceLevel = 'documented';
    }
  }
  
  // Layer 3: NABERS Range Validation
  if (material.ef_total !== null && material.ef_total !== undefined && material.material_category) {
    const efTotal = material.ef_total;
    const ranges = NABERS_RANGES[material.material_category];
    if (ranges && ranges.length > 0 && efTotal > 0) {
      // Find the maximum acceptable range for the category
      const maxRange = Math.max(...ranges.map(r => r.max));
      const minRange = Math.min(...ranges.map(r => r.min));
      
      if (efTotal > maxRange * NABERS_UPPER_TOLERANCE_MULTIPLIER) {
        const variance = ((efTotal - maxRange) / maxRange * 100).toFixed(1);
        isOutlier = true;
        outlierReason = `${variance}% above NABERS maximum`;
        issues.push({
          severity: 'high',
          layer: 3,
          code: 'ABOVE_NABERS_RANGE',
          message: `Value ${efTotal} is ${variance}% above expected range (max ${maxRange})`,
          expectedRange: `${minRange}-${maxRange}`,
          recommendedAction: 'Verify with manufacturer EPD or check grid/regional context'
        });
        if (confidenceLevel !== 'needs_review') confidenceLevel = 'documented';
      } else if (efTotal < minRange * NABERS_LOWER_TOLERANCE_MULTIPLIER) {
        const variance = ((minRange - efTotal) / minRange * 100).toFixed(1);
        isOutlier = true;
        outlierReason = `${variance}% below NABERS minimum`;
        issues.push({
          severity: 'high',
          layer: 3,
          code: 'BELOW_NABERS_RANGE',
          message: `Value ${material.ef_total} is ${variance}% below expected range (min ${minRange})`,
          expectedRange: `${minRange}-${maxRange}`,
          recommendedAction: 'Verify recycled content or source documentation'
        });
        if (confidenceLevel !== 'needs_review') confidenceLevel = 'documented';
      }
    }
  }
  
  // Layer 5: Source Credibility
  if (sourceTier.tier === 2) {
    confidenceLevel = confidenceLevel === 'verified' ? 'industry_average' : confidenceLevel;
  } else if (sourceTier.tier === 3) {
    issues.push({
      severity: 'medium',
      layer: 5,
      code: 'TIER_3_SOURCE',
      message: 'Source requires additional verification',
      recommendedAction: 'Document source credibility or replace with Tier 1/2 source'
    });
    if (confidenceLevel !== 'needs_review') confidenceLevel = 'documented';
  }
  
  // Determine final confidence color
  let confidenceColor: 'green' | 'yellow' | 'orange' | 'red';
  let confidenceLabel: string;
  
  switch (confidenceLevel) {
    case 'verified':
      confidenceColor = 'green';
      confidenceLabel = 'Verified EPD';
      break;
    case 'documented':
      confidenceColor = 'yellow';
      confidenceLabel = 'Documented Variant';
      break;
    case 'industry_average':
      confidenceColor = 'orange';
      confidenceLabel = 'Industry Average';
      break;
    case 'needs_review':
      confidenceColor = 'red';
      confidenceLabel = 'Needs Review';
      break;
  }
  
  return {
    confidenceLevel,
    confidenceLabel,
    confidenceColor,
    issues,
    sourceTier: sourceTier.tier,
    isOutlier,
    outlierReason,
    validUntil: material.expiry_date || undefined
  };
}

// ============================================
// PART 5: VALIDATION STATISTICS
// ============================================

export interface ValidationStats {
  totalMaterials: number;
  passRate: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  confidenceLevelCounts: {
    verified: number;
    documented: number;
    industry_average: number;
    needs_review: number;
  };
  sourceTierCounts: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  outlierCount: number;
  lastValidationDate: string;
  validationVersion: string;
}

export interface MaterialWithValidation {
  id: string;
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
  data_source: string | null;
  epd_number: string | null;
  manufacturer: string | null;
  state: string | null;
  expiry_date: string | null;
  validation: MaterialValidation;
}

/**
 * Run comprehensive validation on all materials
 */
export async function runFullValidation(
  materials: Array<{
    id: string;
    material_name: string;
    material_category: string;
    ef_total: number;
    unit: string;
    data_source: string | null;
    epd_number: string | null;
    manufacturer: string | null;
    state: string | null;
    expiry_date: string | null;
  }>
): Promise<{
  materials: MaterialWithValidation[];
  stats: ValidationStats;
}> {
  const validatedMaterials: MaterialWithValidation[] = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  const confidenceCounts = { verified: 0, documented: 0, industry_average: 0, needs_review: 0 };
  const tierCounts = { tier1: 0, tier2: 0, tier3: 0 };
  let outlierCount = 0;
  
  for (const material of materials) {
    const validation = determineConfidenceLevel(material);
    
    validatedMaterials.push({ ...material, validation });
    
    // Count issues by severity
    for (const issue of validation.issues) {
      switch (issue.severity) {
        case 'critical': criticalCount++; break;
        case 'high': highCount++; break;
        case 'medium': mediumCount++; break;
        case 'low': lowCount++; break;
      }
    }
    
    // Count confidence levels
    confidenceCounts[validation.confidenceLevel]++;
    
    // Count source tiers
    switch (validation.sourceTier) {
      case 1: tierCounts.tier1++; break;
      case 2: tierCounts.tier2++; break;
      case 3: tierCounts.tier3++; break;
    }
    
    if (validation.isOutlier) outlierCount++;
  }
  
  const totalMaterials = materials.length;
  const passedMaterials = confidenceCounts.verified + confidenceCounts.documented + confidenceCounts.industry_average;
  const passRate = totalMaterials > 0 ? Math.round((passedMaterials / totalMaterials) * 1000) / 10 : 0;
  
  return {
    materials: validatedMaterials,
    stats: {
      totalMaterials,
      passRate,
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: mediumCount,
      lowIssues: lowCount,
      confidenceLevelCounts: confidenceCounts,
      sourceTierCounts: tierCounts,
      outlierCount,
      lastValidationDate: new Date().toISOString().split('T')[0],
      validationVersion: 'v1.0'
    }
  };
}
