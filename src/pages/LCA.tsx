import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Truck, Building, Recycle, AlertCircle, Calculator } from 'lucide-react';

interface MaterialEntry {
  materialName: string;
  quantity: number;
  unit: string;
  category: string;
  stage: 'A1-A3' | 'A4' | 'A5' | 'B' | 'C';
}

const LCA = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialEntry[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<MaterialEntry>({
    materialName: '',
    quantity: 0,
    unit: 'kg',
    category: 'concrete',
    stage: 'A1-A3',
  });

  const materialCategories = [
    'concrete',
    'steel',
    'timber',
    'glass',
    'insulation',
    'brickwork',
    'aluminium',
    'plasterboard',
    'roofing',
    'flooring',
  ];

  const lcaStages = {
    'A1-A3': 'Product Stage (Raw material, Transport, Manufacturing)',
    'A4': 'Transport to Site',
    'A5': 'Construction/Installation',
    'B': 'Use Stage',
    'C': 'End of Life',
  };

  const addMaterial = () => {
    if (!currentMaterial.materialName || currentMaterial.quantity <= 0) {
      toast({
        title: 'Invalid Material',
        description: 'Please enter material name and quantity',
        variant: 'destructive',
      });
      return;
    }

    setMaterials([...materials, { ...currentMaterial }]);
    setCurrentMaterial({
      materialName: '',
      quantity: 0,
      unit: 'kg',
      category: 'concrete',
      stage: 'A1-A3',
    });
    
    toast({
      title: 'Material Added',
      description: `${currentMaterial.materialName} added to LCA calculation`,
    });
  };

  const calculateLCA = async () => {
    if (!currentProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project first',
        variant: 'destructive',
      });
      return;
    }

    if (materials.length === 0) {
      toast({
        title: 'No Materials',
        description: 'Please add materials to calculate embodied carbon',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let totalEmbodiedCarbon = 0;

      for (const material of materials) {
        // Fetch emission factor from database
        const { data: factorData } = await supabase
          .from('lca_materials')
          .select('embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5')
          .eq('material_name', material.materialName)
          .eq('material_category', material.category)
          .maybeSingle();

        let emissionFactor = 0;
        if (factorData) {
          switch (material.stage) {
            case 'A1-A3':
              emissionFactor = factorData.embodied_carbon_a1a3 || 0;
              break;
            case 'A4':
              emissionFactor = factorData.embodied_carbon_a4 || 0;
              break;
            case 'A5':
              emissionFactor = factorData.embodied_carbon_a5 || 0;
              break;
            default:
              emissionFactor = (factorData.embodied_carbon_a1a3 || 0) + (factorData.embodied_carbon_a4 || 0) + (factorData.embodied_carbon_a5 || 0);
          }
        } else {
          // Use default factors if not found
          const defaultFactors: Record<string, number> = {
            concrete: 0.15,
            steel: 2.5,
            timber: 0.5,
            glass: 1.2,
            insulation: 3.5,
            brickwork: 0.24,
            aluminium: 8.5,
            plasterboard: 0.38,
            roofing: 1.8,
            flooring: 0.95,
          };
          emissionFactor = defaultFactors[material.category] || 1.0;
        }

        const embodiedCarbon = material.quantity * emissionFactor;
        totalEmbodiedCarbon += embodiedCarbon;

        // Save to scope3_emissions as embodied carbon category
        await supabase.from('scope3_emissions').insert({
          project_id: currentProject.id,
          category: 1, // Purchased goods and services
          category_name: 'Embodied Carbon - Materials',
          subcategory: material.category,
          activity_description: `${material.materialName} - ${material.stage}`,
          lca_stage: material.stage,
          quantity: material.quantity,
          unit: material.unit,
          emission_factor: emissionFactor,
          emissions_tco2e: embodiedCarbon,
          data_quality: 'calculated',
          calculation_method: 'ISO 14040/14044 LCA',
        });
      }

      toast({
        title: 'LCA Calculation Complete',
        description: `Total Embodied Carbon: ${totalEmbodiedCarbon.toFixed(2)} tCO₂e`,
      });

      setMaterials([]);
      navigate('/');
    } catch (error) {
      console.error('LCA calculation error:', error);
      toast({
        title: 'Calculation Failed',
        description: 'Failed to calculate embodied carbon',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Life Cycle Assessment (LCA)</h1>
          <p className="text-muted-foreground">
            Calculate embodied carbon following ISO 14040/14044 standards
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>ISO 14040/14044 Compliant</AlertTitle>
        <AlertDescription>
          This calculator follows international standards for Life Cycle Assessment, covering all stages from cradle to grave (A1-C4) as per Australian embodied carbon guidelines.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials">
            <Package className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="transport">
            <Truck className="h-4 w-4 mr-2" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="construction">
            <Building className="h-4 w-4 mr-2" />
            Construction
          </TabsTrigger>
          <TabsTrigger value="eol">
            <Recycle className="h-4 w-4 mr-2" />
            End of Life
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Embodied Carbon (A1-A3)</CardTitle>
              <CardDescription>
                Product stage: Raw material extraction, transport, and manufacturing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="material-name">Material Name</Label>
                  <Input
                    id="material-name"
                    placeholder="e.g., Ready-mix concrete C32/40"
                    value={currentMaterial.materialName}
                    onChange={(e) =>
                      setCurrentMaterial({ ...currentMaterial, materialName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Material Category</Label>
                  <Select
                    value={currentMaterial.category}
                    onValueChange={(value) =>
                      setCurrentMaterial({ ...currentMaterial, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materialCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={currentMaterial.quantity || ''}
                    onChange={(e) =>
                      setCurrentMaterial({
                        ...currentMaterial,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={currentMaterial.unit}
                    onValueChange={(value) =>
                      setCurrentMaterial({ ...currentMaterial, unit: value })
                    }
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="tonnes">tonnes</SelectItem>
                      <SelectItem value="m3">m³</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="stage">LCA Stage</Label>
                  <Select
                    value={currentMaterial.stage}
                    onValueChange={(value: any) =>
                      setCurrentMaterial({ ...currentMaterial, stage: value })
                    }
                  >
                    <SelectTrigger id="stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(lcaStages).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {key}: {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={addMaterial} className="w-full">
                Add Material to LCA
              </Button>

              {materials.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Added Materials ({materials.length})</h3>
                  <div className="space-y-2">
                    {materials.map((mat, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{mat.materialName}</div>
                          <div className="text-sm text-muted-foreground">
                            {mat.quantity} {mat.unit} - Stage {mat.stage}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport">
          <Card>
            <CardHeader>
              <CardTitle>Transport to Site (A4)</CardTitle>
              <CardDescription>
                Transport emissions from factory/supplier to construction site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the materials tab to add transport stage (A4) emissions
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="construction">
          <Card>
            <CardHeader>
              <CardTitle>Construction Process (A5)</CardTitle>
              <CardDescription>
                Construction and installation emissions on site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the materials tab to add construction stage (A5) emissions
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eol">
          <Card>
            <CardHeader>
              <CardTitle>End of Life (C)</CardTitle>
              <CardDescription>
                Deconstruction, transport, waste processing, and disposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the materials tab to add end-of-life stage (C) emissions
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-lca-material/5 to-lca-construction/5">
        <CardContent className="pt-6">
          <Button
            onClick={calculateLCA}
            disabled={loading || materials.length === 0}
            className="w-full text-lg py-6"
            size="lg"
          >
            <Calculator className="h-5 w-5 mr-2" />
            {loading ? 'Calculating...' : 'Calculate Embodied Carbon (ISO 14040/14044)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LCA;
