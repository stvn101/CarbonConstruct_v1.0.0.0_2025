import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportProgress {
  total: number;
  imported: number;
  failed: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  deletedExisting: number;
  status: string;
}

interface ImportOptions {
  tableName?: string;
  batchSize?: number;
  mode?: 'replace' | 'merge';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let metadataId: string | null = null;
  let supabaseAdmin: ReturnType<typeof createClient> | null = null;

  try {
    // Initialize Supabase client for auth check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log(`User ${user.id} attempted import without admin role`);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Import started by admin user: ${user.id}`);

    // Use service role key for all database operations (initialize early for metadata)
    supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse options from request body (parse early to get mode for metadata)
    const options: ImportOptions = await req.json().catch(() => ({}));
    const tableName = options.tableName || 'unified_materials';
    const batchSize = options.batchSize || 100;
    const mode = options.mode || 'replace';

    // Create import metadata record
    const { data: metadataRecord, error: metadataError } = await supabaseAdmin
      .from('import_metadata')
      .insert({
        import_type: 'unified_materials',
        started_at: new Date().toISOString(),
        mode: mode,
        status: 'running',
        performed_by: user.id
      })
      .select('id')
      .single();

    if (!metadataError && metadataRecord) {
      metadataId = metadataRecord.id;
      console.log(`Created import metadata record: ${metadataId}`);
    }

    // Get external Supabase credentials
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_KEY');

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured');
    }

    // Connect to external Supabase
    const externalSupabase = createClient(externalUrl, externalKey);

    console.log(`Import mode: ${mode}, table: ${tableName}, batchSize: ${batchSize}`);

    // Initialize progress
    const progress: ImportProgress = {
      total: 0,
      imported: 0,
      failed: 0,
      skippedDuplicates: 0,
      skippedInvalid: 0,
      deletedExisting: 0,
      status: 'initializing',
    };

    // If REPLACE mode, delete all existing materials first
    if (mode === 'replace') {
      console.log('REPLACE mode: Deleting all existing materials_epd records...');
      
      // Get count before deletion
      const { count: existingCount } = await supabaseAdmin
        .from('materials_epd')
        .select('*', { count: 'exact', head: true });
      
      const { error: deleteError } = await supabaseAdmin
        .from('materials_epd')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (deleteError) {
        console.error('Error deleting existing records:', deleteError);
        throw new Error(`Failed to clear existing data: ${deleteError.message}`);
      }
      
      progress.deletedExisting = existingCount || 0;
      console.log(`Deleted ${progress.deletedExisting} existing records`);
    }

