import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportProgress {
  total: number;
  imported: number;
  failed: number;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Get external Supabase credentials
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_KEY');

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured');
    }

    // Connect to external Supabase
    const externalSupabase = createClient(externalUrl, externalKey);

    // Get the table name from request or default to 'lca_materials'
    const { tableName = 'lca_materials', batchSize = 100 } = await req.json();

    console.log(`Importing from external table: ${tableName}`);

    // First, get a sample row to understand the schema
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
    console.log(`External table has ${externalColumns.length} columns:`, externalColumns);

    // Get total count
    const { count: totalCount, error: countError } = await externalSupabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
      throw new Error(`Could not count records: ${countError.message}`);
    }

    console.log(`Total records to import: ${totalCount}`);

    // Use service role key for inserting into our database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Import data in batches
    const progress: ImportProgress = {
      total: totalCount || 0,
      imported: 0,
      failed: 0,
      status: 'importing',
    };

    let offset = 0;
    const errors: Array<{ row: number; error: string }> = [];

    while (offset < (totalCount || 0)) {
      console.log(`Fetching batch at offset ${offset}`);

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
        // Map the data to our schema - unified_materials column mapping
        const mappedData = batchData.map((row: any) => {
          // Calculate total from LCA stages
          const a1a3 = parseFloat(row.a1a3_factor) || null;
          const a4 = parseFloat(row.a4_factor) || null;
          const a5 = parseFloat(row.a5_factor) || null;
          
          // Calculate total if we have at least a1a3
          let total = null;
          if (a1a3 !== null) {
            total = a1a3 + (a4 || 0) + (a5 || 0);
          }

          const mapped: any = {
            material_name: row.name || 'Unknown',
            material_category: row.category || 'Uncategorized',
            unit: row.unit || 'kg',
            embodied_carbon_a1a3: a1a3,
            embodied_carbon_a4: a4,
            embodied_carbon_a5: a5,
            embodied_carbon_total: total,
            data_source: row.source || 'External Import',
            region: row.region || 'Australia',
            year: row.publish_date ? new Date(row.publish_date).getFullYear() : null,
          };

          return mapped;
        });

        // Insert batch into our database
        const { error: insertError } = await supabaseAdmin
          .from('lca_materials')
          .insert(mappedData);

        if (insertError) {
          console.error(`Error inserting batch at offset ${offset}:`, insertError);
          progress.failed += batchData.length;
          errors.push({
            row: offset,
            error: insertError.message,
          });
        } else {
          progress.imported += batchData.length;
          console.log(`Successfully imported ${progress.imported}/${totalCount} records`);
        }
      }

      offset += batchSize;
    }

    progress.status = progress.failed > 0 ? 'completed_with_errors' : 'completed';

    console.log('Import completed:', progress);

    return new Response(
      JSON.stringify({
        success: true,
        progress,
        externalColumns,
        sampleRow,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return first 10 errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in import-materials function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
