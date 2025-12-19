import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ICEMaterial {
  material_name: string;
  material_category: string;
  subcategory?: string;
  unit: string;
  ef_total: number;
  ef_a1a3?: number;
  data_quality_rating?: string;
  notes?: string;
  year?: number;
}

// Normalize material name for deduplication
function normalizeMaterialName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"');
}

// Normalize unit for consistency
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kgs': 'kg',
    'm2': 'm²',
    'm²': 'm²',
    'sqm': 'm²',
    'square meter': 'm²',
    'square metre': 'm²',
    'm3': 'm³',
    'm³': 'm³',
    'cbm': 'm³',
    'cubic meter': 'm³',
    'cubic metre': 'm³',
    'm': 'm',
    'meter': 'm',
    'metre': 'm',
    'meters': 'm',
    'metres': 'm',
    't': 'tonne',
    'tonne': 'tonne',
    'tonnes': 'tonne',
    'ton': 'tonne',
    'tons': 'tonne',
    'l': 'L',
    'litre': 'L',
    'liter': 'L',
    'litres': 'L',
    'liters': 'L',
  };
  
  const lower = unit.toLowerCase().trim();
  return unitMap[lower] || unit.trim();
}

// Column name mapping for ICE spreadsheet variations (ICE Database V4.1 Oct 2025)
const COLUMN_MAPPINGS: Record<string, string[]> = {
  material_name: [
    'Material', 'Materials', 'Material Name', 'Name', 'material_name', 
    'MATERIAL', 'Material name', 'MATERIALS'
  ],
  material_category: [
    'Category', 'Material Category', 'Main Category', 'material_category', 
    'CATEGORY', 'Material Type'
  ],
  subcategory: [
    'Sub-Category', 'Subcategory', 'Sub Category', 'subcategory', 
    'SUB-CATEGORY', 'Sub-category', 'Sub_Category'
  ],
  unit: [
    'Unit', 'Units', 'unit', 'UNIT', 'Functional Unit', 
    'UNITS', 'Unit of measurement'
  ],
  ef_total: [
    // ICE V4.1 specific headers
    'EF (kgCO2e/ unit)', 'EF (kgCO2e/unit)', 'EF(kgCO2e/unit)',
    'EF (kgCO2e / unit)', 'Embodied Carbon (kgCO2e/kg)',
    'EF kgCO2e/kg', 'kgCO2e/kg', 'kgCO2e / kg',
    // Generic headers
    'EF Total', 'EF', 'ef_total', 'Embodied Carbon', 'Total EF',
    'GWP', 'Total GWP', 'EF_Total', 'GWP Total', 'Total GWP-fossil',
    'EF (kgCO2e)', 'kgCO2e'
  ],
  ef_a1a3: [
    'EF A1-A3', 'A1-A3', 'ef_a1a3', 'Process EF', 'A1A3', 
    'Modules A1-A3', 'A1-A3 EF', 'A1-A3 (kgCO2e)', 'A1-A3 EF (kgCO2e)'
  ],
  data_quality: [
    'DQI Score', 'DQI', 'Data Quality', 'data_quality_rating', 
    'Quality', 'Data Quality Rating', 'Quality Score'
  ],
  notes: [
    'Notes', 'notes', 'Comments', 'Comment', 'Description', 
    'NOTES', 'Additional Notes', 'Remarks'
  ],
  year: [
    'Year', 'year', 'Reference Year', 'Data Year', 
    'YEAR', 'Source Year', 'Validity'
  ],
  density: [
    'Density', 'density', 'Density (kg/m3)', 'kg/m³', 
    'Density (kg/m³)', 'DENSITY'
  ],
  recycled_content: [
    'Recycled Content', 'Recycled', 'Recycled %', 'recycled_content',
    '% Recycled', 'Recycled Content (%)'
  ],
};

function findColumnValue(row: Record<string, unknown>, targetField: string): unknown {
  const possibleNames = COLUMN_MAPPINGS[targetField] || [targetField];
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return undefined;
}

