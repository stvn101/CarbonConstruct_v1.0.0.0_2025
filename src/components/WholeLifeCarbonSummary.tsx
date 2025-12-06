import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WholeLifeCarbonTotals } from "@/hooks/useWholeLifeCarbonCalculations";
import { Factory, Truck, Hammer, Wrench, Zap, Droplets, Trash2, Recycle } from "lucide-react";

interface WholeLifeCarbonSummaryProps {
  totals: WholeLifeCarbonTotals;
  buildingLifespan?: number;
}

export function WholeLifeCarbonSummary({ totals, buildingLifespan = 60 }: WholeLifeCarbonSummaryProps) {
  // Convert to tonnes for display
  const toTonnes = (kg: number) => kg / 1000;
  
  // Calculate percentages for visualization
  const wholeLife = Math.abs(totals.total_whole_life);
  const upfrontPercent = wholeLife > 0 ? (totals.total_upfront / wholeLife) * 100 : 0;
  const usePhasePercent = wholeLife > 0 ? ((totals.b1_use + totals.b2_maintenance + totals.b3_repair + totals.b4_replacement + totals.b5_refurbishment) / wholeLife) * 100 : 0;
  const operationalPercent = wholeLife > 0 ? (totals.total_operational / wholeLife) * 100 : 0;
  const endOfLifePercent = wholeLife > 0 ? ((totals.c1_deconstruction + totals.c2_transport + totals.c3_waste_processing + totals.c4_disposal) / wholeLife) * 100 : 0;
  
  // Module D offset percentage (of whole life)
  const moduleDTotal = totals.d_recycling + totals.d_reuse + totals.d_energy_recovery;
  const offsetPercent = wholeLife > 0 ? (Math.abs(moduleDTotal) / wholeLife) * 100 : 0;

  const stageData = [
    { 
      stage: "A1-A3", 
      label: "Product Stage", 
      value: toTonnes(totals.a1a3_product), 
      color: "bg-blue-500",
      icon: Factory 
    },
    { 
      stage: "A4", 
      label: "Transport", 
      value: toTonnes(totals.a4_transport), 
      color: "bg-blue-400",
      icon: Truck 
    },
    { 
      stage: "A5", 
      label: "Construction", 
      value: toTonnes(totals.a5_construction), 
      color: "bg-blue-300",
      icon: Hammer 
    },
    { 
      stage: "B1-B5", 
      label: "Use (Embodied)", 
      value: toTonnes(totals.b1_use + totals.b2_maintenance + totals.b3_repair + totals.b4_replacement + totals.b5_refurbishment), 
      color: "bg-amber-500",
      icon: Wrench 
    },
    { 
      stage: "B6", 
      label: "Operational Energy", 
      value: toTonnes(totals.b6_operational_energy), 
      color: "bg-orange-500",
      icon: Zap 
    },
    { 
      stage: "B7", 
      label: "Operational Water", 
      value: toTonnes(totals.b7_operational_water), 
      color: "bg-cyan-500",
      icon: Droplets 
    },
    { 
      stage: "C1-C4", 
      label: "End of Life", 
      value: toTonnes(totals.c1_deconstruction + totals.c2_transport + totals.c3_waste_processing + totals.c4_disposal), 
      color: "bg-red-500",
      icon: Trash2 
    },
    { 
      stage: "D", 
      label: "Benefits", 
      value: toTonnes(moduleDTotal), 
      color: "bg-emerald-500",
      icon: Recycle,
      isCredit: true 
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Whole Life Carbon Assessment</CardTitle>
          <Badge variant="outline" className="text-xs">EN 15978</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {buildingLifespan}-year reference study period
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            <div className="text-xs text-blue-600 dark:text-blue-400">Upfront (A1-A5)</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {toTonnes(totals.total_upfront).toFixed(1)} t
            </div>
            <div className="text-xs text-muted-foreground">{upfrontPercent.toFixed(0)}% of WLC</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
            <div className="text-xs text-amber-600 dark:text-amber-400">Use Phase (B1-B7)</div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {toTonnes(totals.total_operational + totals.b1_use + totals.b2_maintenance + totals.b3_repair + totals.b4_replacement + totals.b5_refurbishment).toFixed(1)} t
            </div>
            <div className="text-xs text-muted-foreground">{(usePhasePercent + operationalPercent).toFixed(0)}% of WLC</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3">
            <div className="text-xs text-red-600 dark:text-red-400">End of Life (C1-C4)</div>
            <div className="text-xl font-bold text-red-700 dark:text-red-300">
              {toTonnes(totals.c1_deconstruction + totals.c2_transport + totals.c3_waste_processing + totals.c4_disposal).toFixed(1)} t
            </div>
            <div className="text-xs text-muted-foreground">{endOfLifePercent.toFixed(0)}% of WLC</div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3">
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Benefits (D)</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {toTonnes(moduleDTotal).toFixed(1)} t
            </div>
            <div className="text-xs text-muted-foreground">{offsetPercent.toFixed(0)}% offset</div>
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Lifecycle Stage Breakdown</div>
          {stageData.map(item => {
            const Icon = item.icon;
            const percentage = wholeLife > 0 ? (Math.abs(item.value * 1000) / wholeLife) * 100 : 0;
            return (
              <div key={item.stage} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs w-16 flex-shrink-0">{item.stage}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-20 text-right ${item.isCredit ? 'text-emerald-600' : ''}`}>
                  {item.value.toFixed(2)} t
                </span>
              </div>
            );
          })}
        </div>

        {/* Final Totals */}
        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Whole Life Carbon (A-C)</span>
            <span className="font-bold">{toTonnes(totals.total_whole_life).toFixed(2)} tCO₂e</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Net Carbon (A-D)</span>
            <span className="font-bold text-lg">{toTonnes(totals.total_with_benefits).toFixed(2)} tCO₂e</span>
          </div>
          {totals.intensity_whole_life && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Carbon Intensity</span>
              <span className="font-medium">{totals.intensity_whole_life.toFixed(1)} kgCO₂e/m²</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
