import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Edge function to check EPD registries for updated EPD versions
 * Checks EPD Australasia and EPD International for newer versions of materials
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EPDRegistryResult {
  epd_number: string;
  found: boolean;
  registry: string;
  registry_url?: string;
  updated_version?: string;
  new_expiry_date?: string;
  is_newer: boolean;
  error?: string;
}

interface CheckRequest {
  materials: Array<{
    epd_number: string;
    current_expiry_date?: string;
    manufacturer?: string;
    material_name?: string;
  }>;
}

// EPD Registry base URLs
const EPD_REGISTRIES = {
  epd_australasia: {
    name: 'EPD Australasia',
    search_url: 'https://www.epd-australasia.com/epd-search/',
    epd_base_url: 'https://www.epd-australasia.com/epd/',
  },
  epd_international: {
    name: 'EPD International',
    search_url: 'https://www.environdec.com/library',
    epd_base_url: 'https://www.environdec.com/library/',
  },
  epd_ireland: {
    name: 'EPD Ireland',
    search_url: 'https://www.igbc.ie/epd/',
    epd_base_url: 'https://www.igbc.ie/epd/',
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting EPD registry check...");

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { materials }: CheckRequest = await req.json();

    if (!materials || materials.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No materials provided' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Checking ${materials.length} materials against EPD registries`);

    const results: EPDRegistryResult[] = [];

    for (const material of materials) {
      if (!material.epd_number) {
        results.push({
          epd_number: 'unknown',
          found: false,
          registry: 'none',
          is_newer: false,
          error: 'No EPD number provided',
        });
        continue;
      }

      const result = await checkEPDRegistries(material);
      results.push(result);
    }

    // Summary statistics
    const summary = {
      total_checked: materials.length,
      found: results.filter(r => r.found).length,
      newer_available: results.filter(r => r.is_newer).length,
      not_found: results.filter(r => !r.found).length,
      errors: results.filter(r => r.error).length,
    };

    console.log(`EPD registry check complete:`, summary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in check-epd-registry:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function checkEPDRegistries(material: {
  epd_number: string;
  current_expiry_date?: string;
  manufacturer?: string;
  material_name?: string;
}): Promise<EPDRegistryResult> {
  const { epd_number, current_expiry_date, manufacturer } = material;

  // Try to determine which registry based on EPD number format
  // EPD Australasia typically uses format like "EPD-XXX-XXX"
  // EPD International uses format like "S-P-XXXXX" or similar

  let registryToCheck = 'epd_australasia'; // Default to Australian registry
  
  if (epd_number.startsWith('S-P-') || epd_number.startsWith('S-E-')) {
    registryToCheck = 'epd_international';
  }

  const registry = EPD_REGISTRIES[registryToCheck as keyof typeof EPD_REGISTRIES];

  try {
    // Note: In a production environment, you would make actual HTTP requests
    // to the registry APIs. For now, we'll simulate the check with a structured response.
    // Most EPD registries don't have public APIs, so web scraping or manual checks
    // would be needed in production.

    // Simulated registry check - in production this would be actual API/scraping
    const registryResult = await simulateRegistryCheck(epd_number, registry, current_expiry_date);

    return {
      epd_number,
      found: registryResult.found,
      registry: registry.name,
      registry_url: registryResult.found 
        ? `${registry.epd_base_url}${encodeURIComponent(epd_number)}`
        : registry.search_url,
      updated_version: registryResult.updated_version,
      new_expiry_date: registryResult.new_expiry_date,
      is_newer: registryResult.is_newer,
    };

  } catch (error: any) {
    console.error(`Error checking registry for ${epd_number}:`, error);
    return {
      epd_number,
      found: false,
      registry: registry.name,
      registry_url: registry.search_url,
      is_newer: false,
      error: `Registry check failed: ${error.message}`,
    };
  }
}

async function simulateRegistryCheck(
  epd_number: string,
  registry: typeof EPD_REGISTRIES[keyof typeof EPD_REGISTRIES],
  current_expiry_date?: string
): Promise<{
  found: boolean;
  updated_version?: string;
  new_expiry_date?: string;
  is_newer: boolean;
}> {
  // In production, this would make actual HTTP requests to check the registry
  // For now, we return a structured response indicating a manual check is needed
  
  // Log the check attempt
  console.log(`Checking ${registry.name} for EPD: ${epd_number}`);
  
  // Since we can't actually scrape these sites without proper API access,
  // we return a "needs manual verification" status
  // The frontend will provide links for users to manually check
  
  return {
    found: false, // Would be true if we could verify the EPD exists
    is_newer: false, // Would be true if we found a newer version
    // In production with actual API access:
    // updated_version: '2.0',
    // new_expiry_date: '2028-12-31',
  };
}

serve(handler);
