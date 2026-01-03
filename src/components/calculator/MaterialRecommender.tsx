import { memo, useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Award,
  MapPin,
  Factory,
  FileCheck,
  Info,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMaterialRecommendations } from '@/hooks/useMaterialRecommendations';
import { cn } from '@/lib/utils';

interface Material {
  id: string;
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
}

interface RecommendedMaterial {
  id: string;
  material_name: string;
  material_category: string;
  subcategory: string | null;
  manufacturer: string | null;
  plant_location: string | null;
  region: string | null;
  state: string | null;
  unit: string;
  ef_a1a3: number;
  ef_a4: number;
  ef_a5: number;
  ef_b1b5: number;
  ef_c1c4: number;
  ef_d: number;
  ef_total: number;
  epd_number: string;
  epd_url: string;
  data_quality_tier: string;
  eco_platform_compliant: boolean;
  carbon_savings: number;
  carbon_savings_percent: number;
  ai_score: number;
  cost_impact?: number;
}

interface MaterialRecommenderProps {
  currentMaterial: Material;
  onSelectAlternative: (material: RecommendedMaterial) => void;
  onClose?: () => void;
}

export const MaterialRecommender = memo(({
  currentMaterial,
  onSelectAlternative,
  onClose
}: MaterialRecommenderProps) => {
  const { data, isLoading, error } = useMaterialRecommendations(currentMaterial);
  const [selectedMaterial, setSelectedMaterial] = useState<RecommendedMaterial | null>(null);

  const hasRecommendations = data && data.recommendations.length > 0;

  if (isLoading) {
    return <RecommenderSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Unable to Load Recommendations</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'An error occurred while fetching recommendations'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!hasRecommendations) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle>No Lower-Carbon Alternatives Found</CardTitle>
          </div>
          <CardDescription>
            {currentMaterial.material_name} is already one of the lowest carbon options in the {currentMaterial.material_category} category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Excellent Choice!</p>
              <p className="text-sm text-green-700">
                Current carbon footprint: {currentMaterial.ef_total.toFixed(2)} kgCO₂e/{currentMaterial.unit}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle>AI-Powered Alternatives</CardTitle>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Found {data.recommendations.length} lower-carbon alternatives for {currentMaterial.material_name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard
              label="Current Carbon"
              value={`${data.reasoning.current_carbon.toFixed(2)}`}
              unit={`kgCO₂e/${currentMaterial.unit}`}
              icon={<Info className="h-4 w-4" />}
            />
            <SummaryCard
              label="Best Alternative"
              value={`${data.reasoning.best_alternative_carbon.toFixed(2)}`}
              unit={`kgCO₂e/${currentMaterial.unit}`}
              icon={<TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />}
              className="border-green-500/30 bg-green-500/10 dark:bg-green-900/30"
            />
            <SummaryCard
              label="Max Savings"
              value={`${data.reasoning.max_savings_percent.toFixed(1)}%`}
              unit="carbon reduction"
              icon={<Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
              className="border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-900/30"
            />
          </div>

          <Separator />

          {/* Recommendations List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {data.recommendations.map((material, index) => (
                <RecommendationCard
                  key={material.id}
                  material={material}
                  rank={index + 1}
                  currentUnit={currentMaterial.unit}
                  onSelect={() => setSelectedMaterial(material)}
                  onReplace={() => onSelectAlternative(material)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-2" />
          AI scoring considers carbon savings (40%), data quality (20%), ECO compliance (20%), regional availability (10%), and manufacturer verification (10%)
        </CardFooter>
      </Card>

      {/* Material Details Dialog */}
      <MaterialDetailsDialog
        material={selectedMaterial}
        currentMaterial={currentMaterial}
        onClose={() => setSelectedMaterial(null)}
        onReplace={() => {
          if (selectedMaterial) {
            onSelectAlternative(selectedMaterial);
            setSelectedMaterial(null);
          }
        }}
      />
    </>
  );
});

MaterialRecommender.displayName = 'MaterialRecommender';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SummaryCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  className?: string;
}

const SummaryCard = memo(({ label, value, unit, icon, className }: SummaryCardProps) => (
  <div className={cn('p-4 rounded-lg border', className)}>
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{unit}</p>
  </div>
));

SummaryCard.displayName = 'SummaryCard';

interface RecommendationCardProps {
  material: RecommendedMaterial;
  rank: number;
  currentUnit: string;
  onSelect: () => void;
  onReplace: () => void;
}

