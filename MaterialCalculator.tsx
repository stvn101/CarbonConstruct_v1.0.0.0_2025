/**
 * Material Embodied Carbon Calculator Component
 * Features biogenic carbon storage tracking for timber
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Package, CheckCircle2, Leaf } from 'lucide-react';
import { calculatorAPI, MaterialCalculationResponse, MaterialInfo } from '@/lib/api/calculator';

export function MaterialCalculator({ projectId }: { projectId: string }) {
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('m3');
  const [dataQuality, setDataQuality] = useState<'default' | 'avg' | 'min' | 'max'>('default');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MaterialCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await calculatorAPI.listMaterialCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Load materials when category changes
  useEffect(() => {
    if (selectedCategory) {
      const loadMaterials = async () => {
        try {
          const mats = await calculatorAPI.listMaterials(selectedCategory);
          setMaterials(mats);
        } catch (err) {
          console.error('Failed to load materials', err);
        }
      };
      loadMaterials();
    } else {
      setMaterials([]);
    }
  }, [selectedCategory]);

  // Update unit when material selected
  useEffect(() => {
    const material = materials.find((m) => m.material_type === materialType);
    if (material) {
      setUnit(material.unit);
    }
  }, [materialType, materials]);

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    if (!materialType || !quantity) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await calculatorAPI.calculateMaterial({
        project_id: projectId,
        material_type: materialType,
        quantity: parseFloat(quantity),
        unit,
        data_quality: dataQuality,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const hasBiogenicStorage = result && result.carbon_storage_kg < 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <CardTitle>Material Embodied Carbon Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate A1-A3 embodied carbon from construction materials (NCC 2025 compliant)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Material Category *</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Material Type */}
        <div className="space-y-2">
          <Label htmlFor="material-type">Material Type *</Label>
          <Select
            value={materialType}
            onValueChange={setMaterialType}
            disabled={!selectedCategory}
          >
            <SelectTrigger id="material-type">
              <SelectValue placeholder={selectedCategory ? 'Select material' : 'Select category first'} />
            </SelectTrigger>
            <SelectContent>
              {materials.map((mat) => (
                <SelectItem key={mat.material_type} value={mat.material_type}>
                  <div className="flex items-center justify-between w-full">
                    <span>{mat.material_type}</span>
                    {mat.carbon_storage_per_unit && mat.carbon_storage_per_unit < 0 && (
                      <Leaf className="h-3 w-3 text-green-600 ml-2" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            <Input
              id="unit"
              value={unit}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Data Quality Tier */}
        <div className="space-y-2">
          <Label htmlFor="data-quality">Data Quality Tier</Label>
          <Select value={dataQuality} onValueChange={(v: any) => setDataQuality(v)}>
            <SelectTrigger id="data-quality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (NGER Standard)</SelectItem>
              <SelectItem value="avg">Average (Industry EPDs)</SelectItem>
              <SelectItem value="min">Conservative Lower Bound</SelectItem>
              <SelectItem value="max">Conservative Upper Bound</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Higher quality data reduces uncertainty and improves accuracy
          </p>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Calculating...' : 'Calculate Embodied Carbon'}
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
          <Alert className="border-blue-500 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Calculation Complete</AlertTitle>
            <AlertDescription className="text-blue-800 space-y-3">
              <div className="grid grid-cols-1 gap-4 mt-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">Gross Embodied Carbon (A1-A3)</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {result.gross_co2e_kg.toLocaleString()} kg CO₂e
                  </p>
                </div>

                {hasBiogenicStorage && (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-green-100 rounded-md">
                      <Leaf className="h-5 w-5 text-green-700" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-700">
                          Biogenic Carbon Storage
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          {result.carbon_storage_kg.toLocaleString()} kg CO₂e
                        </p>
                        <p className="text-xs text-green-600">
                          Timber stores carbon, reducing net emissions
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600">Net Embodied Carbon</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {result.net_co2e_kg.toLocaleString()} kg CO₂e
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Data Quality: {result.data_quality}
                  </Badge>
                  {result.uncertainty_pct && (
                    <Badge variant="outline" className="text-xs">
                      Uncertainty: ±{result.uncertainty_pct}%
                    </Badge>
                  )}
                </div>
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
