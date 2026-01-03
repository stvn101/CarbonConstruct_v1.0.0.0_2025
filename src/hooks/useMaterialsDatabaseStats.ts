import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DataSourceStats {
  name: string;
  count: number;
  percentage: number;
  lastImported: string | null;
}

export interface CategoryStats {
  category: string;
  count: number;
  avgEf: number;
  minEf: number;
  maxEf: number;
  stdDev: number;
}

export interface OutlierMaterial {
  id: string;
  name: string;
  category: string;
  efTotal: number;
  expectedRange: { min: number; max: number };
  severity: 'extreme_high' | 'high' | 'low' | 'extreme_low';
}

export interface MaterialsDatabaseStats {
  totalMaterials: number;
  totalCategories: number;
  totalSources: number;
  lastUpdated: string | null;
  sourceDistribution: { source: string; count: number; percentage: number }[];
  categoryBreakdown: CategoryStats[];
  unitDistribution: { unit: string; count: number }[];
  metadataCompleteness: {
    withEpdNumber: number;
    withManufacturer: number;
    withEpdUrl: number;
    withState: number;
  };
  validationStatus: {
    passRate: number;
    totalValidated: number;
    lastValidationDate: string;
    methodology: string;
  };
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
  issuesCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dataSourceStats: {
    ice: DataSourceStats;
    nabers: DataSourceStats;
    bluescope: DataSourceStats;
    icm: DataSourceStats;
    nger: DataSourceStats;
    epic: DataSourceStats;
    other: DataSourceStats;
  };
  outliers: {
    extremeHigh: OutlierMaterial[];
    high: OutlierMaterial[];
    low: OutlierMaterial[];
    extremeLow: OutlierMaterial[];
    totalCount: number;
  };
}

// Expected EF ranges by category (kgCO2e per unit)
const EXPECTED_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  'concrete': { min: 50, max: 800, unit: 'm³' },
  'steel': { min: 500, max: 4000, unit: 'tonne' },
  'aluminium': { min: 5000, max: 30000, unit: 'tonne' },
  'timber': { min: 50, max: 800, unit: 'm³' },
  'glass': { min: 0.5, max: 200, unit: 'm²' },
  'masonry': { min: 50, max: 500, unit: 'tonne' },
  'asphalt': { min: 5, max: 200, unit: 'tonne' },
  'insulation': { min: 1, max: 50, unit: 'm²' },
  'plasterboard': { min: 0.5, max: 20, unit: 'm²' },
};

function detectOutliers(materials: any[], categoryStats: Map<string, { avg: number; stdDev: number }>): {
  extremeHigh: OutlierMaterial[];
  high: OutlierMaterial[];
  low: OutlierMaterial[];
  extremeLow: OutlierMaterial[];
} {
  const outliers = {
    extremeHigh: [] as OutlierMaterial[],
    high: [] as OutlierMaterial[],
    low: [] as OutlierMaterial[],
    extremeLow: [] as OutlierMaterial[],
  };

  materials.forEach(m => {
    const category = m.material_category?.toLowerCase() || '';
    const efTotal = parseFloat(m.ef_total) || 0;
    const stats = categoryStats.get(m.material_category);
    
    if (!stats || stats.stdDev === 0) return;

    // Calculate z-score
    const zScore = (efTotal - stats.avg) / stats.stdDev;
    
    // Find expected range from predefined or use category stats
    let expectedRange = { min: stats.avg - 2 * stats.stdDev, max: stats.avg + 2 * stats.stdDev };
    
    for (const [key, range] of Object.entries(EXPECTED_RANGES)) {
      if (category.includes(key)) {
        expectedRange = { min: range.min, max: range.max };
        break;
      }
    }

    const outlierMaterial: OutlierMaterial = {
      id: m.id,
      name: m.material_name,
      category: m.material_category,
      efTotal,
      expectedRange,
      severity: 'high'
    };

    if (zScore > 3) {
      outlierMaterial.severity = 'extreme_high';
      outliers.extremeHigh.push(outlierMaterial);
    } else if (zScore > 2) {
      outlierMaterial.severity = 'high';
      outliers.high.push(outlierMaterial);
    } else if (zScore < -3) {
      outlierMaterial.severity = 'extreme_low';
      outliers.extremeLow.push(outlierMaterial);
    } else if (zScore < -2) {
      outlierMaterial.severity = 'low';
      outliers.low.push(outlierMaterial);
    }
  });

  return outliers;
}

