/**
 * EC3 Categories Edge Function
 * 
 * Fetches the category tree from EC3's /categories/public endpoint.
 * This endpoint is fully cached by EC3 (refreshed daily) and returns
 * the complete category hierarchy.
 * 
 * @see https://docs.buildingtransparency.org/ec3/release-notes (2024-01-08 release)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EC3 API configuration
const EC3_API_BASE = 'https://buildingtransparency.org/api';

// In-memory cache with 24h TTL (categories refresh daily on EC3)
let cachedCategories: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface EC3Category {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  parent_id?: string;
  children?: EC3Category[];
  masterformat?: string;
  level?: number;
}

/**
 * Flatten the category tree into a simple array with parent paths
 * Handles EC3 API formats: array of categories, or object with category names as keys
 */
function flattenCategories(
  data: any, 
  parentPath: string = '',
  level: number = 0
): Array<{ id: string; name: string; display_name: string; path: string; level: number }> {
  const result: Array<{ id: string; name: string; display_name: string; path: string; level: number }> = [];
  
  // Handle array of categories
  if (Array.isArray(data)) {
    for (const cat of data) {
      const catName = cat.display_name || cat.name || cat.id || 'Unknown';
      const currentPath = parentPath ? `${parentPath} >> ${catName}` : catName;
      
      result.push({
        id: cat.id || catName,
        name: cat.name || catName,
        display_name: catName,
        path: currentPath,
        level,
      });
      
      // Recursively add children (limit depth to 3 for usability)
      if (cat.children && Array.isArray(cat.children) && cat.children.length > 0 && level < 3) {
        result.push(...flattenCategories(cat.children, currentPath, level + 1));
      }
      
      // Handle subcategories in alternative format
      if (cat.subcategories && Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && level < 3) {
        result.push(...flattenCategories(cat.subcategories, currentPath, level + 1));
      }
    }
    return result;
  }
  
  // Handle object format: { "CategoryName": { id, description, ... }, ... }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    for (const key of keys) {
      // Skip non-category keys like 'id', 'pagination', 'meta'
      if (['id', 'pagination', 'meta', 'total', 'page'].includes(key)) continue;
      
      const cat = data[key];
      const catName = cat?.display_name || cat?.name || key;
      const catId = cat?.id || key;
      const currentPath = parentPath ? `${parentPath} >> ${catName}` : catName;
      
      // If the value is a simple string/number, use the key as category
      if (typeof cat !== 'object' || cat === null) {
        result.push({
          id: key,
          name: key,
          display_name: key,
          path: key,
          level,
        });
        continue;
      }
      
      result.push({
        id: catId,
        name: cat.name || key,
        display_name: catName,
        path: currentPath,
        level,
      });
      
      // Recursively add nested categories
      if (cat.children && level < 3) {
        result.push(...flattenCategories(cat.children, currentPath, level + 1));
      }
      if (cat.subcategories && level < 3) {
        result.push(...flattenCategories(cat.subcategories, currentPath, level + 1));
      }
    }
    return result;
  }
  
  return result;
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
      console.error('[EC3-Categories] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required', status_code: 401 }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('[EC3-Categories] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', status_code: 401 }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EC3-Categories] Request from user: ${user.id}`);

    // Check in-memory cache first
    const now = Date.now();
    if (cachedCategories && (now - cacheTimestamp) < CACHE_TTL_MS) {
      console.log('[EC3-Categories] Returning cached categories');
      return new Response(
        JSON.stringify({ 
          categories: cachedCategories,
          cached: true,
          cache_age_hours: Math.round((now - cacheTimestamp) / (60 * 60 * 1000))
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get EC3 API key
    const ec3ApiKey = Deno.env.get('EC3_API_KEY');
    if (!ec3ApiKey) {
      console.error('[EC3-Categories] EC3_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'EC3 API key not configured',
          status_code: 500 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch categories from EC3 API
    const ec3Url = `${EC3_API_BASE}/categories/public`;
    console.log('[EC3-Categories] Fetching from EC3 API:', ec3Url);

    const ec3Response = await fetch(ec3Url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ec3ApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!ec3Response.ok) {
      const errorText = await ec3Response.text();
      console.error(`[EC3-Categories] API error ${ec3Response.status}:`, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `EC3 API error: ${ec3Response.statusText}`,
          status_code: ec3Response.status,
          details: errorText.substring(0, 200)
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ec3Data = await ec3Response.json();
    const dataKeys = Array.isArray(ec3Data) ? ec3Data.length : Object.keys(ec3Data).length;
    console.log(`[EC3-Categories] Received data with ${dataKeys} top-level entries, type: ${Array.isArray(ec3Data) ? 'array' : 'object'}`);
    
    // Debug: log first few keys/items
    if (Array.isArray(ec3Data)) {
      console.log('[EC3-Categories] Sample items:', ec3Data.slice(0, 3).map((c: any) => c.name || c.display_name || c.id));
    } else {
      console.log('[EC3-Categories] Object keys:', Object.keys(ec3Data).slice(0, 10));
    }

    // Flatten the category tree - pass directly to flattenCategories which handles both formats
    const flatCategories = flattenCategories(ec3Data);
    
    // Sort alphabetically by display name within each level
    flatCategories.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.display_name.localeCompare(b.display_name);
    });

    console.log(`[EC3-Categories] Flattened to ${flatCategories.length} categories`);

    // Update cache
    cachedCategories = flatCategories;
    cacheTimestamp = now;

    return new Response(
      JSON.stringify({ 
        categories: flatCategories,
        cached: false,
        total_count: flatCategories.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[EC3-Categories] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status_code: 500
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
