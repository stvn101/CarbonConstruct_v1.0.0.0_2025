import * as React from "react";
import * as XLSX from 'xlsx';
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { useEcoCompliance } from "@/hooks/useEcoCompliance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Eraser, Leaf, CloudUpload, Upload, Sparkles, Search, X, Database, Clock, Scale, Crown, ChevronDown, ChevronRight, Lock, Download, FileSpreadsheet, Cloud, CloudOff, FileUp, FileDown, CheckCircle, History, RotateCcw, FileJson, Hash } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { FUEL_FACTORS, STATE_ELEC_FACTORS, COMMUTE_FACTORS, WASTE_FACTORS, A5_EQUIPMENT_FACTORS } from "@/lib/emission-factors";
import { MaterialSchema } from "@/lib/validation-schemas";
import { SEOHead } from "@/components/SEOHead";
import { useEPDMaterials, EPDMaterial } from "@/hooks/useEPDMaterials";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavoriteMaterials } from "@/hooks/useFavoriteMaterials";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialCategoryBrowser } from "@/components/calculator/MaterialCategoryBrowser";
import { MaterialSearchResults } from "@/components/calculator/MaterialSearchResults";
import { MaterialRowImproved } from "@/components/calculator/MaterialRowImproved";
import { QuickAddPanel } from "@/components/calculator/QuickAddPanel";
import { TransportCalculator } from "@/components/calculator/TransportCalculator";
import { MaterialRecommender } from "@/components/calculator/MaterialRecommender";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MaterialComparison } from "@/components/MaterialComparison";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UsePhaseCalculator, UsePhaseEmissions } from "@/components/calculator/UsePhaseCalculator";
import { EndOfLifeCalculator, EndOfLifeEmissions } from "@/components/calculator/EndOfLifeCalculator";
import { ModuleDCalculator, ModuleDEmissions } from "@/components/calculator/ModuleDCalculator";
import { EcoComplianceToggle } from "@/components/EcoComplianceToggle";
import { EcoCompliancePanel } from "@/components/EcoCompliancePanel";
import { SkeletonPage } from "@/components/SkeletonPage";
import { useEPDRenewalReminders } from "@/hooks/useEPDRenewalReminders";
import { EPDRenewalReminders } from "@/components/calculator/EPDRenewalReminders";
import { EPDWorkflowDashboardWidget } from "@/components/calculator/EPDWorkflowDashboardWidget";
import { CalculatorReportSection } from "@/components/calculator/CalculatorReportSection";

interface Material {
  id: string;
  category: string;
  typeId: string;
  name: string;
  unit: string;
  factor: number;
  source: string;
  quantity: number;
  isCustom: boolean;
  sequestration?: number; // kgCO2 stored per unit for timber
  // EPD Traceability fields
  epdNumber?: string;
  epdUrl?: string;
  manufacturer?: string;
  plantLocation?: string;
  dataQualityTier?: string;
  year?: number;
  publishDate?: string;
  expiryDate?: string;
  // Lifecycle module breakdown (kgCO2e per unit)
  ef_a1a3?: number;
  ef_a4?: number;
  ef_a5?: number;
  ef_b1b5?: number;
  ef_c1c4?: number;
  ef_d?: number;
  // ECO Platform compliance fields
  manufacturing_country?: string;
  manufacturing_city?: string;
  characterisation_factor_version?: string;
  allocation_method?: string;
  is_co_product?: boolean;
  co_product_type?: string;
  uses_mass_balance?: boolean;
  biogenic_carbon_kg_c?: number;
  biogenic_carbon_percentage?: number;
  ecoinvent_methodology?: string;
  eco_platform_compliant?: boolean;
  data_quality_rating?: string;
}