const RecommendationCard = memo(({
  material,
  rank,
  currentUnit,
  onSelect,
  onReplace
}: RecommendationCardProps) => {
  const isTopPick = rank === 1;

  return (
    <Card className={cn(
      'cursor-pointer transition-all hover:shadow-md',
      isTopPick && 'border-2 border-primary shadow-md'
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isTopPick ? 'default' : 'secondary'}>
                  #{rank} {isTopPick && '⭐ Top Pick'}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  AI Score: {material.ai_score}
                </Badge>
              </div>
              <h4 className="font-semibold truncate">{material.material_name}</h4>
              {material.subcategory && (
                <p className="text-sm text-muted-foreground">{material.subcategory}</p>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onSelect}>
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View full details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Carbon Savings */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Carbon Savings</span>
                <span className="font-bold text-green-600">
                  -{material.carbon_savings_percent.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(material.carbon_savings_percent, 100)}
                className="h-2 bg-red-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {material.ef_total.toFixed(2)} kgCO₂e/{currentUnit} (saves {material.carbon_savings.toFixed(2)} kgCO₂e)
              </p>
            </div>
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-2">
            {material.eco_platform_compliant && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                ECO Compliant
              </Badge>
            )}
            {material.manufacturer && (
              <Badge variant="outline">
                <Factory className="h-3 w-3 mr-1" />
                {material.manufacturer}
              </Badge>
            )}
            {material.state && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {material.state}
              </Badge>
            )}
            <Badge variant="outline" className={cn(
              material.data_quality_tier === 'tier_1' && 'border-green-600 text-green-600',
              material.data_quality_tier === 'tier_2' && 'border-blue-600 text-blue-600'
            )}>
              <FileCheck className="h-3 w-3 mr-1" />
              {material.data_quality_tier.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Cost Impact */}
          {material.cost_impact !== undefined && material.cost_impact !== 0 && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className={cn(
                'h-4 w-4',
                material.cost_impact > 0 ? 'text-red-600' : 'text-green-600'
              )} />
              <span className={cn(
                material.cost_impact > 0 ? 'text-red-600' : 'text-green-600'
              )}>
                Est. {material.cost_impact > 0 ? '+' : ''}{material.cost_impact.toFixed(1)}% cost {material.cost_impact > 0 ? 'increase' : 'savings'}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              className="flex-1"
            >
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              size="sm"
              onClick={onReplace}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Replace Material
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

interface MaterialDetailsDialogProps {
  material: RecommendedMaterial | null;
  currentMaterial: Material;
  onClose: () => void;
  onReplace: () => void;
}

const MaterialDetailsDialog = memo(({
  material,
  currentMaterial,
  onClose,
  onReplace
}: MaterialDetailsDialogProps) => {
  if (!material) return null;

  return (
    <Dialog open={!!material} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material.material_name}</DialogTitle>
          <DialogDescription>
            Detailed comparison and lifecycle analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current vs. Alternative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComparisonRow
                label="Material"
                current={currentMaterial.material_name}
                alternative={material.material_name}
              />
              <ComparisonRow
                label="Total Carbon"
                current={`${currentMaterial.ef_total.toFixed(2)} kgCO₂e`}
                alternative={`${material.ef_total.toFixed(2)} kgCO₂e`}
                isBetter={material.ef_total < currentMaterial.ef_total}
              />
              <ComparisonRow
                label="Category"
                current={currentMaterial.material_category}
                alternative={material.material_category}
              />
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Carbon Savings:</span>
                  <span className="text-2xl font-bold text-green-600">
                    -{material.carbon_savings_percent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Saves {material.carbon_savings.toFixed(2)} kgCO₂e per {currentMaterial.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifecycle Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <LifecycleModule label="A1-A3: Product Stage" value={material.ef_a1a3} />
                <LifecycleModule label="A4: Transport" value={material.ef_a4} />
                <LifecycleModule label="A5: Construction" value={material.ef_a5} />
                <LifecycleModule label="B1-B5: Use Phase" value={material.ef_b1b5} />
                <LifecycleModule label="C1-C4: End of Life" value={material.ef_c1c4} />
                <LifecycleModule label="D: Benefits & Loads" value={material.ef_d} />
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>{material.ef_total.toFixed(2)} kgCO₂e</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {material.manufacturer && (
                <InfoRow
                  icon={<Factory className="h-4 w-4" />}
                  label="Manufacturer"
                  value={material.manufacturer}
                />
              )}
              {material.plant_location && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Plant Location"
                  value={material.plant_location}
                />
              )}
              {material.state && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="State"
                  value={material.state}
                />
              )}
              {material.region && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Region"
                  value={material.region}
                />
              )}
              <InfoRow
                icon={<FileCheck className="h-4 w-4" />}
                label="Data Quality"
                value={material.data_quality_tier.replace('_', ' ').toUpperCase()}
              />
              <InfoRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="ECO Platform"
                value={material.eco_platform_compliant ? 'Compliant' : 'Not Compliant'}
                valueClassName={material.eco_platform_compliant ? 'text-green-600' : 'text-muted-foreground'}
              />
              <InfoRow
                icon={<FileCheck className="h-4 w-4" />}
                label="EPD Number"
                value={material.epd_number}
              />
              {material.epd_url && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a href={material.epd_url} target="_blank" rel="noopener noreferrer">
                      View EPD Document
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onReplace} className="flex-1" size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Replace Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

MaterialDetailsDialog.displayName = 'MaterialDetailsDialog';

interface ComparisonRowProps {
  label: string;
  current: string;
  alternative: string;
  isBetter?: boolean;
}

const ComparisonRow = memo(({ label, current, alternative, isBetter }: ComparisonRowProps) => (
  <div className="grid grid-cols-3 gap-4 items-center text-sm">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="text-center">{current}</span>
    <div className="flex items-center justify-center gap-2">
      <span className={cn(isBetter && 'text-green-600 font-semibold')}>{alternative}</span>
      {isBetter && <TrendingDown className="h-4 w-4 text-green-600" />}
    </div>
  </div>
));

ComparisonRow.displayName = 'ComparisonRow';

interface LifecycleModuleProps {
  label: string;
  value: number;
}

const LifecycleModule = memo(({ label, value }: LifecycleModuleProps) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono font-medium">{value.toFixed(2)} kgCO₂e</span>
  </div>
));

LifecycleModule.displayName = 'LifecycleModule';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

const InfoRow = memo(({ icon, label, value, valueClassName }: InfoRowProps) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="text-muted-foreground">{icon}</div>
    <span className="text-muted-foreground flex-1">{label}</span>
    <span className={cn('font-medium', valueClassName)}>{value}</span>
  </div>
));

InfoRow.displayName = 'InfoRow';

const RecommenderSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64 mt-2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </CardContent>
  </Card>
));

RecommenderSkeleton.displayName = 'RecommenderSkeleton';
