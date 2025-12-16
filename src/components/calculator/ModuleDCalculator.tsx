import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Recycle, ArrowDownLeft, Info, Leaf } from "lucide-react";

// Module D: Benefits from recycling/reuse - these are NEGATIVE emissions (credits)
// Values represent avoided emissions in kgCO2e per tonne of material recycled/reused
const RECYCLING_CREDITS: Record<string, { credit: number; description: string }> = {
  steel: { credit: -1850, description: "Recycled steel displaces virgin steel production" },
  aluminium: { credit: -8700, description: "Recycled aluminium displaces virgin aluminium" },
  concrete: { credit: -15, description: "Crushed concrete as aggregate" },
  timber: { credit: -1200, description: "Timber reuse or biomass energy recovery" },
  glass: { credit: -280, description: "Recycled glass displaces virgin glass" },
  copper: { credit: -2800, description: "Recycled copper displaces virgin copper" },
  plastics: { credit: -1500, description: "Recycled plastics displace virgin polymers" },
  brick: { credit: -50, description: "Brick reuse or crushed as fill" },
  plasterboard: { credit: -100, description: "Recycled gypsum" },
};

// Energy recovery credits (kgCO2e per tonne)
const ENERGY_RECOVERY_CREDITS: Record<string, { credit: number; description: string }> = {
  timber: { credit: -400, description: "Biomass energy recovery displaces fossil fuels" },
  plastics: { credit: -800, description: "Energy from waste displaces grid electricity" },
  mixed_waste: { credit: -200, description: "General waste-to-energy" },
};

interface ModuleDCalculatorProps {
  onTotalsChange?: (totals: ModuleDEmissions) => void;
}

export interface ModuleDEmissions {
  recycling_credits: number;
  reuse_credits: number;
  energy_recovery_credits: number;
  total: number; // Total Module D (negative = benefit) in kgCO2e
}

interface RecyclingItem {
  material: string;
  tonnes: number;
}

interface ReuseItem {
  material: string;
  tonnes: number;
  reusePercent: number; // 100% reuse = full credit
}

interface EnergyRecoveryItem {
  material: string;
  tonnes: number;
}

