import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jobId, filePath } = await req.json();

    console.log('Starting materials import:', { jobId, filePath });

    // Update job status to processing
    await supabase
      .from('materials_import_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', jobId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('materials-data')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Parse Excel file
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    let materials: any[] = [];
    let recordsTotal = 0;

    // Process based on file type
    if (filePath.includes('ICM_Database')) {
      materials = parseICMDatabase(workbook);
    } else if (filePath.includes('National_material_emission_factors')) {
      if (filePath.includes('EPD_list')) {
        materials = parseNABERSEPDList(workbook);
      } else if (filePath.includes('Technical_workbook')) {
        materials = parseNABERSTechnical(workbook);
      } else {
        materials = parseNABERSMain(workbook);
      }
    }

    recordsTotal = materials.length;
    console.log(`Parsed ${recordsTotal} materials from ${filePath}`);

    // Update job with total
    await supabase
      .from('materials_import_jobs')
      .update({ records_total: recordsTotal })
      .eq('id', jobId);

    // Insert materials in batches
    const BATCH_SIZE = 100;
    let recordsProcessed = 0;

    for (let i = 0; i < materials.length; i += BATCH_SIZE) {
      const batch = materials.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('lca_materials')
        .upsert(batch, { onConflict: 'material_name,region,data_source' });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      recordsProcessed = i + batch.length;
      
      // Update progress
      await supabase
        .from('materials_import_jobs')
        .update({ records_processed: recordsProcessed })
        .eq('id', jobId);
    }

    // Mark as completed
    await supabase
      .from('materials_import_jobs')
      .update({
        status: 'completed',
        records_processed: recordsTotal,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return new Response(
      JSON.stringify({ success: true, recordsProcessed: recordsTotal }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    const { jobId } = await req.json().catch(() => ({}));
    if (jobId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('materials_import_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseICMDatabase(workbook: XLSX.WorkBook): any[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  return data.map((row: any) => ({
    material_name: row.Product || row.product || 'Unknown',
    material_category: 'General',
    unit: row.Unit || row.unit || 'kg',
    embodied_carbon_a1a3: parseFloat(row['Process CFIs\n(kg of CO2e per unit)'] || row['Hybrid CFIs\n(kg of CO2e per unit)'] || 0),
    embodied_carbon_a4: null,
    embodied_carbon_a5: null,
    embodied_carbon_total: parseFloat(row['Hybrid CFIs\n(kg of CO2e per unit)'] || row['Process CFIs\n(kg of CO2e per unit)'] || 0),
    region: 'Australia',
    data_source: 'ICM Database 2019',
    year: 2019,
  })).filter(m => m.material_name !== 'Unknown' && m.embodied_carbon_total > 0);
}

function parseNABERSMain(workbook: XLSX.WorkBook): any[] {
  // Look for the main data sheet (usually "Emission factors" or similar)
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('emission') || 
    name.toLowerCase().includes('factor') ||
    name.toLowerCase() === 'database'
  ) || workbook.SheetNames[0];
  
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  return data.map((row: any) => ({
    material_name: row['Material type'] || row['Material'] || row.Material || 'Unknown',
    material_category: row['Category'] || row.Category || 'General',
    unit: row['Declared unit'] || row['Unit'] || 'kg',
    embodied_carbon_a1a3: parseFloat(row['Default (uncertainty adjusted)'] || row['Average EF'] || 0),
    embodied_carbon_a4: null,
    embodied_carbon_a5: null,
    embodied_carbon_total: parseFloat(row['Default (uncertainty adjusted)'] || row['Average EF'] || 0),
    region: 'Australia',
    data_source: 'NABERS NMEF v2025.1',
    year: 2025,
  })).filter(m => m.material_name !== 'Unknown' && m.embodied_carbon_total > 0);
}

function parseNABERSEPDList(workbook: XLSX.WorkBook): any[] {
  // EPD list sheet
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('epd') || 
    name.toLowerCase().includes('list')
  ) || workbook.SheetNames[0];
  
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  return data.map((row: any) => ({
    material_name: row['Product'] || row['Material'] || row.Product || 'Unknown',
    material_category: row['Category'] || row.Category || 'General',
    unit: row['Declared unit'] || row['Unit'] || row.unit || 'kg',
    embodied_carbon_a1a3: parseFloat(row['A1-A3 (kg CO2e)'] || row['A1-A3'] || row['GWP A1-A3'] || 0),
    embodied_carbon_a4: parseFloat(row['A4'] || 0) || null,
    embodied_carbon_a5: parseFloat(row['A5'] || 0) || null,
    embodied_carbon_total: parseFloat(row['Total'] || row['A1-A3 (kg CO2e)'] || row['A1-A3'] || 0),
    region: 'Australia',
    data_source: row['EPD Source'] || 'NABERS EPD v2025.1',
    year: parseInt(row['Year'] || '2025'),
  })).filter(m => m.material_name !== 'Unknown' && m.embodied_carbon_total > 0);
}

function parseNABERSTechnical(workbook: XLSX.WorkBook): any[] {
  // Technical workbook often has multiple sheets with calculations
  const materials: any[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().includes('summary') || 
        sheetName.toLowerCase().includes('data') ||
        sheetName.toLowerCase().includes('factors')) {
      const sheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);
      
      const parsed = data.map((row: any) => ({
        material_name: row['Material'] || row['Product'] || row.Material || 'Unknown',
        material_category: row['Category'] || 'General',
        unit: row['Unit'] || row['Declared unit'] || 'kg',
        embodied_carbon_a1a3: parseFloat(row['A1-A3'] || row['EF'] || 0),
        embodied_carbon_a4: parseFloat(row['A4'] || 0) || null,
        embodied_carbon_a5: parseFloat(row['A5'] || 0) || null,
        embodied_carbon_total: parseFloat(row['Total'] || row['A1-A3'] || 0),
        region: 'Australia',
        data_source: 'NABERS Technical Workbook v2025.1',
        year: 2025,
      })).filter(m => m.material_name !== 'Unknown' && m.embodied_carbon_total > 0);
      
      materials.push(...parsed);
    }
  }
  
  return materials;
}