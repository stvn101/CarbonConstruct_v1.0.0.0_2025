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
import { Loader2, Plus, Trash2, Save, Eraser, Leaf, CloudUpload, Upload, Sparkles } from "lucide-react";
import { MATERIAL_DB, FUEL_FACTORS, STATE_ELEC_FACTORS, TRANSPORT_FACTORS } from "@/lib/emission-factors";

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
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>(() => loadFromStorage('selectedMaterials', []));
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('projectDetails', JSON.stringify(projectDetails));
    localStorage.setItem('scope1Inputs', JSON.stringify(scope1Inputs));
    localStorage.setItem('scope2Inputs', JSON.stringify(scope2Inputs));
    localStorage.setItem('transportInputs', JSON.stringify(transportInputs));
    localStorage.setItem('selectedMaterials', JSON.stringify(selectedMaterials));
  }, [projectDetails, scope1Inputs, scope2Inputs, transportInputs, selectedMaterials]);

  const calculations = useMemo(() => {
    let s1 = 0, s2 = 0, s3_mat = 0, s3_trans = 0;

    Object.entries(FUEL_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(scope1Inputs[k] || '0');
      s1 += val * f.factor;
    });

    const s2Val = parseFloat(scope2Inputs.kwh || '0');
    const location = projectDetails.location || 'NSW';
    const s2Factor = STATE_ELEC_FACTORS[location as keyof typeof STATE_ELEC_FACTORS]?.factor || 0.66;
    s2 = s2Val * s2Factor;

    selectedMaterials.forEach(m => {
      s3_mat += m.quantity * m.factor;
    });

    Object.entries(TRANSPORT_FACTORS).forEach(([k, f]) => {
      const val = parseFloat(transportInputs[k] || '0');
      s3_trans += val * f.factor;
    });

    return { s1, s2, s3_mat, s3_trans, total: s1 + s2 + s3_mat + s3_trans };
  }, [scope1Inputs, scope2Inputs, selectedMaterials, transportInputs, projectDetails.location]);

  const addMaterial = (category: string, typeId: string) => {
    const catData = MATERIAL_DB[category as keyof typeof MATERIAL_DB];
    const matData = catData.items.find(i => i.id === typeId);
    if (!matData) return;

    const newItem: Material = {
      id: Date.now().toString() + Math.random(),
      category,
      typeId,
      name: matData.name,
      unit: catData.unit,
      factor: matData.factor,
      source: matData.source,
      quantity: 0,
      isCustom: false
    };
    setSelectedMaterials(prev => [...prev, newItem]);
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
      if (file.type === 'application/pdf') {
        toast({ 
          title: "PDF support coming soon", 
          description: "For now, please convert to text or CSV",
          variant: "destructive" 
        });
        setAiProcessing(false);
        return;
      } else {
        text = await file.text();
      }

      // Call the AI function
      const { data, error } = await supabase.functions.invoke('parse-boq', {
        body: { text }
      });

      // Handle rate limiting error (429)
      if (error?.message?.includes('429') || data?.error?.includes('Rate limit')) {
        toast({ 
          title: "🕐 Rate limit reached", 
          description: "Too many AI requests. Please wait a moment and try again.",
          variant: "destructive" 
        });
        setAiProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Handle payment/credits exhausted error (402)
      if (error?.message?.includes('402') || data?.error?.includes('credits exhausted') || data?.error?.includes('Payment required')) {
        toast({ 
          title: "💳 AI credits exhausted", 
          description: "Your AI usage limit has been reached. Please add credits or upgrade your plan.",
          variant: "destructive",
          duration: 7000
        });
        setAiProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Process the materials from AI
      const aiMaterials = data.materials || [];
      const newMaterials: Material[] = aiMaterials.map((item: any) => {
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
        description: `Added ${newMaterials.length} materials from ${file.name}` 
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

    setSaving(true);
    try {
      const { error } = await supabase.from('unified_calculations').insert([{
        project_id: currentProject.id,
        user_id: user.id,
        materials: selectedMaterials as any,
        fuel_inputs: scope1Inputs as any,
        electricity_inputs: scope2Inputs as any,
        transport_inputs: transportInputs as any,
        totals: calculations as any,
        is_draft: false
      }]);

      if (error) throw error;

      toast({ title: "Calculation saved successfully!" });
      navigate('/reports');
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to save", variant: "destructive" });
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addCustomMaterial}
                        className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Custom
                      </Button>
                      <Select onValueChange={(value) => {
                        const [cat, id] = value.split(':');
                        addMaterial(cat, id);
                      }}>
                        <SelectTrigger className="w-[180px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          <SelectValue placeholder="Add From DB" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MATERIAL_DB).map(([catKey, cat]) => (
                            <div key={catKey}>
                              <div className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase">{cat.label}</div>
                              {cat.items.map(item => (
                                <SelectItem key={item.id} value={`${catKey}:${item.id}`} className="text-sm">
                                  {item.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedMaterials.map(m => (
                      <MaterialRow 
                        key={m.id}
                        material={m}
                        onChange={(updated) => setSelectedMaterials(prev => prev.map(mat => mat.id === m.id ? updated : mat))}
                        onRemove={() => setSelectedMaterials(prev => prev.filter(mat => mat.id !== m.id))}
                      />
                    ))}
                    {selectedMaterials.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded text-muted-foreground text-sm">
                        No materials added.
                      </div>
                    )}
                  </div>
                </Card>

                {/* Transport Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">Transport (A5)</h3>
                  {Object.entries(TRANSPORT_FACTORS).map(([k, f]) => (
                    <FactorRow 
                      key={k}
                      label={f.name}
                      unit={f.unit}
                      factor={f.factor}
                      value={transportInputs[k] || ''}
                      onChange={v => setTransportInputs({ ...transportInputs, [k]: v })}
                      total={parseFloat(transportInputs[k] || '0') * f.factor}
                    />
                  ))}
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
                  <span className="font-bold">{((calculations.s1 + calculations.s2) / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Materials</span>
                  <span className="font-bold">{(calculations.s3_mat / 1000).toFixed(2)} t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Transport</span>
                  <span className="font-bold">{(calculations.s3_trans / 1000).toFixed(2)} t</span>
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