    // Get sample row to verify schema
    const { data: sampleData, error: sampleError } = await externalSupabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      throw new Error(`Could not access external table: ${sampleError.message}`);
    }

    if (!sampleData || sampleData.length === 0) {
      throw new Error('External table is empty');
    }

    const sampleRow = sampleData[0];
    const externalColumns = Object.keys(sampleRow);
    console.log(`External table columns (${externalColumns.length}):`, externalColumns.join(', '));

    // Get total count
    const { count: totalCount, error: countError } = await externalSupabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
      throw new Error(`Could not count records: ${countError.message}`);
    }

    progress.total = totalCount || 0;
    progress.status = 'importing';
    console.log(`Total records to import: ${progress.total}`);

    const errors: Array<{ row: number; error: string; material?: string }> = [];
    
    // Track seen materials to prevent duplicates
    const seenMaterials = new Set<string>();

    let offset = 0;
    while (offset < (totalCount || 0)) {
      console.log(`Processing batch at offset ${offset}/${progress.total}`);

      const { data: batchData, error: batchError } = await externalSupabase
        .from(tableName)
        .select('*')
        .range(offset, offset + batchSize - 1);

      if (batchError) {
        console.error(`Error fetching batch at offset ${offset}:`, batchError);
        progress.failed += batchSize;
        offset += batchSize;
        continue;
      }

      if (batchData && batchData.length > 0) {
        const mappedData: any[] = [];
        
        for (const row of batchData) {
          try {
            // Parse numeric values with robust handling
            const parseNumber = (val: any): number | null => {
              if (val === null || val === undefined || val === '' || val === 'null') return null;
              const num = typeof val === 'string' ? parseFloat(val) : val;
              return isNaN(num) ? null : num;
            };

            const parseDate = (val: any): string | null => {
              if (!val || val === 'null') return null;
              try {
                const date = new Date(val);
                if (isNaN(date.getTime())) return null;
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
              } catch {
                return null;
              }
            };

            // Map all LCA lifecycle stages (EN 15804 compliant)
            // Support both standard column names and external unified_materials schema
            const efA1a3 = parseNumber(row.a1a3_factor) ?? parseNumber(row.ef_a1a3);
            const efA4 = parseNumber(row.a4_factor) ?? parseNumber(row.ef_a4);
            const efA5 = parseNumber(row.a5_factor) ?? parseNumber(row.ef_a5);
            const efB1b5 = parseNumber(row.b1b5_factor) ?? parseNumber(row.ef_b1b5);
            const efC1c4 = parseNumber(row.c1c4_factor) ?? parseNumber(row.ef_c1c4);
            const efD = parseNumber(row.d_factor) ?? parseNumber(row.ef_d);

            // Map scope factors
            const scope1 = parseNumber(row.scope1_factor);
            const scope2 = parseNumber(row.scope2_factor);
            const scope3 = parseNumber(row.scope3_factor);

            // Calculate total: Handle multiple possible column names
            // External unified_materials uses 'embodied_carbon' for per-unit factor
            let efTotal = parseNumber(row.ef_total) ?? 
                          parseNumber(row.embodied_carbon_total) ?? 
                          parseNumber(row.embodied_carbon);
            
            if (efTotal === null && efA1a3 !== null) {
              efTotal = efA1a3 + (efA4 || 0) + (efA5 || 0) + (efB1b5 || 0) + (efC1c4 || 0);
            }

            // Skip if no valid emission data
            if (efTotal === null || efTotal <= 0) {
              progress.skippedInvalid++;
              continue;
            }

            // Extract material identifiers - support external unified_materials schema
            // External uses: material_type, material_subtype, supplier
            const materialName = row.name || row.material_name || row.material_type || 'Unknown Material';
            const materialCategory = row.category || row.material_category || row.material_type || 'Uncategorized';
            const subcategory = row.subcategory || row.material_subtype || null;

            // Standardize unit based on material type
            let unit = row.unit || 'kg';
            const nameLower = materialName.toLowerCase();
            const categoryLower = materialCategory.toLowerCase();
            
            // Fix common unit mismatches
            if (unit === 'm³' || unit === 'm3') {
              if (categoryLower.includes('steel') || categoryLower.includes('metal') || 
                  categoryLower.includes('alumin') || nameLower.includes('steel') || 
                  nameLower.includes('rebar') || nameLower.includes('reinforc')) {
                unit = 'kg';
              } else if (categoryLower.includes('glass') || categoryLower.includes('glazing') || 
                         categoryLower.includes('window')) {
                unit = 'm²';
              }
            }
            
            // Create unique key for deduplication
            const dedupeKey = `${materialName.toLowerCase()}|${materialCategory.toLowerCase()}|${unit}|${efTotal.toFixed(4)}`;
            
            if (seenMaterials.has(dedupeKey)) {
              progress.skippedDuplicates++;
              continue;
            }
            seenMaterials.add(dedupeKey);

            // Build complete mapped record with all columns
            mappedData.push({
              // Core identification
              material_name: materialName,
              material_category: materialCategory,
              subcategory: subcategory,
              unit: unit,
              
              // LCA lifecycle stages (EN 15804)
              ef_a1a3: efA1a3,
              ef_a4: efA4,
              ef_a5: efA5,
              ef_b1b5: efB1b5,
              ef_c1c4: efC1c4,
              ef_d: efD,
              ef_total: efTotal,
              
              // Scope factors
              scope1_factor: scope1,
              scope2_factor: scope2,
              scope3_factor: scope3,
              
              // Data source and provenance - map supplier from external schema
              data_source: row.source || row.data_source || 'unified_materials',
              region: row.region || 'Australia',
              state: row.state || null,
              manufacturer: row.manufacturer || row.supplier || null,
              plant_location: row.plant_location || null,
              
              // EPD metadata
              epd_number: row.epd_number || row.ec3_id || null,
              epd_url: row.epd_url || null,
              epd_type: row.epd_type || null,
              program_operator: row.program_operator || null,
              
              // Dates
              publish_date: parseDate(row.publish_date),
              expiry_date: parseDate(row.expiry_date),
              year: row.publish_date ? new Date(row.publish_date).getFullYear() : 
                    (parseNumber(row.year) || parseNumber(row.reference_year) || null),
              reference_year: parseNumber(row.reference_year),
              
              // Data quality
              data_quality_tier: row.data_quality_tier || row.reliability || 'industry_average',
              data_quality_rating: row.data_quality_rating || row.reliability || null,
              uncertainty_percent: parseNumber(row.uncertainty_percent) || 20,
              
              // Carbon details
              recycled_content: parseNumber(row.recycled_content),
              carbon_sequestration: parseNumber(row.carbon_sequestration),
              biogenic_carbon_kg_c: parseNumber(row.biogenic_carbon_kg_c),
              biogenic_carbon_percentage: parseNumber(row.biogenic_carbon_percentage),
              
              // GWP breakdown
              gwp_fossil_a1a3: parseNumber(row.gwp_fossil_a1a3),
              gwp_biogenic_a1a3: parseNumber(row.gwp_biogenic_a1a3),
              gwp_luluc_a1a3: parseNumber(row.gwp_luluc_a1a3),
              
              // Methodology
              allocation_method: row.allocation_method || null,
              characterisation_factor_version: row.characterisation_factor_version || 'JRC-EF-3.1',
              ecoinvent_methodology: row.ecoinvent_methodology || null,
              
              // Manufacturing info
              manufacturing_country: row.manufacturing_country || null,
              manufacturing_city: row.manufacturing_city || null,
              number_of_sites: parseNumber(row.number_of_sites),
              
              // Co-product handling
              is_co_product: row.is_co_product === true || row.is_co_product === 'true',
              co_product_type: row.co_product_type || null,
              uses_mass_balance: row.uses_mass_balance === true || row.uses_mass_balance === 'true',
              
              // Compliance
              eco_platform_compliant: row.eco_platform_compliant !== false,
              average_specific: row.average_specific || null,
              validity: row.validity || null,
              
              // LCA practitioners
              lca_practitioner: row.lca_practitioner || null,
              lca_verifier: row.lca_verifier || null,
              
              // Notes - include ec3_category if present
              notes: row.notes || (row.ec3_category ? `EC3 Category: ${row.ec3_category}` : null),
            });
          } catch (parseError) {
            console.warn(`Error parsing row:`, parseError);
            progress.skippedInvalid++;
          }
        }

        if (mappedData.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('materials_epd')
            .insert(mappedData);

          if (insertError) {
            console.error(`Error inserting batch at offset ${offset}:`, insertError);
            progress.failed += mappedData.length;
            errors.push({
              row: offset,
              error: insertError.message,
              material: mappedData[0]?.material_name || 'unknown',
            });
          } else {
            progress.imported += mappedData.length;
          }
        }
      }

      offset += batchSize;
      
      // Log progress every 10 batches
      if ((offset / batchSize) % 10 === 0) {
        console.log(`Progress: ${progress.imported} imported, ${progress.skippedDuplicates} duplicates skipped, ${progress.skippedInvalid} invalid skipped`);
      }
    }

    progress.status = progress.failed > 0 ? 'completed_with_errors' : 'completed';

    console.log('=== Import Complete ===');
    console.log(`Total from source: ${progress.total}`);
    console.log(`Imported: ${progress.imported}`);
    console.log(`Duplicates skipped: ${progress.skippedDuplicates}`);
    console.log(`Invalid skipped: ${progress.skippedInvalid}`);
    console.log(`Failed: ${progress.failed}`);
    if (mode === 'replace') {
      console.log(`Previous records deleted: ${progress.deletedExisting}`);
    }

    // Update import metadata with completion status
    if (metadataId && supabaseAdmin) {
      await supabaseAdmin
        .from('import_metadata')
        .update({
          completed_at: new Date().toISOString(),
          records_imported: progress.imported,
          records_deleted: progress.deletedExisting,
          status: progress.status,
        })
        .eq('id', metadataId);
      console.log(`Updated import metadata: ${metadataId}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        progress,
        externalColumns,
        sampleRow: { 
          ...sampleRow, 
          // Truncate long values in sample for readability
          notes: sampleRow.notes ? `${String(sampleRow.notes).substring(0, 100)}...` : null 
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in import-materials function:', errorMessage);

    // Update import metadata with failure status
    if (metadataId && supabaseAdmin) {
      await supabaseAdmin
        .from('import_metadata')
        .update({
          completed_at: new Date().toISOString(),
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', metadataId);
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: 'An error occurred while importing materials. Check edge function logs for details.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
