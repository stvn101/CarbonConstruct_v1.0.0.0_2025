import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Upload, Sparkles, Save, FileText, Download, FileSpreadsheet } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  factor: number;
  category: string;
  source: string;
  isCustom: boolean;
}

interface FuelInputs {
  diesel_transport?: number;
  diesel_stationary?: number;
  petrol?: number;
  lpg?: number;
  natural_gas?: number;
}

interface ElectricityInputs {
  kwh?: number;
}

interface TransportInputs {
  commute_car?: number;
  commute_ute?: number;
  waste?: number;
}

const STATE_FACTORS = {
  NSW: { factor: 0.66, name: "New South Wales" },
  VIC: { factor: 0.85, name: "Victoria" },
  QLD: { factor: 0.72, name: "Queensland" },
  SA: { factor: 0.25, name: "South Australia" },
  WA: { factor: 0.51, name: "Western Australia" },
  TAS: { factor: 0.17, name: "Tasmania" },
  NT: { factor: 0.54, name: "Northern Territory" },
  ACT: { factor: 0.66, name: "ACT" }
};

const FUEL_FACTORS = {
  diesel_transport: { name: "Diesel (Transport)", unit: "L", factor: 2.7 },
  diesel_stationary: { name: "Diesel (Stationary)", unit: "L", factor: 2.7 },
  petrol: { name: "Petrol", unit: "L", factor: 2.3 },
  lpg: { name: "LPG", unit: "L", factor: 1.6 },
  natural_gas: { name: "Natural Gas", unit: "GJ", factor: 51.5 }
};

const TRANSPORT_FACTORS = {
  commute_car: { name: "Staff Commute (Car)", unit: "km", factor: 0.22 },
  commute_ute: { name: "Staff Commute (Ute)", unit: "km", factor: 0.28 },
  waste: { name: "Waste Transport", unit: "t", factor: 1200 }
};

