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
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'parse-invoice',
        details: 'Missing authorization header'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;

    // Rate limit: 20 requests per 5 minutes
    const rateLimitResult = await checkRateLimit(
      supabaseServiceClient,
      user.id,
      'parse-invoice',
      { windowMinutes: 5, maxRequests: 20 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
          retryAfter: resetInSeconds
        }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, fileType } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "No text provided" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Text too long (max 50,000 characters)" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an expert at parsing construction delivery tickets and invoices.

Extract line items from the document and return a JSON array. Each item should have:
- lineNumber: number (row index in document)
- description: string (material/product description)
- quantity: number (amount delivered/invoiced)
- unit: string (m², m³, kg, Tonnes, each, etc.)
- unitPrice: number | null (price per unit in dollars, if available)
- totalPrice: number | null (line total in dollars, if available)
- category: string | null (best guess: Concrete, Steel, Timber, Plasterboard, Insulation, etc.)
- supplierCode: string | null (product code if present)
- confidence: number (0-1, how confident you are in the extraction)

RULES:
1. Parse ALL line items, even if some fields are missing
2. Convert all quantities to standard units (kg not g, m² not mm²)
3. Prices should be in AUD dollars (not cents)
4. If GST is included, note it but keep prices as-is
5. Return ONLY the JSON array, no explanations

Example output:
[
  {
    "lineNumber": 1,
    "description": "Ready Mix Concrete 32MPa",
    "quantity": 15.5,
    "unit": "m³",
    "unitPrice": 245.00,
    "totalPrice": 3797.50,
    "category": "Concrete",
    "supplierCode": "RMC32-S20",
    "confidence": 0.95
  }
]`;

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
          { role: "user", content: `Parse this ${fileType || 'document'} and extract all line items:\n\n${text}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit. Try again shortly." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean and parse JSON
    let cleanContent = content.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');
    
    const items = JSON.parse(cleanContent);
    
    if (!Array.isArray(items)) {
      throw new Error("Invalid response format");
    }

    // Normalize and validate items
    const normalizedItems = items.map((item: Record<string, unknown>, idx: number) => ({
      lineNumber: typeof item.lineNumber === 'number' ? item.lineNumber : idx + 1,
      description: String(item.description || '').trim(),
      quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0,
      unit: String(item.unit || 'each').trim(),
      unitPrice: typeof item.unitPrice === 'number' ? Math.round(item.unitPrice * 100) : null, // Convert to cents
      totalPrice: typeof item.totalPrice === 'number' ? Math.round(item.totalPrice * 100) : null, // Convert to cents
      category: item.category ? String(item.category) : null,
      supplierCode: item.supplierCode ? String(item.supplierCode) : null,
      confidence: typeof item.confidence === 'number' ? Math.min(1, Math.max(0, item.confidence)) : 0.5,
    })).filter((item: { description: string }) => item.description.length > 0);

    console.log(`[parse-invoice] Extracted ${normalizedItems.length} line items`);

    return new Response(
      JSON.stringify({ items: normalizedItems }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[parse-invoice] Error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Failed to parse document" }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
