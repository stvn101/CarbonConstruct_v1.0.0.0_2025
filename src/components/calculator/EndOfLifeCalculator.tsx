import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Truck, Info, Recycle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Demolition methods and their emission factors (kgCO2e per m²)
const DEMOLITION_METHODS = [
  { id: "conventional", label: "Conventional Demolition", factor: 25, description: "Standard mechanical demolition" },
  { id: "selective", label: "Selective Demolition", factor: 35, description: "Careful material separation for recycling" },
  { id: "deconstruction", label: "Deconstruction", factor: 45, description: "Manual dismantling for maximum reuse" },
  { id: "implosion", label: "Controlled Implosion", factor: 15, description: "Explosive demolition (large structures)" },
];

// Waste processing emission factors (kgCO2e per tonne)
const WASTE_PROCESSING_FACTORS: Record<string, { landfill: number; recycling: number; incineration: number }> = {
  concrete: { landfill: 5, recycling: 15, incineration: 0 },
  steel: { landfill: 10, recycling: 450, incineration: 0 },
  timber: { landfill: 50, recycling: 20, incineration: 80 },
  brick: { landfill: 5, recycling: 12, incineration: 0 },
  glass: { landfill: 8, recycling: 25, incineration: 0 },
  plasterboard: { landfill: 15, recycling: 30, incineration: 0 },
  mixed_waste: { landfill: 50, recycling: 100, incineration: 150 },
  plastics: { landfill: 20, recycling: 80, incineration: 200 },
  insulation: { landfill: 25, recycling: 40, incineration: 100 },
  aluminium: { landfill: 15, recycling: 850, incineration: 0 },
};

// Transport to disposal factors (kgCO2e per tonne-km)
const DISPOSAL_TRANSPORT_FACTOR = 0.089; // Articulated truck

interface EndOfLifeCalculatorProps {
  buildingSqm: number;
  onTotalsChange?: (totals: EndOfLifeEmissions) => void;
}

export interface EndOfLifeEmissions {
  c1_deconstruction: number;
  c2_transport: number;
  c3_waste_processing: number;
  c4_disposal: number;
  total: number; // Total C1-C4 in kgCO2e
}

interface WasteFraction {
  material: string;
  tonnes: number;
  recyclePercent: number;
  landfillPercent: number;
  incinerationPercent: number;
}

