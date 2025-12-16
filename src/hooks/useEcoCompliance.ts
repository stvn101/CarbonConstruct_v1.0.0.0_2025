/**
 * ECO Platform Compliance Hook
 * Aggregates all ECO Platform compliance checks and generates reports
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { 
  EcoPlatformComplianceReport, 
  EcoPlatformMaterial, 
  EcoPlatformProject,
  ValidationResult,
  ModuleDCalculation,
  AustralianState
} from '@/lib/eco-platform-types';
import {
  validateProjectEcoCompliance,
  generateEcoComplianceReport,
  validateMaterialEcoCompliance,
  getGridFactor
} from '@/lib/eco-platform-validation';
import { supabase } from '@/integrations/supabase/client';

interface UseEcoComplianceOptions {
  enabled?: boolean;
  autoValidate?: boolean;
}

interface UseEcoComplianceReturn {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  complianceReport: EcoPlatformComplianceReport | null;
  validationResults: ValidationResult[];
  isLoading: boolean;
  error: string | null;
  validateMaterial: (material: EcoPlatformMaterial) => ValidationResult;
  refreshCompliance: () => Promise<void>;
  complianceScore: number;
  isFullyCompliant: boolean;
  gridFactor: number;
  gridFactorSource: string;
}

export function useEcoCompliance(
  options: UseEcoComplianceOptions = {}
): UseEcoComplianceReturn {
  const { enabled: initialEnabled = false, autoValidate = true } = options;
  const { currentProject } = useProject();
  
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [complianceReport, setComplianceReport] = useState<EcoPlatformComplianceReport | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get grid factor based on project location
  const projectState = useMemo(() => {
    if (!currentProject?.location) return 'NSW' as AustralianState;
    
    const location = currentProject.location.toUpperCase();
    const stateMap: Record<string, AustralianState> = {
      'NEW SOUTH WALES': 'NSW',
      'NSW': 'NSW',
      'VICTORIA': 'VIC',
      'VIC': 'VIC',
      'QUEENSLAND': 'QLD',
      'QLD': 'QLD',
      'SOUTH AUSTRALIA': 'SA',
      'SA': 'SA',
      'WESTERN AUSTRALIA': 'WA',
      'WA': 'WA',
      'TASMANIA': 'TAS',
      'TAS': 'TAS',
      'NORTHERN TERRITORY': 'NT',
      'NT': 'NT',
      'AUSTRALIAN CAPITAL TERRITORY': 'ACT',
      'ACT': 'ACT',
      'SYDNEY': 'NSW',
      'MELBOURNE': 'VIC',
      'BRISBANE': 'QLD',
      'PERTH': 'WA',
      'ADELAIDE': 'SA',
      'HOBART': 'TAS',
      'DARWIN': 'NT',
      'CANBERRA': 'ACT'
    };
    
    for (const [key, state] of Object.entries(stateMap)) {
      if (location.includes(key)) {
        return state;
      }
    }
    
    return 'NSW' as AustralianState;
  }, [currentProject?.location]);

  const gridFactor = useMemo(() => getGridFactor(projectState), [projectState]);
  const gridFactorSource = `Australian National Greenhouse Accounts 2024 (${projectState})`;

  // Convert database material to EcoPlatformMaterial
  const convertToEcoPlatformMaterial = useCallback((dbMaterial: Record<string, unknown>): EcoPlatformMaterial => {
    return {
      id: String(dbMaterial.id || ''),
      materialName: String(dbMaterial.material_name || ''),
      materialCategory: String(dbMaterial.material_category || ''),
      characterisationFactorVersion: (dbMaterial.characterisation_factor_version as 'JRC-EF-3.0' | 'JRC-EF-3.1' | 'other') || 'JRC-EF-3.1',
      allocationMethod: (dbMaterial.allocation_method as 'economic' | 'physical' | 'system-expansion' | 'unknown') || null,
      isCoProduct: Boolean(dbMaterial.is_co_product),
      coProductType: dbMaterial.co_product_type as EcoPlatformMaterial['coProductType'] || null,
      usesMassBalance: Boolean(dbMaterial.uses_mass_balance),
      biogenicCarbonKgC: dbMaterial.biogenic_carbon_kg_c as number | null,
      biogenicCarbonPercentage: dbMaterial.biogenic_carbon_percentage as number | null,
      manufacturingCountry: dbMaterial.manufacturing_country as string | null,
      manufacturingCity: dbMaterial.manufacturing_city as string | null,
      ecoinventMethodology: dbMaterial.ecoinvent_methodology as EcoPlatformMaterial['ecoinventMethodology'] || null,
      ecoPlatformCompliant: dbMaterial.eco_platform_compliant !== false,
      dataQualityRating: dbMaterial.data_quality_rating as EcoPlatformMaterial['dataQualityRating'] || null,
      referenceYear: dbMaterial.reference_year as number | null,
      dataRepresentativeness: dbMaterial.data_representativeness as EcoPlatformMaterial['dataRepresentativeness'] || null
    };
  }, []);

  // Convert project to EcoPlatformProject
  const convertToEcoPlatformProject = useCallback((dbProject: Record<string, unknown>): EcoPlatformProject => {
    return {
      id: String(dbProject.id || ''),
      name: String(dbProject.name || ''),
      electricityPercentageA1A3: dbProject.electricity_percentage_a1a3 as number | null,
      electricityModellingApproach: (dbProject.electricity_modelling_approach as 'market-based' | 'location-based') || 'location-based',
      gridFactorSource: dbProject.grid_factor_source as string | null,
      ecoComplianceEnabled: Boolean(dbProject.eco_compliance_enabled),
      ecoComplianceReport: dbProject.eco_compliance_report as EcoPlatformComplianceReport | null
    };
  }, []);

  // Validate a single material
  const validateMaterial = useCallback((material: EcoPlatformMaterial): ValidationResult => {
    return validateMaterialEcoCompliance(material);
  }, []);

  // Refresh compliance data
  const refreshCompliance = useCallback(async () => {
    if (!currentProject?.id || !isEnabled) {
      setComplianceReport(null);
      setValidationResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch project materials from unified_calculations
      const { data: calculations, error: calcError } = await supabase
        .from('unified_calculations')
        .select('materials')
        .eq('project_id', currentProject.id)
        .maybeSingle();

      if (calcError) throw calcError;

      // Parse materials from calculations
      const rawMaterials = calculations?.materials;
      const materialsArray: Record<string, unknown>[] = [];
      if (Array.isArray(rawMaterials)) {
        for (const m of rawMaterials) {
          if (m !== null && typeof m === 'object' && !Array.isArray(m)) {
            materialsArray.push(m as Record<string, unknown>);
          }
        }
      }
      const materials: EcoPlatformMaterial[] = materialsArray.map((m) => convertToEcoPlatformMaterial(m));

      // Convert current project
      const projectRecord = currentProject as unknown as Record<string, unknown>;
      const ecoProject = convertToEcoPlatformProject({
        ...projectRecord,
        electricity_percentage_a1a3: projectRecord.electricity_percentage_a1a3,
        electricity_modelling_approach: projectRecord.electricity_modelling_approach,
        grid_factor_source: projectRecord.grid_factor_source,
        eco_compliance_enabled: projectRecord.eco_compliance_enabled,
        eco_compliance_report: projectRecord.eco_compliance_report
      });

      // Get Module D data from localStorage
      const storedModuleD = localStorage.getItem('carbonconstruct_module_d');
      let moduleD: ModuleDCalculation | undefined;
      
      if (storedModuleD) {
        try {
          const parsed = JSON.parse(storedModuleD);
          moduleD = {
            recyclingCredits: parsed.recycling_credits || 0,
            reuseCredits: parsed.reuse_credits || 0,
            energyRecoveryCredits: parsed.energy_recovery_credits || 0,
            totalModuleD: parsed.total || 0,
            includesMultiRecycling: false, // We don't support multi-recycling
            calculationMethod: 'cut-off-100-0'
          };
        } catch {
          // Ignore parse errors
        }
      }

      // Generate compliance report
      const report = generateEcoComplianceReport(ecoProject, materials, moduleD);
      setComplianceReport(report);

      // Collect all validation results
      const results: ValidationResult[] = materials.map(m => validateMaterialEcoCompliance(m));
      results.push(validateProjectEcoCompliance(ecoProject, materials, moduleD));
      setValidationResults(results);

    } catch (err) {
      console.error('Error refreshing ECO Platform compliance:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate compliance');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, isEnabled, convertToEcoPlatformMaterial, convertToEcoPlatformProject]);

  // Auto-validate when enabled or project changes
  useEffect(() => {
    if (autoValidate && isEnabled) {
      refreshCompliance();
    }
  }, [autoValidate, isEnabled, currentProject?.id, refreshCompliance]);

  // Save enabled state to project
  useEffect(() => {
    const projectRecord = currentProject as unknown as Record<string, unknown>;
    if (currentProject?.id && isEnabled !== projectRecord?.eco_compliance_enabled) {
      supabase
        .from('projects')
        .update({ eco_compliance_enabled: isEnabled })
        .eq('id', currentProject.id)
        .then(({ error: updateError }) => {
          if (updateError) console.error('Error saving ECO compliance state:', updateError);
        });
    }
  }, [isEnabled, currentProject]);

  const complianceScore = complianceReport?.complianceValidation.complianceScore ?? 0;
  const isFullyCompliant = complianceReport?.complianceValidation.isFullyCompliant ?? false;

  return {
    isEnabled,
    setEnabled: setIsEnabled,
    complianceReport,
    validationResults,
    isLoading,
    error,
    validateMaterial,
    refreshCompliance,
    complianceScore,
    isFullyCompliant,
    gridFactor,
    gridFactorSource
  };
}