const STORAGE_KEY = 'moduleDCalculatorData';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function ModuleDCalculator({ onTotalsChange }: ModuleDCalculatorProps) {
  const stored = loadFromStorage();
  
  const [recyclingItems, setRecyclingItems] = useState<RecyclingItem[]>(stored?.recyclingItems || [
    { material: "steel", tonnes: 0 },
    { material: "aluminium", tonnes: 0 },
    { material: "concrete", tonnes: 0 },
    { material: "timber", tonnes: 0 },
    { material: "glass", tonnes: 0 },
  ]);
  
  const [reuseItems, setReuseItems] = useState<ReuseItem[]>(stored?.reuseItems || [
    { material: "steel", tonnes: 0, reusePercent: 100 },
    { material: "timber", tonnes: 0, reusePercent: 100 },
    { material: "brick", tonnes: 0, reusePercent: 100 },
  ]);
  
  const [energyRecoveryItems, setEnergyRecoveryItems] = useState<EnergyRecoveryItem[]>(stored?.energyRecoveryItems || [
    { material: "timber", tonnes: 0 },
    { material: "plastics", tonnes: 0 },
  ]);

  const emissions = useMemo(() => {
    // Recycling credits (negative values = benefits)
    let recyclingCredits = 0;
    recyclingItems.forEach(item => {
      const credit = RECYCLING_CREDITS[item.material]?.credit || 0;
      recyclingCredits += item.tonnes * credit;
    });
    
    // Reuse credits (higher credit than recycling - avoids processing)
    let reuseCredits = 0;
    reuseItems.forEach(item => {
      const baseCredit = RECYCLING_CREDITS[item.material]?.credit || 0;
      // Reuse gets 120% of recycling credit (avoids reprocessing energy)
      const reuseCredit = baseCredit * 1.2 * (item.reusePercent / 100);
      reuseCredits += item.tonnes * reuseCredit;
    });
    
    // Energy recovery credits
    let energyCredits = 0;
    energyRecoveryItems.forEach(item => {
      const credit = ENERGY_RECOVERY_CREDITS[item.material]?.credit || -200;
      energyCredits += item.tonnes * credit;
    });
    
    return {
      recycling_credits: recyclingCredits,
      reuse_credits: reuseCredits,
      energy_recovery_credits: energyCredits,
      total: recyclingCredits + reuseCredits + energyCredits
    };
  }, [recyclingItems, reuseItems, energyRecoveryItems]);

  // Persist and notify parent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      recyclingItems, reuseItems, energyRecoveryItems
    }));
    onTotalsChange?.(emissions);
  }, [emissions, onTotalsChange, recyclingItems, reuseItems, energyRecoveryItems]);

  const updateRecyclingItem = (index: number, tonnes: number) => {
    setRecyclingItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], tonnes };
      return updated;
    });
  };

  const updateReuseItem = (index: number, field: 'tonnes' | 'reusePercent', value: number) => {
    setReuseItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateEnergyRecoveryItem = (index: number, tonnes: number) => {
    setEnergyRecoveryItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], tonnes };
      return updated;
    });
  };

  const getMaterialLabel = (material: string) => {
    const labels: Record<string, string> = {
      steel: "Steel",
      aluminium: "Aluminium",
      concrete: "Concrete",
      timber: "Timber",
      glass: "Glass",
      copper: "Copper",
      plastics: "Plastics",
      brick: "Brick",
      plasterboard: "Plasterboard",
      mixed_waste: "Mixed Waste",
    };
    return labels[material] || material;
  };

  const totalCredits = Math.abs(emissions.total);
  const hasAnyInput = recyclingItems.some(i => i.tonnes > 0) || 
                      reuseItems.some(i => i.tonnes > 0) || 
                      energyRecoveryItems.some(i => i.tonnes > 0);

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
          <h3 className="font-bold text-base md:text-lg text-foreground">Module D: Beyond Building Lifecycle</h3>
          <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Credits</Badge>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Module D captures benefits beyond the building lifecycle - emissions avoided through recycling, reuse, and energy recovery. These are shown as negative values (credits).</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Recycling Credits */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Recycle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Recycling Credits</span>
        </div>
        <div className="space-y-2">
          {recyclingItems.map((item, index) => {
            const creditInfo = RECYCLING_CREDITS[item.material];
            const itemCredit = item.tonnes * (creditInfo?.credit || 0);
            return (
              <div key={item.material} className="flex items-center gap-3">
                <span className="text-sm w-24 text-emerald-700 dark:text-emerald-300">{getMaterialLabel(item.material)}</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={item.tonnes || ''}
                  onChange={(e) => updateRecyclingItem(index, parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-sm text-foreground dark:bg-emerald-900/30 dark:border-emerald-700"
                />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">tonnes</span>
                {item.tonnes > 0 && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-auto">
                    {(itemCredit / 1000).toFixed(2)} tCO₂e
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reuse Credits */}
      <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-300">Direct Reuse Credits</span>
          <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">+20% bonus</Badge>
        </div>
        <p className="text-xs text-green-700 dark:text-green-400 mb-3">
          Direct reuse avoids reprocessing energy and receives a 20% higher credit than recycling.
        </p>
        <div className="space-y-2">
          {reuseItems.map((item, index) => {
            const baseCredit = RECYCLING_CREDITS[item.material]?.credit || 0;
            const itemCredit = item.tonnes * baseCredit * 1.2 * (item.reusePercent / 100);
            return (
              <div key={item.material} className="flex items-center gap-3 flex-wrap">
                <span className="text-sm w-20 text-green-700 dark:text-green-300">{getMaterialLabel(item.material)}</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={item.tonnes || ''}
                  onChange={(e) => updateReuseItem(index, 'tonnes', parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-sm text-foreground dark:bg-green-900/30 dark:border-green-700"
                />
                <span className="text-xs text-green-600 dark:text-green-400">tonnes @</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={item.reusePercent || ''}
                  onChange={(e) => updateReuseItem(index, 'reusePercent', parseFloat(e.target.value) || 0)}
                  className="w-16 h-8 text-sm text-foreground dark:bg-green-900/30 dark:border-green-700"
                />
                <span className="text-xs text-green-600 dark:text-green-400">%</span>
                {item.tonnes > 0 && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-auto">
                    {(itemCredit / 1000).toFixed(2)} tCO₂e
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Recovery Credits */}
      <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Energy Recovery Credits</span>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-400 mb-3">
          Energy recovered from waste-to-energy processes displaces fossil fuel electricity.
        </p>
        <div className="space-y-2">
          {energyRecoveryItems.map((item, index) => {
            const creditInfo = ENERGY_RECOVERY_CREDITS[item.material];
            const itemCredit = item.tonnes * (creditInfo?.credit || -200);
            return (
              <div key={item.material} className="flex items-center gap-3">
                <span className="text-sm w-24 text-orange-700 dark:text-orange-300">{getMaterialLabel(item.material)}</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={item.tonnes || ''}
                  onChange={(e) => updateEnergyRecoveryItem(index, parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-sm text-foreground dark:bg-orange-900/30 dark:border-orange-700"
                />
                <span className="text-xs text-orange-600 dark:text-orange-400">tonnes</span>
                {item.tonnes > 0 && (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 ml-auto">
                    {(itemCredit / 1000).toFixed(2)} tCO₂e
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Module D Summary</span>
          {hasAnyInput && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50">
              Circular Economy Benefits
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">Recycling</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">{(emissions.recycling_credits / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">Reuse</div>
            <div className="font-bold text-green-600 dark:text-green-400">{(emissions.reuse_credits / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-muted-foreground">Energy Recovery</div>
            <div className="font-bold text-orange-600 dark:text-orange-400">{(emissions.energy_recovery_credits / 1000).toFixed(2)} t</div>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded p-2">
            <div className="text-emerald-700 dark:text-emerald-300">Total Credits</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-300">{(emissions.total / 1000).toFixed(2)} tCO₂e</div>
          </div>
        </div>
        
        {hasAnyInput && totalCredits > 0 && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
            💡 These credits offset {(totalCredits / 1000).toFixed(2)} tCO₂e of upfront emissions through circular economy practices.
          </p>
        )}
      </div>
    </Card>
  );
}
