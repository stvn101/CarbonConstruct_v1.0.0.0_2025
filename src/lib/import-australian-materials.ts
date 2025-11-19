import { supabase } from "@/integrations/supabase/client";

interface MaterialData {
  material_name: string;
  material_category: string;
  unit: string;
  embodied_carbon_a1a3: number;
  embodied_carbon_total: number;
  region: string;
  data_source: string;
  year: number;
}

export const australianMaterialsData: MaterialData[] = [
  // CONCRETE & CEMENT (40% of building emissions)
  {
    material_name: "Ready Mix Concrete 20MPa",
    material_category: "Concrete",
    unit: "m3",
    embodied_carbon_a1a3: 320,
    embodied_carbon_total: 320,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Ready Mix Concrete 25MPa",
    material_category: "Concrete",
    unit: "m3",
    embodied_carbon_a1a3: 365,
    embodied_carbon_total: 365,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Ready Mix Concrete 32MPa",
    material_category: "Concrete",
    unit: "m3",
    embodied_carbon_a1a3: 420,
    embodied_carbon_total: 420,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Concrete Block 190mm",
    material_category: "Concrete",
    unit: "each",
    embodied_carbon_a1a3: 2.6,
    embodied_carbon_total: 2.6,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Concrete with 30% GGBFS (EcoMax/ECOPact)",
    material_category: "Concrete",
    unit: "m3",
    embodied_carbon_a1a3: 275,
    embodied_carbon_total: 275,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  
  // STEEL & METALS (25% of building emissions)
  {
    material_name: "Reinforcing Bar Grade 500E 12mm (90% recycled)",
    material_category: "Steel",
    unit: "kg",
    embodied_carbon_a1a3: 1.65,
    embodied_carbon_total: 1.65,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Reinforcing Bar Grade 500E 16mm (90% recycled)",
    material_category: "Steel",
    unit: "kg",
    embodied_carbon_a1a3: 1.65,
    embodied_carbon_total: 1.65,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Steel Reinforcing Mesh SL82",
    material_category: "Steel",
    unit: "kg",
    embodied_carbon_a1a3: 1.70,
    embodied_carbon_total: 1.70,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Structural Steel Universal Beam",
    material_category: "Steel",
    unit: "kg",
    embodied_carbon_a1a3: 1.75,
    embodied_carbon_total: 1.75,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "COLORBOND Steel Roofing 0.42mm",
    material_category: "Steel",
    unit: "m2",
    embodied_carbon_a1a3: 11.8,
    embodied_carbon_total: 11.8,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  
  // TIMBER (Carbon storing material)
  {
    material_name: "H2 Treated Pine Framing 90x45mm",
    material_category: "Timber",
    unit: "kg",
    embodied_carbon_a1a3: 0.35,
    embodied_carbon_total: 0.35,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Hardwood Framing F17",
    material_category: "Timber",
    unit: "kg",
    embodied_carbon_a1a3: 0.42,
    embodied_carbon_total: 0.42,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Plywood Structural 17mm F17",
    material_category: "Timber",
    unit: "m2",
    embodied_carbon_a1a3: 8.5,
    embodied_carbon_total: 8.5,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Engineered Timber I-Beam",
    material_category: "Timber",
    unit: "m",
    embodied_carbon_a1a3: 12.0,
    embodied_carbon_total: 12.0,
    region: "Australia",
    data_source: "Australian Construction Materials Database 2024",
    year: 2024
  },
  
  // GLOBAL MATERIALS - Low Carbon Alternatives
  {
    material_name: "Geopolymer Concrete",
    material_category: "Concrete",
    unit: "ton",
    embodied_carbon_a1a3: 300,
    embodied_carbon_total: 300,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "LC3 Limestone Calcined Clay Cement",
    material_category: "Concrete",
    unit: "ton",
    embodied_carbon_a1a3: 75,
    embodied_carbon_total: 75,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Green Steel (HYBRIT)",
    material_category: "Steel",
    unit: "ton",
    embodied_carbon_a1a3: 360,
    embodied_carbon_total: 360,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Recycled Aluminum",
    material_category: "Metal",
    unit: "ton",
    embodied_carbon_a1a3: 800,
    embodied_carbon_total: 800,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Magnesium Oxide Board",
    material_category: "Board",
    unit: "ton",
    embodied_carbon_a1a3: 90,
    embodied_carbon_total: 90,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Hemp Insulation",
    material_category: "Insulation",
    unit: "ton",
    embodied_carbon_a1a3: 325,
    embodied_carbon_total: 325,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "HDPE Recycled Piping",
    material_category: "Piping",
    unit: "ton",
    embodied_carbon_a1a3: 1440,
    embodied_carbon_total: 1440,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Low-Carbon Glass",
    material_category: "Glass",
    unit: "ton",
    embodied_carbon_a1a3: 700,
    embodied_carbon_total: 700,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Bio-Asphalt",
    material_category: "Asphalt",
    unit: "ton",
    embodied_carbon_a1a3: 45,
    embodied_carbon_total: 45,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Earth Blocks",
    material_category: "Masonry",
    unit: "ton",
    embodied_carbon_a1a3: 44,
    embodied_carbon_total: 44,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "Cross Laminated Timber (CLT)",
    material_category: "Timber",
    unit: "ton",
    embodied_carbon_a1a3: 135,
    embodied_carbon_total: 135,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  },
  {
    material_name: "BlueScope Low Carbon Steel",
    material_category: "Steel",
    unit: "ton",
    embodied_carbon_a1a3: 1470,
    embodied_carbon_total: 1470,
    region: "Australia",
    data_source: "Global Construction Materials Database 2024",
    year: 2024
  }
];

export async function importAustralianMaterials() {
  try {
    console.log(`Starting import of ${australianMaterialsData.length} Australian materials...`);
    
    // Insert materials in batches
    const BATCH_SIZE = 50;
    let imported = 0;
    
    for (let i = 0; i < australianMaterialsData.length; i += BATCH_SIZE) {
      const batch = australianMaterialsData.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from('lca_materials')
        .insert(batch);

      
      if (error) {
        console.error(`Error importing batch ${i / BATCH_SIZE + 1}:`, error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`Imported ${imported}/${australianMaterialsData.length} materials`);
    }
    
    console.log('✅ Successfully imported all Australian materials!');
    return { success: true, count: imported };
  } catch (error) {
    console.error('❌ Import failed:', error);
    return { success: false, error };
  }
}
