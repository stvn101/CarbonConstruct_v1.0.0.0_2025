/**
 * EC3 Material Search Edge Function
 * 
 * Proxies search requests to the BuildingTransparency EC3 API.
 * Requires EC3_API_KEY secret to be configured.
 * 
 * Materials are returned for display but NOT stored per licensing requirements.
 * 
 * Rate limits (default EC3):
 * - 45 requests/minute
 * - 400 requests/hour  
 * - 2,000 tokens/day
 * - 10,000 tokens/month
 * 
 * Token costs:
 * - Material Filter Query: 0.01 tokens (cheap)
 * - EPD Details: 1.0 token (expensive - avoid)
 * 
 * @see https://buildingtransparency.org/ec3/manage-apps (API documentation)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Correct EC3 API base URL per implementation blueprint
const EC3_API_BASE = 'https://etl-api.cqd.io/api';

// Rate limit: 20 searches per hour for Pro users
const EC3_RATE_LIMIT = {
  windowMinutes: 60,
  maxRequests: 20,
};

interface SearchRequest {
  query?: string;
  category?: string;
  manufacturer?: string;
  country?: string; // e.g., "AU", "US-NY"
  min_gwp?: number;
  max_gwp?: number;
  declared_unit?: string;
  page?: number;
  page_size?: number;
  only_valid?: boolean; // Filter expired EPDs
}

/**
 * Check if user has Pro or Enterprise subscription via Stripe
 */
async function checkProSubscription(email: string): Promise<{ isPro: boolean; isAdmin: boolean }> {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    console.warn('[EC3] STRIPE_SECRET_KEY not configured, denying access');
    return { isPro: false, isAdmin: false };
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    
    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return { isPro: false, isAdmin: false };
    }

    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing subscription
      const trialingSubs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'trialing',
        limit: 1,
      });
      
      if (trialingSubs.data.length === 0) {
        return { isPro: false, isAdmin: false };
      }
    }

    // Has active/trialing subscription = Pro access
    return { isPro: true, isAdmin: false };
  } catch (error) {
    console.error('[EC3] Stripe check error:', error);
    return { isPro: false, isAdmin: false };
  }
}

/**
 * Check if user is admin via user_roles table
 */
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Rate limit check using rate_limits table
 */
