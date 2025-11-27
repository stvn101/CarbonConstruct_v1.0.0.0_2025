import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Eraser, Leaf, CloudUpload, Upload, Sparkles, Search, X, Pin, Database, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FUEL_FACTORS, STATE_ELEC_FACTORS, TRANSPORT_FACTORS, COMMUTE_FACTORS, WASTE_FACTORS, A5_EQUIPMENT_FACTORS } from "@/lib/emission-factors";
import { MaterialSchema } from "@/lib/validation-schemas";
import { SEOHead } from "@/components/SEOHead";
import { useLocalMaterials, Material as LocalMaterial } from "@/hooks/useLocalMaterials";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavoriteMaterials } from "@/hooks/useFavoriteMaterials";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialCategoryBrowser } from "@/components/calculator/MaterialCategoryBrowser";
import { MaterialSearchResults } from "@/components/calculator/MaterialSearchResults";
import { MaterialRowImproved } from "@/components/calculator/MaterialRowImproved";
import { QuickAddPanel } from "@/components/calculator/QuickAddPanel";
import { TransportCalculator } from "@/components/calculator/TransportCalculator";

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
}

const loadFromStorage = (key: string, fallback: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const MaterialRow = ({ material, onChange, onRemove }: { 
  material: Material; 
  onChange: (m: Material) => void; 
  onRemove: () => void;
}) => {
  return (
    <div className={`grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0 px-2 rounded group ${
      material.isCustom ? 'bg-purple-50 border-purple-200' : 'hover:bg-muted/50'
    }`}>
      <div className="col-span-4">
        {material.isCustom ? (
          <Input 
            className="h-8 text-sm text-foreground bg-background"
            placeholder="Material Name"
            value={material.name}
            onChange={(e) => onChange({ ...material, name: e.target.value })}
          />
        ) : (
          <div>
            <div className="font-medium text-sm">{material.name}</div>
            <div className="text-xs text-muted-foreground">{material.source}</div>
          </div>
        )}
      </div>

      <div className="col-span-3">
        <div className="flex items-center relative">
          <Input 
            type="number" 
            min="0"
            step="any"
            className="h-8 pr-12 text-sm text-foreground"
            placeholder="0"
            value={material.quantity || ''} 
            onChange={(e) => onChange({ ...material, quantity: parseFloat(e.target.value) || 0 })}
          />
          {material.isCustom ? (
            <Input 
              className="absolute right-1 top-1 bottom-1 w-12 text-xs text-foreground h-6 border-l"
              placeholder="Unit"
              value={material.unit}
              onChange={(e) => onChange({ ...material, unit: e.target.value })}
            />
          ) : (
            <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">{material.unit}</span>
          )}
        </div>
      </div>

      <div className="col-span-3 text-right">
        {material.isCustom ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">Factor:</span>
            <Input 
              type="number" 
              step="0.01"
              className="w-20 h-8 text-xs text-right text-foreground"
              placeholder="kgCO2"
              value={material.factor || ''} 
              onChange={(e) => onChange({ ...material, factor: parseFloat(e.target.value) || 0 })}
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono">× {material.factor}</div>
        )}
      </div>

      <div className="col-span-2 text-right font-bold text-sm flex justify-end items-center gap-2">
        <span className="text-emerald-600">{((material.quantity * material.factor) / 1000).toFixed(3)} t</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const FactorRow = ({ label, unit, value, onChange, factor, total }: {
  label: string;
  unit: string;
  value: string | number;
  onChange: (v: string) => void;
  factor: number;
  total: number;
}) => (
  <div className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
    <div className="col-span-5 font-medium text-sm">{label}</div>
    <div className="col-span-3 flex items-center relative">
      <Input 
        type="number"
        min="0"
        step="any"
        className="h-8 pr-12 text-sm text-foreground"
        placeholder="0"
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">{unit}</span>
    </div>
    <div className="col-span-2 text-xs text-muted-foreground text-right font-mono">× {factor}</div>
    <div className="col-span-2 text-right font-bold text-emerald-600 text-sm">{(total / 1000).toFixed(3)} t</div>
  </div>
);

export default function Calculator() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch materials from LOCAL database (no Supabase)
  const { materials: dbMaterials, loading: materialsLoading, getUnitLabel } = useLocalMaterials();
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [useNewMaterialUI, setUseNewMaterialUI] = useState(() => {
    try {
      const stored = localStorage.getItem('useNewMaterialUI');
      return stored === null ? true : stored === 'true'; // Default to true if not set
    } catch {
      return true;
    }
  });
  
  // Favorite materials for quick-add
  const { quickAddMaterials, recentlyUsedMaterials, trackMaterialUsage, hideMaterial, clearAllFavorites } = useFavoriteMaterials();
  
  // Category counts for browser - using local database
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dbMaterials.forEach(m => {
      counts.set(m.category, (counts.get(m.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }, [dbMaterials]);
  
  // Save UI preference
  useEffect(() => {
    localStorage.setItem('useNewMaterialUI', String(useNewMaterialUI));
  }, [useNewMaterialUI]);
  
  const [activeTab, setActiveTab] = useState<'inputs' | 'report'>('inputs');
  const [projectDetails, setProjectDetails] = useState(() => loadFromStorage('projectDetails', { 
    name: '', 
    location: 'NSW', 
    period: '', 
    auditor: '' 
  }));
  const [scope1Inputs, setScope1Inputs] = useState<Record<string, string>>(() => loadFromStorage('scope1Inputs', {}));
  const [scope2Inputs, setScope2Inputs] = useState<Record<string, string>>(() => loadFromStorage('scope2Inputs', {}));
  const [transportInputs, setTransportInputs] = useState<Record<string, string>>(() => loadFromStorage('transportInputs', {}));
  const [commuteInputs, setCommuteInputs] = useState<Record<string, string>>(() => loadFromStorage('commuteInputs', {}));
  const [wasteInputs, setWasteInputs] = useState<Record<string, { quantity: string; unit: 'kg' | 'tonne' }>>(() => loadFromStorage('wasteInputs', {}));
  const [a5Inputs, setA5Inputs] = useState<Record<string, string>>(() => loadFromStorage('a5Inputs', {}));
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>(() => loadFromStorage('selectedMaterials', []));
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Group database materials by category and filter by search/category
  const groupedMaterials = useMemo(() => {
    let filtered = [...dbMaterials]; // Local materials already have valid data
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    // Filter by search term
    if (materialSearch.length >= 2) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.subcategory.toLowerCase().includes(materialSearch.toLowerCase())
      );
    }
    
    // For new UI, show results when category is selected OR search is active
    // For old UI, only show when search is active
    const shouldShow = useNewMaterialUI 
      ? (selectedCategory || materialSearch.length >= 2)
      : materialSearch.length >= 2;
    
    if (!shouldShow) return [];
    
    const groups = new Map<string, LocalMaterial[]>();
    filtered.forEach(mat => {
      const existing = groups.get(mat.category) || [];
      existing.push(mat);
      groups.set(mat.category, existing);
    });
    
    // Sort categories and limit items per category for performance
    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 30)
      .map(([cat, items]) => ({
        category: cat,
        items: items.slice(0, 50) // Higher limit for better browsing
      }));
  }, [dbMaterials, materialSearch, selectedCategory, useNewMaterialUI]);

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

    Object.entries(TRANSPORT_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(transportInputs[k] || '0');
      scope3_transport += val * f.factor;
    });

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

    return { 
      scope1, 
      scope2, 
      scope3_materials: scope3_materials_net, // Net materials (after sequestration)
      scope3_materials_gross,
      scope3_sequestration,
      scope3_transport, 
      scope3_commute, 
      scope3_waste, 
      scope3_a5,
      total: scope1 + scope2 + scope3_materials_net + scope3_transport + scope3_commute + scope3_waste + scope3_a5 
    };
  }, [scope1Inputs, scope2Inputs, selectedMaterials, transportInputs, commuteInputs, wasteInputs, a5Inputs, projectDetails.location]);

  const addMaterialFromDb = (materialId: string) => {
    const material = dbMaterials.find(m => m.id === materialId);
    if (!material) return;

    const newItem: Material = {
      id: Date.now().toString() + Math.random(),
      category: material.category,
      typeId: material.id,
      name: material.name,
      unit: material.unit,
      factor: material.ef_total,
      source: material.data_source,
      quantity: 0,
      isCustom: false,
      sequestration: material.carbon_sequestration_kg ? Math.abs(material.carbon_sequestration_kg) : undefined
    };
    setSelectedMaterials(prev => [...prev, newItem]);
    setMaterialSearch(''); // Clear search after adding
    
    // Track usage for quick-add
    trackMaterialUsage({
      id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      factor: material.ef_total,
      source: material.data_source
    });
  };

  // Quick add from favorites
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
      isCustom: false
    };
    setSelectedMaterials(prev => [...prev, newItem]);
    
    // Track usage
    trackMaterialUsage({
      id: fav.materialId,
      name: fav.materialName,
      category: fav.category,
      unit: fav.unit,
      factor: fav.factor,
      source: fav.source
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
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
        description: "Please upload a text, CSV, PDF, or Excel file",
        variant: "destructive" 
      });
      return;
    }

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

  const saveReport = async () => {
    if (!user || !currentProject) {
      toast({ title: "Please select a project first", variant: "destructive" });
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

    setSaving(true);
    try {
      // Server-side validation
      const validationData = {
        projectDetails,
        materials: selectedMaterials,
        fuelInputs: scope1Inputs,
        electricityInputs: scope2Inputs,
        transportInputs
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

  return (
    <div className="min-h-screen bg-background pb-12">
      <SEOHead 
        title="Carbon Calculator" 
        description="Calculate Scope 1, 2, and 3 carbon emissions for Australian construction projects. NCC compliant with AI-powered BOQ import."
        canonicalPath="/calculator"
      />
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded">
              <Leaf className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                CarbonConstruct <span className="text-emerald-400">Calculator</span>
              </h1>
              <div className="text-xs text-slate-400">NCC 2025 • Auto-Save Enabled</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-slate-400 hover:text-white">
            <Eraser className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Config */}
            <div className="bg-card rounded-lg shadow-sm border p-5 relative">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Project Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-card rounded-t-lg">
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
                {/* AI Import Banner */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900">AI-Powered BOQ Import</h4>
                        <p className="text-sm text-purple-700">Upload your construction documents and let AI extract materials automatically</p>
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
                </Card>

                {/* Energy Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">Energy (Scope 1 & 2)</h3>
                  <div className="bg-slate-50 p-3 rounded border mb-4">
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
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-700">Materials (Upfront A1-A3)</h3>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addCustomMaterial}
                        className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Custom
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick-Add Materials */}
                  {useNewMaterialUI ? (
                    <div className="mb-4">
                      <QuickAddPanel
                        materials={quickAddMaterials}
                        onAddMaterial={addFromQuickAdd}
                        onHideMaterial={hideMaterial}
                      />
                    </div>
                  ) : quickAddMaterials.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Quick Add</span>
                        <span className="text-xs text-emerald-600">Your frequently used materials</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickAddMaterials.map(fav => (
                          <Tooltip key={fav.materialId}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => addFromQuickAdd(fav)}
                                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-emerald-300 rounded-full hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
                              >
                                <span className="text-foreground truncate max-w-[150px]">{fav.materialName}</span>
                                <span className="text-xs text-emerald-600">{fav.factor.toFixed(1)}</span>
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
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Recently Used
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600">Last 10 materials</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFavorites}
                            className="h-6 px-2 text-xs text-blue-600 hover:text-destructive hover:bg-blue-100"
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-blue-300 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-colors"
                              >
                                <span className="text-foreground truncate max-w-[150px]">{recent.materialName}</span>
                                <span className="text-xs text-blue-600">{recent.unit}</span>
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
                      
                      <div className="relative">
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
                        {(materialSearch || selectedCategory) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => {
                              setMaterialSearch('');
                              setSelectedCategory(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Local database loads instantly - no loading state needed */}
                      
                      {!materialsLoading && dbMaterials.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Database className="h-3 w-3" />
                          {dbMaterials.length.toLocaleString()} materials available
                        </div>
                      )}

                      <MaterialSearchResults
                        groupedMaterials={groupedMaterials.map(g => ({ 
                          category: g.category, 
                          items: g.items.map(i => ({
                            id: i.id,
                            material_name: i.name,
                            material_category: i.category,
                            unit: i.unit,
                            embodied_carbon_total: i.ef_total,
                            embodied_carbon_a1a3: i.ef_a1a3,
                            embodied_carbon_a4: i.ef_a4 || null,
                            embodied_carbon_a5: i.ef_a5 || null,
                            data_source: i.data_source
                          }))
                        }))}
                        onAddMaterial={addMaterialFromDb}
                        searchTerm={materialSearch}
                        selectedCategory={selectedCategory}
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
                                    <span className="text-foreground">{item.name}</span>
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
                <TransportCalculator />

                {/* Employee Commute Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">Employee Commute (Scope 3)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter total km travelled by employees per commute type (e.g., daily km × working days × employees)
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
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>Commute Total:</strong> {(calculations.scope3_commute / 1000).toFixed(3)} tCO2e
                    </div>
                  </div>
                </Card>

                {/* Waste Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">Construction Waste (Scope 3)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter waste quantities in kg or tonnes. Negative factors (e.g., recycled metals) reduce emissions.
                  </p>
                  <div className="space-y-2">
                    {Object.entries(WASTE_FACTORS).map(([k, f]) => {
                      const input = wasteInputs[k] || { quantity: '', unit: 'kg' as const };
                      const qty = parseFloat(input.quantity || '0');
                      const multiplier = input.unit === 'tonne' ? 1000 : 1;
                      const total = qty * multiplier * f.factor;
                      
                      return (
                        <div key={k} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
                          <div className="col-span-4 font-medium text-sm">{f.name}</div>
                          <div className="col-span-3 flex items-center gap-2">
                            <Input 
                              type="number"
                              min="0"
                              step="any"
                              className="h-8 text-sm text-foreground"
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
                              <SelectTrigger className="w-24 h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="tonne">tonne</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3 text-xs text-muted-foreground text-right font-mono">
                            × {f.factor} kgCO2/kg
                          </div>
                          <div className={`col-span-2 text-right font-bold text-sm ${total < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {(total / 1000).toFixed(3)} t
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-sm text-amber-800">
                      <strong>Waste Total:</strong> {(calculations.scope3_waste / 1000).toFixed(3)} tCO2e
                      {calculations.scope3_waste < 0 && <span className="ml-2 text-blue-600">(Credit from recycling)</span>}
                    </div>
                  </div>
                </Card>

                {/* A5 On-Site Construction Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">On-Site Construction (A5)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Site equipment, generators, and installation activities emissions
                  </p>
                  
                  {/* Equipment */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Site Equipment
                    </h4>
                    <div className="space-y-1 bg-slate-50 rounded-lg p-2">
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
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Generators
                    </h4>
                    <div className="space-y-1 bg-slate-50 rounded-lg p-2">
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
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Installation Activities
                    </h4>
                    <div className="space-y-1 bg-slate-50 rounded-lg p-2">
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
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Site Facilities
                    </h4>
                    <div className="space-y-1 bg-slate-50 rounded-lg p-2">
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

                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-sm text-orange-800">
                      <strong>A5 On-Site Total:</strong> {(calculations.scope3_a5 / 1000).toFixed(3)} tCO2e
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'report' && (
              <Card className="p-8 text-center">
                <div className="inline-block p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4">
                  <CloudUpload className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to Report</h2>
                <p className="text-muted-foreground mb-6">Your calculation is complete. Save to history or print as PDF.</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={saveReport} disabled={saving} size="lg">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save to Reports
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => window.print()}>
                    Print PDF
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Stats Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 bg-slate-800 text-white">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Footprint</h3>
              <div className="text-4xl font-bold mb-6 text-emerald-400">
                {(calculations.total / 1000).toFixed(2)} <span className="text-lg text-white">tCO₂e</span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Energy</span>
                  <span className="font-bold">{((calculations.scope1 + calculations.scope2) / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Materials (A1-A3)</span>
                  <span className="font-bold">{(calculations.scope3_materials / 1000).toFixed(2)} t</span>
                </div>
                {calculations.scope3_sequestration > 0 && (
                  <div className="flex justify-between border-b border-slate-700 pb-2 bg-emerald-900/30 -mx-6 px-6 py-2">
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Leaf className="h-3 w-3" /> Carbon Stored
                    </span>
                    <span className="font-bold text-emerald-400">-{(calculations.scope3_sequestration / 1000).toFixed(2)} t</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Transport (A4)</span>
                  <span className="font-bold">{(calculations.scope3_transport / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">On-Site (A5)</span>
                  <span className="font-bold text-orange-400">{(calculations.scope3_a5 / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Commute</span>
                  <span className="font-bold">{(calculations.scope3_commute / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Waste</span>
                  <span className={`font-bold ${calculations.scope3_waste < 0 ? 'text-blue-400' : ''}`}>
                    {(calculations.scope3_waste / 1000).toFixed(2)} t
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-center text-slate-500">
                {user ? '✓ Auto-save active' : 'Connecting...'}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