const STORAGE_KEY = 'endOfLifeCalculatorData';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function EndOfLifeCalculator({ buildingSqm, onTotalsChange }: EndOfLifeCalculatorProps) {
  const stored = loadFromStorage();
  
  const [demolitionMethod, setDemolitionMethod] = useState<string>(stored?.demolitionMethod || "selective");
  const [transportDistance, setTransportDistance] = useState<string>(stored?.transportDistance || "50");
  
  // Default waste fractions based on typical building composition
  const [wasteFractions, setWasteFractions] = useState<WasteFraction[]>(stored?.wasteFractions || [
    { material: "concrete", tonnes: 0, recyclePercent: 80, landfillPercent: 20, incinerationPercent: 0 },
    { material: "steel", tonnes: 0, recyclePercent: 95, landfillPercent: 5, incinerationPercent: 0 },
    { material: "timber", tonnes: 0, recyclePercent: 40, landfillPercent: 40, incinerationPercent: 20 },
    { material: "brick", tonnes: 0, recyclePercent: 70, landfillPercent: 30, incinerationPercent: 0 },
    { material: "glass", tonnes: 0, recyclePercent: 60, landfillPercent: 40, incinerationPercent: 0 },
    { material: "plasterboard", tonnes: 0, recyclePercent: 50, landfillPercent: 50, incinerationPercent: 0 },
    { material: "mixed_waste", tonnes: 0, recyclePercent: 20, landfillPercent: 70, incinerationPercent: 10 },
  ]);

  const emissions = useMemo(() => {
    const effectiveArea = buildingSqm || 1000;
    const distance = parseFloat(transportDistance) || 50;
    
    // C1: Deconstruction/demolition
    const demolitionFactor = DEMOLITION_METHODS.find(m => m.id === demolitionMethod)?.factor || 25;
    const c1 = effectiveArea * demolitionFactor;
    
    // Calculate total waste tonnage
    const totalWasteTonnes = wasteFractions.reduce((sum, w) => sum + w.tonnes, 0);
    
    // C2: Transport to waste processing/disposal
    const c2 = totalWasteTonnes * distance * DISPOSAL_TRANSPORT_FACTOR;
    
    // C3: Waste processing (recycling, incineration)
    let c3 = 0;
    wasteFractions.forEach(w => {
      const factors = WASTE_PROCESSING_FACTORS[w.material] || WASTE_PROCESSING_FACTORS.mixed_waste;
      const recycledTonnes = w.tonnes * (w.recyclePercent / 100);
      const incineratedTonnes = w.tonnes * (w.incinerationPercent / 100);
      c3 += recycledTonnes * factors.recycling;
      c3 += incineratedTonnes * factors.incineration;
    });
    
    // C4: Disposal (landfill)
    let c4 = 0;
    wasteFractions.forEach(w => {
      const factors = WASTE_PROCESSING_FACTORS[w.material] || WASTE_PROCESSING_FACTORS.mixed_waste;
      const landfillTonnes = w.tonnes * (w.landfillPercent / 100);
      c4 += landfillTonnes * factors.landfill;
    });
    
    return {
      c1_deconstruction: c1,
      c2_transport: c2,
      c3_waste_processing: c3,
      c4_disposal: c4,
      total: c1 + c2 + c3 + c4
    };
  }, [buildingSqm, demolitionMethod, transportDistance, wasteFractions]);

  // Persist and notify parent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      demolitionMethod, transportDistance, wasteFractions
    }));
    onTotalsChange?.(emissions);
  }, [emissions, onTotalsChange, demolitionMethod, transportDistance, wasteFractions]);

  const updateWasteFraction = (index: number, field: keyof WasteFraction, value: number | string) => {
    setWasteFractions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-balance percentages if needed
      if (field === 'recyclePercent' || field === 'landfillPercent' || field === 'incinerationPercent') {
        const total = updated[index].recyclePercent + updated[index].landfillPercent + updated[index].incinerationPercent;
        if (total > 100) {
          // Reduce the other percentages proportionally
          const excess = total - 100;
          if (field === 'recyclePercent') {
            updated[index].landfillPercent = Math.max(0, updated[index].landfillPercent - excess / 2);
            updated[index].incinerationPercent = Math.max(0, updated[index].incinerationPercent - excess / 2);
          } else if (field === 'landfillPercent') {
            updated[index].recyclePercent = Math.max(0, updated[index].recyclePercent - excess);
          } else {
            updated[index].landfillPercent = Math.max(0, updated[index].landfillPercent - excess);
          }
        }
      }
      
      return updated;
    });
  };

  const getMaterialLabel = (material: string) => {
    const labels: Record<string, string> = {
      concrete: "Concrete & Masonry",
      steel: "Steel & Metal",
      timber: "Timber",
      brick: "Brick",
      glass: "Glass",
      plasterboard: "Plasterboard",
      mixed_waste: "Mixed C&D Waste",
      plastics: "Plastics",
      insulation: "Insulation",
      aluminium: "Aluminium",
    };
    return labels[material] || material;
  };

  const totalWaste = wasteFractions.reduce((sum, w) => sum + w.tonnes, 0);
  const avgRecycleRate = totalWaste > 0 
    ? wasteFractions.reduce((sum, w) => sum + w.tonnes * w.recyclePercent, 0) / totalWaste 
    : 0;

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h3 className="font-bold text-base md:text-lg text-foreground">C1-C4: End-of-Life Emissions</h3>
          <Badge variant="outline" className="text-xs">EN 15978</Badge>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Calculate emissions from demolition, waste transport, processing, and disposal at the building's end of life.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* C1: Demolition Method */}
      <div className="bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200">C1</Badge>
          <span className="text-sm font-medium text-red-900 dark:text-red-100">Deconstruction/Demolition Method</span>
        </div>
        <Select value={demolitionMethod} onValueChange={setDemolitionMethod}>
          <SelectTrigger className="bg-white dark:bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEMOLITION_METHODS.map(m => (
              <SelectItem key={m.id} value={m.id}>
                <div>
                  <span className="font-medium">{m.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">~{m.factor} kgCO₂e/m²</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-red-700 dark:text-red-300 mt-2 font-medium">
          {DEMOLITION_METHODS.find(m => m.id === demolitionMethod)?.description}
        </p>
      </div>

      {/* C2: Transport Distance */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">C2</Badge>
          <Truck className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">Transport to Disposal/Processing</span>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="50"
            value={transportDistance}
            onChange={(e) => setTransportDistance(e.target.value)}
            className="w-24 text-foreground"
          />
          <span className="text-sm text-muted-foreground">km average distance</span>
        </div>
      </div>

      {/* C3 & C4: Waste Processing & Disposal */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">C3/C4</Badge>
          <Recycle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">Waste Processing & Disposal</span>
        </div>
        
        <div className="space-y-4">
          {wasteFractions.map((w, index) => (
            <div key={w.material} className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{getMaterialLabel(w.material)}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={w.tonnes || ''}
                    onChange={(e) => updateWasteFraction(index, 'tonnes', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm text-foreground"
                  />
                  <span className="text-xs text-muted-foreground">tonnes</span>
                </div>
              </div>
              
              {w.tonnes > 0 && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Recycle</span>
                    <Slider
                      value={[w.recyclePercent]}
                      onValueChange={([v]) => updateWasteFraction(index, 'recyclePercent', v)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-12 text-right text-emerald-600">{w.recyclePercent}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Landfill</span>
                    <Slider
                      value={[w.landfillPercent]}
                      onValueChange={([v]) => updateWasteFraction(index, 'landfillPercent', v)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-12 text-right text-red-600">{w.landfillPercent}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Incinerate</span>
                    <Slider
                      value={[w.incinerationPercent]}
                      onValueChange={([v]) => updateWasteFraction(index, 'incinerationPercent', v)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-12 text-right text-orange-600">{w.incinerationPercent}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">End-of-Life Summary</span>
          <Badge variant={avgRecycleRate >= 70 ? "default" : avgRecycleRate >= 50 ? "secondary" : "destructive"}>
            {avgRecycleRate.toFixed(0)}% Recycling Rate
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">C1 Demolition</div>
            <div className="font-bold text-red-600">{(emissions.c1_deconstruction / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">C2 Transport</div>
            <div className="font-bold text-red-600">{(emissions.c2_transport / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">C3 Processing</div>
            <div className="font-bold text-red-600">{(emissions.c3_waste_processing / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">C4 Disposal</div>
            <div className="font-bold text-red-600">{(emissions.c4_disposal / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-red-100 rounded p-2">
            <div className="text-red-700">Total C1-C4</div>
            <div className="font-bold text-red-700">{(emissions.total / 1000).toFixed(2)} tCO₂e</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
