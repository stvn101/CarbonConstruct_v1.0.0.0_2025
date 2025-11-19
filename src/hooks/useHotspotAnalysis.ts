import { useMemo } from 'react';
import { LCAMaterialData, LCACategoryBreakdown } from './useLCAMaterials';

export type HotspotSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface MaterialHotspot {
  material: LCAMaterialData;
  severity: HotspotSeverity;
  emissions: number;
  percentageOfTotal: number;
  stage: 'A1-A3' | 'A4' | 'A5';
  stageEmissions: number;
}

export interface CategoryHotspot {
  category: string;
  severity: HotspotSeverity;
  totalEmissions: number;
  percentageOfTotal: number;
  topStage: 'A1-A3' | 'A4' | 'A5';
  stageEmissions: number;
}

export const useHotspotAnalysis = (
  materials: LCAMaterialData[],
  categoryBreakdown: LCACategoryBreakdown[]
) => {
  const analysis = useMemo(() => {
    if (!materials.length) {
      return {
        materialHotspots: [],
        categoryHotspots: [],
        overallStats: {
          totalEmissions: 0,
          criticalCount: 0,
          highCount: 0,
          moderateCount: 0,
        }
      };
    }

    const totalEmissions = materials.reduce((sum, m) => sum + m.embodied_carbon_total, 0);

    // Analyze materials
    const materialHotspots: MaterialHotspot[] = materials
      .map(material => {
        const percentageOfTotal = (material.embodied_carbon_total / totalEmissions) * 100;
        
        // Find highest stage
        const stages = [
          { stage: 'A1-A3' as const, emissions: material.embodied_carbon_a1a3 },
          { stage: 'A4' as const, emissions: material.embodied_carbon_a4 },
          { stage: 'A5' as const, emissions: material.embodied_carbon_a5 },
        ];
        const topStage = stages.reduce((max, curr) => 
          curr.emissions > max.emissions ? curr : max
        );

        // Determine severity based on percentage of total
        let severity: HotspotSeverity;
        if (percentageOfTotal >= 15) severity = 'critical';
        else if (percentageOfTotal >= 10) severity = 'high';
        else if (percentageOfTotal >= 5) severity = 'moderate';
        else severity = 'low';

        return {
          material,
          severity,
          emissions: material.embodied_carbon_total,
          percentageOfTotal,
          stage: topStage.stage,
          stageEmissions: topStage.emissions,
        };
      })
      .filter(h => h.severity !== 'low')
      .sort((a, b) => b.emissions - a.emissions);

    // Analyze categories
    const categoryHotspots: CategoryHotspot[] = categoryBreakdown
      .map(cat => {
        const percentageOfTotal = (cat.total / totalEmissions) * 100;
        
        // Find highest stage
        const stages = [
          { stage: 'A1-A3' as const, emissions: cat.a1a3 },
          { stage: 'A4' as const, emissions: cat.a4 },
          { stage: 'A5' as const, emissions: cat.a5 },
        ];
        const topStage = stages.reduce((max, curr) => 
          curr.emissions > max.emissions ? curr : max
        );

        // Determine severity
        let severity: HotspotSeverity;
        if (percentageOfTotal >= 20) severity = 'critical';
        else if (percentageOfTotal >= 15) severity = 'high';
        else if (percentageOfTotal >= 10) severity = 'moderate';
        else severity = 'low';

        return {
          category: cat.category,
          severity,
          totalEmissions: cat.total,
          percentageOfTotal,
          topStage: topStage.stage,
          stageEmissions: topStage.emissions,
        };
      })
      .filter(h => h.severity !== 'low')
      .sort((a, b) => b.totalEmissions - a.totalEmissions);

    // Calculate stats
    const allHotspots = [...materialHotspots, ...categoryHotspots];
    const overallStats = {
      totalEmissions,
      criticalCount: allHotspots.filter(h => h.severity === 'critical').length,
      highCount: allHotspots.filter(h => h.severity === 'high').length,
      moderateCount: allHotspots.filter(h => h.severity === 'moderate').length,
    };

    return {
      materialHotspots,
      categoryHotspots,
      overallStats,
    };
  }, [materials, categoryBreakdown]);

  return analysis;
};

export const getSeverityColor = (severity: HotspotSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'hsl(0 85% 62%)'; // Red
    case 'high':
      return 'hsl(30 95% 58%)'; // Orange
    case 'moderate':
      return 'hsl(48 95% 55%)'; // Yellow
    case 'low':
      return 'hsl(142 70% 45%)'; // Green
  }
};

export const getSeverityLabel = (severity: HotspotSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
  }
};
