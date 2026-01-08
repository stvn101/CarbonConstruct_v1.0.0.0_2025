import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ECO Platform compliance constants
const AUSTRALIAN_GRID_FACTORS_2024: Record<string, number> = {
  NSW: 0.76,
  VIC: 0.90,
  QLD: 0.72,
  SA: 0.42,
  WA: 0.64,
  TAS: 0.14,
  NT: 0.54,
  ACT: 0.76
};

const CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION = [
  'granulated-blast-furnace-slag',
  'crystallised-bof-slag',
  'fly-ash',
  'artificial-gypsum',
  'silica-fume',
  'aluminium-oxide-byproduct'
];

const C_TO_CO2_FACTOR = 44 / 12; // 3.667

interface ValidationResult {
  requirement: string;
  section: string;
  isCompliant: boolean;
  errors: string[];
  warnings: string[];
}

interface MaterialData {
  id: string;
  name: string;
  characterisation_factor_version?: string;
  allocation_method?: string;
  is_co_product?: boolean;
  co_product_type?: string;
  uses_mass_balance?: boolean;
  biogenic_carbon_kg_c?: number;
  biogenic_carbon_percentage?: number;
  manufacturing_country?: string;
  manufacturing_city?: string;
  ecoinvent_methodology?: string;
  eco_platform_compliant?: boolean;
  data_quality_rating?: string;
  reference_year?: number;
  data_source?: string;
}

interface ProjectData {
  id: string;
  name: string;
  location?: string;
  electricity_percentage_a1a3?: number;
  electricity_modelling_approach?: string;
  grid_factor_source?: string;
  eco_compliance_enabled?: boolean;
}

interface ComplianceReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  standardsCompliance: {
    en15804A2: boolean;
    ecoPlatformV2: boolean;
    iso14025: boolean;
    iso21930: boolean;
  };
  energyTransparency: {
    electricityModellingApproach: string;
    electricityPercentageOfA1A3: number;
    electricityGwpKgCO2ePerKwh: number | null;
    gasPercentageOfA1A3: number;
    gasGwpKgCO2ePerMJ: number | null;
    contractualInstrumentsUsed: boolean;
    contractualInstrumentDetails?: string;
  };
  characterisationFactors: {
    version: string;
    source: string;
  };
  allocationStatement: {
    coProductsPresent: boolean;
    allocationMethodUsed: string;
    economicAllocationForSlagFlyAsh: boolean;
  };
  dataQuality: {
    overallRating: string;
    temporalCoverage: string;
    geographicalCoverage: string;
  };
  manufacturingLocations: Array<{ country: string; city: string; state?: string }>;
  biogenicCarbon: {
    totalBiogenicCarbonKgC: number;
    biogenicCarbonKgCO2e: number | null;
    packagingBiogenicBalanced: boolean;
  };
  complianceValidation: {
    isFullyCompliant: boolean;
    complianceScore: number;
    nonCompliantItems: string[];
    warnings: string[];
  };
  validationResults: ValidationResult[];
}

