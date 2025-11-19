import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface MaterialRecord {
  material_name: string;
  material_category: string;
  unit: string;
  embodied_carbon_a1a3?: number;
  embodied_carbon_a4?: number;
  embodied_carbon_a5?: number;
  embodied_carbon_total?: number;
  region?: string;
  data_source?: string;
  year?: number;
}

export async function parseMaterialsFromFile(
  filePath: string,
  fileName: string
): Promise<MaterialRecord[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    
    const materials: MaterialRecord[] = [];
    
    // Determine file type and parse accordingly
    if (fileName.includes("EPD_list")) {
      return parseNABERSEPDList(workbook);
    } else if (fileName.includes("Technical_workbook")) {
      return parseNABERSTechnical(workbook);
    } else if (fileName.includes("ICM_Database")) {
      return parseICMDatabase(workbook);
    } else {
      return parseNABERSMain(workbook);
    }
  } catch (error) {
    console.error(`Error parsing ${fileName}:`, error);
    return [];
  }
}

function parseNABERSEPDList(workbook: XLSX.WorkBook): MaterialRecord[] {
  const materials: MaterialRecord[] = [];
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    const record: any = row;
    
    if (!record['Product name'] || !record['Declared unit']) continue;
    
    materials.push({
      material_name: String(record['Product name'] || '').trim(),
      material_category: String(record['Product category'] || 'General').trim(),
      unit: String(record['Declared unit'] || 'kg').trim(),
      embodied_carbon_a1a3: parseFloat(record['A1-A3'] || 0),
      embodied_carbon_a4: parseFloat(record['A4'] || 0),
      embodied_carbon_a5: parseFloat(record['A5'] || 0),
      embodied_carbon_total: parseFloat(record['Total'] || 0),
      region: 'Australia',
      data_source: 'NABERS EPD List v2025.1',
      year: parseInt(record['Year'] || 2025)
    });
  }
  
  return materials.filter(m => m.embodied_carbon_total && m.embodied_carbon_total > 0);
}

function parseNABERSTechnical(workbook: XLSX.WorkBook): MaterialRecord[] {
  const materials: MaterialRecord[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().includes('summary') || 
        sheetName.toLowerCase().includes('data') ||
        sheetName.toLowerCase().includes('factors')) {
      
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        const record: any = row;
        
        const materialName = record['Material'] || record['Product'] || record['Description'];
        const unit = record['Unit'] || record['Declared Unit'] || 'kg';
        
        if (!materialName || materialName === 'Material') continue;
        
        materials.push({
          material_name: String(materialName).trim(),
          material_category: String(record['Category'] || 'General').trim(),
          unit: String(unit).trim(),
          embodied_carbon_a1a3: parseFloat(record['A1-A3'] || record['Embodied Carbon'] || 0),
          embodied_carbon_a4: parseFloat(record['A4'] || 0),
          embodied_carbon_a5: parseFloat(record['A5'] || 0),
          embodied_carbon_total: parseFloat(record['Total'] || record['A1-A3'] || 0),
          region: 'Australia',
          data_source: 'NABERS Technical Workbook v2025.1',
          year: 2025
        });
      }
    }
  }
  
  return materials.filter(m => m.embodied_carbon_total && m.embodied_carbon_total > 0);
}

function parseICMDatabase(workbook: XLSX.WorkBook): MaterialRecord[] {
  const materials: MaterialRecord[] = [];
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    const record: any = row;
    
    const materialName = record['Material'] || record['Material Name'];
    if (!materialName || materialName === 'Material' || materialName === 'unknown') continue;
    
    const embodiedCarbon = parseFloat(record['Embodied Carbon'] || record['kgCO2e'] || 0);
    if (embodiedCarbon === 0) continue;
    
    materials.push({
      material_name: String(materialName).trim(),
      material_category: String(record['Category'] || 'General').trim(),
      unit: String(record['Unit'] || 'kg').trim(),
      embodied_carbon_a1a3: embodiedCarbon,
      embodied_carbon_total: parseFloat(record['Total Embodied Carbon'] || embodiedCarbon),
      region: String(record['Region'] || 'Australia').trim(),
      data_source: 'ICM Database 2019',
      year: parseInt(record['Year'] || 2019)
    });
  }
  
  return materials;
}

function parseNABERSMain(workbook: XLSX.WorkBook): MaterialRecord[] {
  const materials: MaterialRecord[] = [];
  
  // Find the main data sheet
  let targetSheet = null;
  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().includes('emission') || 
        sheetName.toLowerCase().includes('factor') ||
        sheetName.toLowerCase().includes('data')) {
      targetSheet = workbook.Sheets[sheetName];
      break;
    }
  }
  
  if (!targetSheet) {
    targetSheet = workbook.Sheets[workbook.SheetNames[0]];
  }
  
  const data = XLSX.utils.sheet_to_json(targetSheet);
  
  for (const row of data) {
    const record: any = row;
    
    const materialName = record['Material type'] || record['Product'] || record['Material'];
    if (!materialName) continue;
    
    materials.push({
      material_name: String(materialName).trim(),
      material_category: String(record['Category'] || 'General').trim(),
      unit: String(record['Declared unit'] || record['Unit'] || 'kg').trim(),
      embodied_carbon_a1a3: parseFloat(record['A1-A3'] || record['Embodied carbon'] || 0),
      embodied_carbon_a4: parseFloat(record['A4'] || 0),
      embodied_carbon_a5: parseFloat(record['A5'] || 0),
      embodied_carbon_total: parseFloat(record['Total'] || record['A1-A3'] || 0),
      region: 'Australia',
      data_source: 'NABERS National Material Emission Factors v2025.1',
      year: 2025
    });
  }
  
  return materials.filter(m => m.embodied_carbon_total && m.embodied_carbon_total > 0);
}

export async function bulkImportMaterials(
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ success: boolean; imported: number; errors: number }> {
  const files = [
    { path: '/temp-uploads/nabers-main.xlsx', name: 'National_material_emission_factors_database_-_v2025.1-2.xlsx' },
    { path: '/temp-uploads/nabers-epd-list.xlsx', name: 'National_material_emission_factors_database_-_EPD_list_-_v2025.1-2.xlsx' },
    { path: '/temp-uploads/nabers-technical.xlsx', name: 'National_material_emission_factors_database_-_Technical_workbook_-_v2025.1-2.xlsx' },
    { path: '/temp-uploads/icm-database.xlsx', name: 'ICM_Database_2019_FINAL-2.xlsx' },
  ];
  
  let totalImported = 0;
  let totalErrors = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, `Processing ${file.name}...`);
    
    try {
      const materials = await parseMaterialsFromFile(file.path, file.name);
      
      if (materials.length === 0) {
        console.warn(`No materials found in ${file.name}`);
        continue;
      }
      
      // Insert in batches of 100
      const BATCH_SIZE = 100;
      for (let j = 0; j < materials.length; j += BATCH_SIZE) {
        const batch = materials.slice(j, j + BATCH_SIZE);
        
        const { error } = await supabase
          .from('lca_materials')
          .insert(batch);
        
        if (error) {
          console.error(`Error inserting batch from ${file.name}:`, error);
          totalErrors += batch.length;
        } else {
          totalImported += batch.length;
        }
      }
      
      onProgress?.(i + 1, files.length, `Imported ${materials.length} materials from ${file.name}`);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      totalErrors++;
    }
  }
  
  return {
    success: totalErrors === 0,
    imported: totalImported,
    errors: totalErrors
  };
}
