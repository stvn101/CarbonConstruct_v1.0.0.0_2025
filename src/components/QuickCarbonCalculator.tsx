import { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface CalculatorResult {
  totalEmissions: number;
  breakdown: {
    materials: number;
    energy: number;
    transport: number;
  };
}

export const QuickCarbonCalculator = () => {
  const navigate = useNavigate();
  const [projectSize, setProjectSize] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simplified emission factors (tCO2e per sqm for Australian construction)
  const emissionFactors = {
    residential: { base: 0.45, energy: 0.08, transport: 0.05 },
    commercial: { base: 0.65, energy: 0.12, transport: 0.08 },
    industrial: { base: 0.85, energy: 0.15, transport: 0.10 },
    infrastructure: { base: 0.95, energy: 0.18, transport: 0.12 },
  };

  const calculateEmissions = () => {
    if (!projectSize || !projectType || !duration) {
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay for better UX
    setTimeout(() => {
      const size = parseFloat(projectSize);
      const months = parseFloat(duration);
      const factors = emissionFactors[projectType as keyof typeof emissionFactors];

      if (factors) {
        // Calculate emissions with duration multiplier
        const durationMultiplier = 1 + (months / 12) * 0.1; // 10% increase per year
        
        const materials = size * factors.base * durationMultiplier;
        const energy = size * factors.energy * months * 0.5; // Monthly energy usage
        const transport = size * factors.transport * durationMultiplier;
        
        const totalEmissions = materials + energy + transport;

        setResult({
          totalEmissions: Math.round(totalEmissions * 10) / 10,
          breakdown: {
            materials: Math.round(materials * 10) / 10,
            energy: Math.round(energy * 10) / 10,
            transport: Math.round(transport * 10) / 10,
          },
        });
      }

      setIsCalculating(false);
    }, 800);
  };

  const handleReset = () => {
    setProjectSize('');
    setProjectType('');
    setDuration('');
    setResult(null);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Quick Carbon Estimator</CardTitle>
            <CardDescription className="text-base">
              Get an instant estimate of your construction project's carbon footprint
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* Input Form */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectSize">Project Size (sqm)</Label>
                <Input
                  id="projectSize"
                  type="number"
                  placeholder="e.g., 5000"
                  value={projectSize}
                  onChange={(e) => setProjectSize(e.target.value)}
                  min="1"
                  max="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 18"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <Button
              onClick={calculateEmissions}
              disabled={!projectSize || !projectType || !duration || isCalculating}
              className="w-full"
              size="lg"
              aria-label="Calculate carbon emissions estimate"
              aria-busy={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Calculator className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-5 w-5" aria-hidden="true" />
                  Calculate Emissions
                </>
              )}
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Note:</strong> This is a simplified estimate. Sign up for detailed, 
                compliance-ready calculations using Australian emission factors.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Results Display */}
            <div
              className="space-y-6 animate-fade-in"
              role="region"
              aria-label="Calculation results"
              aria-live="polite"
            >
              {/* Total Emissions */}
              <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="text-sm text-muted-foreground mb-2">Estimated Total Emissions</div>
                <div
                  className="text-5xl font-bold text-primary mb-2"
                  aria-label={`Total emissions: ${result.totalEmissions.toLocaleString()} tonnes CO2 equivalent`}
                >
                  {result.totalEmissions.toLocaleString()}
                </div>
                <div className="text-lg text-muted-foreground" aria-hidden="true">tonnes CO₂e</div>
                <Badge variant="secondary" className="mt-3">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Based on Australian standards
                </Badge>
              </div>

              {/* Emissions Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {result.breakdown.materials.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Materials</div>
                  <div className="text-xs text-muted-foreground">tCO₂e</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {result.breakdown.energy.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Energy</div>
                  <div className="text-xs text-muted-foreground">tCO₂e</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {result.breakdown.transport.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Transport</div>
                  <div className="text-xs text-muted-foreground">tCO₂e</div>
                </div>
              </div>

              {/* Context Information */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>That's equivalent to:</strong>
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li>• {Math.round(result.totalEmissions * 4.6)} trees needed for 10 years to offset</li>
                  <li>• {Math.round(result.totalEmissions * 2.4)} average cars driven for one year</li>
                  <li>• {Math.round(result.totalEmissions * 115)} barrels of oil consumed</li>
                </ul>
              </div>

              {/* Call to Action */}
              <div className="flex gap-3">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Calculate Another
                </Button>
                <Button onClick={() => navigate('/auth')} className="flex-1">
                  Get Accurate Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
