/**
 * EC3 Material Search Edge Function
 * 
 * Proxies search requests to the BuildingTransparency EC3 API using the
 * MaterialFilter (mf) approach per the EC3 API Blueprint specification.
 * 
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
 * @see EC3_INTEGRATION_GUIDE.md for architecture overview
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EC3 API configuration - production endpoint
const EC3_API_BASE = 'https://buildingtransparency.org/api';

// Rate limit: 200 searches per hour for Pro users
// EC3 allows 400 tokens/hour; material search = 0.01-0.02 tokens each (2 calls with MaterialFilter)
const EC3_RATE_LIMIT = {
  windowMinutes: 60,
  maxRequests: 200,
};

// EC3 category mapping - display names to EC3 category identifiers
// These are the top-level categories in EC3's taxonomy
const EC3_CATEGORY_MAP: Record<string, string> = {
  'Concrete': 'Concrete',
  'Steel': 'Steel',
  'Timber': 'Wood',
  'Aluminium': 'Aluminum',
  'Aluminum': 'Aluminum',
  'Glass': 'Glass',
  'Insulation': 'Insulation',
  'Masonry': 'Masonry',
  'Gypsum': 'Gypsum',
  'Plastics': 'Plastic',
  'Roofing': 'Roofing',
  'Flooring': 'Flooring',
  'Cladding': 'Cladding',
  'Ceiling': 'Ceilings',
  'Asphalt': 'Asphalt',
  'Aggregates': 'Aggregates',
  'Doors': 'Doors',
  'Windows': 'Windows',
  'Paint': 'Coatings',
};

interface SearchRequest {
  query?: string;
  category?: string;
  manufacturer?: string;
  country?: string; // e.g., "AU", "US-NY"
  jurisdiction?: string; // Alias for country
  min_gwp?: number;
  max_gwp?: number;
  declared_unit?: string;
  page?: number;
  page_size?: number;
  only_valid?: boolean; // Filter expired EPDs
}

/**
 * Build MaterialFilter JSON per EC3 API Blueprint specification
 * @see Blueprint page 3-4 for MaterialFilter structure
 */
function buildMaterialFilter(params: SearchRequest): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    pragma: [{ name: "eMF", args: ["2.0/1"] }],
  };

  // EC3 REQUIRES a category field - if none specified, use broad matching
  // Map our category name to EC3's category format
  if (params.category && params.category !== 'all') {
    const ec3Category = EC3_CATEGORY_MAP[params.category] || params.category;
    filter.category = ec3Category;
  } else if (params.query) {
    // Infer category from query text when possible
    const queryLower = params.query.toLowerCase();
    if (queryLower.includes('concrete') || queryLower.includes('cement')) {
      filter.category = 'Concrete';
    } else if (queryLower.includes('steel') || queryLower.includes('rebar')) {
      filter.category = 'Steel';
    } else if (queryLower.includes('timber') || queryLower.includes('wood') || queryLower.includes('lumber') || queryLower.includes('glulam')) {
      filter.category = 'Wood';
    } else if (queryLower.includes('glass') || queryLower.includes('glazing')) {
      filter.category = 'Glass';
    } else if (queryLower.includes('alumin')) {
      filter.category = 'Aluminum';
    } else if (queryLower.includes('insulation')) {
      filter.category = 'Insulation';
    } else if (queryLower.includes('brick') || queryLower.includes('masonry') || queryLower.includes('block')) {
      filter.category = 'Masonry';
    } else if (queryLower.includes('gypsum') || queryLower.includes('plasterboard') || queryLower.includes('drywall')) {
      filter.category = 'Gypsum';
    } else if (queryLower.includes('asphalt') || queryLower.includes('bitumen')) {
      filter.category = 'Asphalt';
    } else if (queryLower.includes('roof')) {
      filter.category = 'Roofing';
    } else if (queryLower.includes('floor')) {
      filter.category = 'Flooring';
    } else if (queryLower.includes('clad')) {
      filter.category = 'Cladding';
    } else if (queryLower.includes('door')) {
      filter.category = 'Doors';
    } else if (queryLower.includes('window')) {
      filter.category = 'Windows';
    } else {
      // Default to Concrete as the most common construction material
      // This ensures the API doesn't reject the request
      filter.category = 'Concrete';
    }
    console.log(`[EC3] Inferred category "${filter.category}" from query "${params.query}"`);
  } else {
    // Fallback category
    filter.category = 'Concrete';
  }

  // Build filter array for additional constraints
  const filterArray: Array<Record<string, unknown>> = [];

  // Text search using 'name' field with 'icontains' operator
  if (params.query && params.query.trim().length >= 2) {
    filterArray.push({
      field: "name",
      op: "icontains",
      arg: params.query.trim()
    });
  }

  // Jurisdiction filter (e.g., "AU" for Australian EPDs)
  const jurisdiction = params.jurisdiction || params.country;
  if (jurisdiction) {
    filterArray.push({
      field: "jurisdiction",
      op: "in",
      arg: [jurisdiction]
    });
  }

  // Manufacturer filter
  if (params.manufacturer) {
    filterArray.push({
      field: "manufacturer",
      op: "icontains",
      arg: params.manufacturer
    });
  }

  // GWP range filters
  if (params.min_gwp !== undefined) {
    filterArray.push({
      field: "gwp",
      op: "gte",
      arg: params.min_gwp
    });
  }

  if (params.max_gwp !== undefined) {
    filterArray.push({
      field: "gwp",
      op: "lte",
      arg: params.max_gwp
    });
  }

  // Filter expired EPDs by default
  if (params.only_valid !== false) {
    const today = new Date().toISOString().split('T')[0];
    filterArray.push({
      field: "date_validity_ends",
      op: "gt",
      arg: today
    });
  }

  // Add filter array if we have any constraints
  if (filterArray.length > 0) {
    filter.filter = filterArray;
  }

  return filter;
}