// Validation functions
function validateElectricityModelling(
  project: ProjectData,
  materials: MaterialData[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const approach = project.electricity_modelling_approach || 'location-based';
  const electricityPercent = project.electricity_percentage_a1a3 || 0;
  
  // Check if electricity > 30% requires GWP declaration
  if (electricityPercent > 30 && !project.grid_factor_source) {
    errors.push('Electricity GWP declaration required when electricity >30% of A1-A3 energy (ECO Platform §2.5.1)');
  }
  
  // Check for sub-national grid factors for Australia
  if (project.location && !AUSTRALIAN_GRID_FACTORS_2024[project.location]) {
    warnings.push(`Location '${project.location}' not found in Australian sub-national grid factors`);
  }
  
  return {
    requirement: 'Electricity Modelling',
    section: '2.5.1',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateMassBalance(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const massBalanceMaterials = materials.filter(m => m.uses_mass_balance === true);
  
  if (massBalanceMaterials.length > 0) {
    errors.push(`${massBalanceMaterials.length} material(s) use mass balance approach - prohibited by ECO Platform §2.4`);
    massBalanceMaterials.forEach(m => {
      errors.push(`  - ${m.name}`);
    });
  }
  
  return {
    requirement: 'Mass Balance Prohibition',
    section: '2.4',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateCoProductAllocation(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const coProducts = materials.filter(m => m.is_co_product === true);
  
  coProducts.forEach(m => {
    if (m.co_product_type && CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION.includes(m.co_product_type)) {
      if (m.allocation_method !== 'economic') {
        errors.push(`${m.name}: ${m.co_product_type} must use economic allocation (ECO Platform §2.6.1)`);
      }
    }
  });
  
  if (coProducts.length > 0 && coProducts.every(m => !m.allocation_method)) {
    warnings.push('Co-products detected but allocation method not specified');
  }
  
  return {
    requirement: 'Co-Product Allocation',
    section: '2.6.1',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateBiogenicCarbon(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  materials.forEach(m => {
    if (m.biogenic_carbon_percentage && m.biogenic_carbon_percentage > 5) {
      if (!m.biogenic_carbon_kg_c) {
        warnings.push(`${m.name}: Biogenic carbon >5% - kg CO2-e declaration recommended`);
      }
    }
  });
  
  return {
    requirement: 'Biogenic Carbon',
    section: '2.11',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateCharacterisationFactors(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const validVersions = ['JRC-EF-3.0', 'JRC-EF-3.1'];
  
  materials.forEach(m => {
    if (m.characterisation_factor_version && !validVersions.includes(m.characterisation_factor_version)) {
      errors.push(`${m.name}: Uses ${m.characterisation_factor_version} - ECO Platform requires JRC EF 3.0 or 3.1`);
    }
  });
  
  const unknownVersions = materials.filter(m => !m.characterisation_factor_version);
  if (unknownVersions.length > 0) {
    warnings.push(`${unknownVersions.length} material(s) have unknown characterisation factor version`);
  }
  
  return {
    requirement: 'Characterisation Factors',
    section: '2.9',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateEcoinventMethodology(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  materials.forEach(m => {
    if (m.data_source?.toLowerCase().includes('ecoinvent')) {
      if (m.ecoinvent_methodology && m.ecoinvent_methodology !== 'cut-off') {
        errors.push(`${m.name}: Ecoinvent ${m.ecoinvent_methodology} not allowed - ECO Platform requires cut-off methodology only`);
      }
    }
  });
  
  return {
    requirement: 'Ecoinvent Cut-Off Methodology',
    section: '2.8',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function validateManufacturingLocation(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const missingLocation = materials.filter(m => !m.manufacturing_country || !m.manufacturing_city);
  
  if (missingLocation.length > 0) {
    warnings.push(`${missingLocation.length} material(s) missing manufacturing location at country/city level (ECO Platform §2.12)`);
  }
  
  return {
    requirement: 'Manufacturing Site Location',
    section: '2.12',
    isCompliant: true, // Warning only, not a hard requirement
    errors,
    warnings
  };
}

function validateDataQuality(materials: MaterialData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const currentYear = new Date().getFullYear();
  
  materials.forEach(m => {
    if (m.reference_year && currentYear - m.reference_year > 10) {
      warnings.push(`${m.name}: Data from ${m.reference_year} may not meet EN 15941 temporal requirements (>10 years old)`);
    }
    
    if (m.data_quality_rating === 'E') {
      warnings.push(`${m.name}: Data quality rating E requires justification`);
    }
  });
  
  return {
    requirement: 'Data Quality',
    section: '2.7',
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

function generateComplianceReport(
  project: ProjectData,
  materials: MaterialData[],
  validationResults: ValidationResult[]
): ComplianceReport {
  const nonCompliantItems: string[] = [];
  const allWarnings: string[] = [];
  
  validationResults.forEach(result => {
    nonCompliantItems.push(...result.errors);
    allWarnings.push(...result.warnings);
  });
  
  const totalChecks = validationResults.length;
  const passedChecks = validationResults.filter(r => r.isCompliant).length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);
  
  // Calculate biogenic carbon totals
  const totalBiogenicCarbonKgC = materials.reduce((sum, m) => sum + (m.biogenic_carbon_kg_c || 0), 0);
  const avgBiogenicPercent = materials.length > 0 
    ? materials.reduce((sum, m) => sum + (m.biogenic_carbon_percentage || 0), 0) / materials.length 
    : 0;
  
  // Get unique manufacturing locations
  const manufacturingLocations = materials
    .filter(m => m.manufacturing_country && m.manufacturing_city)
    .map(m => ({
      country: m.manufacturing_country!,
      city: m.manufacturing_city!,
      state: undefined
    }))
    .filter((loc, i, arr) => 
      arr.findIndex(l => l.country === loc.country && l.city === loc.city) === i
    );
  
  // Calculate data quality rating
  const qualityRatings = materials
    .filter(m => m.data_quality_rating)
    .map(m => m.data_quality_rating!);
  const overallRating = qualityRatings.length > 0 
    ? calculateOverallDataQuality(qualityRatings) 
    : 'C';
  
  // Get characterisation factor info
  const cfVersions = materials
    .filter(m => m.characterisation_factor_version)
    .map(m => m.characterisation_factor_version!);
  const mostCommonCF = cfVersions.length > 0 
    ? getMostCommon(cfVersions) || 'JRC-EF-3.1'
    : 'JRC-EF-3.1';
  
  return {
    projectId: project.id,
    projectName: project.name,
    generatedAt: new Date().toISOString(),
    standardsCompliance: {
      en15804A2: complianceScore >= 80,
      ecoPlatformV2: complianceScore >= 90,
      iso14025: complianceScore >= 70,
      iso21930: complianceScore >= 70
    },
    energyTransparency: {
      electricityModellingApproach: project.electricity_modelling_approach || 'location-based',
      electricityPercentageOfA1A3: project.electricity_percentage_a1a3 || 0,
      electricityGwpKgCO2ePerKwh: project.location 
        ? AUSTRALIAN_GRID_FACTORS_2024[project.location] || null 
        : null,
      gasPercentageOfA1A3: 0,
      gasGwpKgCO2ePerMJ: null,
      contractualInstrumentsUsed: false
    },
    characterisationFactors: {
      version: mostCommonCF,
      source: 'European Commission Joint Research Centre'
    },
    allocationStatement: {
      coProductsPresent: materials.some(m => m.is_co_product),
      allocationMethodUsed: getMostCommon(materials.filter(m => m.allocation_method).map(m => m.allocation_method!)) || 'Not specified',
      economicAllocationForSlagFlyAsh: materials
        .filter(m => m.is_co_product && m.co_product_type && CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION.includes(m.co_product_type))
        .every(m => m.allocation_method === 'economic')
    },
    dataQuality: {
      overallRating,
      temporalCoverage: calculateTemporalCoverage(materials),
      geographicalCoverage: 'Australia'
    },
    manufacturingLocations,
    biogenicCarbon: {
      totalBiogenicCarbonKgC,
      biogenicCarbonKgCO2e: avgBiogenicPercent > 5 ? totalBiogenicCarbonKgC * C_TO_CO2_FACTOR : null,
      packagingBiogenicBalanced: true
    },
    complianceValidation: {
      isFullyCompliant: nonCompliantItems.length === 0,
      complianceScore,
      nonCompliantItems,
      warnings: allWarnings
    },
    validationResults
  };
}

function calculateOverallDataQuality(ratings: string[]): string {
  const ratingScores: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const avgScore = ratings.reduce((sum, r) => sum + (ratingScores[r] || 3), 0) / ratings.length;
  
  if (avgScore >= 4.5) return 'A';
  if (avgScore >= 3.5) return 'B';
  if (avgScore >= 2.5) return 'C';
  if (avgScore >= 1.5) return 'D';
  return 'E';
}

function calculateTemporalCoverage(materials: MaterialData[]): string {
  const years = materials.filter(m => m.reference_year).map(m => m.reference_year!);
  if (years.length === 0) return 'Not specified';
  
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return `${minYear}-${maxYear}`;
}

function getMostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  let maxCount = 0;
  let result: T | undefined;
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      result = item;
    }
  });
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[validate-eco-compliance] No authorization header");
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'validate-eco-compliance',
        details: 'Missing authorization header'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[validate-eco-compliance] Authentication failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    console.log(`[validate-eco-compliance] User: ${user.id.substring(0, 8)}...`);

    // Rate limit: 20 requests per 5 minutes
    const rateLimitResult = await checkRateLimit(
      supabaseServiceClient,
      user.id,
      'validate-eco-compliance',
      { windowMinutes: 5, maxRequests: 20 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Retry in ${resetInSeconds}s` }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(resetInSeconds) } }
      );
    }

    // Parse request
    const body = await req.json();
    const { projectId, materials = [], saveReport = false } = body;

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "projectId is required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch project data - use service client but verify user ownership
    const { data: project, error: projectError } = await supabaseServiceClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error("[validate-eco-compliance] Project not found");
      return new Response(
        JSON.stringify({ error: "Project not found" }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-eco-compliance] Validating project: ${project.name}`);

    // Run all validations
    const validationResults: ValidationResult[] = [
      validateElectricityModelling(project as ProjectData, materials),
      validateMassBalance(materials),
      validateCoProductAllocation(materials),
      validateBiogenicCarbon(materials),
      validateCharacterisationFactors(materials),
      validateEcoinventMethodology(materials),
      validateManufacturingLocation(materials),
      validateDataQuality(materials)
    ];

    // Generate compliance report
    const complianceReport = generateComplianceReport(
      project as ProjectData,
      materials,
      validationResults
    );

    console.log(`[validate-eco-compliance] Score: ${complianceReport.complianceValidation.complianceScore}%`);

    // Optionally save report to database
    if (saveReport) {
      const { error: updateError } = await supabaseServiceClient
        .from('projects')
        .update({ eco_compliance_report: complianceReport })
        .eq('id', projectId);

      if (updateError) {
        console.error("[validate-eco-compliance] Failed to save report:", updateError.message);
      } else {
        console.log("[validate-eco-compliance] Report saved to database");
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        complianceReport 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[validate-eco-compliance] Error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Validation failed" }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});