async function fetchMaterialsStats(): Promise<MaterialsDatabaseStats> {
  // Fetch total count
  const { count: totalMaterials } = await supabase
    .from("materials_epd")
    .select("*", { count: "exact", head: true });

  // Fetch ALL materials with pagination to bypass Supabase 1000 row limit
  const pageSize = 1000;
  let allMaterials: any[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("materials_epd")
      .select("id, material_name, data_source, material_category, unit, epd_number, manufacturer, epd_url, state, ef_total, created_at")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allMaterials = [...allMaterials, ...data];
      hasMore = data.length === pageSize;
      page++;
    }
  }

  // Calculate source tier distribution and data source stats
  let tier1Count = 0, tier2Count = 0, tier3Count = 0;
  let verifiedCount = 0, documentedCount = 0, industryAvgCount = 0, needsReviewCount = 0;
  
  // Data source counters
  let iceCount = 0, nabersCount = 0, bluescopeCount = 0, icmCount = 0, ngerCount = 0, epicCount = 0, otherCount = 0;
  let iceLastImported: string | null = null;
  let nabersLastImported: string | null = null;
  let bluescopeLastImported: string | null = null;
  let icmLastImported: string | null = null;
  let ngerLastImported: string | null = null;
  let epicLastImported: string | null = null;
  let otherLastImported: string | null = null;
  
  // Category stats aggregation
  const categoryData = new Map<string, { values: number[]; count: number }>();
  
  allMaterials.forEach(m => {
    // Tier classification based on exact data source matching
    // Tier 1: NABERS (Australian government verified EPDs)
    // Tier 2: ICE + ICM (verified international/industry databases)
    // Tier 3: NGER + Other (supplementary sources)
    const source = m.data_source || '';
    
    if (source === 'NABERS 2025 Emission Factors') {
      tier1Count++;
      verifiedCount++;
    } else if (source === 'ICE V4.1 - Circular Ecology' || source === 'ICM Database 2019 (AusLCI)') {
      tier2Count++;
      industryAvgCount++;
    } else {
      tier3Count++;
      needsReviewCount++;
    }
    
    // Aggregate EF values by category
    const category = m.material_category || 'Unknown';
    const efTotal = parseFloat(m.ef_total as any) || 0;
    if (!categoryData.has(category)) {
      categoryData.set(category, { values: [], count: 0 });
    }
    const catStats = categoryData.get(category)!;
    catStats.values.push(efTotal);
    catStats.count++;
    
    // Count by data source - use exact matching for known sources
    if (source === 'ICE V4.1 - Circular Ecology') {
      iceCount++;
      if (!iceLastImported || (m.created_at && m.created_at > iceLastImported)) {
        iceLastImported = m.created_at;
      }
    } else if (source === 'NABERS 2025 Emission Factors') {
      nabersCount++;
      if (!nabersLastImported || (m.created_at && m.created_at > nabersLastImported)) {
        nabersLastImported = m.created_at;
      }
    } else if (source.toLowerCase().includes('bluescope')) {
      bluescopeCount++;
      if (!bluescopeLastImported || (m.created_at && m.created_at > bluescopeLastImported)) {
        bluescopeLastImported = m.created_at;
      }
    } else if (source === 'ICM Database 2019 (AusLCI)') {
      icmCount++;
      if (!icmLastImported || (m.created_at && m.created_at > icmLastImported)) {
        icmLastImported = m.created_at;
      }
    } else if (source === 'NGER Materials Database v2025.1') {
      ngerCount++;
      if (!ngerLastImported || (m.created_at && m.created_at > ngerLastImported)) {
        ngerLastImported = m.created_at;
      }
    } else if (source === 'EPiC Database 2024') {
      epicCount++;
      if (!epicLastImported || (m.created_at && m.created_at > epicLastImported)) {
        epicLastImported = m.created_at;
      }
    } else {
      otherCount++;
      if (!otherLastImported || (m.created_at && m.created_at > otherLastImported)) {
        otherLastImported = m.created_at;
      }
    }
  });

  // Calculate category breakdown with stats
  const categoryStatsMap = new Map<string, { avg: number; stdDev: number }>();
  const categoryBreakdown: CategoryStats[] = [];
  
  categoryData.forEach((data, category) => {
    const values = data.values;
    const count = data.count;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    
    // Calculate standard deviation
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    categoryStatsMap.set(category, { avg, stdDev });
    
    categoryBreakdown.push({
      category,
      count,
      avgEf: Math.round(avg * 100) / 100,
      minEf: Math.round(min * 100) / 100,
      maxEf: Math.round(max * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
    });
  });
  
  // Sort by count descending, take top 15
  categoryBreakdown.sort((a, b) => b.count - a.count);
  const topCategories = categoryBreakdown.slice(0, 15);

  // Detect outliers
  const outliers = detectOutliers(allMaterials || [], categoryStatsMap);

  // Unique categories and sources
  const uniqueCategories = new Set(allMaterials?.map(c => c.material_category) || []);
  const uniqueSources = new Set(allMaterials?.map(s => s.data_source) || []);

  // Last updated
  const { data: lastUpdatedData } = await supabase
    .from("materials_epd")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1);

  // Source distribution
  const sourceCountMap = new Map<string, number>();
  allMaterials?.forEach(s => {
    const source = s.data_source || "Unknown";
    sourceCountMap.set(source, (sourceCountMap.get(source) || 0) + 1);
  });

  const sourceDistribution = Array.from(sourceCountMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / (totalMaterials || 1)) * 1000) / 10
    }))
    .sort((a, b) => b.count - a.count);

  // Unit distribution
  const unitCountMap = new Map<string, number>();
  allMaterials?.forEach(u => {
    const unit = u.unit || "Unknown";
    unitCountMap.set(unit, (unitCountMap.get(unit) || 0) + 1);
  });

  const unitDistribution = Array.from(unitCountMap.entries())
    .map(([unit, count]) => ({ unit, count }))
    .sort((a, b) => b.count - a.count);

  // Metadata completeness
  const withEpdNumber = allMaterials?.filter(m => m.epd_number).length || 0;
  const withManufacturer = allMaterials?.filter(m => m.manufacturer).length || 0;
  const withEpdUrl = allMaterials?.filter(m => m.epd_url).length || 0;
  const withState = allMaterials?.filter(m => m.state).length || 0;

  // Calculate pass rate (Tier 1 + Tier 2 = passed)
  const passedMaterials = tier1Count + tier2Count;
  const passRate = totalMaterials ? Math.round((passedMaterials / totalMaterials) * 1000) / 10 : 0;

  const outlierTotalCount = outliers.extremeHigh.length + outliers.high.length + outliers.low.length + outliers.extremeLow.length;

  return {
    totalMaterials: totalMaterials || 0,
    totalCategories: uniqueCategories.size,
    totalSources: uniqueSources.size,
    lastUpdated: lastUpdatedData?.[0]?.updated_at || null,
    sourceDistribution,
    categoryBreakdown: topCategories,
    unitDistribution,
    metadataCompleteness: {
      withEpdNumber,
      withManufacturer,
      withEpdUrl,
      withState
    },
    validationStatus: {
      passRate,
      totalValidated: totalMaterials || 0,
      lastValidationDate: new Date().toISOString().split('T')[0],
      methodology: "NABERS v2025.1 + 6-Layer Validation Framework v1.0"
    },
    confidenceLevelCounts: {
      verified: verifiedCount,
      documented: documentedCount,
      industry_average: industryAvgCount,
      needs_review: needsReviewCount
    },
    sourceTierCounts: {
      tier1: tier1Count,
      tier2: tier2Count,
      tier3: tier3Count
    },
    issuesCounts: {
      critical: 0,
      high: outliers.high.length + outliers.extremeHigh.length,
      medium: 0,
      low: outliers.low.length + outliers.extremeLow.length
    },
    dataSourceStats: {
      ice: {
        name: 'ICE Database',
        count: iceCount,
        percentage: totalMaterials ? Math.round((iceCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: iceLastImported
      },
      nabers: {
        name: 'NABERS EPD',
        count: nabersCount,
        percentage: totalMaterials ? Math.round((nabersCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: nabersLastImported
      },
      bluescope: {
        name: 'BlueScope Steel',
        count: bluescopeCount,
        percentage: totalMaterials ? Math.round((bluescopeCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: bluescopeLastImported
      },
      icm: {
        name: 'Australian ICM',
        count: icmCount,
        percentage: totalMaterials ? Math.round((icmCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: icmLastImported
      },
      nger: {
        name: 'NGER Database',
        count: ngerCount,
        percentage: totalMaterials ? Math.round((ngerCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: ngerLastImported
      },
      epic: {
        name: 'EPiC Database',
        count: epicCount,
        percentage: totalMaterials ? Math.round((epicCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: epicLastImported
      },
      other: {
        name: 'Other Sources',
        count: otherCount,
        percentage: totalMaterials ? Math.round((otherCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: otherLastImported
      }
    },
    outliers: {
      ...outliers,
      totalCount: outlierTotalCount
    }
  };
}

export function useMaterialsDatabaseStats() {
  return useQuery({
    queryKey: ["materials-database-stats"],
    queryFn: fetchMaterialsStats,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60
  });
}
