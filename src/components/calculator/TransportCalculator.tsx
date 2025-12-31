import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Plus, Trash2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  TRANSPORT_MODES,
  MATERIAL_TRANSPORT_DEFAULTS,
  calculateA4Emissions,
  estimateDistanceByPostcodes,
  getTransportMode,
} from "@/data/transport-matrix";

interface TransportItem {
  id: string;
  description: string;
  materialTonnes: number;
  fromPostcode: string;
  toPostcode: string;
  distanceKm: number;
  modeId: string;
  emissions: number;
  isEstimated: boolean;
}

interface TransportCalculatorProps {
  onTotalChange?: (totalEmissions: number) => void;
}

const STORAGE_KEY = 'transportCalculatorItems';

const loadFromStorage = (): TransportItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function TransportCalculator({ onTotalChange }: TransportCalculatorProps) {
  const [items, setItems] = useState<TransportItem[]>(() => loadFromStorage());
  const [quickCalc, setQuickCalc] = useState({
    tonnes: '',
    fromPostcode: '',
    toPostcode: '',
    modeId: 'articulated_truck'
  });

  const totalEmissions = useMemo(() => {
    return items.reduce((sum, item) => sum + item.emissions, 0);
  }, [items]);

  // Notify parent of total emissions changes
  useEffect(() => {
    onTotalChange?.(totalEmissions);
  }, [totalEmissions, onTotalChange]);

  // Persist items to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleQuickCalc = () => {
    const tonnes = parseFloat(quickCalc.tonnes) || 0;
    if (tonnes <= 0) return;

    let distanceKm = 100; // Default
    let isEstimated = true;

    if (quickCalc.fromPostcode && quickCalc.toPostcode) {
      const result = estimateDistanceByPostcodes(quickCalc.fromPostcode, quickCalc.toPostcode);
      distanceKm = result.distance_km;
      isEstimated = result.estimated;
    }

    const calc = calculateA4Emissions(tonnes, distanceKm, quickCalc.modeId);
    
    const newItem: TransportItem = {
      id: Date.now().toString(),
      description: `${quickCalc.fromPostcode || '?'} → ${quickCalc.toPostcode || '?'}`,
      materialTonnes: tonnes,
      fromPostcode: quickCalc.fromPostcode,
      toPostcode: quickCalc.toPostcode,
      distanceKm,
      modeId: quickCalc.modeId,
      emissions: calc.emissions_kg,
      isEstimated
    };

    setItems(prev => [...prev, newItem]);
    setQuickCalc({ tonnes: '', fromPostcode: '', toPostcode: '', modeId: 'articulated_truck' });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<TransportItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, ...updates };
      
      // Recalculate emissions if relevant fields changed
      if (updates.materialTonnes !== undefined || updates.distanceKm !== undefined || updates.modeId !== undefined) {
        const calc = calculateA4Emissions(
          updated.materialTonnes,
          updated.distanceKm,
          updated.modeId
        );
        updated.emissions = calc.emissions_kg;
      }
      
      return updated;
    }));
  };

  const selectedMode = getTransportMode(quickCalc.modeId);

  return (
    <Card className="p-4 md:p-5 glass-glow-hover neon-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-base md:text-lg text-foreground">A4 Transport Emissions</h3>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Calculate emissions from transporting materials to site. Based on Australian NGA emission factors (kg CO2e per tonne-km).</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Quick Add Form - Mobile-first stacked layout */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4 mb-4">
        <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-3">Add Transport Leg</div>
        
        {/* Mobile: stacked layout, Desktop: grid */}
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-3">
          {/* Weight */}
          <div className="md:col-span-2">
            <label className="text-xs text-foreground mb-1 block">Weight (tonnes)</label>
            <Input
              type="number"
              placeholder="0"
              value={quickCalc.tonnes}
              onChange={(e) => setQuickCalc(prev => ({ ...prev, tonnes: e.target.value }))}
              className="text-foreground"
            />
          </div>

          {/* Postcodes row on mobile */}
          <div className="grid grid-cols-2 gap-3 md:contents">
            {/* From Postcode */}
            <div className="md:col-span-2">
              <label className="text-xs text-foreground mb-1 block">From</label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="2000"
                  value={quickCalc.fromPostcode}
                  onChange={(e) => setQuickCalc(prev => ({ ...prev, fromPostcode: e.target.value }))}
                  className="pl-7 text-foreground"
                  maxLength={4}
                />
              </div>
            </div>

            {/* To Postcode */}
            <div className="md:col-span-2">
              <label className="text-xs text-foreground mb-1 block">To</label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="2150"
                  value={quickCalc.toPostcode}
                  onChange={(e) => setQuickCalc(prev => ({ ...prev, toPostcode: e.target.value }))}
                  className="pl-7 text-foreground"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          <div className="md:col-span-4">
            <label className="text-xs text-foreground mb-1 block">Transport Mode</label>
            <Select 
              value={quickCalc.modeId} 
              onValueChange={(v) => setQuickCalc(prev => ({ ...prev, modeId: v }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_MODES.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <span>{mode.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <div className="md:col-span-2 md:flex md:items-end">
            <Button 
              onClick={handleQuickCalc}
              disabled={!quickCalc.tonnes}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {selectedMode && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            💡 {selectedMode.description}
          </p>
        )}
      </div>

      {/* Material Defaults Reference */}
      <details className="mb-4">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
          📚 Typical transport distances by material type
        </summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
          {MATERIAL_TRANSPORT_DEFAULTS.slice(0, 5).map(def => (
            <div key={def.materialCategory} className="text-xs bg-muted/50 rounded px-2 py-1">
              <span className="font-medium capitalize">{def.materialCategory}</span>
              <span className="text-muted-foreground ml-1">~{def.typicalDistance_km}km</span>
            </div>
          ))}
        </div>
      </details>

      {/* Items List - Card based for mobile */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map(item => {
            getTransportMode(item.modeId);
            return (
              <div key={item.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                {/* Header row with route and delete */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.description}</span>
                    {item.isEstimated && (
                      <Badge variant="outline" className="text-xs">Est.</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                {/* Data grid - 2x2 on mobile, inline on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Weight (t)</label>
                    <Input
                      type="number"
                      value={item.materialTonnes || ''}
                      onChange={(e) => updateItem(item.id, { materialTonnes: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Distance (km)</label>
                    <Input
                      type="number"
                      value={item.distanceKm || ''}
                      onChange={(e) => updateItem(item.id, { distanceKm: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Mode</label>
                    <Select
                      value={item.modeId}
                      onValueChange={(v) => updateItem(item.id, { modeId: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSPORT_MODES.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Emissions</label>
                    <div className="h-8 flex items-center">
                      <span className="font-bold text-emerald-500 text-sm">
                        {(item.emissions / 1000).toFixed(3)} t
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t mt-3">
            <span className="text-sm font-medium text-muted-foreground">Total A4 Transport Emissions</span>
            <span className="text-lg font-bold text-blue-600">
              {(totalEmissions / 1000).toFixed(3)} tCO₂e
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No transport legs added yet</p>
          <p className="text-xs">Add material deliveries to calculate A4 emissions</p>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong>Emission Factors (NGA 2024):</strong>
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          Rigid: 0.089-0.207 | Semi: 0.062 | B-Double: 0.048 | Rail: 0.021 kg/t·km
        </div>
      </div>
    </Card>
  );
}
