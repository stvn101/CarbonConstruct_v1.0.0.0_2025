import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { useEmissionCalculations } from '@/hooks/useEmissionCalculations';
import { TestTube } from 'lucide-react';

export const DemoDataButton = () => {
  const { toast } = useToast();
  const { currentProject } = useProject();
  const { calculateScope1Emissions, calculateScope2Emissions, calculateScope3Emissions, loading } = useEmissionCalculations();

  const addDemoData = async () => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before adding demo data.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Demo Scope 1 data
      const scope1DemoData = {
        fuelCombustion: [
          {
            fuelType: "diesel",
            quantity: 1000,
            unit: "L",
            notes: "Site generator fuel consumption"
          },
          {
            fuelType: "natural_gas",
            quantity: 500,
            unit: "GJ",
            notes: "Site heating system"
          }
        ],
        vehicles: [
          {
            vehicleType: "light_commercial_vehicle",
            fuelType: "diesel",
            quantity: 15000,
            unit: "km",
            notes: "Fleet vehicle annual usage"
          }
        ],
        processes: [
          {
            processType: "concrete_production",
            quantity: 100,
            unit: "tonnes",
            notes: "On-site concrete mixing"
          }
        ],
        fugitiveEmissions: [
          {
            refrigerantType: "r-134a",
            quantity: 5,
            unit: "kg",
            notes: "Air conditioning system leakage"
          }
        ]
      };

      // Demo Scope 2 data
      const scope2DemoData = {
        electricity: [
          {
            state: "NSW",
            quantity: 150000,
            unit: "kWh",
            renewablePercentage: 10,
            notes: "Main site electricity consumption"
          }
        ],
        heating: [
          {
            quantity: 200,
            unit: "GJ",
            notes: "Site heating requirements"
          }
        ],
        steam: [
          {
            quantity: 50,
            unit: "GJ",
            notes: "Process steam requirements"
          }
        ]
      };

      // Demo Scope 3 data
      const scope3DemoData = {
        upstreamActivities: [
          {
            category: 1,
            categoryName: "Purchased Goods and Services",
            subcategory: "steel",
            description: "Structural steel procurement",
            lcaStage: "a1",
            quantity: 50,
            unit: "tonnes",
            emissionFactor: 2.1,
            supplierData: false,
            notes: "Main structural elements"
          },
          {
            category: 1,
            categoryName: "Purchased Goods and Services",
            subcategory: "concrete",
            description: "Ready mix concrete delivery",
            lcaStage: "a1",
            quantity: 200,
            unit: "m3",
            emissionFactor: 0.35,
            supplierData: false,
            notes: "Foundation and structural concrete"
          }
        ],
        downstreamActivities: [
          {
            category: 9,
            categoryName: "Downstream Transportation",
            subcategory: "road_transport",
            description: "Material delivery to site",
            quantity: 500,
            unit: "tkm",
            emissionFactor: 0.08,
            supplierData: false,
            notes: "Final delivery of materials"
          }
        ]
      };

      // Calculate all scopes with demo data
      const scope1Result = await calculateScope1Emissions(scope1DemoData);
      const scope2Result = await calculateScope2Emissions(scope2DemoData);
      const scope3Result = await calculateScope3Emissions(scope3DemoData);

      const totalEmissions = (scope1Result?.total || 0) + (scope2Result?.total || 0) + (scope3Result?.total || 0);

      toast({
        title: "Demo Data Added Successfully!",
        description: `Total emissions calculated: ${totalEmissions.toFixed(2)} tCO₂e across all scopes`,
      });

    } catch (error) {
      console.error("Error adding demo data:", error);
      toast({
        title: "Error",
        description: "Failed to add demo data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={addDemoData} 
      disabled={!currentProject || loading}
      variant="outline"
      className="gap-2"
    >
      <TestTube className="h-4 w-4" />
      Add Demo Data
    </Button>
  );
};