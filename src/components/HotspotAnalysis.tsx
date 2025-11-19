import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLCAMaterials } from '@/hooks/useLCAMaterials';
import { useHotspotAnalysis, getSeverityColor, getSeverityLabel } from '@/hooks/useHotspotAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Flame, Lightbulb, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { logger } from '@/lib/logger';
import { DEBOUNCE } from '@/lib/constants';
import { debounce } from '@/lib/debounce';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const HotspotAnalysis = () => {
  const { materials, loading, stageBreakdown, categoryBreakdown } = useLCAMaterials();
  const { materialHotspots, categoryHotspots, overallStats } = useHotspotAnalysis(materials, categoryBreakdown);
  const [recommendations, setRecommendations] = useState<string>('');
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  const generateRecommendations = async () => {
    if (materialHotspots.length === 0 && categoryHotspots.length === 0) {
      toast({
        title: 'No Hotspots Found',
        description: 'No significant carbon hotspots detected to analyze',
      });
      return;
    }

    setGeneratingRecommendations(true);
    try {
      // Prepare hotspot data for AI
      const hotspotsData = [
        ...materialHotspots.map(h => ({
          name: h.material.material_name,
          category: h.material.material_category,
          severity: h.severity,
          emissions: h.emissions,
          percentageOfTotal: h.percentageOfTotal,
          stage: h.stage,
        })),
        ...categoryHotspots.map(h => ({
          category: h.category,
          severity: h.severity,
          emissions: h.totalEmissions,
          percentageOfTotal: h.percentageOfTotal,
          stage: h.topStage,
        })),
      ];

      const { data, error } = await supabase.functions.invoke('carbon-recommendations', {
        body: {
          hotspots: hotspotsData,
          totalEmissions: overallStats.totalEmissions,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Please wait a moment before requesting more recommendations.',
            variant: 'destructive',
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: 'AI Credits Depleted',
            description: 'Please add credits to your workspace to continue using AI features.',
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setRecommendations(data.recommendations);
      toast({
        title: 'Recommendations Generated',
        description: 'AI-powered optimization recommendations are ready',
      });
    } catch (error) {
      logger.error('HotspotAnalysis:generateRecommendations', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate AI recommendations',
        variant: 'destructive',
      });
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Analyzing carbon hotspots...</p>
        </div>
      </div>
    );
  }

  const hasHotspots = materialHotspots.length > 0 || categoryHotspots.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Hotspots</CardTitle>
            <Flame className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.criticalCount}</div>
            <p className="text-xs text-muted-foreground">≥15% of total emissions</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.highCount}</div>
            <p className="text-xs text-muted-foreground">10-15% of total</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderate</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.moderateCount}</div>
            <p className="text-xs text-muted-foreground">5-10% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalEmissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">kgCO₂e total</p>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Tabs */}
      {hasHotspots ? (
        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Material Hotspots ({materialHotspots.length})</TabsTrigger>
            <TabsTrigger value="categories">Category Hotspots ({categoryHotspots.length})</TabsTrigger>
          </TabsList>

          {/* Material Hotspots */}
          <TabsContent value="materials" className="space-y-4">
            {materialHotspots.map((hotspot, idx) => (
              <Alert
                key={idx}
                className="border-l-4"
                style={{ borderLeftColor: getSeverityColor(hotspot.severity) }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2 mb-2">
                      <Flame className="h-4 w-4" style={{ color: getSeverityColor(hotspot.severity) }} />
                      <span className="font-semibold">{hotspot.material.material_name}</span>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: getSeverityColor(hotspot.severity) + '20',
                          color: getSeverityColor(hotspot.severity)
                        }}
                      >
                        {getSeverityLabel(hotspot.severity)}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Total Emissions:</span>
                          <p className="font-semibold">{hotspot.emissions.toFixed(2)} kgCO₂e</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">% of Total:</span>
                          <p className="font-semibold">{hotspot.percentageOfTotal.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Highest Stage:</span>
                          <p className="font-semibold">{hotspot.stage}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Stage Emissions:</span>
                          <p className="font-semibold">{hotspot.stageEmissions.toFixed(2)} kgCO₂e</p>
                        </div>
                      </div>
                      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mt-3">
                        <div 
                          className="absolute h-full transition-all"
                          style={{ 
                            width: `${hotspot.percentageOfTotal}%`,
                            backgroundColor: getSeverityColor(hotspot.severity)
                          }}
                        />
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </TabsContent>

          {/* Category Hotspots */}
          <TabsContent value="categories" className="space-y-4">
            {categoryHotspots.map((hotspot, idx) => (
              <Alert
                key={idx}
                className="border-l-4"
                style={{ borderLeftColor: getSeverityColor(hotspot.severity) }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2 mb-2">
                      <Flame className="h-4 w-4" style={{ color: getSeverityColor(hotspot.severity) }} />
                      <span className="font-semibold capitalize">{hotspot.category}</span>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: getSeverityColor(hotspot.severity) + '20',
                          color: getSeverityColor(hotspot.severity)
                        }}
                      >
                        {getSeverityLabel(hotspot.severity)}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Total Emissions:</span>
                          <p className="font-semibold">{hotspot.totalEmissions.toFixed(2)} kgCO₂e</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">% of Total:</span>
                          <p className="font-semibold">{hotspot.percentageOfTotal.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Highest Stage:</span>
                          <p className="font-semibold">{hotspot.topStage}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Stage Emissions:</span>
                          <p className="font-semibold">{hotspot.stageEmissions.toFixed(2)} kgCO₂e</p>
                        </div>
                      </div>
                      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mt-3">
                        <div 
                          className="absolute h-full transition-all"
                          style={{ 
                            width: `${hotspot.percentageOfTotal}%`,
                            backgroundColor: getSeverityColor(hotspot.severity)
                          }}
                        />
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Significant Hotspots Detected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your materials show balanced carbon distribution. All emissions are below 5% of total.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {hasHotspots && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  Get personalized suggestions to reduce embodied carbon based on Australian standards
                </CardDescription>
              </div>
              <Button 
                onClick={generateRecommendations}
                disabled={generatingRecommendations}
                size="sm"
              >
                {generatingRecommendations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {recommendations && (
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm">{recommendations}</div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Severity Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getSeverityColor('critical') }} />
              <div className="text-sm">
                <span className="font-medium">Critical:</span> ≥15% of total
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getSeverityColor('high') }} />
              <div className="text-sm">
                <span className="font-medium">High:</span> 10-15% of total
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getSeverityColor('moderate') }} />
              <div className="text-sm">
                <span className="font-medium">Moderate:</span> 5-10% of total
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getSeverityColor('low') }} />
              <div className="text-sm">
                <span className="font-medium">Low:</span> &lt;5% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
