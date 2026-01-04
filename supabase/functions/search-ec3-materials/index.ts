/**
 * EC3 Material Search Edge Function
 * 
 * Proxies search requests to the BuildingTransparency EC3 API.
 * Requires EC3_API_KEY secret to be configured.
 * 
 * Materials are returned for display but NOT stored per licensing requirements.
 * 
 * Rate limits (default EC3): 45/min, 400/hour, 2000/day, 10000/month
 * 
 * @see https://docs.buildingtransparency.org/ec3/api-and-integrations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EC3 API base URL
const EC3_API_BASE = 'https://buildingtransparency.org/api';

interface SearchRequest {
  query?: string;
  category_id?: string;
  manufacturer?: string;
  country?: string;
  min_gwp?: number;
  max_gwp?: number;
  declared_unit?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[EC3] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required', status_code: 401 }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[EC3] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', status_code: 401 }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EC3] Search request from user: ${user.id}`);

    // Get EC3 API key
    const ec3ApiKey = Deno.env.get('EC3_API_KEY');
    if (!ec3ApiKey) {
      console.error('[EC3] EC3_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'EC3 API key not configured. Please add your EC3 API key in project settings.',
          status_code: 500 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: SearchRequest = await req.json();
    console.log('[EC3] Search params:', JSON.stringify(body));

    if (!body.query || body.query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Search query must be at least 2 characters', status_code: 400 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build EC3 API request
    // Note: EC3 uses a GraphQL-like query language, but also has REST endpoints
    // The materials endpoint supports text search via 'q' parameter
    const params = new URLSearchParams();
    params.set('q', body.query.trim());
    
    if (body.category_id) params.set('category', body.category_id);
    if (body.manufacturer) params.set('manufacturer', body.manufacturer);
    if (body.country) params.set('country', body.country);
    if (body.declared_unit) params.set('declared_unit', body.declared_unit);
    if (body.page) params.set('page', String(body.page));
    if (body.page_size) params.set('page_size', String(Math.min(body.page_size, 100)));
    if (body.sort_by) params.set('sort_by', body.sort_by);
    if (body.sort_order) params.set('sort_order', body.sort_order);

    // Add filters for GWP range
    if (body.min_gwp !== undefined) params.set('gwp_min', String(body.min_gwp));
    if (body.max_gwp !== undefined) params.set('gwp_max', String(body.max_gwp));

    const ec3Url = `${EC3_API_BASE}/epds?${params.toString()}`;
    console.log('[EC3] Calling EC3 API:', ec3Url.replace(ec3ApiKey, '***'));

    // Call EC3 API
    const ec3Response = await fetch(ec3Url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ec3ApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Handle EC3 API errors
    if (!ec3Response.ok) {
      const errorText = await ec3Response.text();
      console.error(`[EC3] API error ${ec3Response.status}:`, errorText);

      if (ec3Response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'EC3 rate limit exceeded. Please wait and try again.',
            status_code: 429,
            rate_limit_remaining: 0
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (ec3Response.status === 401 || ec3Response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'EC3 API key is invalid or expired. Please update your API key.',
            status_code: ec3Response.status
          }),
          { status: ec3Response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: `EC3 API error: ${ec3Response.statusText}`,
          status_code: ec3Response.status
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and transform EC3 response
    const ec3Data = await ec3Response.json();
    console.log(`[EC3] Received ${ec3Data.results?.length || 0} results`);

    // Transform EC3 data to our format
    // Note: Actual EC3 response structure may vary - adjust mapping as needed
    const transformedResults = (ec3Data.results || ec3Data.data || ec3Data || []).map((item: any) => ({
      id: item.id || item.epd_id || item.open_xpd_uuid,
      name: item.name || item.product_name,
      product_name: item.product_name || item.name,
      category: {
        id: item.category?.id || item.category_id,
        display_name: item.category?.display_name || item.category_name || item.category,
      },
      manufacturer: item.manufacturer,
      manufacturer_name: item.manufacturer_name || item.manufacturer?.name,
      plant_or_group: item.plant_or_group || item.plant_name,
      
      // EPD info
      epd_number: item.epd_number || item.declaration_number,
      epd_url: item.epd_url || item.declaration_url,
      date_of_issue: item.date_of_issue || item.issued_date,
      date_of_expiry: item.date_of_expiry || item.expiry_date || item.valid_until,
      program_operator: item.program_operator,
      program_operator_name: item.program_operator_name,
      
      // Environmental data
      gwp: item.gwp || item.gwp_total || item.gwp_per_declared_unit || item.carbon_footprint,
      declared_unit: item.declared_unit || item.unit,
      impacts: {
        gwp_per_declared_unit: item.gwp || item.gwp_total,
        declared_unit: item.declared_unit || item.unit,
        gwp_a1a2a3: item.gwp_a1a2a3 || item.gwp_a1_a3,
        gwp_a4: item.gwp_a4,
        gwp_a5: item.gwp_a5,
        gwp_b: item.gwp_b || item.gwp_b1_b7,
        gwp_c: item.gwp_c || item.gwp_c1_c4,
        gwp_d: item.gwp_d,
        gwp_biogenic: item.gwp_biogenic,
      },
      
      // Geographic
      geographic_scope: {
        country: item.country || item.geography?.country,
        state: item.state || item.region || item.geography?.region,
        plant_city: item.plant_city || item.manufacturing_city,
        plant_country: item.plant_country || item.manufacturing_country,
      },
      
      // Metadata
      product_description: item.description || item.product_description,
      ec3_url: item.ec3_url || `https://buildingtransparency.org/ec3/epds/${item.id}`,
      last_updated: item.last_updated || item.updated_at,
      
      // Quality
      pcr_name: item.pcr_name || item.pcr?.name,
      pcr_id: item.pcr_id || item.pcr?.id,
      data_quality_score: item.data_quality_score,
      conservativeness: item.conservativeness,
    }));

    // Build response
    const response = {
      results: transformedResults,
      total_count: ec3Data.count || ec3Data.total_count || transformedResults.length,
      page: body.page || 1,
      page_size: body.page_size || 25,
      has_next: ec3Data.has_next || (transformedResults.length === (body.page_size || 25)),
      query_tokens_used: ec3Data.tokens_used || 1,
    };

    console.log(`[EC3] Returning ${response.results.length} results to user ${user.id}`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[EC3] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status_code: 500
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