/**
 * Convert MaterialFilter to URL-encoded string via EC3 API
 * @see Blueprint page 4 for convert-query endpoint
 */
async function convertMaterialFilter(
  materialFilter: Record<string, unknown>,
  ec3ApiKey: string
): Promise<{ success: boolean; mf?: string; error?: string }> {
  const convertUrl = `${EC3_API_BASE}/materials/convert-query?output=string&output_style=compact`;
  
  console.log('[EC3] Converting MaterialFilter:', JSON.stringify(materialFilter));
  
  try {
    const response = await fetch(convertUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ec3ApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(materialFilter),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EC3] Convert query failed ${response.status}:`, errorText);
      return { 
        success: false, 
        error: `Failed to convert query: ${response.status}` 
      };
    }

    const data = await response.json();
    console.log('[EC3] Convert response:', JSON.stringify(data));
    
    // Response contains material_filter_str field
    const mfString = data.material_filter_str || data.mf || data;
    
    if (typeof mfString === 'string') {
      return { success: true, mf: mfString };
    }
    
    // If response is the mf directly as JSON, stringify it
    return { success: true, mf: JSON.stringify(mfString) };
  } catch (error) {
    console.error('[EC3] Convert query error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown convert error' 
    };
  }
}

/**
 * Fallback: Build simple query parameters when MaterialFilter conversion fails
 * Uses direct category parameter which EC3 does support
 */
function buildFallbackParams(params: SearchRequest): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  // Infer category from query if not explicitly provided
  let category = params.category && params.category !== 'all' 
    ? EC3_CATEGORY_MAP[params.category] || params.category 
    : null;
  
  if (!category && params.query) {
    const q = params.query.toLowerCase();
    if (q.includes('concrete') || q.includes('cement')) category = 'Concrete';
    else if (q.includes('steel') || q.includes('rebar')) category = 'Steel';
    else if (q.includes('timber') || q.includes('wood') || q.includes('lumber')) category = 'Wood';
    else if (q.includes('glass')) category = 'Glass';
    else if (q.includes('alumin')) category = 'Aluminum';
    else if (q.includes('insulation')) category = 'Insulation';
    else if (q.includes('masonry') || q.includes('brick')) category = 'Masonry';
    else if (q.includes('gypsum')) category = 'Gypsum';
  }
  
  // Use category parameter - EC3 supports this directly
  if (category) {
    urlParams.set('category', category);
    console.log(`[EC3] Fallback using category: ${category}`);
  }
  
  // Text search - try multiple param names that EC3 might support
  if (params.query && params.query.trim().length >= 2) {
    // EC3 uses 'q' for general search
    urlParams.set('q', params.query.trim());
  }
  
  // Filter expired EPDs
  const today = new Date().toISOString().split('T')[0];
  urlParams.set('date_validity_ends__gt', today);
  
  return urlParams;
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

/**
 * Transform EC3 API response to standardized format
 */
function transformEC3Results(rawResults: any[]): any[] {
  return rawResults.map((item: any) => ({
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
    // CRITICAL: EC3 API returns GWP values as strings, must parse to numbers
    gwp: parseFloat(item.gwp_per_category_declared_unit) || 
         parseFloat(item.gwp_per_declared_unit) || 
         parseFloat(item.gwp) || 
         parseFloat(item.gwp_total) || 
         parseFloat(item.carbon_footprint) || 
         null,
    declared_unit: item.declared_unit || item.unit || 'unit',
    impacts: {
      gwp_per_declared_unit: parseFloat(item.gwp_per_category_declared_unit) ||
                             parseFloat(item.gwp_per_declared_unit) || 
                             parseFloat(item.gwp) || null,
      declared_unit: item.declared_unit || item.unit || 'unit',
      gwp_a1a2a3: parseFloat(item.gwp_a1a2a3) || parseFloat(item.gwp_a1_a3) || null,
      gwp_a4: parseFloat(item.gwp_a4) || null,
      gwp_a5: parseFloat(item.gwp_a5) || null,
      gwp_c: parseFloat(item.gwp_c1c4) || parseFloat(item.gwp_c) || parseFloat(item.gwp_c1_c4) || null,
      gwp_d: parseFloat(item.gwp_d) || null,
      gwp_biogenic: parseFloat(item.gwp_biogenic) || null,
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

    // Check rate limit (admins bypass rate limiting for testing/support)
    if (!isAdmin) {
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
    } else {
      console.log(`[EC3] Admin user ${user.id} - bypassing rate limit`);
    }

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

    // Allow text search OR category-only search (not requiring both)
    const hasQuery = body.query && body.query.trim().length >= 2;
    const hasCategory = body.category && body.category.trim().length > 0 && body.category !== 'all';
    
    if (!hasQuery && !hasCategory) {
      return new Response(
        JSON.stringify({ error: 'Please provide a search query (min 2 chars) or select a category', status_code: 400 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build MaterialFilter per Blueprint specification
    const materialFilter = buildMaterialFilter(body);
    console.log('[EC3] Built MaterialFilter:', JSON.stringify(materialFilter));

    // Step 1: Convert MaterialFilter to mf string parameter
    let mfString: string | null = null;
    let useFallback = false;
    
    const convertResult = await convertMaterialFilter(materialFilter, ec3ApiKey);
    if (convertResult.success && convertResult.mf) {
      mfString = convertResult.mf;
      console.log('[EC3] Converted mf string:', mfString.substring(0, 100) + '...');
    } else {
      console.warn('[EC3] MaterialFilter conversion failed, using fallback:', convertResult.error);
      useFallback = true;
    }

    // Step 2: Build the materials query URL
    const params = new URLSearchParams();
    
    if (mfString && !useFallback) {
      // Use MaterialFilter approach (Blueprint-compliant)
      params.set('mf', mfString);
    } else {
      // Fallback to simple params
      const fallbackParams = buildFallbackParams(body);
      fallbackParams.forEach((value, key) => params.set(key, value));
    }
    
    // Pagination
    params.set('page_size', String(Math.min(body.page_size || 25, 100)));
    if (body.page) params.set('page_number', String(body.page));
    
    // Specify return fields to minimize response size and token usage
    const returnFields = [
      'id', 'name', 'category', 'manufacturer',
      'gwp', 'gwp_per_category_declared_unit', 'declared_unit', 
      'date_of_issue', 'date_validity_ends',
      'epd_number', 'declaration_url', 'plant_or_group', 
      'jurisdiction', 'country', 'open_xpd_uuid'
    ];
    params.set('fields', returnFields.join(','));

    const ec3Url = `${EC3_API_BASE}/materials?${params.toString()}`;
    console.log('[EC3] Calling EC3 API:', ec3Url.substring(0, 200) + '...');

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
          status_code: ec3Response.status,
          details: errorText.substring(0, 200)
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
    const transformedResults = transformEC3Results(rawResults);

    // Build response with pagination info
    const response = {
      results: transformedResults,
      total_count: ec3Data.count || ec3Data.total_count || transformedResults.length,
      page: body.page || 1,
      page_size: body.page_size || 25,
      has_next: ec3Data.has_next || ec3Data.next !== null || (transformedResults.length === (body.page_size || 25)),
      query_tokens_used: useFallback ? 0.01 : 0.02, // MaterialFilter uses 2 API calls
      filter_method: useFallback ? 'fallback' : 'material_filter',
    };

    console.log(`[EC3] Returning ${response.results.length} results to user ${user.id} (method: ${response.filter_method})`);

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
