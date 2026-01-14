import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";
import { validateCarbonFactorsServer } from "../_shared/boq-validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define DBMaterial interface for type safety
interface DBMaterial {
  id: string;
  material_name: string;
  material_category: string;
  subcategory: string | null;
  unit: string;
  ef_total: number;
  data_source: string;
  epd_number: string | null;
  manufacturer: string | null;
  state: string | null;
  region: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[parse-boq] No authorization header provided");
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'parse-boq',
        details: 'Missing authorization header'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Anon client for auth verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Service role client for rate limiting and database queries
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[parse-boq] Authentication failed");
      logSecurityEvent({
        event_type: 'invalid_token',
        ip_address: getClientIP(req),
        endpoint: 'parse-boq',
        details: 'Invalid or expired token'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    console.log(`[parse-boq] Authenticated user: ${user.id.substring(0, 8)}...`);

    // Check rate limit using service role client (30 requests per 5 minutes for BOQ parsing)
    const rateLimitResult = await checkRateLimit(
      supabaseServiceClient,
      user.id,
      'parse-boq',
      { windowMinutes: 5, maxRequests: 30 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      console.warn(`[parse-boq] Rate limit exceeded. Reset in ${resetInSeconds}s`);
      
      logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        user_id: user.id,
        ip_address: getClientIP(req),
        endpoint: 'parse-boq',
        details: `Rate limit exceeded. Reset in ${resetInSeconds}s`
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
          retryAfter: resetInSeconds
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSeconds)
          } 
        }
      );
    }

    console.log(`[parse-boq] Rate limit OK (${rateLimitResult.remaining} remaining)`);

    const { text } = await req.json();
    
    // Validate text parameter exists and is a string
    if (!text) {
      console.error(`[parse-boq] No text provided`);
      return new Response(
        JSON.stringify({ error: "No text provided" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof text !== 'string') {
      console.error(`[parse-boq] Invalid text type`);
      return new Response(
        JSON.stringify({ error: "Text must be a string" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedText = text.trim();

    // Validate minimum length
    if (trimmedText.length < 10) {
      console.error(`[parse-boq] Text too short`);
      return new Response(
        JSON.stringify({ error: "Text too short - must be at least 10 characters for a valid BOQ document" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate maximum length BEFORE processing (reject, don't truncate)
    if (trimmedText.length > 15000) {
      console.error(`[parse-boq] Text too long`);
      return new Response(
        JSON.stringify({ error: "Text exceeds maximum length of 15,000 characters. Please split your document into smaller sections." }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SERVER-SIDE VALIDATION: Check for negative carbon factors (defense-in-depth)
    const carbonValidation = validateCarbonFactorsServer(trimmedText);
    if (carbonValidation) {
      console.error(`[parse-boq] Carbon factor validation failed: ${carbonValidation.errorCode}`);
      return new Response(
        JSON.stringify({ 
          error: carbonValidation.error,
          errorCode: carbonValidation.errorCode 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[parse-boq] Validated text input (${trimmedText.length} chars)`);

    // Query the actual materials_epd database for reference materials
    console.log(`[parse-boq] Fetching materials from database...`);
    
    // Fetch ALL materials from database - no limit, no region filter
    // Australian filtering is done in post-processing for comprehensive matching
    const { data: allDbMaterials, error: dbError } = await supabaseServiceClient
      .from('materials_epd')
      .select('id, material_name, material_category, subcategory, unit, ef_total, data_source, epd_number, manufacturer, state, region')
      .not('ef_total', 'is', null) // Only materials with valid emission factors
      .order('ef_total', { ascending: false });

    if (dbError) {
      console.error(`[parse-boq] Database query failed:`, dbError.message);
      // Continue with fallback - don't fail entirely
    }

    // AUSTRALIAN STATES for filtering
    const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
    
    // Helper: check if material is Australian (moved here for early filtering)
    const isAustralianMaterial = (mat: DBMaterial): boolean => {
      if (mat.state && AUSTRALIAN_STATES.includes(mat.state.toUpperCase())) return true;
      if (mat.region && mat.region.toLowerCase().includes('australia')) return true;
      // Default to true if no region info (assume Australian for local DB)
      if (!mat.state && !mat.region) return true;
      return false;
    };

    // Filter to Australian materials only for matching
    const dbMaterials: DBMaterial[] = (allDbMaterials || []).filter(m => isAustralianMaterial(m as DBMaterial)) as DBMaterial[];
    
    console.log(`[parse-boq] Database: ${allDbMaterials?.length || 0} total materials, ${dbMaterials.length} Australian materials available for matching`);

    // Build material schema from actual database
    let materialSchema = '';
    
    if (dbMaterials && dbMaterials.length > 0) {
      console.log(`[parse-boq] Retrieved ${dbMaterials.length} materials from database`);
      
      // Group by category for better AI reference
      const byCategory: Record<string, typeof dbMaterials> = {};
      for (const mat of dbMaterials) {
        const cat = mat.material_category || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(mat);
      }

      materialSchema = `
Available materials from the NMEF v2025.1 database (${dbMaterials.length} materials):

`;
      for (const [category, items] of Object.entries(byCategory)) {
        materialSchema += `\n### ${category.toUpperCase()}\n`;
        // Show up to 15 materials per category to keep prompt manageable
        const sampleItems = items.slice(0, 15);
        for (const item of sampleItems) {
          materialSchema += `- ${item.material_name} (id: ${item.id}, unit: ${item.unit}, factor: ${item.ef_total} kgCO2e/${item.unit}${item.manufacturer ? `, mfr: ${item.manufacturer}` : ''})\n`;
        }
        if (items.length > 15) {
          materialSchema += `  ... and ${items.length - 15} more ${category} materials\n`;
        }
      }
    } else {
      // Fallback to hardcoded schema if database query fails
      console.warn(`[parse-boq] Using fallback material schema`);
      materialSchema = `
Available material categories (estimate factors if no exact match):

CONCRETE (unit: m³): 200-400 kgCO2e/m³ depending on grade
STEEL (unit: Tonnes): 1200-3000 kgCO2e/t depending on type
MASONRY (unit: m² or kg): 5-15 kgCO2e/m² for plasterboard
FLOORING (unit: m²): 10-20 kgCO2e/m² for carpet/vinyl
TIMBER (unit: m³): 200-500 kgCO2e/m³ depending on type
INSULATION (unit: m²): 2-10 kgCO2e/m² depending on type
`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert construction quantity surveyor analyzing Bill of Quantities (BOQ) documents for Australian construction projects.

Your task is to extract material items from construction documents and match them to the provided material database.

CRITICAL MATCHING RULES:
1. ALWAYS try to match to an existing database material by ID first
2. Use the exact "id" (UUID) from the database when matching
3. Match based on material type, not brand names (e.g., "Gyprock" = plasterboard, "Rondo" = steel framing)
4. If quantity includes dimensions, calculate the total (e.g., "10m x 5m" = 50m²)
5. Convert units if needed (e.g., mm² to m², tonnes to kg)
6. If no EXACT match exists, find the CLOSEST category match from the database
7. NEVER use arbitrary values like 1.234 - always use real database factors
8. Only set isCustom: true if there's genuinely no similar material category in the database

UNIT CONVERSION RULES:
- Steel products in linear metres: ONLY convert if description explicitly contains "stud", "track", "furring channel", or "light gauge framing"
- Light gauge steel framing (studs/tracks): use 2.5 kg/m ONLY when description clearly indicates light gauge (e.g., "92mm steel stud", "ceiling track", "wall frame")
- Structural steel sections (UB, UC, PFC, RHS, CHS, SHS, HEA, HEB, HEM, IPE, angles, channels, Tees, Flats): DO NOT convert linear metres to kg. Set requiresReview: true with reviewReason: "Structural steel requires mass specification in tonnes - cannot estimate from linear metres. Please specify total tonnage or refer to structural drawings."
- If unsure whether steel is light gauge or structural: set requiresReview: true

Return a JSON array of materials ONLY. No explanations, no markdown, just the JSON array.

Each item must have:
- category: string (use the material_category from the database match, or closest category)
- typeId: string (the UUID id from the database, or "custom" if no match)
- name: string (the material name as it appears in the BOQ)
- quantity: number (always a positive number, converted to database-compatible units)
- unit: string (m³, Tonnes, m², kg, etc. - MUST match database unit for the category)
- factor: number (ef_total from database - NEVER make up values)
- isCustom: boolean (false if matched to database, true if not)
- source: string (data_source from database, or "category average" if using similar material)
- epdNumber: string | null (epd_number from database if available)
- confidenceLevel: string ("high" if exact match, "medium" if category match, "low" if estimated)
- unitConversionApplied: boolean (true if units were converted, e.g., metres to kg)
- requiresReview: boolean (true if material needs manual review)
- reviewReason: string | undefined (explanation for why review is required)

${materialSchema}`;

    console.log(`[parse-boq] Calling Lovable AI to parse BOQ...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract all materials from this BOQ document and match them to the database:\n\n${trimmedText}` }
        ],
        temperature: 0.2, // Lower temperature for more consistent matching
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // CRITICAL: Remove any JavaScript undefined values that the AI might have generated
    // These are invalid JSON and cause parsing to fail
    cleanContent = cleanContent.replace(/:\s*undefined\b/g, ': null');
    cleanContent = cleanContent.replace(/,\s*undefined\b/g, '');
    
    // Try to extract JSON array if response includes extra text
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    // Parse the JSON with error handling
    let materials;
    try {
      materials = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[parse-boq] JSON parse failed. Content preview:", cleanContent.substring(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    if (!Array.isArray(materials)) {
      throw new Error("Invalid response format from AI - expected array");
    }

    // Post-process: validate material IDs against database and fix fallback factors
    // CRITICAL: Never trust AI-provided factors for custom materials
    const validatedMaterials = materials.map((mat: Record<string, unknown>) => {
      // If typeId looks like a UUID, verify it exists in database
      if (mat.typeId && typeof mat.typeId === 'string' && mat.typeId.length === 36 && mat.typeId.includes('-')) {
        const dbMatch = dbMaterials?.find(m => m.id === mat.typeId);
        if (dbMatch) {
          // Ensure we use exact database values - NEVER use AI-provided factor
          return {
            ...mat,
            factor: dbMatch.ef_total,
            unit: dbMatch.unit,
            source: dbMatch.data_source,
            epdNumber: dbMatch.epd_number,
            manufacturer: dbMatch.manufacturer,
            isCustom: false,
            confidenceLevel: 'high',
            requiresReview: false
          };
        }
      }

      // STRUCTURAL STEEL FALLBACK: If AI missed it, catch it here
      if (!mat.typeId || mat.typeId === 'custom') {
        const matNameLower = typeof mat.name === 'string' ? mat.name.toLowerCase() : '';
        const matUnitLower = typeof mat.unit === 'string' ? mat.unit.toLowerCase() : '';

        // Check for structural steel in linear metres
        if (matNameLower.includes('steel') &&
            (matUnitLower === 'm' || matUnitLower === 'metres' || matUnitLower === 'meter') &&
            !matNameLower.match(/stud|track|furring|light gauge|ceiling/)) {

          return {
            ...mat,
            factor: null,
            requiresReview: true,
            reviewReason: 'Structural steel in linear metres requires mass specification in tonnes - cannot estimate from linear metres alone. Please specify total tonnage or consult structural drawings.',
            isCustom: true,
            confidenceLevel: 'low',
            source: 'N/A - requires specification'
          };
        }
      }

      // ID not found or custom - try to find DETERMINISTIC category match
      // This ensures consistent results across multiple parses
      const matCategory = typeof mat.category === 'string' ? mat.category.toLowerCase() : '';
      const matName = typeof mat.name === 'string' ? mat.name.toLowerCase() : '';
      const matUnit = typeof mat.unit === 'string' ? mat.unit.toLowerCase() : '';
      
      // STRICT matching: same category AND same unit, sorted by ef_total for determinism
      // dbMaterials is already filtered to Australian materials only
      const categoryMatches = dbMaterials
        .filter(m =>
          m.material_category?.toLowerCase() === matCategory &&
          m.unit?.toLowerCase() === matUnit
        )
        .sort((a, b) => (b.ef_total || 0) - (a.ef_total || 0)); // Sort descending (highest first)

      let proxyMatch = categoryMatches?.[0]; // Take highest (conservative for compliance)
      
      // If no exact category+unit match, try keyword matching (still unit-aware)
      if (!proxyMatch) {
        const keywords = ['steel', 'concrete', 'timber', 'plasterboard', 'insulation', 'glass', 'aluminium', 'brick', 'masonry', 'carpet', 'vinyl'];
        for (const keyword of keywords) {
          if (matName.includes(keyword) || matCategory.includes(keyword)) {
            // dbMaterials is already filtered to Australian materials only
            const keywordMatches = dbMaterials
              .filter(m =>
                (m.material_category?.toLowerCase().includes(keyword) ||
                 m.material_name?.toLowerCase().includes(keyword)) &&
                m.unit?.toLowerCase() === matUnit
              )
              .sort((a, b) => (b.ef_total || 0) - (a.ef_total || 0)); // Sort descending (highest first)
            
            proxyMatch = keywordMatches?.[0];
            if (proxyMatch) break;
          }
        }
      }
      
      // If we found a proxy match, use its factor (deterministic)
      if (proxyMatch) {
        return {
          ...mat,
          factor: proxyMatch.ef_total,
          unit: proxyMatch.unit,
          source: `${proxyMatch.data_source} (proxy match: ${proxyMatch.material_name})`,
          proxyMaterialId: proxyMatch.id,
          proxyMaterialName: proxyMatch.material_name,
          isCustom: true,
          confidenceLevel: 'medium',
          requiresReview: false // Has a valid proxy factor
        };
      }
      
      // NO MATCH FOUND - DO NOT USE AI FACTOR
      // Mark as requiring review with null factor
      console.warn(`[parse-boq] No database match for custom material: ${mat.name} (${mat.category}, ${mat.unit})`);
      
      return {
        ...mat,
        factor: null, // CRITICAL: null factor forces user review
        source: 'N/A - requires selection',
        isCustom: true,
        confidenceLevel: 'low',
        requiresReview: true,
        reviewReason: `No verified Australian material found for "${mat.name}" in category "${mat.category}" with unit "${mat.unit}". Please select a material from the database.`
      };
    });

    const matchedCount = validatedMaterials.filter((m: Record<string, unknown>) => !m.isCustom).length;
    console.log(`[parse-boq] Successfully parsed ${validatedMaterials.length} materials (${matchedCount} matched to database)`);

    return new Response(
      JSON.stringify({ materials: validatedMaterials }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[parse-boq] Error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ 
        error: "Failed to process document" 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
