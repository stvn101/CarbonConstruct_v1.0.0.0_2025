import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Wrench, RefreshCw, Hammer, Info, Plus, Trash2 } from "lucide-react";

// Building lifespan options per AS 5377
const BUILDING_LIFESPANS = [
  { value: 30, label: "30 years (Temporary)", description: "Temporary structures, fit-outs" },
  { value: 50, label: "50 years (Standard)", description: "Most commercial/residential buildings" },
  { value: 60, label: "60 years (NCC Default)", description: "NCC 2024 reference study period" },
  { value: 75, label: "75 years (Extended)", description: "Heritage-quality construction" },
  { value: 100, label: "100 years (Long-life)", description: "Infrastructure, institutional" },
];

// Maintenance factors (kgCO2e per m² per year)
const MAINTENANCE_FACTORS: Record<string, { factor: number; interval: number; description: string }> = {
  painting_interior: { factor: 2.5, interval: 7, description: "Interior repainting" },
  painting_exterior: { factor: 4.2, interval: 10, description: "Exterior repainting" },
  carpet_replacement: { factor: 8.5, interval: 10, description: "Carpet replacement" },
  hvac_maintenance: { factor: 1.2, interval: 1, description: "HVAC servicing" },
  roof_maintenance: { factor: 3.0, interval: 15, description: "Roof repairs/coating" },
  facade_cleaning: { factor: 0.5, interval: 2, description: "Facade cleaning" },
  general_repairs: { factor: 1.5, interval: 1, description: "General repairs" },
};

// Replacement components (kgCO2e per m² when replaced)
const REPLACEMENT_COMPONENTS: Record<string, { factor: number; lifespan: number; description: string }> = {
  hvac_system: { factor: 85, lifespan: 20, description: "HVAC system replacement" },
  roofing: { factor: 45, lifespan: 25, description: "Roofing replacement" },
  flooring: { factor: 35, lifespan: 15, description: "Floor coverings" },
  facade_panels: { factor: 65, lifespan: 30, description: "Facade panels" },
  windows: { factor: 55, lifespan: 30, description: "Windows/glazing" },
  lifts: { factor: 120, lifespan: 25, description: "Lift systems" },
  electrical: { factor: 40, lifespan: 25, description: "Electrical systems" },
  plumbing: { factor: 30, lifespan: 30, description: "Plumbing systems" },
};

// Refurbishment scenarios
const REFURBISHMENT_SCENARIOS = [
  { id: "none", label: "No Major Refurbishment", factor: 0 },
  { id: "minor", label: "Minor Refurbishment", factor: 150 }, // kgCO2e/m²
  { id: "major", label: "Major Refurbishment", factor: 350 }, // kgCO2e/m²
];

interface UsePhaseCalculatorProps {
  buildingSqm: number;
  onTotalsChange?: (totals: UsePhaseEmissions) => void;
}

export interface UsePhaseEmissions {
  b1_use: number; // In-use emissions (refrigerants etc)
  b2_maintenance: number;
  b3_repair: number;
  b4_replacement: number;
  b5_refurbishment: number;
  b6_operational_energy: number;
  b7_operational_water: number;
  total: number; // Total B1-B7 in kgCO2e
}

interface MaintenanceItem {
  id: string;
  type: string;
  areaSqm: number;
}

interface ReplacementItem {
  id: string;
  type: string;
  areaSqm: number;
}

