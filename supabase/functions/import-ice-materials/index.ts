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

/**
 * Parse ICE database spreadsheet data and map to materials_epd schema.
 * ICE V4.1 uses columns like:
 * - Material Name
 * - Material Category  
 * - Unit (kg, m², m³, etc.)
 * - EF (kgCO2e/unit) - hybrid LCA total
 * - EF A1-A3 - process LCA
 * - DQI Score - data quality indicator
 * - Notes
 */
function parseICERow(row: Record<string, unknown>): ICEMaterial | null {
  // Handle various possible column names from ICE spreadsheet
  const materialName = row['Material Name'] || row['material_name'] || row['Material'] || row['Name'];
  const category = row['Material Category'] || row['Category'] || row['material_category'] || 'Uncategorized';
  const subcategory = row['Sub-Category'] || row['Subcategory'] || row['subcategory'];
  const unit = row['Unit'] || row['unit'] || 'kg';
  
  // EF columns - ICE uses various naming conventions
  const efTotal = parseFloat(
    row['EF Total'] || row['EF (kgCO2e/unit)'] || row['ef_total'] || 
    row['Embodied Carbon'] || row['EF'] || row['Total EF'] || '0'
  );
  const efA1A3 = parseFloat(
    row['EF A1-A3'] || row['A1-A3'] || row['ef_a1a3'] || 
    row['Process EF'] || row['A1A3'] || '0'
  );
  
  const dqi = row['DQI Score'] || row['DQI'] || row['Data Quality'] || row['data_quality_rating'];
  const notes = row['Notes'] || row['notes'] || row['Comments'];
  const year = parseInt(row['Year'] || row['year'] || row['Reference Year'] || '2025');
  
  if (!materialName || isNaN(efTotal) || efTotal <= 0) {
    return null;
  }
  
  return {
    material_name: String(materialName).trim(),
    material_category: String(category).trim(),
    subcategory: subcategory ? String(subcategory).trim() : undefined,
    unit: String(unit).trim(),
    ef_total: efTotal,
    ef_a1a3: isNaN(efA1A3) || efA1A3 <= 0 ? undefined : efA1A3,
    data_quality_rating: dqi ? String(dqi).trim() : undefined,
    notes: notes ? String(notes).trim() : undefined,
    year: isNaN(year) ? 2025 : year,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleError || !roleData) {
      throw new Error('Unauthorized: Admin role required');
    }
    
    const body = await req.json();
    const { materials, dryRun = false } = body;
    
    if (!materials || !Array.isArray(materials)) {
      throw new Error('Invalid request: materials array required');
    }
    
    console.log(`Processing ${materials.length} ICE materials (dryRun: ${dryRun})`);
    
    const parsed: ICEMaterial[] = [];
    const errors: { row: number; error: string }[] = [];
    
    // Parse and validate each row
    for (let i = 0; i < materials.length; i++) {
      try {
        const material = parseICERow(materials[i]);
        if (material) {
          parsed.push(material);
        } else {
          errors.push({ row: i, error: 'Invalid or empty material data' });
        }
      } catch (err) {
        errors.push({ row: i, error: err instanceof Error ? err.message : 'Parse error' });
      }
    }
    
    console.log(`Parsed ${parsed.length} valid materials, ${errors.length} errors`);
    
    if (dryRun) {
      // Return preview without inserting
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          validCount: parsed.length,
          errorCount: errors.length,
          preview: parsed.slice(0, 10),
          errors: errors.slice(0, 20),
          categories: [...new Set(parsed.map(m => m.material_category))],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform to materials_epd schema
    const records = parsed.map(m => ({
      material_name: m.material_name,
      material_category: m.material_category,
      subcategory: m.subcategory || null,
      unit: m.unit,
      ef_total: m.ef_total,
      ef_a1a3: m.ef_a1a3 || null,
      data_source: 'ICE V4.1',
      data_quality_rating: m.data_quality_rating || null,
      notes: m.notes || null,
      year: m.year,
      region: 'UK', // ICE is UK-based
      eco_platform_compliant: false, // ICE uses different methodology
      ecoinvent_methodology: 'hybrid', // ICE uses hybrid LCA
    }));
    
    // Batch insert with upsert (update if material_name + data_source exists)
    const batchSize = 100;
    let inserted = 0;
    let updated = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('materials_epd')
        .upsert(batch, {
          onConflict: 'material_name,data_source',
          ignoreDuplicates: false,
        })
        .select('id');
      
      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error);
        throw new Error(`Database insert failed: ${error.message}`);
      }
      
      inserted += data?.length || 0;
      console.log(`Processed batch ${i / batchSize + 1}, total: ${inserted}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        dryRun: false,
        inserted,
        validCount: parsed.length,
        errorCount: errors.length,
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
