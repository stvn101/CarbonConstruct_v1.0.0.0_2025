/**
 * Fuel Emissions Calculator Component
 * Features diesel stationary vs transport disambiguation
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Fuel, CheckCircle2 } from 'lucide-react';
import { calculatorAPI, FuelCalculationResponse } from '@/lib/api/calculator';

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
];

const FUEL_TYPES = [
  'Diesel',
  'Petrol',
  'Natural Gas',
  'LPG',
  'Fuel Oil',
  'Kerosene',
  'Biodiesel',
];

export function FuelCalculator({ projectId }: { projectId: string }) {
  const [fuelType, setFuelType] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('L');
  const [state, setState] = useState<string>('');
  const [isStationary, setIsStationary] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FuelCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showDieselQuestion = fuelType.toLowerCase() === 'diesel';

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    // Validation
    if (!fuelType || !quantity || !state) {
      setError('Please fill in all required fields');
      return;
    }

    if (showDieselQuestion && isStationary === null) {
      setError('Please answer whether this diesel is used in a registered road vehicle');
      return;
    }

    setLoading(true);

    try {
      const response = await calculatorAPI.calculateFuel({
        project_id: projectId,
        fuel_type: fuelType,
        quantity: parseFloat(quantity),
        unit,
        state,
        is_stationary: isStationary ?? false,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-orange-600" />
          <CardTitle>Fuel Emissions Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate Scope 1 emissions from fuel combustion (NGER compliant)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fuel Type */}
        <div className="space-y-2">
          <Label htmlFor="fuel-type">Fuel Type *</Label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger id="fuel-type">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>
                  {fuel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CRITICAL: Diesel Disambiguation */}
        {showDieselQuestion && (
          <Alert className="border-orange-500 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Critical Question</AlertTitle>
            <AlertDescription className="text-orange-800">
              <p className="mb-3">
                Is this diesel used in a <strong>registered road vehicle</strong>?
              </p>
              <div className="flex gap-2">
                <Button
                  variant={isStationary === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsStationary(false)}
                  className={isStationary === false ? 'bg-orange-600' : ''}
                >
                  Yes (Transport)
                </Button>
                <Button
                  variant={isStationary === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsStationary(true)}
                  className={isStationary === true ? 'bg-orange-600' : ''}
                >
                  No (Stationary)
                </Button>
              </div>
              <p className="mt-2 text-xs">
                N₂O emission factors differ by 171% between stationary and transport use
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Litres (L)</SelectItem>
                <SelectItem value="kL">Kilolitres (kL)</SelectItem>
                <SelectItem value="GJ">Gigajoules (GJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">State/Territory *</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {AUSTRALIAN_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Calculating...' : 'Calculate Emissions'}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Calculation Complete</AlertTitle>
            <AlertDescription className="text-green-800 space-y-3">
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Emissions</p>
                  <p className="text-2xl font-bold text-green-900">
                    {result.co2e_kg.toLocaleString()} kg CO₂e
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Energy Content</p>
                  <p className="text-2xl font-bold text-green-900">
                    {result.energy_gj.toLocaleString()} GJ
                  </p>
                </div>
              </div>

              <div className="border-t border-green-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CO₂:</span>
                  <span className="font-mono">{result.breakdown.co2_kg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CH₄:</span>
                  <span className="font-mono">{result.breakdown.ch4_kg.toFixed(6)} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>N₂O:</span>
                  <span className="font-mono">{result.breakdown.n2o_kg.toFixed(6)} kg</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <Badge variant="outline" className="text-xs">
                  Uncertainty: ±{result.uncertainty_pct}%
                </Badge>
                <p className="text-xs text-gray-600">
                  <strong>Factor Source:</strong> {result.factor_source}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Compliance:</strong> {result.compliance}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