function parseICERow(row: Record<string, unknown>): ICEMaterial | null {
  const rawName = findColumnValue(row, 'material_name');
  const rawCategory = findColumnValue(row, 'material_category');
  const rawSubcat = findColumnValue(row, 'subcategory');
  const rawUnit = findColumnValue(row, 'unit');
  const rawEfTotal = findColumnValue(row, 'ef_total');
  const rawEfA1A3 = findColumnValue(row, 'ef_a1a3');
  const rawDqi = findColumnValue(row, 'data_quality');
  const rawNotes = findColumnValue(row, 'notes');
  const rawYear = findColumnValue(row, 'year');
  
  const materialName = rawName ? String(rawName).trim() : '';
  const efTotal = parseFloat(String(rawEfTotal || '0'));
  
  // Skip rows without valid material name or EF
  if (!materialName || materialName.length < 2 || isNaN(efTotal) || efTotal <= 0) {
    return null;
  }
  
  const efA1A3 = parseFloat(String(rawEfA1A3 || '0'));
  const year = parseInt(String(rawYear || '2025'));
  
  return {
    material_name: normalizeMaterialName(materialName),
    material_category: rawCategory ? String(rawCategory).trim() : 'Uncategorized',
    subcategory: rawSubcat ? String(rawSubcat).trim() : undefined,
    unit: normalizeUnit(String(rawUnit || 'kg')),
    ef_total: efTotal,
    ef_a1a3: isNaN(efA1A3) || efA1A3 <= 0 ? undefined : efA1A3,
    data_quality_rating: rawDqi ? String(rawDqi).trim() : undefined,
    notes: rawNotes ? String(rawNotes).trim() : undefined,
    year: isNaN(year) ? 2025 : year,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }
    
    // Check admin role (optional - allow any authenticated user for now)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    const isAdmin = !!roleData;
    console.log(`User ${user.id} is admin: ${isAdmin}`);
    
    const body = await req.json();
    const { materials, dryRun = false, jobId } = body;
    
    if (!materials || !Array.isArray(materials)) {
      throw new Error('Invalid request: materials array required');
    }
    
    console.log(`Processing ${materials.length} ICE materials (dryRun: ${dryRun}, jobId: ${jobId || 'none'})`);
    
    const parsed: ICEMaterial[] = [];
    const errors: { row: number; error: string }[] = [];
    const seenKeys = new Set<string>();
    let duplicatesSkipped = 0;
    
    // Parse, validate, and dedupe each row
    for (let i = 0; i < materials.length; i++) {
      try {
        const material = parseICERow(materials[i]);
        if (material) {
          // Create a dedupe key: normalized name + unit
          const dedupeKey = `${material.material_name}|${material.unit}`;
          
          if (seenKeys.has(dedupeKey)) {
            duplicatesSkipped++;
            continue;
          }
          seenKeys.add(dedupeKey);
          parsed.push(material);
        } else {
          errors.push({ row: i, error: 'Invalid or empty material data' });
        }
      } catch (err) {
        errors.push({ row: i, error: err instanceof Error ? err.message : 'Parse error' });
      }
    }
    
    console.log(`Parsed ${parsed.length} valid materials, ${errors.length} errors, ${duplicatesSkipped} duplicates skipped`);
    
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          validCount: parsed.length,
          errorCount: errors.length,
          duplicatesSkipped,
          preview: parsed.slice(0, 10),
          errors: errors.slice(0, 20),
          categories: [...new Set(parsed.map(m => m.material_category))],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform to materials_epd schema with proper data source for dedupe index
    const records = parsed.map(m => ({
      material_name: m.material_name,
      material_category: m.material_category,
      subcategory: m.subcategory || null,
      unit: m.unit,
      ef_total: m.ef_total,
      ef_a1a3: m.ef_a1a3 || null,
      data_source: 'ICE Database', // Must match the unique index condition
      data_quality_rating: m.data_quality_rating || null,
      notes: m.notes || null,
      year: m.year,
      region: 'UK',
      eco_platform_compliant: false,
      ecoinvent_methodology: 'hybrid',
      updated_at: new Date().toISOString(),
    }));
    
    // Batch upsert with conflict handling
    const batchSize = 100;
    let inserted = 0;
    let updated = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Use upsert with the unique constraint on (material_name, data_source, unit)
      const { data, error, count } = await supabase
        .from('materials_epd')
        .upsert(batch, {
          onConflict: 'material_name,data_source,unit',
          ignoreDuplicates: false,
        })
        .select('id');
      
      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error);
        // Continue with other batches instead of failing entirely
        errors.push({ row: i, error: `Batch insert failed: ${error.message}` });
        continue;
      }
      
      const batchCount = data?.length || 0;
      inserted += batchCount;
      
      // Update job progress if jobId provided
      if (jobId) {
        await supabase
          .from('ice_import_jobs')
          .update({
            processed_rows: Math.min(i + batchSize, records.length),
            imported_count: inserted,
          })
          .eq('id', jobId);
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, total: ${inserted}`);
    }
    
    // Update job as completed if jobId provided
    if (jobId) {
      await supabase
        .from('ice_import_jobs')
        .update({
          status: 'completed',
          processed_rows: records.length,
          imported_count: inserted,
          skipped_count: duplicatesSkipped,
          error_count: errors.length,
          errors: errors.slice(0, 100),
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        dryRun: false,
        inserted,
        updated,
        validCount: parsed.length,
        errorCount: errors.length,
        duplicatesSkipped,
        categories: [...new Set(parsed.map(m => m.material_category))],
        errors: errors.slice(0, 20),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('ICE import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
