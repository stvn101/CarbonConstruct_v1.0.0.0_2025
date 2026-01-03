import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Material {
  id: string;
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
}

interface RecommendedMaterial {
  id: string;
  material_name: string;
  material_category: string;
  subcategory: string | null;
  manufacturer: string | null;
  plant_location: string | null;
  region: string | null;
  state: string | null;
  unit: string;
  ef_a1a3: number;
  ef_a4: number;
  ef_a5: number;
  ef_b1b5: number;
  ef_c1c4: number;
  ef_d: number;
  ef_total: number;
  epd_number: string;
  epd_url: string;
  data_quality_tier: string;
  eco_platform_compliant: boolean;
  carbon_savings: number;
  carbon_savings_percent: number;
  ai_score: number;
  cost_impact?: number;
}

interface RecommendationResponse {
  recommendations: RecommendedMaterial[];
  reasoning: {
    current_carbon: number;
    best_alternative_carbon: number;
    max_savings_percent: number;
    category: string;
  };
}

// Terms that indicate end-of-life/disposal materials - not valid construction alternatives
const EXCLUDED_TERMS = ['disposal', 'recycling', 'waste', 'landfill', 'sorting plant', 'incineration', 'end of life', 'eol', 'demolition waste'];

// Calculate functional relevance between current material and alternative
function getFunctionalRelevanceScore(
  currentName: string,
  altName: string,
  currentSub: string | null,
  altSub: string | null
): number {
  let score = 0.5; // Base score
  
  // Subcategory match is a strong signal
  if (currentSub && altSub && currentSub.toLowerCase() === altSub.toLowerCase()) {
    score = 1.0;
  }
  
  // Name similarity (simple keyword matching)
  const currentWords = currentName.toLowerCase().split(/[\s,()_-]+/);
  const altWords = altName.toLowerCase().split(/[\s,()_-]+/);
  const significantWords = currentWords.filter(w => w.length > 3);
  const commonWords = significantWords.filter(w => altWords.includes(w));
  score += (commonWords.length * 0.15);
  
  return Math.min(score, 1.0);
}

