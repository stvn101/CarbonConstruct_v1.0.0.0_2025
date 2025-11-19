import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotspots, totalEmissions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for AI
    const hotspotsContext = hotspots.map((h: any) => 
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
