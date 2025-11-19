import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MaterialRow {
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

// Parse NABERS Main file
function parseNABERSMain(workbook: XLSX.WorkBook): MaterialRow[] {
  const materials: MaterialRow[] = [];
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('emission') || 
    name.toLowerCase().includes('factor')
  );
  
  if (!sheetName) return materials;
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  for (const row of data as any[]) {
    const name = String(row['Material Type'] || row['Product'] || '').trim();
    if (!name || name === 'Material Type') continue;
    
    const category = String(row['Category'] || 'Construction Materials').trim();
    const unit = String(row['Declared Unit'] || row['Unit'] || 'kg').trim();
    const a1a3 = parseFloat(row['A1-A3 (kg CO2-e)'] || row['Embodied Carbon'] || '0');
    
    if (a1a3 > 0) {
      materials.push({
        material_name: name,
        material_category: category,
        unit: unit,
        embodied_carbon_a1a3: a1a3,
        embodied_carbon_total: a1a3,
        region: 'Australia',
        data_source: 'NABERS NMEF',
        year: 2025
      });
    }
  }
  
  return materials;
}

// Parse NABERS EPD List
function parseNABERSEPDList(workbook: XLSX.WorkBook): MaterialRow[] {
  const materials: MaterialRow[] = [];
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  for (const row of data as any[]) {
    const name = String(row['Product Name'] || row['Material'] || '').trim();
    if (!name || name === 'Product Name') continue;
    
    const category = String(row['Category'] || row['Material Category'] || 'Construction Materials').trim();
    const unit = String(row['Declared Unit'] || row['Unit'] || 'kg').trim();
    const a1a3 = parseFloat(row['A1-A3'] || '0');
    const a4 = parseFloat(row['A4'] || '0');
    const a5 = parseFloat(row['A5'] || '0');
    const total = parseFloat(row['Total'] || '0') || (a1a3 + a4 + a5);
    
    if (total > 0) {
      materials.push({
        material_name: name,
        material_category: category,
        unit: unit,
        embodied_carbon_a1a3: a1a3 || undefined,
        embodied_carbon_a4: a4 || undefined,
        embodied_carbon_a5: a5 || undefined,
        embodied_carbon_total: total,
        region: 'Australia',
        data_source: 'NABERS EPD',
        year: 2025
      });
    }
  }
  
  return materials;
}

// Parse NABERS Technical Workbook
function parseNABERSTechnical(workbook: XLSX.WorkBook): MaterialRow[] {
  const materials: MaterialRow[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    if (!sheetName.toLowerCase().includes('summary') && 
        !sheetName.toLowerCase().includes('data') &&
        !sheetName.toLowerCase().includes('factor')) continue;
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    
    for (const row of data as any[]) {
      const name = String(row['Material'] || row['Product'] || row['Item'] || '').trim();
      if (!name || name === 'Material') continue;
      
      const category = String(row['Category'] || row['Type'] || 'Construction Materials').trim();
      const unit = String(row['Unit'] || row['Declared Unit'] || 'kg').trim();
      const a1a3 = parseFloat(row['A1-A3'] || row['Embodied Carbon'] || '0');
      const total = parseFloat(row['Total'] || '0') || a1a3;
      
      if (total > 0) {
        materials.push({
          material_name: name,
          material_category: category,
          unit: unit,
          embodied_carbon_a1a3: a1a3 || undefined,
          embodied_carbon_total: total,
          region: 'Australia',
          data_source: 'NABERS Technical',
          year: 2025
        });
      }
    }
  }
  
  return materials;
}

// Parse ICM Database
function parseICMDatabase(workbook: XLSX.WorkBook): MaterialRow[] {
  const materials: MaterialRow[] = [];
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  for (const row of data as any[]) {
    const name = String(row['Material Name'] || row['Material'] || row['Product'] || '').trim();
    if (!name || name === 'Material Name' || name.toLowerCase().includes('unknown')) continue;
    
    const category = String(row['Category'] || row['Material Category'] || 'Construction Materials').trim();
    const unit = String(row['Unit'] || row['Declared Unit'] || 'kg').trim();
    const a1a3 = parseFloat(row['A1-A3 (kg CO2-e)'] || row['Embodied Carbon A1-A3'] || '0');
    const total = parseFloat(row['Total (kg CO2-e)'] || row['Total Embodied Carbon'] || '0') || a1a3;
    
    if (total > 0) {
      materials.push({
        material_name: name,
        material_category: category,
        unit: unit,
        embodied_carbon_a1a3: a1a3 || undefined,
        embodied_carbon_total: total,
        region: 'Australia',
        data_source: 'ICM Database 2019',
        year: 2019
      });
    }
  }
  
  return materials;
}

// Deduplicate materials
function deduplicate(materials: MaterialRow[]): MaterialRow[] {
  const seen = new Map<string, MaterialRow>();
  
  for (const material of materials) {
    const key = `${material.material_name.toLowerCase()}|${material.unit.toLowerCase()}|${material.data_source}`;
    
    if (!seen.has(key)) {
      seen.set(key, material);
    }
  }
  
  return Array.from(seen.values());
}

// Main import function
async function importMaterials() {
  console.log('Starting materials import...\n');
  
  const files = [
    { path: 'public/temp-uploads/nabers-main.xlsx', parser: parseNABERSMain, name: 'NABERS Main' },
    { path: 'public/temp-uploads/nabers-epd-list.xlsx', parser: parseNABERSEPDList, name: 'NABERS EPD List' },
    { path: 'public/temp-uploads/nabers-technical.xlsx', parser: parseNABERSTechnical, name: 'NABERS Technical' },
    { path: 'public/temp-uploads/icm-database.xlsx', parser: parseICMDatabase, name: 'ICM Database' }
  ];
  
  let allMaterials: MaterialRow[] = [];
  
  for (const file of files) {
    try {
      console.log(`Processing ${file.name}...`);
      
      if (!fs.existsSync(file.path)) {
        console.log(`  ⚠️  File not found: ${file.path}`);
        continue;
      }
      
      const workbook = XLSX.readFile(file.path);
      const materials = file.parser(workbook);
      
      console.log(`  ✓ Parsed ${materials.length} materials`);
      allMaterials = allMaterials.concat(materials);
    } catch (error) {
      console.error(`  ✗ Error parsing ${file.name}:`, error);
    }
  }
  
  console.log(`\nTotal materials parsed: ${allMaterials.length}`);
  
  // Deduplicate
  const uniqueMaterials = deduplicate(allMaterials);
  console.log(`Unique materials after deduplication: ${uniqueMaterials.length}\n`);
  
  // Insert in batches
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;
  
  for (let i = 0; i < uniqueMaterials.length; i += batchSize) {
    const batch = uniqueMaterials.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('lca_materials')
        .upsert(batch, { 
          onConflict: 'material_name,unit,data_source',
          ignoreDuplicates: true 
        });
      
      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${batch.length} materials (${inserted}/${uniqueMaterials.length})`);
      }
    } catch (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} exception:`, error);
      errors += batch.length;
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Errors: ${errors}`);
}

// Run
importMaterials()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