async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const endpoint = 'ec3-search';
  const windowStart = new Date(Date.now() - EC3_RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
  try {
    // Check existing rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .maybeSingle();

    if (fetchError && !fetchError.message.includes('no rows')) {
      console.error('[EC3] Rate limit fetch error:', fetchError);
      // Allow on error to prevent blocking legitimate requests
      return { allowed: true, remaining: EC3_RATE_LIMIT.maxRequests, resetAt: new Date(Date.now() + EC3_RATE_LIMIT.windowMinutes * 60 * 1000).toISOString() };
    }

    if (existing) {
      // Check if limit exceeded
      if (existing.request_count >= EC3_RATE_LIMIT.maxRequests) {
        const resetAt = new Date(new Date(existing.window_start).getTime() + EC3_RATE_LIMIT.windowMinutes * 60 * 1000);
        return { 
          allowed: false, 
          remaining: 0, 
          resetAt: resetAt.toISOString() 
        };
      }

      // Increment counter
      await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      return { 
        allowed: true, 
        remaining: EC3_RATE_LIMIT.maxRequests - existing.request_count - 1,
        resetAt: new Date(new Date(existing.window_start).getTime() + EC3_RATE_LIMIT.windowMinutes * 60 * 1000).toISOString()
      };
    }

    // Create new rate limit record
    await supabase
      .from('rate_limits')
      .insert({
        user_id: userId,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
      });

    return { 
      allowed: true, 
      remaining: EC3_RATE_LIMIT.maxRequests - 1,
      resetAt: new Date(Date.now() + EC3_RATE_LIMIT.windowMinutes * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('[EC3] Rate limit error:', error);
    // Allow on error
    return { allowed: true, remaining: EC3_RATE_LIMIT.maxRequests, resetAt: new Date(Date.now() + EC3_RATE_LIMIT.windowMinutes * 60 * 1000).toISOString() };
  }
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Use anon key for auth verification (respects JWT)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Use service role for rate limits and admin check (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('[EC3] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', status_code: 401 }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EC3] Search request from user: ${user.id}`);

    // Check admin role first (admins bypass subscription check)
    const isAdmin = await checkAdminRole(supabaseAdmin, user.id);
    
    if (!isAdmin) {
      // Check Pro subscription for non-admins
      const { isPro } = await checkProSubscription(user.email || '');
      
      if (!isPro) {
        console.log(`[EC3] User ${user.id} denied - not Pro subscriber`);
        return new Response(
          JSON.stringify({ 
            error: 'EC3 Global Database access requires a Pro subscription. Upgrade to unlock 90,000+ verified EPDs.',
            status_code: 403,
            upgrade_required: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log(`[EC3] Admin user ${user.id} - bypassing subscription check`);
    }

    // Check rate limit (applies to both admins and Pro users)
    const rateLimit = await checkRateLimit(supabaseAdmin, user.id);
    if (!rateLimit.allowed) {
      console.log(`[EC3] User ${user.id} rate limited until ${rateLimit.resetAt}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. You can make ${EC3_RATE_LIMIT.maxRequests} EC3 searches per hour. Try again at ${new Date(rateLimit.resetAt).toLocaleTimeString()}.`,
          status_code: 429,
          rate_limit_remaining: 0,
          rate_limit_reset: rateLimit.resetAt
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EC3] Rate limit OK - ${rateLimit.remaining} requests remaining`);

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

    // Build EC3 API request per implementation blueprint
    // Using /materials endpoint with correct query parameters
    const params = new URLSearchParams();
    
    // Text search - EC3 uses 'search' parameter
    params.set('search', body.query.trim());
    
    // Category filtering - EC3 uses product_classes with JSON format
    if (body.category) {
      params.set('product_classes', JSON.stringify({ "EC3": body.category }));
    }
    
    // Geographic filtering - EC3 uses 'jurisdiction' (e.g., "AU", "US-NY")
    if (body.country) {
      params.set('jurisdiction', body.country);
    }
    
    // Filter expired EPDs by checking validity end date
    if (body.only_valid !== false) {
      const today = new Date().toISOString().split('T')[0];
      params.set('epd__date_validity_ends__gt', today);
    }
    
    // Pagination
    params.set('page_size', String(Math.min(body.page_size || 25, 100)));
    if (body.page) params.set('page', String(body.page));
    
    // Specify return fields to minimize response size and token usage
    const returnFields = [
      'id', 'name', 'product_name', 'category', 'manufacturer',
      'gwp', 'gwp_per_declared_unit', 'declared_unit', 
      'date_of_issue', 'date_of_expiry', 'date_validity_ends',
      'epd_number', 'declaration_url', 'plant_or_group', 
      'jurisdiction', 'country', 'region',
      'gwp_a1a2a3', 'gwp_a4', 'gwp_a5', 'gwp_c1c4', 'gwp_d',
      'open_xpd_uuid', 'ec3_url'
    ];
    params.set('return_fields', JSON.stringify(returnFields));

    const ec3Url = `${EC3_API_BASE}/materials?${params.toString()}`;
    console.log('[EC3] Calling EC3 API:', ec3Url.replace(ec3ApiKey, '***'));

    // Call EC3 API with Bearer token authentication
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
    console.log(`[EC3] Received ${ec3Data.results?.length || ec3Data.length || 0} results`);

    // Handle both array response and paginated response formats
    const rawResults = ec3Data.results || ec3Data.data || (Array.isArray(ec3Data) ? ec3Data : []);

    // Transform EC3 data to our standardized format
    const transformedResults = rawResults.map((item: any) => ({
      id: item.id || item.open_xpd_uuid,
      name: item.name || item.product_name,
      product_name: item.product_name || item.name,
      category: {
        id: item.category?.id || item.category_id,
        display_name: item.category?.display_name || item.category?.name || item.category_name || 
                      (typeof item.category === 'string' ? item.category : 'Uncategorized'),
      },
      manufacturer: item.manufacturer?.name || item.manufacturer,
      manufacturer_name: item.manufacturer?.name || item.manufacturer_name || item.manufacturer,
      plant_or_group: item.plant_or_group || item.plant_name,
      
      // EPD info
      epd_number: item.epd_number || item.declaration_number,
      epd_url: item.declaration_url || item.epd_url,
      date_of_issue: item.date_of_issue || item.issued_date,
      date_of_expiry: item.date_of_expiry || item.date_validity_ends || item.valid_until,
      program_operator: item.program_operator,
      program_operator_name: item.program_operator_name,
      
      // Environmental data - GWP per declared unit
      gwp: item.gwp_per_declared_unit || item.gwp || item.gwp_total || item.carbon_footprint,
      declared_unit: item.declared_unit || item.unit,
      impacts: {
        gwp_per_declared_unit: item.gwp_per_declared_unit || item.gwp || item.gwp_total,
        declared_unit: item.declared_unit || item.unit,
        gwp_a1a2a3: item.gwp_a1a2a3 || item.gwp_a1_a3,
        gwp_a4: item.gwp_a4,
        gwp_a5: item.gwp_a5,
        gwp_c: item.gwp_c1c4 || item.gwp_c || item.gwp_c1_c4,
        gwp_d: item.gwp_d,
        gwp_biogenic: item.gwp_biogenic,
      },
      
      // Geographic scope
      geographic_scope: {
        country: item.country || item.jurisdiction || item.geography?.country,
        state: item.region || item.state || item.geography?.region,
        plant_city: item.plant_city || item.manufacturing_city,
        plant_country: item.plant_country || item.manufacturing_country,
      },
      
      // Metadata
      product_description: item.description || item.product_description,
      ec3_url: item.ec3_url || `https://buildingtransparency.org/ec3/epds/${item.id || item.open_xpd_uuid}`,
      last_updated: item.last_updated || item.updated_at,
      
      // Quality info
      pcr_name: item.pcr_name || item.pcr?.name,
      pcr_id: item.pcr_id || item.pcr?.id,
      data_quality_score: item.data_quality_score,
      conservativeness: item.conservativeness,
    }));

    // Build response with pagination info
    const response = {
      results: transformedResults,
      total_count: ec3Data.count || ec3Data.total_count || transformedResults.length,
      page: body.page || 1,
      page_size: body.page_size || 25,
      has_next: ec3Data.has_next || ec3Data.next !== null || (transformedResults.length === (body.page_size || 25)),
      query_tokens_used: 0.01, // Material filter queries cost 0.01 tokens
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
