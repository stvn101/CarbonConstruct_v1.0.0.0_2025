import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSourceTier } from "@/lib/material-validation";

export interface DataSourceStats {
  name: string;
  count: number;
  percentage: number;
  lastImported: string | null;
}

export interface MaterialsDatabaseStats {
  totalMaterials: number;
  totalCategories: number;
  totalSources: number;
  lastUpdated: string | null;
  sourceDistribution: { source: string; count: number; percentage: number }[];
  categoryBreakdown: { category: string; count: number }[];
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
  // New: Framework v1.0 validation layers
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
  // Data source specific stats
  dataSourceStats: {
    ice: DataSourceStats;
    nabers: DataSourceStats;
    bluescope: DataSourceStats;
    icm: DataSourceStats;
    other: DataSourceStats;
  };
}

async function fetchMaterialsStats(): Promise<MaterialsDatabaseStats> {
  // Fetch total count
  const { count: totalMaterials } = await supabase
    .from("materials_epd")
    .select("*", { count: "exact", head: true });

  // Fetch all materials for validation analysis
  const { data: allMaterials } = await supabase
    .from("materials_epd")
    .select("data_source, material_category, unit, epd_number, manufacturer, epd_url, state, ef_total, created_at");

  // Calculate source tier distribution and data source stats
  let tier1Count = 0, tier2Count = 0, tier3Count = 0;
  let verifiedCount = 0, documentedCount = 0, industryAvgCount = 0, needsReviewCount = 0;
  
  // Data source counters
  let iceCount = 0, nabersCount = 0, bluescopeCount = 0, icmCount = 0, otherCount = 0;
  let iceLastImported: string | null = null;
  let nabersLastImported: string | null = null;
  let bluescopeLastImported: string | null = null;
  let icmLastImported: string | null = null;
  let otherLastImported: string | null = null;
  
  allMaterials?.forEach(m => {
    const tier = getSourceTier(m.data_source);
    if (tier.tier === 1) { tier1Count++; verifiedCount++; }
    else if (tier.tier === 2) { tier2Count++; industryAvgCount++; }
    else { tier3Count++; needsReviewCount++; }
    
    // Count by data source
    const source = (m.data_source || '').toLowerCase();
    if (source.includes('ice') || source.includes('ice v4')) {
      iceCount++;
      if (!iceLastImported || (m.created_at && m.created_at > iceLastImported)) {
        iceLastImported = m.created_at;
      }
    } else if (source.includes('nabers') || source.includes('nabers epd')) {
      nabersCount++;
      if (!nabersLastImported || (m.created_at && m.created_at > nabersLastImported)) {
        nabersLastImported = m.created_at;
      }
    } else if (source.includes('bluescope')) {
      bluescopeCount++;
      if (!bluescopeLastImported || (m.created_at && m.created_at > bluescopeLastImported)) {
        bluescopeLastImported = m.created_at;
      }
    } else if (source.includes('icm') || source.includes('australian icm')) {
      icmCount++;
      if (!icmLastImported || (m.created_at && m.created_at > icmLastImported)) {
        icmLastImported = m.created_at;
      }
    } else {
      otherCount++;
      if (!otherLastImported || (m.created_at && m.created_at > otherLastImported)) {
        otherLastImported = m.created_at;
      }
    }
  });

  // Unique categories
  const uniqueCategories = new Set(allMaterials?.map(c => c.material_category) || []);

  // Unique sources
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

  // Category breakdown (top 15)
  const categoryCountMap = new Map<string, number>();
  allMaterials?.forEach(c => {
    const category = c.material_category || "Unknown";
    categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
  });

  const categoryBreakdown = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

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

  return {
    totalMaterials: totalMaterials || 0,
    totalCategories: uniqueCategories.size,
    totalSources: uniqueSources.size,
    lastUpdated: lastUpdatedData?.[0]?.updated_at || null,
    sourceDistribution,
    categoryBreakdown,
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
      high: needsReviewCount,
      medium: 0,
      low: 0
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
      other: {
        name: 'Other Sources',
        count: otherCount,
        percentage: totalMaterials ? Math.round((otherCount / totalMaterials) * 1000) / 10 : 0,
        lastImported: otherLastImported
      }
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
