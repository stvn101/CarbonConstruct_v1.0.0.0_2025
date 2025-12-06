import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`Schema inspection started by user: ${user.id}`);

    // Get external Supabase credentials
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_KEY');

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured');
    }

    // Connect to external Supabase
    const externalSupabase = createClient(externalUrl, externalKey);

    const { tableName = 'materials_epd' } = await req.json();

    // Get sample rows to understand schema
    const { data: sampleData, error: sampleError } = await externalSupabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      throw new Error(`Could not access external table: ${sampleError.message}`);
    }

    if (!sampleData || sampleData.length === 0) {
      throw new Error('External table is empty');
    }

    // Analyze schema from sample data
    const columns: Record<string, { type: string; sample: any; nullable: boolean }> = {};
    
    sampleData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        if (!columns[key]) {
          columns[key] = {
            type: value === null ? 'unknown' : typeof value,
            sample: value,
            nullable: value === null,
          };
        } else if (value === null) {
          columns[key].nullable = true;
        }
      });
    });

    // Get count and data sources
    const { count } = await externalSupabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    const { data: sourcesData } = await externalSupabase
      .from(tableName)
      .select('data_source')
      .limit(1000);

    const uniqueSources = [...new Set(sourcesData?.map(r => r.data_source) || [])];

    console.log(`Found ${Object.keys(columns).length} columns in external table`);

    return new Response(
      JSON.stringify({
        success: true,
        tableName,
        totalRows: count || 0,
        columns,
        columnNames: Object.keys(columns),
        sampleRows: sampleData.slice(0, 3),
        dataSources: uniqueSources,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in inspect-external-schema function:', error);
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