export default function Calculator() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fuelInputs, setFuelInputs] = useState<FuelInputs>({});
  const [electricityInputs, setElectricityInputs] = useState<ElectricityInputs>({});
  const [transportInputs, setTransportInputs] = useState<TransportInputs>({});
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [boqText, setBoqText] = useState('');
  const [saving, setSaving] = useState(false);
  const [materialDb, setMaterialDb] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!currentProject) {
      toast.error('Please select a project first');
      navigate('/');
      return;
    }
    loadMaterialDatabase();
    loadDraft();
  }, [user, currentProject]);

  // Auto-save effect
  useEffect(() => {
    if (!currentProject) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [materials, fuelInputs, electricityInputs, transportInputs, currentProject]);

  const loadMaterialDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('emission_factors')
        .select('*')
        .eq('category', 'Materials')
        .eq('scope', 3)
        .order('subcategory', { ascending: true });

      if (error) throw error;
      setMaterialDb(data || []);
    } catch (error) {
      console.error('Error loading material database:', error);
    } finally {
      setLoadingDb(false);
    }
  };

  const loadDraft = async () => {
    if (!currentProject?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('unified_calculations')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('is_draft', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setMaterials((data.materials as any) || []);
        setFuelInputs((data.fuel_inputs as any) || {});
        setElectricityInputs((data.electricity_inputs as any) || {});
        setTransportInputs((data.transport_inputs as any) || {});
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!currentProject?.id || !user?.id) return;

    const totals = calculateTotals();

    try {
      const { data: existing } = await supabase
        .from('unified_calculations')
        .select('id')
        .eq('project_id', currentProject.id)
        .eq('is_draft', true)
        .maybeSingle();

      const payload = {
        project_id: currentProject.id,
        user_id: user.id,
        materials: materials as any,
        fuel_inputs: fuelInputs as any,
        electricity_inputs: electricityInputs as any,
        transport_inputs: transportInputs as any,
        totals: totals as any,
        is_draft: true
      };

      if (existing) {
        await supabase
          .from('unified_calculations')
          .update(payload)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('unified_calculations')
          .insert([payload]);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const calculateTotals = useMemo(() => () => {
    let scope1 = 0;
    let scope2 = 0;
    let scope3_materials = 0;
    let scope3_transport = 0;

    // Scope 1: Fuel combustion
    Object.entries(fuelInputs).forEach(([key, value]) => {
      const factor = FUEL_FACTORS[key as keyof typeof FUEL_FACTORS]?.factor || 0;
      scope1 += (value || 0) * factor;
    });

    // Scope 2: Electricity
    const state = currentProject?.location || 'NSW';
    const elecFactor = STATE_FACTORS[state as keyof typeof STATE_FACTORS]?.factor || 0.66;
    scope2 = (electricityInputs.kwh || 0) * elecFactor;

    // Scope 3: Materials
    materials.forEach(m => {
      scope3_materials += (m.quantity || 0) * (m.factor || 0);
    });

    // Scope 3: Transport
    Object.entries(transportInputs).forEach(([key, value]) => {
      const factor = TRANSPORT_FACTORS[key as keyof typeof TRANSPORT_FACTORS]?.factor || 0;
      scope3_transport += (value || 0) * factor;
    });

    return {
      scope1,
      scope2,
      scope3_materials,
      scope3_transport,
      total: scope1 + scope2 + scope3_materials + scope3_transport
    };
  }, [materials, fuelInputs, electricityInputs, transportInputs, currentProject]);

  const totals = calculateTotals();

  const addMaterial = (dbMaterial: any) => {
    const newMaterial: Material = {
      id: Date.now().toString() + Math.random(),
      name: `${dbMaterial.subcategory} ${dbMaterial.fuel_type || ''}`.trim(),
      quantity: 0,
      unit: dbMaterial.unit.replace('kgCO2e/', ''),
      factor: dbMaterial.factor_value,
      category: dbMaterial.subcategory,
      source: dbMaterial.source,
      isCustom: false
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const addCustomMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString() + Math.random(),
      name: "Custom Material",
      quantity: 0,
      unit: "kg",
      factor: 0,
      category: "Custom",
      source: "User Defined",
      isCustom: true
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBoqText(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleAiImport = async () => {
    if (!boqText.trim()) {
      toast.error('Please paste or upload BOQ text');
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-boq-import', {
        body: { boqText }
      });

      if (error) throw error;

      const importedMaterials = data.materials.map((m: any) => ({
        id: Date.now().toString() + Math.random(),
        name: m.name,
        quantity: m.quantity || 0,
        unit: m.unit || 'kg',
        factor: m.factor || 0,
        category: m.category || 'Custom',
        source: m.isCustom ? 'AI Estimate' : 'NMEF v2025.1',
        isCustom: m.isCustom || false
      }));

      setMaterials(prev => [...prev, ...importedMaterials]);
      toast.success(`Imported ${importedMaterials.length} materials from BOQ`);
      setShowAiModal(false);
      setBoqText('');
    } catch (error: any) {
      console.error('AI Import Error:', error);
      toast.error(error.message || 'Failed to import BOQ');
    } finally {
      setAiLoading(false);
    }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      const calculationTotals = calculateTotals();
      
      await supabase.from('unified_calculations').insert([{
        project_id: currentProject!.id,
        user_id: user!.id,
        materials: materials as any,
        fuel_inputs: fuelInputs as any,
        electricity_inputs: electricityInputs as any,
        transport_inputs: transportInputs as any,
        totals: calculationTotals as any,
        is_draft: false
      }]);

      toast.success('Report saved successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (materials.length === 0) {
      toast.error('No materials to export');
      return;
    }

    const totals = calculateTotals();
    const projectName = currentProject?.name || 'Project';
    const today = new Date().toISOString().split('T')[0];

    // CSV Header
    let csv = 'CarbonConstruct - Materials Export\n';
    csv += `Project: ${projectName}\n`;
    csv += `Date: ${today}\n`;
    csv += `Total Emissions: ${(totals.total / 1000).toFixed(2)} tCO₂e\n\n`;
    
    // Materials Table
    csv += 'Item,Category,Quantity,Unit,Emission Factor (kgCO₂e),Total Emissions (kgCO₂e),Source\n';
    
    materials.forEach((material) => {
      const emissions = (material.quantity || 0) * (material.factor || 0);
      csv += `"${material.name}","${material.category}",${material.quantity},"${material.unit}",${material.factor},${emissions.toFixed(2)},"${material.source}"\n`;
    });

    // Summary
    csv += `\nSummary\n`;
    csv += `Total Materials,${materials.length}\n`;
    csv += `Total Embodied Carbon,${(totals.scope3_materials / 1000).toFixed(2)} tCO₂e\n`;

    // Create and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/\s+/g, '_')}_Materials_${today}.csv`;
    link.click();
    
    toast.success('CSV exported successfully!');
  };

  const exportToBOQ = () => {
    if (materials.length === 0) {
      toast.error('No materials to export');
      return;
    }

    const totals = calculateTotals();
    const projectName = currentProject?.name || 'Project';
    const today = new Date().toISOString().split('T')[0];

    // BOQ Format (Bill of Quantities - Australian Standard)
    let boq = '═══════════════════════════════════════════════════════════════\n';
    boq += '                    BILL OF QUANTITIES                          \n';
    boq += '               Carbon Assessment Schedule                       \n';
    boq += '═══════════════════════════════════════════════════════════════\n\n';
    
    boq += `Project:           ${projectName}\n`;
    boq += `Date:              ${today}\n`;
    boq += `Location:          ${currentProject?.location || 'Australia'}\n`;
    boq += `Status:            ${currentProject?.status || 'Active'}\n\n`;
    
    boq += '───────────────────────────────────────────────────────────────\n';
    boq += '                    MATERIALS SCHEDULE                          \n';
    boq += '───────────────────────────────────────────────────────────────\n\n';

    // Group materials by category
    const grouped = materials.reduce((acc, material) => {
      if (!acc[material.category]) {
        acc[material.category] = [];
      }
      acc[material.category].push(material);
      return acc;
    }, {} as Record<string, Material[]>);

    let itemNo = 1;
    Object.entries(grouped).forEach(([category, items]) => {
      boq += `\n${category.toUpperCase()}\n`;
      boq += '───────────────────────────────────────────────────────────────\n';
      
      items.forEach((material) => {
        const emissions = (material.quantity || 0) * (material.factor || 0);
        boq += `${itemNo.toString().padStart(3, '0')}  ${material.name}\n`;
        boq += `     Quantity:      ${material.quantity} ${material.unit}\n`;
        boq += `     Factor:        ${material.factor} kgCO₂e/${material.unit}\n`;
        boq += `     Emissions:     ${emissions.toFixed(2)} kgCO₂e (${(emissions / 1000).toFixed(3)} tCO₂e)\n`;
        boq += `     Source:        ${material.source}\n`;
        if (material.isCustom) {
          boq += `     Note:          Custom material - User defined\n`;
        }
        boq += `\n`;
        itemNo++;
      });
    });

    // Summary Section
    boq += '\n═══════════════════════════════════════════════════════════════\n';
    boq += '                    EMISSIONS SUMMARY                           \n';
    boq += '═══════════════════════════════════════════════════════════════\n\n';
    
    boq += `Materials (Embodied Carbon):     ${(totals.scope3_materials / 1000).toFixed(2)} tCO₂e\n`;
    boq += `Energy (Scope 1 & 2):            ${((totals.scope1 + totals.scope2) / 1000).toFixed(2)} tCO₂e\n`;
    boq += `Transport (Scope 3):             ${(totals.scope3_transport / 1000).toFixed(2)} tCO₂e\n`;
    boq += `                                 ──────────────\n`;
    boq += `TOTAL PROJECT EMISSIONS:         ${(totals.total / 1000).toFixed(2)} tCO₂e\n\n`;
    
    boq += `Total Items:                     ${materials.length}\n`;
    boq += `Custom Items:                    ${materials.filter(m => m.isCustom).length}\n\n`;
    
    boq += '═══════════════════════════════════════════════════════════════\n';
    boq += '              Generated by CarbonConstruct Pro                  \n';
    boq += '           Australian NCC 2024 / NMEF v2025.1                  \n';
    boq += '═══════════════════════════════════════════════════════════════\n';

    // Create and download
    const blob = new Blob([boq], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/\s+/g, '_')}_BOQ_${today}.txt`;
    link.click();
    
    toast.success('BOQ exported successfully!');
  };

  if (loadingDb) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unified Carbon Calculator</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Auto-saving to {currentProject?.name}
                </p>
              </div>
              <Button onClick={() => setShowAiModal(true)} variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Import
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="energy" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="energy">Energy</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="transport">Transport</TabsTrigger>
                </TabsList>

                {/* Energy Tab */}
                <TabsContent value="energy" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Electricity (Scope 2)</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={electricityInputs.kwh || ''}
                        onChange={(e) => setElectricityInputs({ kwh: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">kWh</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        = {((electricityInputs.kwh || 0) * (STATE_FACTORS[currentProject?.location as keyof typeof STATE_FACTORS]?.factor || 0.66) / 1000).toFixed(3)} t
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Fuel Combustion (Scope 1)</h4>
                    {Object.entries(FUEL_FACTORS).map(([key, fuel]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm min-w-[140px]">{fuel.name}</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={fuelInputs[key as keyof FuelInputs] || ''}
                          onChange={(e) => setFuelInputs(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                        />
                        <span className="text-sm text-muted-foreground min-w-[40px]">{fuel.unit}</span>
                        <span className="text-sm font-mono text-muted-foreground">
                          = {((fuelInputs[key as keyof FuelInputs] || 0) * fuel.factor / 1000).toFixed(3)} t
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Materials Tab */}
                <TabsContent value="materials" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Embodied Carbon (Scope 3)</h4>
                    <div className="flex gap-2">
                      <Button onClick={addCustomMaterial} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Custom
                      </Button>
                      <div className="relative group">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          From Database
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-lg hidden group-hover:block z-10 max-h-96 overflow-y-auto">
                          {materialDb.map((mat) => (
                            <button
                              key={mat.id}
                              onClick={() => addMaterial(mat)}
                              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                            >
                              {mat.subcategory} {mat.fuel_type || ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className={`grid grid-cols-12 gap-2 p-2 rounded border ${material.isCustom ? 'bg-purple-50 border-purple-200' : 'bg-muted/50'}`}
                      >
                        <div className="col-span-4">
                          {material.isCustom ? (
                            <Input
                              value={material.name}
                              onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <span className="text-sm font-medium">{material.name}</span>
                          )}
                        </div>
                        <div className="col-span-3 flex gap-1">
                          <Input
                            type="number"
                            value={material.quantity || ''}
                            onChange={(e) => updateMaterial(material.id, { quantity: parseFloat(e.target.value) || 0 })}
                            className="h-8 text-sm"
                          />
                          {material.isCustom ? (
                            <Input
                              value={material.unit}
                              onChange={(e) => updateMaterial(material.id, { unit: e.target.value })}
                              className="h-8 text-sm w-16"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center">{material.unit}</span>
                          )}
                        </div>
                        <div className="col-span-3">
                          {material.isCustom ? (
                            <Input
                              type="number"
                              value={material.factor || ''}
                              onChange={(e) => updateMaterial(material.id, { factor: parseFloat(e.target.value) || 0 })}
                              className="h-8 text-sm"
                              placeholder="Factor"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">× {material.factor}</span>
                          )}
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <span className="text-sm font-bold text-primary">
                            {((material.quantity || 0) * (material.factor || 0) / 1000).toFixed(3)} t
                          </span>
                          <Button
                            onClick={() => removeMaterial(material.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No materials added. Click "From Database" or "Custom" to add materials.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Transport Tab */}
                <TabsContent value="transport" className="space-y-4 mt-4">
                  <h4 className="font-semibold text-sm">Transport (Scope 3)</h4>
                  {Object.entries(TRANSPORT_FACTORS).map(([key, transport]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm min-w-[140px]">{transport.name}</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={transportInputs[key as keyof TransportInputs] || ''}
                        onChange={(e) => setTransportInputs(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      />
                      <span className="text-sm text-muted-foreground min-w-[40px]">{transport.unit}</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        = {((transportInputs[key as keyof TransportInputs] || 0) * transport.factor / 1000).toFixed(3)} t
                      </span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                <div className="flex gap-3">
                  <Button onClick={saveReport} disabled={saving} className="flex-1">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Report
                  </Button>
                  <Button onClick={() => navigate('/reports')} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={exportToCSV} 
                    variant="outline" 
                    className="flex-1"
                    disabled={materials.length === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={exportToBOQ} 
                    variant="outline"
                    className="flex-1"
                    disabled={materials.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export BOQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-semibold opacity-80">Total Footprint</CardTitle>
              <div className="text-4xl font-bold">{(totals.total / 1000).toFixed(2)} <span className="text-lg">tCO₂e</span></div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                <span className="opacity-80">Energy</span>
                <span className="font-bold">{((totals.scope1 + totals.scope2) / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                <span className="opacity-80">Materials</span>
                <span className="font-bold">{(totals.scope3_materials / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="opacity-80">Transport</span>
                <span className="font-bold">{(totals.scope3_transport / 1000).toFixed(2)} t</span>
              </div>
              
              {materials.length > 0 && (
                <div className="pt-3 mt-3 border-t border-primary-foreground/20 text-xs opacity-70">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    <span>{materials.length} materials ready to export</span>
                  </div>
                  <div className="text-[10px] opacity-60">
                    Use CSV for spreadsheets or BOQ for contractors
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Import Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI BOQ Importer
              </CardTitle>
              <Button onClick={() => setShowAiModal(false)} variant="ghost" size="sm">
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop BOQ file (.txt, .csv) or click to upload</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <textarea
                className="w-full border rounded-lg p-3 text-sm h-32 font-mono"
                placeholder="Or paste BOQ text here..."
                value={boqText}
                onChange={(e) => setBoqText(e.target.value)}
              />
              <Button onClick={handleAiImport} disabled={aiLoading || !boqText.trim()} className="w-full">
                {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {aiLoading ? 'Processing...' : 'Import with AI'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}