const STORAGE_KEY = 'usePhaseCalculatorData';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function UsePhaseCalculator({ buildingSqm, onTotalsChange }: UsePhaseCalculatorProps) {
  const stored = loadFromStorage();
  
  const [buildingLifespan, setBuildingLifespan] = useState<number>(stored?.buildingLifespan || 60);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(stored?.maintenanceItems || []);
  const [replacementItems, setReplacementItems] = useState<ReplacementItem[]>(stored?.replacementItems || []);
  const [refurbishmentScenario, setRefurbishmentScenario] = useState<string>(stored?.refurbishmentScenario || "none");
  
  // B6: Operational Energy
  const [annualElectricity, setAnnualElectricity] = useState<string>(stored?.annualElectricity || "");
  const [annualGas, setAnnualGas] = useState<string>(stored?.annualGas || "");
  const [renewablePercent, setRenewablePercent] = useState<string>(stored?.renewablePercent || "0");
  
  // B7: Operational Water
  const [annualWater, setAnnualWater] = useState<string>(stored?.annualWater || "");
  
  // B1: In-use emissions (refrigerant leakage)
  const [refrigerantCharge, setRefrigerantCharge] = useState<string>(stored?.refrigerantCharge || "");
  const [refrigerantGWP, setRefrigerantGWP] = useState<string>(stored?.refrigerantGWP || "1430"); // R410A default

  const emissions = useMemo(() => {
    const effectiveArea = buildingSqm || 1000;
    
    // B1: In-use emissions (refrigerant leakage ~5% per year)
    const refrigerantKg = parseFloat(refrigerantCharge) || 0;
    const gwp = parseFloat(refrigerantGWP) || 1430;
    const annualLeakageRate = 0.05; // 5% per year
    const b1 = refrigerantKg * gwp * annualLeakageRate * buildingLifespan;
    
    // B2: Maintenance emissions
    let b2 = 0;
    maintenanceItems.forEach(item => {
      const factor = MAINTENANCE_FACTORS[item.type];
      if (factor) {
        const occurrences = Math.floor(buildingLifespan / factor.interval);
        b2 += item.areaSqm * factor.factor * occurrences;
      }
    });
    
    // B3: Repair (estimated as 20% of maintenance for general repairs)
    const b3 = b2 * 0.2;
    
    // B4: Replacement emissions
    let b4 = 0;
    replacementItems.forEach(item => {
      const component = REPLACEMENT_COMPONENTS[item.type];
      if (component) {
        const replacements = Math.max(0, Math.floor(buildingLifespan / component.lifespan) - 1);
        b4 += item.areaSqm * component.factor * replacements;
      }
    });
    
    // B5: Refurbishment
    const refurbFactor = REFURBISHMENT_SCENARIOS.find(s => s.id === refurbishmentScenario)?.factor || 0;
    const b5 = effectiveArea * refurbFactor;
    
    // B6: Operational Energy (kgCO2e)
    const elecKwh = parseFloat(annualElectricity) || 0;
    const gasGj = parseFloat(annualGas) || 0;
    const renewable = parseFloat(renewablePercent) || 0;
    const gridFactor = 0.72 * (1 - renewable / 100); // Australian grid average, reduced by renewables
    const gasFactor = 51.4; // kgCO2e per GJ
    const b6 = (elecKwh * gridFactor + gasGj * gasFactor) * buildingLifespan;
    
    // B7: Operational Water (kgCO2e)
    const waterKl = parseFloat(annualWater) || 0;
    const waterFactor = 1.2; // kgCO2e per kL (Australian average)
    const b7 = waterKl * waterFactor * buildingLifespan;
    
    return {
      b1_use: b1,
      b2_maintenance: b2,
      b3_repair: b3,
      b4_replacement: b4,
      b5_refurbishment: b5,
      b6_operational_energy: b6,
      b7_operational_water: b7,
      total: b1 + b2 + b3 + b4 + b5 + b6 + b7
    };
  }, [
    buildingSqm, buildingLifespan, maintenanceItems, replacementItems, 
    refurbishmentScenario, annualElectricity, annualGas, renewablePercent, 
    annualWater, refrigerantCharge, refrigerantGWP
  ]);

  // Persist and notify parent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      buildingLifespan, maintenanceItems, replacementItems, refurbishmentScenario,
      annualElectricity, annualGas, renewablePercent, annualWater, refrigerantCharge, refrigerantGWP
    }));
    onTotalsChange?.(emissions);
  }, [emissions, onTotalsChange, buildingLifespan, maintenanceItems, replacementItems, refurbishmentScenario, annualElectricity, annualGas, renewablePercent, annualWater, refrigerantCharge, refrigerantGWP]);

  const addMaintenanceItem = () => {
    setMaintenanceItems(prev => [...prev, {
      id: Date.now().toString(),
      type: "painting_interior",
      areaSqm: buildingSqm || 1000
    }]);
  };

  const addReplacementItem = () => {
    setReplacementItems(prev => [...prev, {
      id: Date.now().toString(),
      type: "hvac_system",
      areaSqm: buildingSqm || 1000
    }]);
  };

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h3 className="font-bold text-base md:text-lg text-foreground">B1-B7: Use Phase Emissions</h3>
          <Badge variant="outline" className="text-xs">EN 15978</Badge>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Calculate emissions over the building's service life including maintenance, replacements, and operational energy/water.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Building Lifespan Selection */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 mb-4">
        <div className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-3">Reference Study Period</div>
        <Select value={String(buildingLifespan)} onValueChange={(v) => setBuildingLifespan(parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUILDING_LIFESPANS.map(opt => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                <div>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">- {opt.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* B1: In-Use Emissions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">B1</Badge>
          <span className="text-sm font-medium">In-Use Emissions (Refrigerants)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Refrigerant Charge (kg)</label>
            <Input
              type="number"
              placeholder="0"
              value={refrigerantCharge}
              onChange={(e) => setRefrigerantCharge(e.target.value)}
              className="text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">GWP (R410A=1430)</label>
            <Input
              type="number"
              placeholder="1430"
              value={refrigerantGWP}
              onChange={(e) => setRefrigerantGWP(e.target.value)}
              className="text-foreground"
            />
          </div>
        </div>
      </div>

      {/* B2: Maintenance */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">B2</Badge>
            <Wrench className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Maintenance</span>
          </div>
          <Button variant="outline" size="sm" onClick={addMaintenanceItem}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {maintenanceItems.map(item => (
          <div key={item.id} className="flex gap-2 mb-2 items-end">
            <div className="flex-1">
              <Select value={item.type} onValueChange={(v) => setMaintenanceItems(prev => prev.map(i => i.id === item.id ? { ...i, type: v } : i))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_FACTORS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="m²"
                value={item.areaSqm}
                onChange={(e) => setMaintenanceItems(prev => prev.map(i => i.id === item.id ? { ...i, areaSqm: parseFloat(e.target.value) || 0 } : i))}
                className="text-foreground"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMaintenanceItems(prev => prev.filter(i => i.id !== item.id))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* B4: Replacement */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">B4</Badge>
            <RefreshCw className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Component Replacement</span>
          </div>
          <Button variant="outline" size="sm" onClick={addReplacementItem}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {replacementItems.map(item => (
          <div key={item.id} className="flex gap-2 mb-2 items-end">
            <div className="flex-1">
              <Select value={item.type} onValueChange={(v) => setReplacementItems(prev => prev.map(i => i.id === item.id ? { ...i, type: v } : i))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPLACEMENT_COMPONENTS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.description} ({val.lifespan}yr life)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="m²"
                value={item.areaSqm}
                onChange={(e) => setReplacementItems(prev => prev.map(i => i.id === item.id ? { ...i, areaSqm: parseFloat(e.target.value) || 0 } : i))}
                className="text-foreground"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplacementItems(prev => prev.filter(i => i.id !== item.id))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* B5: Refurbishment */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">B5</Badge>
          <Hammer className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">Refurbishment Scenario</span>
        </div>
        <Select value={refurbishmentScenario} onValueChange={setRefurbishmentScenario}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFURBISHMENT_SCENARIOS.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.label} {s.factor > 0 && `(~${s.factor} kgCO₂e/m²)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* B6: Operational Energy */}
      <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">B6</Badge>
          <span className="text-sm font-medium">Operational Energy (Annual)</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Electricity (kWh/yr)</label>
            <Input
              type="number"
              placeholder="0"
              value={annualElectricity}
              onChange={(e) => setAnnualElectricity(e.target.value)}
              className="text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Gas (GJ/yr)</label>
            <Input
              type="number"
              placeholder="0"
              value={annualGas}
              onChange={(e) => setAnnualGas(e.target.value)}
              className="text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Renewable %</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={renewablePercent}
              onChange={(e) => setRenewablePercent(e.target.value)}
              className="text-foreground"
            />
          </div>
        </div>
      </div>

      {/* B7: Operational Water */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">B7</Badge>
          <span className="text-sm font-medium">Operational Water (Annual)</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Water Use (kL/yr)</label>
          <Input
            type="number"
            placeholder="0"
            value={annualWater}
            onChange={(e) => setAnnualWater(e.target.value)}
            className="text-foreground"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4 mt-4">
        <div className="text-sm font-medium mb-2">Use Phase Summary ({buildingLifespan} years)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">B1-B5 Embodied</div>
            <div className="font-bold text-amber-600">{((emissions.b1_use + emissions.b2_maintenance + emissions.b3_repair + emissions.b4_replacement + emissions.b5_refurbishment) / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">B6 Energy</div>
            <div className="font-bold text-orange-600">{(emissions.b6_operational_energy / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">B7 Water</div>
            <div className="font-bold text-blue-600">{(emissions.b7_operational_water / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-amber-100 rounded p-2">
            <div className="text-amber-700">Total B1-B7</div>
            <div className="font-bold text-amber-700">{(emissions.total / 1000).toFixed(2)} tCO₂e</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
