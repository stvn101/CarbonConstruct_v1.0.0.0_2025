import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ICEMaterial {
  material_name: string;
  material_category: string;
  subcategory?: string | null;
  unit: string;
  ef_total: number;
  ef_a1a3?: number | null;
  data_source: string;
  data_quality_rating?: string | null;
  notes?: string | null;
  year?: number;
  region?: string;
  eco_platform_compliant?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ICE Import] Starting import...');

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`[ICE Import] User authenticated: ${user.id}`);

    // Parse request body
    const { materials } = await req.json();

    if (!Array.isArray(materials) || materials.length === 0) {
      throw new Error('No materials provided');
    }

    console.log(`[ICE Import] Processing ${materials.length} materials...`);

    // First, delete existing ICE materials to avoid duplicates
    const { error: deleteError } = await supabase
      .from('materials_epd')
      .delete()
      .eq('data_source', 'ICE V4.1 - Circular Ecology');

    if (deleteError) {
      console.error('[ICE Import] Delete error:', deleteError);
    } else {
      console.log('[ICE Import] Cleared existing ICE materials');
    }

    // Transform materials to database schema
    const dbMaterials = materials.map((m: ICEMaterial) => ({
      material_name: m.material_name,
      material_category: m.material_category,
      subcategory: m.subcategory || null,
      unit: m.unit,
      ef_total: m.ef_total,
      ef_a1a3: m.ef_a1a3 || m.ef_total,
      data_source: 'ICE V4.1 - Circular Ecology',
      data_quality_rating: m.data_quality_rating || null,
      notes: m.notes || null,
      year: m.year || 2025,
      region: m.region || 'UK',
      eco_platform_compliant: m.eco_platform_compliant ?? true,
      updated_at: new Date().toISOString()
    }));

    // Batch insert (50 at a time)
    const batchSize = 50;
    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < dbMaterials.length; i += batchSize) {
      const batch = dbMaterials.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('materials_epd')
        .insert(batch);

      if (error) {
        console.error(`[ICE Import] Batch error:`, error);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        imported += batch.length;
        console.log(`[ICE Import] Imported batch: ${imported}/${dbMaterials.length}`);
      }
    }

    console.log(`[ICE Import] Complete: ${imported} imported, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        imported,
        updated: 0,
        errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('[ICE Import] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
