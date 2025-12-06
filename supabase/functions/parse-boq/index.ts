import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Service role client for rate limiting (requires elevated permissions)
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

    // Check rate limit using service role client (10 requests per 5 minutes for BOQ parsing)
    const rateLimitResult = await checkRateLimit(
      supabaseServiceClient,
      user.id,
      'parse-boq',
      { windowMinutes: 5, maxRequests: 10 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      console.warn(`[parse-boq] Rate limit exceeded. Reset in ${resetInSeconds}s`);
      
      // Log security event for rate limit violation
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

    // Basic content validation - check for some BOQ-like indicators
    const hasNumbers = /\d/.test(trimmedText);
    const hasUnits = /\b(m[²³]?|tonnes?|kg|litres?|L|sqm|m2|m3)\b/i.test(trimmedText);
    
    if (!hasNumbers || !hasUnits) {
      console.warn(`[parse-boq] Text may not be a valid BOQ document`);
    }

    console.log(`[parse-boq] Validated text input (${trimmedText.length} chars)`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Material database schema for AI reference
    const materialSchema = `
    Available material categories and items:
    
    CONCRETE (unit: m³):
    - Concrete 20 MPa (id: c_20, factor: 201 kgCO2e/m³)
    - Concrete 25 MPa (id: c_25, factor: 222 kgCO2e/m³)
    - Concrete 32 MPa (id: c_32, factor: 249 kgCO2e/m³)
    - Concrete 40 MPa (id: c_40, factor: 305 kgCO2e/m³)
    - Concrete 50 MPa (id: c_50, factor: 354 kgCO2e/m³)
    
    STEEL (unit: Tonnes):
    - Steel Framing Cold Rolled (id: s_struc_cold, factor: 3013 kgCO2e/t)
    - Reinforcing Steel Rebar (id: s_rebar, factor: 1380 kgCO2e/t)
    - Structural Steel Hot Rolled (id: s_struc_hot, factor: 1250 kgCO2e/t)
    - Aluminium Extruded (id: al_ext, factor: 12741 kgCO2e/t)
    
    MASONRY (unit: m²):
    - Plasterboard 10mm (id: m_plaster_10, factor: 5.9 kgCO2e/m²)
    - Plasterboard 13mm (id: m_plaster_13, factor: 7.2 kgCO2e/m²)
    - AAC Panel Hebel (id: m_aac_panel, factor: 0.45 kgCO2e/kg, unit: kg)
    - Flat Glass (id: m_glass, factor: 1.66 kgCO2e/kg, unit: kg)
    - Fibre Cement Sheet (id: m_fc_sheet, factor: 7.2 kgCO2e/m²)
    
    FLOORING (unit: m²):
    - Carpet Tiles Nylon (id: f_carpet_tile, factor: 13.2 kgCO2e/m²)
    - Vinyl Flooring (id: f_vinyl, factor: 15.9 kgCO2e/m²)
    - Engineered Timber Flooring (id: f_timber_eng, factor: 9.5 kgCO2e/m²)
    - Ceramic Tiles (id: f_ceramic, factor: 11.0 kgCO2e/m²)
    
    DOORS_WINDOWS (unit: m²):
    - Door Solid Timber (id: d_solid_timber, factor: 28 kgCO2e/m²)
    - Window/Door Alum Frame Glazed (id: d_alum_glass, factor: 65 kgCO2e/m²)
    
    TIMBER (unit: m³):
    - Sawn Softwood Pine (id: t_soft, factor: 233 kgCO2e/m³)
    - Sawn Hardwood (id: t_hard, factor: 320 kgCO2e/m³)
    - LVL Timber (id: t_lvl, factor: 430 kgCO2e/m³)
    `;

    const systemPrompt = `You are an expert construction quantity surveyor analyzing Bill of Quantities (BOQ) documents for Australian construction projects.

Your task is to extract material items from construction documents and match them to the provided material database.

For each material item you identify:
1. Match it to the closest item in the material database by ID
2. If no exact match exists, create a custom item with isCustom: true and estimate a conservative emission factor based on Australian standards (NMEF v2025.1)
3. Extract the quantity and ensure units are consistent

Return a JSON array of materials ONLY. No explanations, no markdown, just the JSON array.

Each item must have:
- category: string (concrete, steel, masonry, flooring, doors_windows, timber, or "custom")
- typeId: string (the id from the database, or "custom")
- name: string
- quantity: number (always a positive number)
- unit: string (m³, Tonnes, m², kg, etc.)
- factor: number (emission factor in kgCO2e per unit)
- isCustom: boolean (true if not in database)

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
          { role: "user", content: `Extract all materials from this BOQ document:\n\n${trimmedText}` }
        ],
        temperature: 0.3,
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
    
    // Parse the JSON
    const materials = JSON.parse(cleanContent);
    
    if (!Array.isArray(materials)) {
      throw new Error("Invalid response format from AI");
    }

    console.log(`[parse-boq] Successfully parsed ${materials.length} materials`);

    return new Response(
      JSON.stringify({ materials }), 
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
