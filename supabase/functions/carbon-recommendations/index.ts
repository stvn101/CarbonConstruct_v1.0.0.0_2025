import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const HotspotSchema = z.object({
  name: z.string().max(200).optional(),
  category: z.string().max(100),
  severity: z.enum(['low', 'medium', 'high']),
  emissions: z.number().nonnegative().max(1000000000),
  percentageOfTotal: z.number().min(0).max(100),
  stage: z.string().max(50),
});

const RequestSchema = z.object({
  hotspots: z.array(HotspotSchema).min(1).max(100),
  totalEmissions: z.number().nonnegative().max(1000000000),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[carbon-recommendations] Request from user: ${user.id}`);

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = RequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('[carbon-recommendations] Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { hotspots, totalEmissions } = validationResult.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for AI with validated data
    const hotspotsContext = hotspots.map((h) => 
      `- ${h.name || h.category} (${h.severity}): ${h.emissions.toFixed(2)} kgCO₂e (${h.percentageOfTotal.toFixed(1)}% of total) - Primary stage: ${h.stage}`
    ).join('\n');

    const systemPrompt = `You are a carbon emissions expert specializing in Australian construction standards (NCC 2024, NMEF v2025.1, AS 5377).
Analyze carbon hotspots and provide actionable optimization recommendations.

Context:
- Total project embodied carbon: ${totalEmissions.toFixed(2)} kgCO₂e
- Identified hotspots:
${hotspotsContext}

Provide 3-5 specific, actionable recommendations to reduce embodied carbon. For each recommendation:
1. Identify the specific material/category and lifecycle stage to target
2. Suggest concrete alternatives or optimization strategies (with Australian suppliers/products where possible)
3. Estimate potential carbon savings (in kgCO₂e and percentage)
4. Note any trade-offs (cost, performance, availability)
5. Reference relevant Australian standards or best practices

Focus on the highest-impact opportunities first.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analyze these carbon hotspots and provide optimization recommendations." }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate recommendations" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
