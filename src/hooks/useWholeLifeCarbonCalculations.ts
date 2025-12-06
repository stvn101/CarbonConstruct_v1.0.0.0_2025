import { useEffect, useMemo } from 'react';
import { UsePhaseEmissions } from '@/components/calculator/UsePhaseCalculator';
import { EndOfLifeEmissions } from '@/components/calculator/EndOfLifeCalculator';
import { ModuleDEmissions } from '@/components/calculator/ModuleDCalculator';

export interface WholeLifeCarbonTotals {
  // Upfront (Product & Construction)
  a1a3_product: number;      // Raw materials + manufacturing
  a4_transport: number;       // Transport to site
  a5_construction: number;    // On-site construction
  
  // Use Phase
  b1_use: number;             // In-use emissions (refrigerants)
  b2_maintenance: number;     // Maintenance
  b3_repair: number;          // Repairs
  b4_replacement: number;     // Component replacement
  b5_refurbishment: number;   // Refurbishment
  b6_operational_energy: number; // Operational energy
  b7_operational_water: number;  // Operational water
  
  // End of Life
  c1_deconstruction: number;  // Deconstruction/demolition
  c2_transport: number;       // Transport to disposal
  c3_waste_processing: number; // Waste processing
  c4_disposal: number;        // Disposal
  
  // Beyond Lifecycle
  d_recycling: number;        // Recycling credits (negative)
  d_reuse: number;            // Reuse credits (negative)
  d_energy_recovery: number;  // Energy recovery credits (negative)
  
  // Aggregates
  total_upfront: number;      // A1-A5
  total_embodied: number;     // A1-A5 + B1-B5 + C1-C4
  total_operational: number;  // B6-B7
  total_whole_life: number;   // A1-A5 + B1-B7 + C1-C4
  total_with_benefits: number; // A1-A5 + B1-B7 + C1-C4 + D
  
  // Per m² intensity (if buildingSqm provided)
  intensity_upfront?: number;
  intensity_whole_life?: number;
  intensity_with_benefits?: number;
}

interface UseWholeLifeCarbonProps {
  // A1-A5 emissions (from main calculator)
  upfrontEmissions: {
    a1a3: number; // Materials
    a4: number;   // Transport
    a5: number;   // Construction
  };
  // B1-B7 emissions (from UsePhaseCalculator)
  usePhaseEmissions?: UsePhaseEmissions | null;
  // C1-C4 emissions (from EndOfLifeCalculator)
  endOfLifeEmissions?: EndOfLifeEmissions | null;
  // Module D credits (from ModuleDCalculator)
  moduleDCredits?: ModuleDEmissions | null;
  // Building size for intensity calculations
  buildingSqm?: number;
}

const STORAGE_KEY = 'wholeLifeCarbonTotals';

export const useWholeLifeCarbonCalculations = ({
  upfrontEmissions,
  usePhaseEmissions,
  endOfLifeEmissions,
  moduleDCredits,
  buildingSqm
}: UseWholeLifeCarbonProps): WholeLifeCarbonTotals => {
  
  const totals = useMemo(() => {
    // Upfront (A1-A5)
    const a1a3 = upfrontEmissions.a1a3 || 0;
    const a4 = upfrontEmissions.a4 || 0;
    const a5 = upfrontEmissions.a5 || 0;
    
    // Use Phase (B1-B7)
    const b1 = usePhaseEmissions?.b1_use || 0;
    const b2 = usePhaseEmissions?.b2_maintenance || 0;
    const b3 = usePhaseEmissions?.b3_repair || 0;
    const b4 = usePhaseEmissions?.b4_replacement || 0;
    const b5 = usePhaseEmissions?.b5_refurbishment || 0;
    const b6 = usePhaseEmissions?.b6_operational_energy || 0;
    const b7 = usePhaseEmissions?.b7_operational_water || 0;
    
    // End of Life (C1-C4)
    const c1 = endOfLifeEmissions?.c1_deconstruction || 0;
    const c2 = endOfLifeEmissions?.c2_transport || 0;
    const c3 = endOfLifeEmissions?.c3_waste_processing || 0;
    const c4 = endOfLifeEmissions?.c4_disposal || 0;
    
    // Module D (credits - negative values)
    const dRecycling = moduleDCredits?.recycling_credits || 0;
    const dReuse = moduleDCredits?.reuse_credits || 0;
    const dEnergy = moduleDCredits?.energy_recovery_credits || 0;
    
    // Calculate aggregates
    const totalUpfront = a1a3 + a4 + a5;
    const totalUseEmbodied = b1 + b2 + b3 + b4 + b5;
    const totalOperational = b6 + b7;
    const totalEndOfLife = c1 + c2 + c3 + c4;
    const totalModuleD = dRecycling + dReuse + dEnergy;
    
    const totalEmbodied = totalUpfront + totalUseEmbodied + totalEndOfLife;
    const totalWholeLife = totalEmbodied + totalOperational;
    const totalWithBenefits = totalWholeLife + totalModuleD;
    
    // Calculate intensity if building size available
    const sqm = buildingSqm || 0;
    
    const result: WholeLifeCarbonTotals = {
      a1a3_product: a1a3,
      a4_transport: a4,
      a5_construction: a5,
      
      b1_use: b1,
      b2_maintenance: b2,
      b3_repair: b3,
      b4_replacement: b4,
      b5_refurbishment: b5,
      b6_operational_energy: b6,
      b7_operational_water: b7,
      
      c1_deconstruction: c1,
      c2_transport: c2,
      c3_waste_processing: c3,
      c4_disposal: c4,
      
      d_recycling: dRecycling,
      d_reuse: dReuse,
      d_energy_recovery: dEnergy,
      
      total_upfront: totalUpfront,
      total_embodied: totalEmbodied,
      total_operational: totalOperational,
      total_whole_life: totalWholeLife,
      total_with_benefits: totalWithBenefits,
      
      ...(sqm > 0 && {
        intensity_upfront: totalUpfront / sqm,
        intensity_whole_life: totalWholeLife / sqm,
        intensity_with_benefits: totalWithBenefits / sqm,
      })
    };
    
    return result;
  }, [upfrontEmissions, usePhaseEmissions, endOfLifeEmissions, moduleDCredits, buildingSqm]);

  // Persist totals for use in reports
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(totals));
  }, [totals]);

  return totals;
};

// Helper function to load stored totals (for reports page)
export const loadStoredWholeLifeTotals = (): WholeLifeCarbonTotals | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