const loadFromStorage = (key: string, fallback: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Mobile-optimized MaterialRow - card layout on mobile
const MaterialRow = ({ material, onChange, onRemove }: { 
  material: Material; 
  onChange: (m: Material) => void; 
  onRemove: () => void;
}) => {
  return (
    <div className={`rounded-lg border p-3 mb-2 ${
      material.isCustom ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' : 'hover:bg-muted/50'
    }`}>
      {/* Header: name and delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {material.isCustom ? (
            <Input 
              className="h-8 text-sm text-foreground bg-background"
              placeholder="Material Name"
              value={material.name}
              onChange={(e) => onChange({ ...material, name: e.target.value })}
            />
          ) : (
            <div>
              <div className="font-medium text-sm break-words">{material.name}</div>
              <div className="text-xs text-muted-foreground">{material.source}</div>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Data: quantity, factor, result - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
          <div className="relative">
            <Input 
              type="number" 
              min="0"
              step="any"
              className="h-9 pr-10 text-sm text-foreground bg-background"
              placeholder="0"
              value={material.quantity || ''} 
              onChange={(e) => onChange({ ...material, quantity: parseFloat(e.target.value) || 0 })}
            />
            {material.isCustom ? (
              <Input 
                className="absolute right-1 top-1 bottom-1 w-10 text-xs text-foreground bg-background h-7 border-l text-center"
                placeholder="unit"
                value={material.unit}
                onChange={(e) => onChange({ ...material, unit: e.target.value })}
              />
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{material.unit}</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Factor</label>
          {material.isCustom ? (
            <Input 
              type="number" 
              step="0.01"
              className="h-9 text-sm text-foreground"
              placeholder="kgCO2"
              value={material.factor || ''} 
              onChange={(e) => onChange({ ...material, factor: parseFloat(e.target.value) || 0 })}
            />
          ) : (
            <div className="h-9 flex items-center px-2 bg-muted/50 rounded-md border text-xs font-mono text-muted-foreground">
              × {material.factor}
            </div>
          )}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-muted-foreground mb-1 block">Emissions</label>
          <div className="h-9 flex items-center justify-center px-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md font-bold text-emerald-700 dark:text-emerald-300 text-sm">
            {((material.quantity * material.factor) / 1000).toFixed(3)} t
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized FactorRow - stacks on mobile, grid on desktop
const FactorRow = ({ label, unit, value, onChange, factor, total }: {
  label: string;
  unit: string;
  value: string | number;
  onChange: (v: string) => void;
  factor: number;
  total: number;
}) => (
  <div className="py-2.5 md:py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
    <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2">
      <div className="md:col-span-5 font-medium text-sm">{label}</div>
      <div className="flex items-center gap-2 md:col-span-3">
        <div className="relative flex-1 md:flex-none md:w-full">
          <Input 
            type="number"
            min="0"
            step="any"
            className="h-9 pr-12 text-sm text-foreground"
            placeholder="0"
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{unit}</span>
        </div>
        {/* Mobile: show factor and total inline */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">× {factor}</span>
          <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">{(total / 1000).toFixed(3)} t</span>
        </div>
      </div>
      {/* Desktop-only columns */}
      <div className="hidden md:block md:col-span-2 text-xs text-muted-foreground text-right font-mono">× {factor}</div>
      <div className="hidden md:block md:col-span-2 text-right font-bold text-emerald-600 text-sm">{(total / 1000).toFixed(3)} t</div>
    </div>
  </div>
);

export default function Calculator() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { canPerformAction } = useUsageTracking();
  useSubscriptionStatus();
  const { currentTier } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Material Recommender state
  const [recommenderOpen, setRecommenderOpen] = useState(false);
  const [selectedMaterialForRecommendations, setSelectedMaterialForRecommendations] = useState<Material | null>(null);

  // ECO Platform Compliance
  const { 
    isEnabled: ecoComplianceEnabled, 
    setEnabled: setEcoComplianceEnabled, 
    complianceReport, 
    isLoading: complianceLoading,
    refreshCompliance
  } = useEcoCompliance();
  
  // Feature access checks based on subscription tier
  // Admin users always have full access regardless of tier limits
  const { is_admin: isAdmin } = useSubscriptionStatus();
  const canAccessEN15978 = isAdmin || (currentTier?.limits?.en15978_calculators ?? false);
  const canAccessMaterialComparer = isAdmin || (currentTier?.limits?.material_comparer ?? false);
  
  // Fetch materials from EPD database (Supabase materials_epd table)
  const { 
    materials: dbMaterials, 
    loading: materialsLoading, 
    error: materialsError, 
    states, 
    dataSources, 
    refetch: refetchMaterials,
    hideExpiredEPDs,
    setHideExpiredEPDs
  } = useEPDMaterials();
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [useNewMaterialUI] = useState(() => {
    try {
      const stored = localStorage.getItem('useNewMaterialUI');
      return stored === null ? true : stored === 'true'; // Default to true if not set
    } catch {
      return true;
    }
  });
  
  // Favorite materials for quick-add
  const { quickAddMaterials, recentlyUsedMaterials, trackMaterialUsage, hideMaterial, clearAllFavorites, syncWithDatabase, cloudSyncEnabled, isSyncing, lastSyncTime, saveToCloud } = useFavoriteMaterials();
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  // Import history state
  interface ImportHistoryEntry {
    id: string;
    fileName: string;
    importedAt: Date;
    materialCount: number;
    materials: { name: string; quantity: number; unit: string; factor: number; category: string }[];
  }
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem('carbonConstruct_importHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((h: any) => ({ ...h, importedAt: new Date(h.importedAt) }));
      }
    } catch {}
    return [];
  });
  const [showImportHistory, setShowImportHistory] = useState(false);

  // Persist import history
  useEffect(() => {
    localStorage.setItem('carbonConstruct_importHistory', JSON.stringify(importHistory));
  }, [importHistory]);
  
  // Download sample CSV template
  const downloadCSVTemplate = () => {
    const template = `name,quantity,unit,factor,category
"Concrete 32MPa",100,m³,320,Concrete
"Steel Reinforcing",500,kg,1.99,Steel
"Timber Softwood",25,m³,718,Timber`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'material-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Template Downloaded", description: "Open in Excel or any spreadsheet app" });
  };

  // Format last sync time
  const formatSyncTime = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Re-import from history
  const reImportFromHistory = (entry: ImportHistoryEntry) => {
    const newMaterials: Material[] = entry.materials.map((m, i) => ({
      id: `reimport_${Date.now()}_${i}`,
      category: m.category,
      typeId: 'csv_import',
      name: m.name,
      unit: m.unit,
      factor: m.factor,
      source: 'CSV Import',
      quantity: m.quantity,
      isCustom: true,
    }));
    setSelectedMaterials(prev => [...prev, ...newMaterials]);
    toast({ 
      title: "Re-imported", 
      description: `Added ${newMaterials.length} materials from "${entry.fileName}"` 
    });
  };

  // Clear import history
  const clearImportHistory = () => {
    setImportHistory([]);
    toast({ title: "History Cleared" });
  };

  // Export import history as JSON
  const exportImportHistory = () => {
    if (importHistory.length === 0) {
      toast({ title: "No history to export", variant: "destructive" });
      return;
    }
    const data = JSON.stringify(importHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "History Exported", description: "JSON file downloaded" });
  };

  // Import history from JSON
  const jsonHistoryInputRef = useRef<HTMLInputElement>(null);
  const handleImportHistoryJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      const validated = parsed.map((entry: any) => ({
        id: entry.id || `imported_${Date.now()}_${Math.random()}`,
        fileName: entry.fileName || 'Unknown',
        importedAt: new Date(entry.importedAt),
        materialCount: entry.materialCount || entry.materials?.length || 0,
        materials: Array.isArray(entry.materials) ? entry.materials : [],
      }));
      setImportHistory(prev => [...validated, ...prev].slice(0, 20));
      toast({ title: "History Imported", description: `Loaded ${validated.length} entries` });
    } catch (err) {
      toast({ title: "Invalid JSON", description: "Could not parse import history file", variant: "destructive" });
    }
    if (jsonHistoryInputRef.current) jsonHistoryInputRef.current.value = '';
  };

  // EPD number search state
  const [epdSearch, setEpdSearch] = useState('');
  const epdSearchResults = useMemo(() => {
    if (epdSearch.trim().length < 3) return [];
    const searchLower = epdSearch.toLowerCase().trim();
    return dbMaterials
      .filter(m => m.epd_number?.toLowerCase().includes(searchLower))
      .slice(0, 20);
  }, [dbMaterials, epdSearch]);

  // Material comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  
  const toggleComparison = (id: string) => {
    setSelectedForComparison(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 5)
    );
  };

  const comparisonMaterials = useMemo(() => 
    dbMaterials.filter(m => selectedForComparison.includes(m.id)),
    [dbMaterials, selectedForComparison]
  );

  const addAllFromComparison = () => {
    comparisonMaterials.forEach(m => addMaterialFromDb(m.id));
    setSelectedForComparison([]);
    setComparisonMode(false);
    toast({ title: "Materials Added", description: `Added ${comparisonMaterials.length} materials to calculator` });
  };
  
  // Category counts for browser - using EPD database
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dbMaterials.forEach(m => {
      counts.set(m.material_category, (counts.get(m.material_category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }, [dbMaterials]);
  
  // Save UI preference
  useEffect(() => {
    localStorage.setItem('useNewMaterialUI', String(useNewMaterialUI));
  }, [useNewMaterialUI]);

  // Handle imported materials from BOQ Import
  useEffect(() => {
    const importedMaterials = location.state?.importedMaterials;

    if (importedMaterials && Array.isArray(importedMaterials)) {
      // Convert imported materials to calculator format
      const convertedMaterials = importedMaterials.map((material: any) => ({
        id: crypto.randomUUID(),
        category: material.category || 'Other',
        typeId: material.matched_epd_id || 'custom',
        name: material.material_name,
        unit: material.unit || 'kg',
        factor: material.ef_total || 0,
        source: material.matched_epd_id ? 'EPD Database' : 'BOQ Import',
        quantity: material.quantity || 0,
        isCustom: !material.matched_epd_id,
        ef_a1a3: material.ef_total || 0, // For now, assign total to A1-A3
        // Add other fields as needed
      }));

      // Add to existing materials
      setSelectedMaterials(prevMaterials => [...prevMaterials, ...convertedMaterials]);

      toast({
        title: "Materials Imported",
        description: `${importedMaterials.length} materials loaded from BOQ`,
      });

      // Clear location state to prevent re-import on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.importedMaterials, toast]);

  const [activeTab, setActiveTab] = useState<'inputs' | 'report'>('inputs');
  const [projectDetails, setProjectDetails] = useState(() => loadFromStorage('projectDetails', { 
    name: '', 
    location: 'NSW', 
    period: '', 
    auditor: '',
    buildingSqm: ''
  }));
  const [scope1Inputs, setScope1Inputs] = useState<Record<string, string>>(() => loadFromStorage('scope1Inputs', {}));
  const [scope2Inputs, setScope2Inputs] = useState<Record<string, string>>(() => loadFromStorage('scope2Inputs', {}));
  const [transportInputs, setTransportInputs] = useState<Record<string, string>>(() => loadFromStorage('transportInputs', {}));
  const [a4TransportEmissions, setA4TransportEmissions] = useState<number>(0); // From TransportCalculator component
  const [commuteInputs, setCommuteInputs] = useState<Record<string, string>>(() => loadFromStorage('commuteInputs', {}));
  const [wasteInputs, setWasteInputs] = useState<Record<string, { quantity: string; unit: 'kg' | 'tonne' }>>(() => loadFromStorage('wasteInputs', {}));
  const [a5Inputs, setA5Inputs] = useState<Record<string, string>>(() => loadFromStorage('a5Inputs', {}));
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>(() => loadFromStorage('selectedMaterials', []));
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // EN 15978 Lifecycle calculator states
  const [usePhaseOpen, setUsePhaseOpen] = useState(false);
  const [endOfLifeOpen, setEndOfLifeOpen] = useState(false);
  const [moduleDOpen, setModuleDOpen] = useState(false);
  const [usePhaseEmissions, setUsePhaseEmissions] = useState<UsePhaseEmissions | null>(null);
  const [endOfLifeEmissions, setEndOfLifeEmissions] = useState<EndOfLifeEmissions | null>(null);
  const [moduleDEmissions, setModuleDEmissions] = useState<ModuleDEmissions | null>(null);
  
  // Building size for lifecycle calculations
  const buildingSqm = parseFloat(projectDetails.buildingSqm) || 0;
  
  // EPD Renewal Reminders - track expiring materials in project
  const { 
    activeWarnings: epdExpiryWarnings, 
    summary: epdExpirySummary,
    dismissWarning: dismissEPDWarning,
    clearDismissedWarnings: clearDismissedEPDWarnings
  } = useEPDRenewalReminders({
    materials: selectedMaterials.map(m => ({
      id: m.id,
      name: m.name,
      expiryDate: m.expiryDate,
      epdNumber: m.epdNumber,
      manufacturer: m.manufacturer,
    })),
    showNotifications: true,
  });
  
  // Group database materials by category and filter by search/category/state
  const groupedMaterials = useMemo(() => {
    let filtered = [...dbMaterials];
    
    // Filter by selected state
    if (selectedState) {
      filtered = filtered.filter(m => m.state === selectedState);
    }
    
    // Filter by selected data source (ICE, NABERS, Bluescope, etc.)
    if (selectedDataSource) {
      filtered = filtered.filter(m => m.data_source === selectedDataSource);
    }
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(m => m.material_category === selectedCategory);
    }
    
    // Filter by search term - improved search logic
    if (materialSearch.trim().length >= 2) {
      const searchLower = materialSearch.toLowerCase().trim();
      // Split search into words for multi-word matching
      const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
      
      filtered = filtered.filter(m => {
        const nameL = m.material_name.toLowerCase();
        const catL = m.material_category.toLowerCase();
        const subL = m.subcategory?.toLowerCase() || '';
        const mfrL = m.manufacturer?.toLowerCase() || '';
        const locL = m.plant_location?.toLowerCase() || '';
        
        // All search words must match somewhere in the material
        return searchWords.every(word => 
          nameL.includes(word) ||
          catL.includes(word) ||
          subL.includes(word) ||
          mfrL.includes(word) ||
          locL.includes(word)
        );
      });
    }
    
    // For new UI, show results when category is selected OR search is active
    // For old UI, only show when search is active
    const shouldShow = useNewMaterialUI 
      ? (selectedCategory || materialSearch.trim().length >= 2 || selectedState || selectedDataSource)
      : materialSearch.trim().length >= 2;
    
    if (!shouldShow) return [];
    
    const groups = new Map<string, EPDMaterial[]>();
    filtered.forEach(mat => {
      const existing = groups.get(mat.material_category) || [];
      existing.push(mat);
      groups.set(mat.material_category, existing);
    });
    
    // Sort categories - no limit, show all matching results
    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cat, items]) => ({
        category: cat,
        items: items // Show all matching items, no limit
      }));
  }, [dbMaterials, materialSearch, selectedCategory, selectedState, selectedDataSource, useNewMaterialUI]);
  
  // Total count of filtered materials for display
  const filteredMaterialsCount = useMemo(() => 
    groupedMaterials.reduce((acc, g) => acc + g.items.length, 0), 
  [groupedMaterials]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('projectDetails', JSON.stringify(projectDetails));
    localStorage.setItem('scope1Inputs', JSON.stringify(scope1Inputs));
    localStorage.setItem('scope2Inputs', JSON.stringify(scope2Inputs));
    localStorage.setItem('transportInputs', JSON.stringify(transportInputs));
    localStorage.setItem('commuteInputs', JSON.stringify(commuteInputs));
    localStorage.setItem('wasteInputs', JSON.stringify(wasteInputs));
    localStorage.setItem('a5Inputs', JSON.stringify(a5Inputs));
    localStorage.setItem('selectedMaterials', JSON.stringify(selectedMaterials));
  }, [projectDetails, scope1Inputs, scope2Inputs, transportInputs, commuteInputs, wasteInputs, a5Inputs, selectedMaterials]);

  // Auto-validate ECO compliance when materials change (debounced)
  const materialsValidationTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (ecoComplianceEnabled && selectedMaterials.length > 0) {
      // Clear previous timer
      if (materialsValidationTimerRef.current) {
        clearTimeout(materialsValidationTimerRef.current);
      }
      // Set new debounced validation
      materialsValidationTimerRef.current = setTimeout(() => {
        refreshCompliance();
      }, 2000); // 2 second debounce
      
      return () => {
        if (materialsValidationTimerRef.current) {
          clearTimeout(materialsValidationTimerRef.current);
        }
      };
    }
  }, [selectedMaterials, ecoComplianceEnabled, refreshCompliance]);

  const calculations = useMemo(() => {
    let scope1 = 0, scope2 = 0, scope3_materials_gross = 0, scope3_sequestration = 0, scope3_transport = 0, scope3_commute = 0, scope3_waste = 0, scope3_a5 = 0;

    Object.entries(FUEL_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(scope1Inputs[k] || '0');
      scope1 += val * f.factor;
    });

    const s2Val = parseFloat(scope2Inputs.kwh || '0');
    const location = projectDetails.location || 'NSW';
    const s2Factor = STATE_ELEC_FACTORS[location as keyof typeof STATE_ELEC_FACTORS]?.factor || 0.66;
    scope2 = s2Val * s2Factor;

    selectedMaterials.forEach(m => {
      scope3_materials_gross += m.quantity * m.factor;
      if (m.sequestration) {
        scope3_sequestration += m.quantity * m.sequestration;
      }
    });

    // A4 Transport emissions from TransportCalculator component
    scope3_transport = a4TransportEmissions;

    // Employee commute emissions
    Object.entries(COMMUTE_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(commuteInputs[k] || '0');
      scope3_commute += val * f.factor;
    });

    // Waste emissions (convert tonnes to kg if needed)
    Object.entries(WASTE_FACTORS).forEach(([k, f]) => {
      const input = wasteInputs[k];
      if (input) {
        const qty = parseFloat(input.quantity || '0');
        const multiplier = input.unit === 'tonne' ? 1000 : 1; // Convert tonnes to kg
        scope3_waste += qty * multiplier * f.factor;
      }
    });

    // A5 On-site construction emissions
    Object.entries(A5_EQUIPMENT_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(a5Inputs[k] || '0');
      scope3_a5 += val * f.factor;
    });

    const scope3_materials_net = scope3_materials_gross - scope3_sequestration;
    
    // Upfront carbon (A1-A5)
    const upfront = scope3_materials_net + scope3_transport + scope3_a5;
    
    // Use phase totals (B1-B7)
    const usePhaseTotal = usePhaseEmissions?.total || 0;
    
    // End of life totals (C1-C4)
    const endOfLifeTotal = endOfLifeEmissions?.total || 0;
    
    // Module D credits
    const moduleDTotal = moduleDEmissions?.total || 0;
    
    // Whole life carbon calculations
    const totalEmbodied = upfront + (usePhaseEmissions?.b2_maintenance || 0) + (usePhaseEmissions?.b3_repair || 0) + (usePhaseEmissions?.b4_replacement || 0) + (usePhaseEmissions?.b5_refurbishment || 0) + endOfLifeTotal;
    const totalOperational = (usePhaseEmissions?.b6_operational_energy || 0) + (usePhaseEmissions?.b7_operational_water || 0);
    const wholeLife = upfront + usePhaseTotal + endOfLifeTotal;
    const withBenefits = wholeLife - moduleDTotal;

    return { 
      scope1, 
      scope2, 
      scope3_materials: scope3_materials_net,
      scope3_materials_gross,
      scope3_sequestration,
      scope3_transport, 
      scope3_commute, 
      scope3_waste, 
      scope3_a5,
      total: scope1 + scope2 + scope3_materials_net + scope3_transport + scope3_commute + scope3_waste + scope3_a5,
      // EN 15978 lifecycle stages
      a1a3_product: scope3_materials_net,
      a4_transport: scope3_transport,
      a5_construction: scope3_a5,
      // Use phase (B1-B7)
      b1_use: usePhaseEmissions?.b1_use || 0,
      b2_maintenance: usePhaseEmissions?.b2_maintenance || 0,
      b3_repair: usePhaseEmissions?.b3_repair || 0,
      b4_replacement: usePhaseEmissions?.b4_replacement || 0,
      b5_refurbishment: usePhaseEmissions?.b5_refurbishment || 0,
      b6_operational_energy: usePhaseEmissions?.b6_operational_energy || 0,
      b7_operational_water: usePhaseEmissions?.b7_operational_water || 0,
      // End of life (C1-C4)
      c1_deconstruction: endOfLifeEmissions?.c1_deconstruction || 0,
      c2_transport: endOfLifeEmissions?.c2_transport || 0,
      c3_waste_processing: endOfLifeEmissions?.c3_waste_processing || 0,
      c4_disposal: endOfLifeEmissions?.c4_disposal || 0,
      // Module D
      d_recycling: moduleDEmissions?.recycling_credits || 0,
      d_reuse: moduleDEmissions?.reuse_credits || 0,
      d_energy_recovery: moduleDEmissions?.energy_recovery_credits || 0,
      // Aggregates
      total_upfront: upfront,
      total_embodied: totalEmbodied,
      total_operational: totalOperational,
      total_whole_life: wholeLife,
      total_with_benefits: withBenefits
    };
  }, [scope1Inputs, scope2Inputs, selectedMaterials, a4TransportEmissions, commuteInputs, wasteInputs, a5Inputs, projectDetails.location, usePhaseEmissions, endOfLifeEmissions, moduleDEmissions]);

  // Persist whole life carbon totals for Reports page
  useEffect(() => {
    const wholeLifeData = {
      a1a3_product: calculations.a1a3_product,
      a4_transport: calculations.a4_transport,
      a5_construction: calculations.a5_construction,
      b1_use: calculations.b1_use,
      b2_maintenance: calculations.b2_maintenance,
      b3_repair: calculations.b3_repair,
      b4_replacement: calculations.b4_replacement,
      b5_refurbishment: calculations.b5_refurbishment,
      b6_operational_energy: calculations.b6_operational_energy,
      b7_operational_water: calculations.b7_operational_water,
      c1_deconstruction: calculations.c1_deconstruction,
      c2_transport: calculations.c2_transport,
      c3_waste_processing: calculations.c3_waste_processing,
      c4_disposal: calculations.c4_disposal,
      d_recycling: calculations.d_recycling,
      d_reuse: calculations.d_reuse,
      d_energy_recovery: calculations.d_energy_recovery,
      total_upfront: calculations.total_upfront,
      total_embodied: calculations.total_embodied,
      total_operational: calculations.total_operational,
      total_whole_life: calculations.total_whole_life,
      total_with_benefits: calculations.total_with_benefits,
    };
    localStorage.setItem('wholeLifeCarbonTotals', JSON.stringify(wholeLifeData));
  }, [calculations]);

  const addMaterialFromDb = (materialId: string, factorType: 'process' | 'hybrid' = 'hybrid') => {
    const material = dbMaterials.find(m => m.id === materialId);
    if (!material) return;

    // Use ef_a1a3 for process, ef_total for hybrid (fallback to available value)
    const factor = factorType === 'process' 
      ? (material.ef_a1a3 ?? material.ef_total ?? 0) 
      : (material.ef_total ?? material.ef_a1a3 ?? 0);
    
    const methodLabel = factorType === 'process' ? ' (Process LCA)' : ' (Hybrid LCA)';

    const newItem: Material = {
      id: Date.now().toString() + Math.random(),
      category: material.material_category,
      typeId: material.id,
      name: material.material_name,
      unit: material.unit,
      factor: factor,
      source: material.data_source + methodLabel,
      quantity: 0,
      isCustom: false,
      sequestration: undefined, // EPD table doesn't have sequestration yet
      // EPD Traceability
      epdNumber: material.epd_number || undefined,
      epdUrl: material.epd_url || undefined,
      manufacturer: material.manufacturer || undefined,
      plantLocation: material.plant_location || undefined,
      dataQualityTier: material.data_quality_tier || undefined,
      year: material.year || undefined,
      // Lifecycle breakdown
      ef_a1a3: material.ef_a1a3 || undefined,
      ef_a4: material.ef_a4 || undefined,
      ef_a5: material.ef_a5 || undefined,
      ef_b1b5: material.ef_b1b5 || undefined,
      ef_c1c4: material.ef_c1c4 || undefined,
      ef_d: material.ef_d || undefined,
      // ECO Platform compliance fields
      manufacturing_country: material.manufacturing_country || material.region || 'Australia',
      manufacturing_city: material.manufacturing_city || material.plant_location || material.state || undefined,
      characterisation_factor_version: material.characterisation_factor_version || 'JRC-EF-3.1',
      allocation_method: material.allocation_method || undefined,
      is_co_product: material.is_co_product || false,
      co_product_type: material.co_product_type || undefined,
      uses_mass_balance: material.uses_mass_balance || false,
      biogenic_carbon_kg_c: material.biogenic_carbon_kg_c || undefined,
      biogenic_carbon_percentage: material.biogenic_carbon_percentage || undefined,
      ecoinvent_methodology: material.ecoinvent_methodology || undefined,
      eco_platform_compliant: material.eco_platform_compliant !== false,
      data_quality_rating: material.data_quality_rating || undefined,
    };
    setSelectedMaterials(prev => [...prev, newItem]);
    setMaterialSearch(''); // Clear search after adding
    
    // Track usage for quick-add with full EPD data
    trackMaterialUsage({
      id: material.id,
      name: material.material_name,
      category: material.material_category,
      unit: material.unit,
      factor: factor,
      source: material.data_source,
      // EPD Traceability
      epdNumber: material.epd_number || undefined,
      epdUrl: material.epd_url || undefined,
      manufacturer: material.manufacturer || undefined,
      plantLocation: material.plant_location || undefined,
      dataQualityTier: material.data_quality_tier || undefined,
      year: material.year || undefined,
      // Lifecycle breakdown
      ef_a1a3: material.ef_a1a3 || undefined,
      ef_a4: material.ef_a4 || undefined,
      ef_a5: material.ef_a5 || undefined,
      ef_b1b5: material.ef_b1b5 || undefined,
      ef_c1c4: material.ef_c1c4 || undefined,
      ef_d: material.ef_d || undefined,
      // ECO Platform compliance fields
      manufacturing_country: material.manufacturing_country || material.region || 'Australia',
      manufacturing_city: material.manufacturing_city || material.plant_location || material.state || undefined,
      characterisation_factor_version: material.characterisation_factor_version || 'JRC-EF-3.1',
      allocation_method: material.allocation_method || undefined,
      is_co_product: material.is_co_product || false,
      co_product_type: material.co_product_type || undefined,
      uses_mass_balance: material.uses_mass_balance || false,
      biogenic_carbon_kg_c: material.biogenic_carbon_kg_c || undefined,
      biogenic_carbon_percentage: material.biogenic_carbon_percentage || undefined,
      ecoinvent_methodology: material.ecoinvent_methodology || undefined,
      eco_platform_compliant: material.eco_platform_compliant !== false,
      data_quality_rating: material.data_quality_rating || undefined,
    });
  };

  // Quick add from favorites - includes full EPD data
  const addFromQuickAdd = (fav: typeof quickAddMaterials[0]) => {
    const newItem: Material = {
      id: Date.now().toString() + Math.random(),
      category: fav.category,
      typeId: fav.materialId,
      name: fav.materialName,
      unit: fav.unit,
      factor: fav.factor,
      source: fav.source,
      quantity: 0,
      isCustom: false,
      // EPD Traceability from stored favorite
      epdNumber: fav.epdNumber,
      epdUrl: fav.epdUrl,
      manufacturer: fav.manufacturer,
      plantLocation: fav.plantLocation,
      dataQualityTier: fav.dataQualityTier,
      year: fav.year,
      // Lifecycle breakdown
      ef_a1a3: fav.ef_a1a3,
      ef_a4: fav.ef_a4,
      ef_a5: fav.ef_a5,
      ef_b1b5: fav.ef_b1b5,
      ef_c1c4: fav.ef_c1c4,
      ef_d: fav.ef_d,
      // ECO Platform compliance fields
      manufacturing_country: fav.manufacturing_country,
      manufacturing_city: fav.manufacturing_city,
      characterisation_factor_version: fav.characterisation_factor_version,
      allocation_method: fav.allocation_method,
      is_co_product: fav.is_co_product,
      co_product_type: fav.co_product_type,
      uses_mass_balance: fav.uses_mass_balance,
      biogenic_carbon_kg_c: fav.biogenic_carbon_kg_c,
      biogenic_carbon_percentage: fav.biogenic_carbon_percentage,
      ecoinvent_methodology: fav.ecoinvent_methodology,
      eco_platform_compliant: fav.eco_platform_compliant,
      data_quality_rating: fav.data_quality_rating,
    };
    setSelectedMaterials(prev => [...prev, newItem]);
    
    // Track usage with full EPD data
    trackMaterialUsage({
      id: fav.materialId,
      name: fav.materialName,
      category: fav.category,
      unit: fav.unit,
      factor: fav.factor,
      source: fav.source,
      epdNumber: fav.epdNumber,
      epdUrl: fav.epdUrl,
      manufacturer: fav.manufacturer,
      plantLocation: fav.plantLocation,
      dataQualityTier: fav.dataQualityTier,
      year: fav.year,
      ef_a1a3: fav.ef_a1a3,
      ef_a4: fav.ef_a4,
      ef_a5: fav.ef_a5,
      ef_b1b5: fav.ef_b1b5,
      ef_c1c4: fav.ef_c1c4,
      ef_d: fav.ef_d,
    });
  };

  const addCustomMaterial = () => {
    const newItem: Material = {
      id: Date.now().toString() + Math.random(),
      category: 'custom',
      typeId: 'custom',
      name: "New Material",
      unit: "kg",
      factor: 0,
      source: "User Estimate",
      quantity: 0,
      isCustom: true
    };
    setSelectedMaterials(prev => [...prev, newItem]);
  };

  const resetForm = () => {
    if (!confirm("Clear all inputs? This cannot be undone.")) return;
    setProjectDetails({ name: '', location: 'NSW', period: '', auditor: '' });
    setScope1Inputs({});
    setScope2Inputs({});
    setTransportInputs({});
    setCommuteInputs({});
    setWasteInputs({});
    setA5Inputs({});
    setSelectedMaterials([]);
  };

  // Bulk CSV import handler
  const handleBulkCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({ title: "Invalid file", description: "Please upload a CSV file", variant: "destructive" });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast({ title: "Empty CSV", description: "CSV file must have headers and at least one row", variant: "destructive" });
        return;
      }

      // Parse headers (first row)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('material'));
      const qtyIdx = headers.findIndex(h => h.includes('quantity') || h.includes('qty') || h.includes('amount'));
      const unitIdx = headers.findIndex(h => h.includes('unit'));
      const factorIdx = headers.findIndex(h => h.includes('factor') || h.includes('ef') || h.includes('emission'));
      const categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('type'));

      if (nameIdx === -1) {
        toast({ title: "Invalid CSV format", description: "CSV must have a 'name' or 'material' column", variant: "destructive" });
        return;
      }

      const newMaterials: Material[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const name = values[nameIdx];
        if (!name) continue;

        const quantity = qtyIdx >= 0 ? parseFloat(values[qtyIdx]) || 0 : 0;
        const unit = unitIdx >= 0 && values[unitIdx] ? values[unitIdx] : 'kg';
        const factor = factorIdx >= 0 ? parseFloat(values[factorIdx]) || 0 : 0;
        const category = categoryIdx >= 0 && values[categoryIdx] ? values[categoryIdx] : 'Imported';

        newMaterials.push({
          id: `csv_${Date.now()}_${i}`,
          category,
          typeId: 'csv_import',
          name,
          unit,
          factor,
          source: 'CSV Import',
          quantity,
          isCustom: true,
        });
      }

      if (newMaterials.length > 0) {
        setSelectedMaterials(prev => [...prev, ...newMaterials]);
        
        // Save to import history
        const historyEntry: ImportHistoryEntry = {
          id: `import_${Date.now()}`,
          fileName: file.name,
          importedAt: new Date(),
          materialCount: newMaterials.length,
          materials: newMaterials.map(m => ({
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            factor: m.factor,
            category: m.category,
          })),
        };
        setImportHistory(prev => [historyEntry, ...prev].slice(0, 10)); // Keep last 10
        
        toast({ 
          title: "CSV Import Complete", 
          description: `Added ${newMaterials.length} materials from CSV` 
        });
      } else {
        toast({ title: "No materials found", description: "CSV did not contain valid material rows", variant: "destructive" });
      }
    } catch (err) {
      console.error('CSV parse error:', err);
      toast({ title: "CSV Parse Error", description: "Failed to parse CSV file", variant: "destructive" });
    }
    
    // Reset input
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  // File validation helper
  const validateFile = (file: File): boolean => {
    const validTypes = [
      'text/plain', 
      'text/csv', 
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(txt|csv|pdf|xlsx|xls)$/i)) {
      toast({ 
        title: "Invalid file type", 
        description: "Please upload a TXT, CSV, PDF, or Excel file",
        variant: "destructive" 
      });
      return false;
    }
    return true;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!aiProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (aiProcessing) return;

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      await processFile(file);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {

    setAiProcessing(true);
    try {
      // Read file content
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Extract text from PDF using edge function
        toast({ 
          title: "📄 Processing PDF", 
          description: "Extracting text from document...",
          duration: 5000
        });
        
        const formData = new FormData();
        formData.append('file', file);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({ 
            title: "Authentication required", 
            description: "Please log in to upload PDF files",
            variant: "destructive" 
          });
          setAiProcessing(false);
          return;
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-pdf-text`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData
          }
        );
        
        const pdfResult = await response.json();
        
        if (!response.ok || pdfResult.error) {
          toast({ 
            title: "PDF extraction failed", 
            description: pdfResult.error || "Could not extract text from PDF. Try converting to text format.",
            variant: "destructive",
            duration: 5000
          });
          setAiProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        
        text = pdfResult.text;
        toast({ 
          title: "✅ PDF text extracted", 
          description: `Extracted ${text.length.toLocaleString()} characters. Processing...`,
          duration: 2000
        });
      } else if (file.name.toLowerCase().match(/\.xlsx?$/)) {
        // Parse Excel file using xlsx library
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Extract text from all sheets
        const textParts: string[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv.trim()) {
            textParts.push(`Sheet: ${sheetName}\n${csv}`);
          }
        }
        text = textParts.join('\n\n');
        
        toast({ 
          title: "📊 Excel file parsed", 
          description: `Extracted ${text.length.toLocaleString()} characters from ${workbook.SheetNames.length} sheet(s)`,
          duration: 2000
        });
      } else {
        text = await file.text();
      }

      // Client-side length validation - max 50,000 characters
      if (text.length > 50000) {
        toast({ 
          title: "📄 Document too large", 
          description: `Your file has ${text.length.toLocaleString()} characters (max 50,000). Please reduce the document size.`,
          variant: "destructive",
          duration: 7000
        });
        setAiProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Split text into chunks if necessary (max 12,000 chars per chunk)
      const CHUNK_SIZE = 12000;
      const chunks: string[] = [];
      
      if (text.length <= CHUNK_SIZE) {
        chunks.push(text);
      } else {
        // Split at paragraph or line breaks to preserve context
        let remaining = text;
        while (remaining.length > 0) {
          if (remaining.length <= CHUNK_SIZE) {
            chunks.push(remaining);
            break;
          }
          
          // Find a good break point (paragraph, then line, then space)
          let breakPoint = CHUNK_SIZE;
          const searchArea = remaining.slice(CHUNK_SIZE - 500, CHUNK_SIZE);
          
          const paragraphBreak = searchArea.lastIndexOf('\n\n');
          if (paragraphBreak > 0) {
            breakPoint = CHUNK_SIZE - 500 + paragraphBreak + 2;
          } else {
            const lineBreak = searchArea.lastIndexOf('\n');
            if (lineBreak > 0) {
              breakPoint = CHUNK_SIZE - 500 + lineBreak + 1;
            }
          }
          
          chunks.push(remaining.slice(0, breakPoint));
          remaining = remaining.slice(breakPoint);
        }
      }

      // Show progress for multi-chunk processing
      const totalChunks = chunks.length;
      if (totalChunks > 1) {
        toast({ 
          title: "🔄 Processing large document", 
          description: `Splitting into ${totalChunks} sections for analysis...`,
          duration: 3000
        });
      }

      // Process each chunk sequentially
      const allMaterials: any[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        if (totalChunks > 1) {
          toast({ 
            title: `Processing section ${i + 1}/${totalChunks}`, 
            description: `Analyzing ${chunk.length.toLocaleString()} characters...`,
            duration: 2000
          });
        }

        const { data, error } = await supabase.functions.invoke('parse-boq', {
          body: { text: chunk }
        });

        // Handle rate limiting error (429)
        if (error?.message?.includes('429') || data?.error?.includes('Rate limit')) {
          toast({ 
            title: "🕐 Rate limit reached", 
            description: `Processed ${i}/${totalChunks} sections. Please wait and try again for remaining content.`,
            variant: "destructive" 
          });
          break;
        }

        // Handle payment/credits exhausted error (402)
        if (error?.message?.includes('402') || data?.error?.includes('credits exhausted') || data?.error?.includes('Payment required')) {
          toast({ 
            title: "💳 AI credits exhausted", 
            description: "Your AI usage limit has been reached. Please add credits or upgrade your plan.",
            variant: "destructive",
            duration: 7000
          });
          break;
        }

        if (error) {
          console.error(`Error processing chunk ${i + 1}:`, error);
          continue; // Continue with other chunks
        }

        if (data?.materials && Array.isArray(data.materials)) {
          allMaterials.push(...data.materials);
        }
        
        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (allMaterials.length === 0) {
        throw new Error("No materials could be extracted from the document");
      }

      // Process the materials from AI
      const newMaterials: Material[] = allMaterials.map((item: any) => {
        const isCustom = item.isCustom || item.category === 'custom';
        
        return {
          id: Date.now().toString() + Math.random(),
          category: item.category || 'custom',
          typeId: item.typeId || 'custom',
          name: item.name || "Imported Item",
          unit: item.unit || 'unit',
          factor: item.factor || 0,
          source: isCustom ? "AI Estimate" : "NMEF v2025.1",
          quantity: item.quantity || 0,
          isCustom
        };
      });

      setSelectedMaterials(prev => [...prev, ...newMaterials]);
      
      toast({ 
        title: "Import successful!", 
        description: `Added ${newMaterials.length} materials from ${file.name}${totalChunks > 1 ? ` (${totalChunks} sections processed)` : ''}` 
      });

    } catch (error) {
      console.error('Error processing file:', error);
      toast({ 
        title: "Import failed", 
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive" 
      });
    } finally {
      setAiProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Material Recommender handlers
  const handleOpenRecommender = (material: Material) => {
    setSelectedMaterialForRecommendations(material);
    setRecommenderOpen(true);
  };

  const handleReplaceMaterial = (oldMaterialId: string, newMaterial: any) => {
    setSelectedMaterials(prevMaterials =>
      prevMaterials.map(m =>
        m.id === oldMaterialId
          ? {
              ...m,
              name: newMaterial.material_name,
              category: newMaterial.material_category,
              factor: newMaterial.ef_total,
              ef_a1a3: newMaterial.ef_a1a3,
              ef_a4: newMaterial.ef_a4,
              ef_a5: newMaterial.ef_a5,
              ef_b1b5: newMaterial.ef_b1b5,
              ef_c1c4: newMaterial.ef_c1c4,
              ef_d: newMaterial.ef_d,
              epdNumber: newMaterial.epd_number,
              manufacturer: newMaterial.manufacturer,
              plantLocation: newMaterial.plant_location,
              dataQualityTier: newMaterial.data_quality_tier,
              ecoComplianceCompliant: newMaterial.eco_platform_compliant,
            }
          : m
      )
    );

    setRecommenderOpen(false);
    toast({
      title: 'Material Replaced',
      description: `Replaced with ${newMaterial.material_name} - saving ${newMaterial.carbon_savings_percent.toFixed(1)}% carbon`,
    });
  };

  const saveReport = async () => {
    if (!user || !currentProject) {
      toast({ title: "Please select a project first", variant: "destructive" });
      return;
    }

    // Check usage limits for LCA calculations
    const limitCheck = canPerformAction('lca_calculations');
    if (!limitCheck.allowed) {
      setUpgradeModalOpen(true);
      return;
    }

      // Client-side pre-validation for better UX
      const clientErrors: string[] = [];
      
      // Validate materials
      selectedMaterials.forEach((material, index) => {
        const result = MaterialSchema.safeParse(material);
        if (!result.success) {
          const errors = result.error.issues.map(i => i.message).join(', ');
          clientErrors.push(`Material ${index + 1}: ${errors}`);
        }
      });

      // Check for negative or invalid quantities
      if (Object.values(scope1Inputs).some(v => parseFloat(String(v)) < 0)) {
        clientErrors.push("Fuel quantities cannot be negative");
      }
      if (Object.values(scope2Inputs).some(v => parseFloat(String(v)) < 0)) {
        clientErrors.push("Electricity quantities cannot be negative");
      }
      if (Object.values(transportInputs).some(v => parseFloat(String(v)) < 0)) {
        clientErrors.push("Transport quantities cannot be negative");
      }

      if (clientErrors.length > 0) {
        toast({ 
          title: "Invalid data", 
          description: clientErrors.slice(0, 2).join('. '),
          variant: "destructive",
          duration: 7000
        });
        return;
      }

      // Load A4 transport items from localStorage (TransportCalculator data)
      // and map to backend schema: description→materialName, materialTonnes→weight, distanceKm→distance, modeId→mode
      let a4TransportItems: { id: string; materialName: string; weight: number; distance: number; mode: string; emissions: number }[] = [];
      try {
        const stored = localStorage.getItem('transportCalculatorItems');
        if (stored) {
          const rawItems = JSON.parse(stored);
          a4TransportItems = rawItems.map((item: any) => ({
            id: item.id,
            materialName: item.description || '',
            weight: item.materialTonnes || 0,
            distance: item.distanceKm || 0,
            mode: item.modeId || '',
            emissions: item.emissions || 0
          }));
        }
      } catch {
        // Ignore localStorage errors
      }

      // Merge commute/waste transport inputs with A4 transport items
      const mergedTransportInputs = {
        ...transportInputs,
        a4_transport_items: a4TransportItems,
        a4_total_emissions: a4TransportEmissions
      };

      setSaving(true);
      try {
        // Server-side validation - include all required fields
        const validationData = {
          projectDetails,
          materials: selectedMaterials,
          fuelInputs: scope1Inputs,
          electricityInputs: scope2Inputs,
          transportInputs: mergedTransportInputs,
          usePhaseInputs: {},
          endOfLifeInputs: {},
          moduleDInputs: {},
          totals: calculations
        };

      const { data: validationResult, error: validationError } = await supabase.functions.invoke(
        'validate-calculation',
        { body: validationData }
      );

      if (validationError) {
        throw new Error(`Validation failed: ${validationError.message}`);
      }

      if (!validationResult?.valid) {
        const errorMessages = validationResult?.errors || ['Unknown validation error'];
        toast({ 
          title: "Validation failed", 
          description: errorMessages.slice(0, 3).join(', '),
          variant: "destructive",
          duration: 7000
        });
        return;
      }

      // Use validated data for insertion
      const validatedData = validationResult.data;

      const { error } = await supabase.from('unified_calculations').insert([{
        project_id: currentProject.id,
        user_id: user.id,
        materials: validatedData.materials as any,
        fuel_inputs: validatedData.fuelInputs as any,
        electricity_inputs: validatedData.electricityInputs as any,
        transport_inputs: validatedData.transportInputs as any,
        totals: calculations as any,
        is_draft: false
      }]);

      if (error) throw error;

      toast({ title: "Calculation saved successfully!" });
      navigate('/reports');
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Failed to save", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to use the calculator</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  // Show loading skeleton while materials database is loading
  if (materialsLoading) {
    return <SkeletonPage variant="form" />;
  }

  // Show error state if materials failed to load
  if (materialsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="text-destructive">
            <Database className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Materials Database Error</h2>
          </div>
          <p className="text-muted-foreground">
            Unable to load the materials database. This may be a temporary issue.
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            {materialsError}
          </p>
          <Button onClick={() => refetchMaterials()} className="w-full">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry Loading Materials
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <SEOHead 
        title="Carbon Calculator" 
        description="Calculate Scope 1, 2, and 3 carbon emissions for Australian construction projects. NCC compliant with AI-powered BOQ import."
        canonicalPath="/calculator"
      />
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="bg-emerald-500 p-1.5 md:p-2 rounded flex-shrink-0">
              <Leaf className="text-white h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold truncate">
                CarbonConstruct <span className="text-emerald-400">Calculator</span>
              </h1>
              <div className="text-xs text-slate-400 hidden sm:block">NCC 2025 • Auto-Save Enabled</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-slate-400 hover:text-white flex-shrink-0">
            <Eraser className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Reset Form</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-4 md:mt-8 px-3 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Project Config */}
            <div className="glass rounded-lg p-3 md:p-5 relative glass-glow-hover neon-border">
              <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 md:mb-4">Project Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Input 
                  className="text-sm" 
                  placeholder="Project Name" 
                  value={projectDetails.name} 
                  onChange={e => setProjectDetails({...projectDetails, name: e.target.value})} 
                />
                <Select value={projectDetails.location} onValueChange={v => setProjectDetails({...projectDetails, location: v})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATE_ELEC_FACTORS).map(([k,v]) => (
                      <SelectItem key={k} value={k}>{k} - {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  className="text-sm" 
                  placeholder="Period" 
                  value={projectDetails.period} 
                  onChange={e => setProjectDetails({...projectDetails, period: e.target.value})} 
                />
                <Input 
                  className="text-sm" 
                  placeholder="Auditor" 
                  value={projectDetails.auditor}
                  onChange={e => setProjectDetails({...projectDetails, auditor: e.target.value})} 
                />
                <Input 
                  className="text-sm" 
                  type="number"
                  placeholder="Building Size (m²)" 
                  value={projectDetails.buildingSqm || ''}
                  onChange={e => setProjectDetails({...projectDetails, buildingSqm: e.target.value})} 
                />
              </div>
              
              {/* ECO Platform Compliance Toggle */}
              <div className="mt-4">
                <EcoComplianceToggle 
                  enabled={ecoComplianceEnabled} 
                  onToggle={setEcoComplianceEnabled} 
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b glass rounded-t-lg">
              <button 
                onClick={() => setActiveTab('inputs')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'inputs' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                Data Entry
              </button>
              <button 
                onClick={() => setActiveTab('report')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'report' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                Report
              </button>
            </div>

            {activeTab === 'inputs' && (
              <div className="space-y-6">
                {/* AI Import Banner with Drag & Drop */}
                <Card 
                  variant="glass"
                  className={`relative overflow-hidden transition-all duration-200 glass-glow-hover ${
                    isDragOver 
                      ? 'bg-purple-100/80 dark:bg-purple-900/30 border-purple-400 border-2 border-dashed' 
                      : 'border-purple-200/50 dark:border-purple-700/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragOver && (
                    <div className="absolute inset-0 bg-purple-200/50 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Upload className="h-10 w-10 text-purple-600 mx-auto mb-2 animate-bounce" />
                        <p className="font-bold text-purple-800">Drop your file here</p>
                        <p className="text-sm text-purple-600">TXT, CSV, PDF, or Excel</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-2 rounded-full">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-900">AI-Powered BOQ Import</h4>
                          <p className="text-sm text-purple-700">Drag & drop or click to upload construction documents</p>
                        </div>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.csv,.pdf,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={aiProcessing}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {aiProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload BOQ
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-purple-600 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 rounded">TXT</span>
                      <span className="px-2 py-0.5 bg-purple-100 rounded">CSV</span>
                      <span className="px-2 py-0.5 bg-purple-100 rounded">PDF</span>
                      <span className="px-2 py-0.5 bg-purple-100 rounded">Excel</span>
                      <span className="text-purple-500 ml-1">• Max 50,000 characters</span>
                    </div>
                  </div>
                </Card>

                {/* Energy Section */}
                <Card className="p-4 md:p-6 glass-glow-hover neon-border">
                  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-foreground">Energy (Scope 1 & 2)</h3>
                  <div className="bg-muted p-2 md:p-3 rounded border mb-3 md:mb-4">
                    <FactorRow 
                      label={`Grid Electricity (${projectDetails.location})`}
                      unit="kWh"
                      factor={STATE_ELEC_FACTORS[projectDetails.location as keyof typeof STATE_ELEC_FACTORS]?.factor || 0.66}
                      value={scope2Inputs.kwh || ''}
                      onChange={v => setScope2Inputs({ kwh: v })}
                      total={parseFloat(scope2Inputs.kwh || '0') * (STATE_ELEC_FACTORS[projectDetails.location as keyof typeof STATE_ELEC_FACTORS]?.factor || 0.66)}
                    />
                  </div>
                  {Object.entries(FUEL_FACTORS).map(([k, f]) => (
                    <FactorRow 
                      key={k}
                      label={f.name}
                      unit={f.unit}
                      factor={f.factor}
                      value={scope1Inputs[k] || ''}
                      onChange={v => setScope1Inputs({ ...scope1Inputs, [k]: v })}
                      total={parseFloat(scope1Inputs[k] || '0') * f.factor}
                    />
                  ))}
                </Card>

                {/* Materials Section */}
                <Card variant="glass" className="p-4 md:p-6 glass-glow-featured neon-border">
                  <div className="flex flex-col gap-3 mb-3 md:mb-4">
                    <h3 className="font-bold text-base md:text-lg text-foreground">Materials (Upfront A1-A3)</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Export Materials Button */}
                      {selectedMaterials.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs md:text-sm"
                          onClick={() => {
                            const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Factor (kgCO2e)', 'Emissions (tCO2e)', 'Source', 'EPD Number', 'Manufacturer', 'A1-A3', 'A4', 'A5', 'Data Quality'];
                            const rows = selectedMaterials.map(m => [
                              m.name,
                              m.category,
                              m.quantity,
                              m.unit,
                              m.factor.toFixed(4),
                              ((m.quantity * m.factor) / 1000).toFixed(4),
                              m.source,
                              m.epdNumber || '',
                              m.manufacturer || '',
                              m.ef_a1a3?.toFixed(4) || '',
                              m.ef_a4?.toFixed(4) || '',
                              m.ef_a5?.toFixed(4) || '',
                              m.dataQualityTier || ''
                            ]);
                            const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `materials-export-${new Date().toISOString().split('T')[0]}.csv`;
                            link.click();
                            toast({ title: "Materials exported to CSV" });
                          }}
                        >
                          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="hidden md:inline">Export</span>
                          <FileSpreadsheet className="h-3 w-3 md:hidden" />
                        </Button>
                      )}
                      {canAccessMaterialComparer ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-200 text-xs md:text-sm"
                            >
                              <Scale className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              Compare
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                            <MaterialComparison />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-muted/50 text-muted-foreground border-muted text-xs md:text-sm"
                          onClick={() => setUpgradeModalOpen(true)}
                        >
                          <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Compare
                          <Crown className="h-3 w-3 ml-1 text-amber-500" />
                        </Button>
                      )}
                      {/* Bulk CSV Import with Template Download */}
                      <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleBulkCSVImport}
                        className="hidden"
                      />
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={downloadCSVTemplate}
                              className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-200 text-xs px-2"
                            >
                              <FileDown className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download CSV template</TooltipContent>
                        </Tooltip>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => csvInputRef.current?.click()}
                          className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-200 text-xs md:text-sm"
                        >
                          <FileUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="hidden md:inline">Import CSV</span>
                        </Button>
                        {importHistory.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowImportHistory(!showImportHistory)}
                                className={`px-2 text-xs ${showImportHistory 
                                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700' 
                                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-200'}`}
                              >
                                <History className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{showImportHistory ? 'Hide' : 'Show'} import history ({importHistory.length})</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {/* Cloud Sync with Status Indicator */}
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            const result = await saveToCloud();
                            toast({ 
                              title: result.success ? "Synced to Cloud" : "Sync Failed",
                              description: result.message,
                              variant: result.success ? "default" : "destructive"
                            });
                          }}
                          disabled={isSyncing}
                          className={`text-xs md:text-sm ${cloudSyncEnabled 
                            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:text-sky-800 dark:hover:text-sky-200' 
                            : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-1 animate-spin" />
                          ) : cloudSyncEnabled ? (
                            <Cloud className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          ) : (
                            <CloudOff className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          )}
                          <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                        </Button>
                        {cloudSyncEnabled && lastSyncTime && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                                <CheckCircle className="h-3 w-3" />
                                <span className="hidden lg:inline">{formatSyncTime(lastSyncTime)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Last synced: {lastSyncTime.toLocaleString()}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addCustomMaterial}
                        className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-800 dark:hover:text-purple-200 text-xs md:text-sm"
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  {/* Import History Panel */}
                  {showImportHistory && importHistory.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                          <History className="h-3 w-3" />
                          Import History
                        </span>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={exportImportHistory}
                                className="h-6 px-2 text-xs bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
                              >
                                <FileJson className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export history as JSON</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => jsonHistoryInputRef.current?.click()}
                                className="h-6 px-2 text-xs bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200"
                              >
                                <Upload className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Import history from JSON</TooltipContent>
                          </Tooltip>
                          <input
                            type="file"
                            ref={jsonHistoryInputRef}
                            onChange={handleImportHistoryJSON}
                            accept=".json"
                            className="hidden"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearImportHistory}
                            className="h-6 text-xs text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {importHistory.map(entry => (
                          <div 
                            key={entry.id} 
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-amber-200 dark:border-amber-700"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate text-foreground">{entry.fileName}</div>
                              <div className="text-xs text-muted-foreground">
                                {entry.materialCount} materials • {formatSyncTime(entry.importedAt)}
                              </div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => reImportFromHistory(entry)}
                                  className="h-7 px-2 text-xs bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Re-import
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add these {entry.materialCount} materials again</TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick-Add Materials */}
                  {useNewMaterialUI ? (
                    <div className="mb-4">
                      <QuickAddPanel
                        materials={quickAddMaterials}
                        onAddMaterial={addFromQuickAdd}
                        onHideMaterial={hideMaterial}
                        onSyncEPD={syncWithDatabase}
                      />
                    </div>
                  ) : quickAddMaterials.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Quick Add</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Your frequently used materials</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickAddMaterials.map(fav => (
                          <Tooltip key={fav.materialId}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => addFromQuickAdd(fav)}
                                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-400 transition-colors"
                              >
                                <span className="text-foreground truncate max-w-[150px]">{fav.materialName}</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">{fav.factor.toFixed(1)}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    hideMaterial(fav.materialId);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 ml-1 text-muted-foreground hover:text-destructive transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{fav.materialName}</p>
                              <p className="text-xs text-muted-foreground">{fav.factor} kgCO2/{fav.unit} • Used {fav.usageCount}x</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recently Used Materials */}
                  {recentlyUsedMaterials.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Recently Used
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400">Last 10 materials</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFavorites}
                            className="h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-destructive hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentlyUsedMaterials.map(recent => (
                          <Tooltip key={recent.materialId}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => addFromQuickAdd(recent)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-400 transition-colors"
                              >
                                <span className="text-foreground truncate max-w-[150px]">{recent.materialName}</span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">{recent.unit}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{recent.materialName}</p>
                              <p className="text-xs text-muted-foreground">{recent.factor} kgCO2/{recent.unit}</p>
                              <p className="text-xs text-muted-foreground">Last used: {new Date(recent.lastUsed).toLocaleDateString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NEW UI: Category Browser + Search */}
                  {useNewMaterialUI && (
                    <div className="mb-4 space-y-4">
                      <MaterialCategoryBrowser
                        categories={categoryCounts}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        totalMaterials={dbMaterials.length}
                      />
                      
                      {/* Search and State Filter Row */}
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={selectedCategory 
                              ? `Search within ${selectedCategory}...` 
                              : "Or search all materials..."
                            }
                            value={materialSearch}
                            onChange={(e) => setMaterialSearch(e.target.value)}
                            className="pl-10 text-foreground"
                          />
                          {(materialSearch || selectedCategory || selectedState) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              onClick={() => {
                                setMaterialSearch('');
                                setSelectedCategory(null);
                                setSelectedState(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* State Filter Dropdown */}
                        <Select value={selectedState || "all"} onValueChange={(v) => setSelectedState(v === "all" ? null : v)}>
                          <SelectTrigger className="w-[120px] bg-background">
                            <SelectValue placeholder="All States" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="all">All States</SelectItem>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Data Source Filter Dropdown */}
                        <Select value={selectedDataSource || "all"} onValueChange={(v) => setSelectedDataSource(v === "all" ? null : v)}>
                          <SelectTrigger className="w-[130px] bg-background">
                            <SelectValue placeholder="All Sources" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="all">All Sources</SelectItem>
                            {dataSources.map((source) => (
                              <SelectItem key={source} value={source}>{source}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* EPD Number Search */}
                      <div className="flex gap-3 items-start">
                        <div className="relative flex-1">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by EPD number (e.g. EPD-BLU-001)..."
                            value={epdSearch}
                            onChange={(e) => setEpdSearch(e.target.value)}
                            className="pl-10 text-foreground"
                          />
                          {epdSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              onClick={() => setEpdSearch('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* EPD Search Results */}
                      {epdSearchResults.length > 0 && (
                        <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg">
                          <div className="text-xs font-medium text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            EPD Matches ({epdSearchResults.length})
                          </div>
                          <ScrollArea className="max-h-48">
                            <div className="space-y-1">
                              {epdSearchResults.map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => addMaterialFromDb(item.id)}
                                  className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-md border border-violet-200 dark:border-violet-700 flex justify-between items-center group transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-foreground truncate">{item.material_name}</div>
                                    <div className="text-xs text-violet-600 dark:text-violet-400 font-mono">{item.epd_number}</div>
                                    {item.manufacturer && (
                                      <div className="text-xs text-muted-foreground truncate">{item.manufacturer}</div>
                                    )}
                                  </div>
                                  <div className="text-right ml-2 flex-shrink-0">
                                    <div className="text-xs text-muted-foreground group-hover:text-violet-600">
                                      {item.ef_total.toFixed(1)} kgCO2/{item.unit}
                                    </div>
                                    <Plus className="h-4 w-4 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                      {epdSearch.length >= 3 && epdSearchResults.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No EPDs found matching "{epdSearch}"
                        </div>
                      )}

                      {/* Local database loads instantly - no loading state needed */}
                      
                      {!materialsLoading && dbMaterials.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Database className="h-3 w-3" />
                          {dbMaterials.length.toLocaleString()} materials available
                        </div>
                      )}

                      {/* Comparison Panel */}
                      {comparisonMode && selectedForComparison.length > 0 && (
                        <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-violet-700 dark:text-violet-300 uppercase tracking-wide flex items-center gap-1">
                              <Scale className="h-3 w-3" />
                              Comparing {selectedForComparison.length} Materials
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedForComparison([])}
                                className="h-6 text-xs text-violet-600 hover:text-violet-800 hover:bg-violet-100"
                              >
                                Clear
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={addAllFromComparison}
                                className="h-6 text-xs bg-violet-600 hover:bg-violet-700"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add All
                              </Button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-violet-200 dark:border-violet-700">
                                  <th className="text-left py-2 font-medium text-violet-700 dark:text-violet-300">Material</th>
                                  <th className="text-right py-2 font-medium text-violet-700 dark:text-violet-300">Unit</th>
                                  <th className="text-right py-2 font-medium text-emerald-600">A1-A3</th>
                                  <th className="text-right py-2 font-medium text-amber-600">Total</th>
                                  <th className="text-right py-2 font-medium text-violet-700 dark:text-violet-300">Source</th>
                                  <th className="text-center py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparisonMaterials.map(m => (
                                  <tr key={m.id} className="border-b border-violet-100 dark:border-violet-800 last:border-0">
                                    <td className="py-2 font-medium text-foreground max-w-[200px] truncate">{m.material_name}</td>
                                    <td className="py-2 text-right text-muted-foreground">{m.unit}</td>
                                    <td className="py-2 text-right font-mono text-emerald-600">{m.ef_a1a3?.toFixed(1) || '-'}</td>
                                    <td className="py-2 text-right font-mono text-amber-600">{m.ef_total.toFixed(1)}</td>
                                    <td className="py-2 text-right text-muted-foreground truncate max-w-[100px]">{m.data_source}</td>
                                    <td className="py-2 text-center">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => addMaterialFromDb(m.id)}
                                        className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-100"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <MaterialSearchResults
                        groupedMaterials={groupedMaterials.map(g => ({ 
                          category: g.category, 
                          items: g.items.map(i => ({
                            id: i.id,
                            material_name: i.material_name,
                            material_category: i.material_category,
                            unit: i.unit,
                            embodied_carbon_total: i.ef_total,
                            embodied_carbon_a1a3: i.ef_a1a3,
                            embodied_carbon_a4: i.ef_a4 || null,
                            embodied_carbon_a5: i.ef_a5 || null,
                            data_source: i.data_source,
                            expiry_date: i.expiry_date,
                            publish_date: i.publish_date
                          }))
                        }))}
                        onAddMaterial={addMaterialFromDb}
                        searchTerm={materialSearch}
                        selectedCategory={selectedCategory}
                        totalResultCount={filteredMaterialsCount}
                        comparisonMode={comparisonMode}
                        onToggleComparisonMode={() => setComparisonMode(!comparisonMode)}
                        selectedForComparison={selectedForComparison}
                        onToggleComparison={toggleComparison}
                        hideExpiredEPDs={hideExpiredEPDs}
                        onToggleHideExpired={() => setHideExpiredEPDs(!hideExpiredEPDs)}
                      />
                    </div>
                  )}

                  {/* OLD UI: Simple Search */}
                  {!useNewMaterialUI && (
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search 4,500+ materials (type 2+ chars)..."
                          value={materialSearch}
                          onChange={(e) => setMaterialSearch(e.target.value)}
                          className="pl-10 text-foreground"
                        />
                      </div>
                      {/* Local database loads instantly - no loading state needed */}
                      {materialSearch.length >= 2 && groupedMaterials.length > 0 && (
                        <ScrollArea className="h-64 mt-2 border rounded-md">
                          <div className="p-2">
                            {groupedMaterials.map(({ category, items }) => (
                              <div key={category} className="mb-3">
                                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase bg-muted rounded">
                                  {category} ({items.length})
                                </div>
                            {items.map(item => (
                                  <button
                                    key={item.id}
                                    onClick={() => addMaterialFromDb(item.id)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 rounded flex justify-between items-center group"
                                  >
                                    <span className="text-foreground">{item.material_name}</span>
                                    <span className="text-xs text-muted-foreground group-hover:text-emerald-600">
                                      {item.ef_total.toFixed(1)} kgCO2/{item.unit}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      {materialSearch.length >= 2 && groupedMaterials.length === 0 && !materialsLoading && (
                        <div className="mt-2 text-sm text-muted-foreground text-center py-4 border rounded">
                          No materials found for "{materialSearch}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Added Materials List */}
                  <div className={useNewMaterialUI ? "space-y-0" : "space-y-2"}>
                    {useNewMaterialUI ? (
                      selectedMaterials.map(m => (
                        <MaterialRowImproved
                          key={m.id}
                          material={m}
                          onChange={(updated) => setSelectedMaterials(prev => prev.map(mat => mat.id === m.id ? updated : mat))}
                          onRemove={() => setSelectedMaterials(prev => prev.filter(mat => mat.id !== m.id))}
                          onFindAlternatives={handleOpenRecommender}
                        />
                      ))
                    ) : (
                      selectedMaterials.map(m => (
                        <MaterialRow 
                          key={m.id}
                          material={m}
                          onChange={(updated) => setSelectedMaterials(prev => prev.map(mat => mat.id === m.id ? updated : mat))}
                          onRemove={() => setSelectedMaterials(prev => prev.filter(mat => mat.id !== m.id))}
                        />
                      ))
                    )}
                    {selectedMaterials.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                        {useNewMaterialUI 
                          ? "Select a category or search to add materials" 
                          : "No materials added."
                        }
                      </div>
                    )}
                  </div>
                </Card>

                {/* A4 Transport Section - Postcode-based calculation */}
                <TransportCalculator onTotalChange={setA4TransportEmissions} />

                {/* Employee Commute Section */}
                <Card className="p-4 md:p-6 glass-glow-hover neon-border">
                  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-foreground">Employee Commute (Scope 3)</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    Enter total km travelled by employees per commute type
                  </p>
                  <div className="space-y-1">
                    {Object.entries(COMMUTE_FACTORS).map(([k, f]) => (
                      <FactorRow 
                        key={k}
                        label={f.name}
                        unit={f.unit}
                        factor={f.factor}
                        value={commuteInputs[k] || ''}
                        onChange={v => setCommuteInputs({ ...commuteInputs, [k]: v })}
                        total={parseFloat(commuteInputs[k] || '0') * f.factor}
                      />
                    ))}
                  </div>
                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs md:text-sm text-blue-800">
                      <strong>Commute Total:</strong> {(calculations.scope3_commute / 1000).toFixed(3)} tCO2e
                    </div>
                  </div>
                </Card>

                {/* Waste Section */}
                <Card className="p-4 md:p-6 glass-glow-hover neon-border">
                  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-foreground">Construction Waste (Scope 3)</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    Enter waste quantities in kg or tonnes. Negative factors (e.g., recycled metals) reduce emissions.
                  </p>
                  <div className="space-y-2">
                    {Object.entries(WASTE_FACTORS).map(([k, f]) => {
                      const input = wasteInputs[k] || { quantity: '', unit: 'kg' as const };
                      const qty = parseFloat(input.quantity || '0');
                      const multiplier = input.unit === 'tonne' ? 1000 : 1;
                      const total = qty * multiplier * f.factor;
                      
                      return (
                        <div key={k} className="py-2.5 md:py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
                          {/* Mobile: stacked, Desktop: grid */}
                          <div className="flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                            <div className="md:col-span-4 font-medium text-sm">{f.name}</div>
                            <div className="flex items-center gap-2 md:col-span-3">
                              <Input 
                                type="number"
                                min="0"
                                step="any"
                                className="h-9 text-sm text-foreground flex-1"
                                placeholder="0"
                                value={input.quantity || ''} 
                                onChange={(e) => setWasteInputs({ 
                                  ...wasteInputs, 
                                  [k]: { ...input, quantity: e.target.value } 
                                })}
                              />
                              <Select
                                value={input.unit}
                                onValueChange={(v) => setWasteInputs({ 
                                  ...wasteInputs, 
                                  [k]: { ...input, unit: v as 'kg' | 'tonne' } 
                                })}
                              >
                                <SelectTrigger className="w-20 h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="tonne">tonne</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between md:contents">
                              <span className="text-xs text-muted-foreground font-mono md:col-span-3 md:text-right">
                                × {f.factor}
                              </span>
                              <span className={`font-bold text-sm md:col-span-2 md:text-right ${total < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                                {(total / 1000).toFixed(3)} t
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs md:text-sm text-amber-800">
                      <strong>Waste Total:</strong> {(calculations.scope3_waste / 1000).toFixed(3)} tCO2e
                      {calculations.scope3_waste < 0 && <span className="ml-2 text-blue-600">(Credit from recycling)</span>}
                    </div>
                  </div>
                </Card>

                {/* A5 On-Site Construction Section */}
                <Card className="p-4 md:p-6 glass-glow-hover neon-border">
                  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-foreground">On-Site Construction (A5)</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    Site equipment, generators, and installation activities
                  </p>
                  
                  {/* Equipment */}
                  <div className="mb-4 md:mb-6">
                    <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Site Equipment
                    </h4>
                    <div className="space-y-1 bg-muted rounded-lg p-2">
                      {Object.entries(A5_EQUIPMENT_FACTORS)
                        .filter(([_, f]) => f.category === 'equipment')
                        .map(([k, f]) => (
                          <FactorRow 
                            key={k}
                            label={f.name}
                            unit={f.unit}
                            factor={f.factor}
                            value={a5Inputs[k] || ''}
                            onChange={v => setA5Inputs({ ...a5Inputs, [k]: v })}
                            total={parseFloat(a5Inputs[k] || '0') * f.factor}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Generators */}
                  <div className="mb-4 md:mb-6">
                    <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Generators
                    </h4>
                    <div className="space-y-1 bg-muted rounded-lg p-2">
                      {Object.entries(A5_EQUIPMENT_FACTORS)
                        .filter(([_, f]) => f.category === 'generator')
                        .map(([k, f]) => (
                          <FactorRow 
                            key={k}
                            label={f.name}
                            unit={f.unit}
                            factor={f.factor}
                            value={a5Inputs[k] || ''}
                            onChange={v => setA5Inputs({ ...a5Inputs, [k]: v })}
                            total={parseFloat(a5Inputs[k] || '0') * f.factor}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Installation Activities */}
                  <div className="mb-4 md:mb-6">
                    <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Installation Activities
                    </h4>
                    <div className="space-y-1 bg-muted rounded-lg p-2">
                      {Object.entries(A5_EQUIPMENT_FACTORS)
                        .filter(([_, f]) => f.category === 'installation')
                        .map(([k, f]) => (
                          <FactorRow 
                            key={k}
                            label={f.name}
                            unit={f.unit}
                            factor={f.factor}
                            value={a5Inputs[k] || ''}
                            onChange={v => setA5Inputs({ ...a5Inputs, [k]: v })}
                            total={parseFloat(a5Inputs[k] || '0') * f.factor}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Site Facilities */}
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Site Facilities
                    </h4>
                    <div className="space-y-1 bg-muted rounded-lg p-2">
                      {Object.entries(A5_EQUIPMENT_FACTORS)
                        .filter(([_, f]) => f.category === 'facilities')
                        .map(([k, f]) => (
                          <FactorRow 
                            key={k}
                            label={f.name}
                            unit={f.unit}
                            factor={f.factor}
                            value={a5Inputs[k] || ''}
                            onChange={v => setA5Inputs({ ...a5Inputs, [k]: v })}
                            total={parseFloat(a5Inputs[k] || '0') * f.factor}
                          />
                        ))}
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xs md:text-sm text-orange-800">
                      <strong>A5 On-Site Total:</strong> {(calculations.scope3_a5 / 1000).toFixed(3)} tCO2e
                    </div>
                  </div>
                </Card>

                {/* EN 15978 Lifecycle Stage Calculators */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Badge variant="outline" className="text-xs">EN 15978</Badge>
                    <span className="text-sm font-medium text-muted-foreground">Whole Life Carbon Stages</span>
                    {!canAccessEN15978 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs ml-auto">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro Feature
                      </Badge>
                    )}
                  </div>
                  
                  {canAccessEN15978 ? (
                    <>
                      {/* Use Phase (B1-B7) */}
                      <Collapsible open={usePhaseOpen} onOpenChange={setUsePhaseOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between hover:bg-amber-50 hover:text-amber-700 border-amber-200">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span>Use Phase (B1-B7)</span>
                              {usePhaseEmissions && usePhaseEmissions.total > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                  {(usePhaseEmissions.total / 1000).toFixed(2)} tCO₂e
                                </Badge>
                              )}
                            </div>
                            {usePhaseOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <UsePhaseCalculator 
                            buildingSqm={buildingSqm} 
                            onTotalsChange={setUsePhaseEmissions}
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* End of Life (C1-C4) */}
                      <Collapsible open={endOfLifeOpen} onOpenChange={setEndOfLifeOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between hover:bg-red-50 hover:text-red-700 border-red-200">
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span>End of Life (C1-C4)</span>
                              {endOfLifeEmissions && endOfLifeEmissions.total > 0 && (
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  {(endOfLifeEmissions.total / 1000).toFixed(2)} tCO₂e
                                </Badge>
                              )}
                            </div>
                            {endOfLifeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <EndOfLifeCalculator 
                            buildingSqm={buildingSqm} 
                            onTotalsChange={setEndOfLifeEmissions}
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Module D (Benefits) */}
                      <Collapsible open={moduleDOpen} onOpenChange={setModuleDOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200">
                            <div className="flex items-center gap-2">
                              <Leaf className="h-4 w-4 text-emerald-600" />
                              <span>Module D (Benefits)</span>
                              {moduleDEmissions && moduleDEmissions.total !== 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  {(moduleDEmissions.total / 1000).toFixed(2)} tCO₂e
                                </Badge>
                              )}
                            </div>
                            {moduleDOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <ModuleDCalculator onTotalsChange={setModuleDEmissions} />
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <Card className="p-4 bg-muted/30 border-dashed">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">EN 15978 Lifecycle Calculators</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use Phase (B1-B7), End of Life (C1-C4), and Module D calculations are available with Pro
                          </p>
                        </div>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => setUpgradeModalOpen(true)}
                          className="mt-2"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <Card variant="glass" className="p-4 md:p-8 text-center glass-glow-featured neon-border">
                <div className="inline-block p-3 md:p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4">
                  <CloudUpload className="h-8 w-8 md:h-12 md:w-12" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to Report</h2>
                <p className="text-sm text-muted-foreground mb-4 md:mb-6">Your calculation is complete. Save to history or print as PDF.</p>
                
                {!canPerformAction('lca_calculations').allowed && (
                  <div className="p-3 md:p-4 mb-4 md:mb-6 bg-amber-50 border border-amber-200 rounded-lg text-xs md:text-sm text-amber-800">
                    <Crown className="h-4 w-4 inline mr-2" />
                    {canPerformAction('lca_calculations').reason}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                  <Button 
                    onClick={saveReport} 
                    disabled={saving || !canPerformAction('lca_calculations').allowed} 
                    size="lg"
                    className="text-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save to Reports
                    {!canPerformAction('lca_calculations').allowed && <Crown className="h-4 w-4 ml-2" />}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => window.print()} className="text-sm">
                    Print PDF
                  </Button>
                  {!canPerformAction('lca_calculations').allowed && (
                    <Button variant="default" size="lg" onClick={() => setUpgradeModalOpen(true)} className="text-sm">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Stats Panel */}
          <div className="lg:col-span-1">
            <Card className="p-4 md:p-6 lg:sticky lg:top-20 bg-slate-800 text-white shadow-lg z-40 neon-border" role="region" aria-label="Calculation totals" aria-live="polite" aria-atomic="true">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Whole Life Carbon (A-D)</h3>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-emerald-400">
                {(calculations.total_with_benefits / 1000).toFixed(2)} <span className="text-sm md:text-lg text-white">tCO₂e</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-3 md:mb-4">Net carbon incl. Module D benefits</p>
              
              {/* Upfront Carbon (A1-A5) */}
              <div className="space-y-2 text-xs md:text-sm">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pt-2">Upfront (A1-A5)</div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Materials (A1-A3)</span>
                  <span className="font-bold">{(calculations.a1a3_product / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span></span>
                </div>
                {calculations.scope3_sequestration > 0 && (
                  <div className="flex justify-between border-b border-slate-700 pb-2 bg-emerald-900/30 -mx-4 md:-mx-6 px-4 md:px-6 py-1">
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Leaf className="h-3 w-3" /> Carbon Stored
                    </span>
                    <span className="font-bold text-emerald-400">-{(calculations.scope3_sequestration / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Transport (A4)</span>
                  <span className="font-bold">{(calculations.a4_transport / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span></span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Construction (A5)</span>
                  <span className="font-bold text-orange-400">{(calculations.a5_construction / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                </div>
                <div className="flex justify-between bg-blue-900/30 -mx-4 md:-mx-6 px-4 md:px-6 py-2">
                  <span className="text-blue-300 font-medium">Subtotal A1-A5</span>
                  <span className="font-bold text-blue-300">{(calculations.total_upfront / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                </div>
                
                {/* Use Phase (B1-B7) */}
                {(calculations.b1_use > 0 || calculations.b2_maintenance > 0 || calculations.b6_operational_energy > 0) && (
                  <>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pt-3">Use Phase (B1-B7)</div>
                    {calculations.b1_use > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">In-Use (B1)</span>
                        <span className="font-bold text-amber-400">{(calculations.b1_use / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                      </div>
                    )}
                    {(calculations.b2_maintenance + calculations.b3_repair + calculations.b4_replacement + calculations.b5_refurbishment) > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">Maintenance (B2-B5)</span>
                        <span className="font-bold text-amber-400">{((calculations.b2_maintenance + calculations.b3_repair + calculations.b4_replacement + calculations.b5_refurbishment) / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                      </div>
                    )}
                    {calculations.b6_operational_energy > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">Operational Energy (B6)</span>
                        <span className="font-bold text-amber-400">{(calculations.b6_operational_energy / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                      </div>
                    )}
                    {calculations.b7_operational_water > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">Operational Water (B7)</span>
                        <span className="font-bold text-amber-400">{(calculations.b7_operational_water / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                      </div>
                    )}
                    <div className="flex justify-between bg-amber-900/30 -mx-4 md:-mx-6 px-4 md:px-6 py-2">
                      <span className="text-amber-300 font-medium">Subtotal B1-B7</span>
                      <span className="font-bold text-amber-300">{((calculations.b1_use + calculations.b2_maintenance + calculations.b3_repair + calculations.b4_replacement + calculations.b5_refurbishment + calculations.b6_operational_energy + calculations.b7_operational_water) / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                    </div>
                  </>
                )}
                
                {/* End of Life (C1-C4) */}
                {(calculations.c1_deconstruction + calculations.c2_transport + calculations.c3_waste_processing + calculations.c4_disposal) > 0 && (
                  <>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pt-3">End of Life (C1-C4)</div>
                    <div className="flex justify-between bg-red-900/30 -mx-4 md:-mx-6 px-4 md:px-6 py-2">
                      <span className="text-red-300 font-medium">Subtotal C1-C4</span>
                      <span className="font-bold text-red-300">{((calculations.c1_deconstruction + calculations.c2_transport + calculations.c3_waste_processing + calculations.c4_disposal) / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                    </div>
                  </>
                )}
                
                {/* Module D (Benefits) */}
                {(calculations.d_recycling + calculations.d_reuse + calculations.d_energy_recovery) !== 0 && (
                  <>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pt-3">Module D (Benefits)</div>
                    <div className="flex justify-between bg-emerald-900/30 -mx-4 md:-mx-6 px-4 md:px-6 py-2">
                      <span className="text-emerald-300 font-medium">Credits</span>
                      <span className="font-bold text-emerald-400">{((calculations.d_recycling + calculations.d_reuse + calculations.d_energy_recovery) / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                    </div>
                  </>
                )}
                
                {/* Legacy Scope breakdowns (collapsible) */}
                {(calculations.scope1 > 0 || calculations.scope2 > 0 || calculations.scope3_commute > 0 || calculations.scope3_waste !== 0) && (
                  <>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider pt-3">Other Emissions</div>
                    {(calculations.scope1 + calculations.scope2) > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">Energy (Scope 1+2)</span>
                        <span className="font-bold">{((calculations.scope1 + calculations.scope2) / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span></span>
                      </div>
                    )}
                    {calculations.scope3_commute > 0 && (
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-300">Commute</span>
                        <span className="font-bold">{(calculations.scope3_commute / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span></span>
                      </div>
                    )}
                    {calculations.scope3_waste !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Waste</span>
                        <span className={`font-bold ${calculations.scope3_waste < 0 ? 'text-blue-400' : ''}`}>
                          {(calculations.scope3_waste / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Whole Life Summary */}
              <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Whole Life (A-C)</span>
                  <span className="font-bold">{(calculations.total_whole_life / 1000).toFixed(2)} <span className="text-xs text-slate-400">t</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 font-medium">Net Carbon (A-D)</span>
                  <span className="font-bold text-lg text-emerald-400">{(calculations.total_with_benefits / 1000).toFixed(2)} <span className="text-xs">t</span></span>
                </div>
              </div>
              
              <div className="mt-4 pt-2 border-t border-slate-700">
                <p className="text-[10px] text-slate-500 text-center">EN 15978 Whole Life Carbon • tCO₂e</p>
              </div>
              <div className="mt-2 text-xs text-center text-slate-500">
                {user ? '✓ Auto-save active' : 'Connecting...'}
              </div>
            </Card>
            
            {/* ECO Platform Compliance Panel */}
            {ecoComplianceEnabled && (
              <div className="mt-4">
                <EcoCompliancePanel 
                  complianceReport={complianceReport} 
                  isLoading={complianceLoading} 
                />
              </div>
            )}
            
            {/* EPD Workflow Dashboard Widget */}
            <div className="mt-4">
              <EPDWorkflowDashboardWidget />
            </div>
            
            {/* EPD Renewal Reminders Panel */}
            {epdExpiryWarnings.length > 0 && (
              <div className="mt-4">
                <EPDRenewalReminders
                  expiryWarnings={epdExpiryWarnings}
                  summary={epdExpirySummary}
                  onDismiss={dismissEPDWarning}
                  onClearDismissed={clearDismissedEPDWarnings}
                  projectName={currentProject?.name}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Generate Report Section */}
        <CalculatorReportSection currentProject={currentProject} />
      </main>
      
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />

      {/* Material Recommender Dialog */}
      <Dialog open={recommenderOpen} onOpenChange={setRecommenderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMaterialForRecommendations && (
            <MaterialRecommender
              currentMaterial={{
                id: selectedMaterialForRecommendations.id,
                material_name: selectedMaterialForRecommendations.name,
                material_category: selectedMaterialForRecommendations.category,
                ef_total: selectedMaterialForRecommendations.factor,
                unit: selectedMaterialForRecommendations.unit,
              }}
              onSelectAlternative={(newMaterial) =>
                handleReplaceMaterial(selectedMaterialForRecommendations.id, newMaterial)
              }
              onClose={() => setRecommenderOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