export function useMaterialRecommendations(currentMaterial: Material | null) {
  return useQuery({
    queryKey: ['material-recommendations', currentMaterial?.id],
    queryFn: async (): Promise<RecommendationResponse> => {
      if (!currentMaterial) {
        throw new Error('No material provided for recommendations');
      }

      try {
        // Query materials in the same category WITH same unit and lower carbon footprint
        const { data: alternatives, error } = await supabase
          .from('materials_epd')
          .select('*')
          .eq('material_category', currentMaterial.material_category)
          .eq('unit', currentMaterial.unit) // Must match unit for functional equivalence
          .lt('ef_total', currentMaterial.ef_total)
          .order('ef_total', { ascending: true })
          .limit(50); // Get more to filter further

        if (error) throw error;

        // Filter out disposal/end-of-life materials - these are never valid alternatives
        const relevantAlternatives = (alternatives || []).filter(alt => {
          const nameLower = alt.material_name.toLowerCase();
          return !EXCLUDED_TERMS.some(term => nameLower.includes(term));
        });

        if (relevantAlternatives.length === 0) {
          return {
            recommendations: [],
            reasoning: {
              current_carbon: currentMaterial.ef_total,
              best_alternative_carbon: currentMaterial.ef_total,
              max_savings_percent: 0,
              category: currentMaterial.material_category,
            },
          };
        }

        // Apply AI scoring algorithm with functional relevance
        const scoredAlternatives = relevantAlternatives.map(alt => {
          const altEfTotal = alt.ef_total ?? 0;
          const carbonSavings = currentMaterial.ef_total - altEfTotal;
          const carbonSavingsPercent = (carbonSavings / currentMaterial.ef_total) * 100;

          // Functional relevance score - prioritize materials that serve similar purpose
          const functionalScore = getFunctionalRelevanceScore(
            currentMaterial.material_name,
            alt.material_name,
            null, // Current material doesn't have subcategory in interface
            alt.subcategory
          ) * 20; // 20% weight

          // AI Scoring Algorithm (weighted factors - adjusted for functional relevance)
          const carbonScore = Math.min(carbonSavingsPercent / 50, 1) * 30; // 30% weight (reduced from 40%)
          const dataQualityScore = getDataQualityScore(alt.data_quality_tier ?? 'tier_3') * 15; // 15% weight
          const ecoComplianceScore = alt.eco_platform_compliant ? 15 : 0; // 15% weight
          const regionalScore = getRegionalScore(alt.state) * 10; // 10% weight (Australian preference)
          const manufacturerScore = alt.manufacturer ? 10 : 5; // 10% weight (verified manufacturer)

          const aiScore =
            functionalScore +
            carbonScore +
            dataQualityScore +
            ecoComplianceScore +
            regionalScore +
            manufacturerScore;

          // Estimate cost impact (simplified - negative means cost savings)
          const costImpact = estimateCostImpact(alt.data_quality_tier ?? 'tier_3', carbonSavingsPercent);

          return {
            id: alt.id,
            material_name: alt.material_name,
            material_category: alt.material_category,
            subcategory: alt.subcategory,
            manufacturer: alt.manufacturer,
            plant_location: alt.plant_location,
            region: alt.region,
            state: alt.state,
            unit: alt.unit,
            ef_a1a3: alt.ef_a1a3 ?? 0,
            ef_a4: alt.ef_a4 ?? 0,
            ef_a5: alt.ef_a5 ?? 0,
            ef_b1b5: alt.ef_b1b5 ?? 0,
            ef_c1c4: alt.ef_c1c4 ?? 0,
            ef_d: alt.ef_d ?? 0,
            ef_total: altEfTotal,
            epd_number: alt.epd_number ?? '',
            epd_url: alt.epd_url ?? '',
            data_quality_tier: alt.data_quality_tier ?? 'tier_3',
            eco_platform_compliant: alt.eco_platform_compliant ?? false,
            carbon_savings: carbonSavings,
            carbon_savings_percent: carbonSavingsPercent,
            ai_score: Math.round(aiScore * 10) / 10, // Round to 1 decimal
            cost_impact: costImpact,
          };
        });

        // Sort by AI score and take top 5
        const topRecommendations = scoredAlternatives
          .sort((a, b) => b.ai_score - a.ai_score)
          .slice(0, 5);

        const reasoning = {
          current_carbon: currentMaterial.ef_total,
          best_alternative_carbon: topRecommendations[0]?.ef_total || currentMaterial.ef_total,
          max_savings_percent: topRecommendations[0]?.carbon_savings_percent || 0,
          category: currentMaterial.material_category,
        };

        logger.info('useMaterialRecommendations:queryFn', 
          `materialId: ${currentMaterial.id}, category: ${currentMaterial.material_category}, foundAlternatives: ${alternatives.length}, topRecommendations: ${topRecommendations.length}`
        );

        return {
          recommendations: topRecommendations,
          reasoning,
        };
      } catch (error) {
        logger.error('useMaterialRecommendations:queryFn', error);
        throw error;
      }
    },
    enabled: !!currentMaterial,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Helper: Data quality score (0-1)
function getDataQualityScore(tier: string): number {
  const tierMap: Record<string, number> = {
    'tier_1': 1.0,
    'tier_2': 0.8,
    'tier_3': 0.6,
    'tier_4': 0.4,
  };
  return tierMap[tier.toLowerCase()] || 0.5;
}

// Helper: Regional preference score (0-1)
function getRegionalScore(state: string | null): number {
  if (!state) return 0.5;

  // Australian states get higher scores
  const australianStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
  if (australianStates.includes(state.toUpperCase())) {
    return 1.0;
  }
  return 0.3;
}

// Helper: Estimate cost impact based on carbon savings
function estimateCostImpact(tier: string, savingsPercent: number): number {
  // Higher quality data typically means more expensive materials
  const tierCostFactor = tier === 'tier_1' ? 1.2 : tier === 'tier_2' ? 1.0 : 0.8;

  // Large carbon savings often correlate with material substitution costs
  // Positive = cost increase, Negative = cost savings
  const baseCostImpact = (savingsPercent / 100) * 15; // Rough estimate: 15% cost change per 100% carbon savings

  return Math.round(baseCostImpact * tierCostFactor * 10) / 10; // Round to 1 decimal
}
