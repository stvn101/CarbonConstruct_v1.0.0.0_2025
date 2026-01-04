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
    const { boqText } = await req.json();
    
    if (!boqText || boqText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "BOQ text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Quantity Surveyor AI assistant specializing in Australian construction.

Material Database:
- Concrete: 20MPa (201), 25MPa (222), 32MPa (249), 40MPa (305), 50MPa (354) - all kgCO2e/m³
- Steel: Cold Rolled Studs (3013), Rebar (1380), Hot Rolled (1250) - all kgCO2e/tonne
- Aluminium Extruded: 12741 kgCO2e/tonne
- Plasterboard: 10mm (5.9), 13mm (7.2) - kgCO2e/m²
- AAC Hebel: 0.45 kgCO2e/kg
- Glass: 1.66 kgCO2e/kg
- Fibre Cement: 7.2 kgCO2e/m²
- Flooring: Carpet (13.2), Vinyl (15.9), Eng Timber (9.5), Ceramic (11.0) - all kgCO2e/m²
- Doors/Windows: Timber Door (28), Alum Window (65) - kgCO2e/m²
- Timber: Softwood (233), Hardwood (320), LVL (430) - all kgCO2e/m³

Task: Parse the BOQ text and extract materials with quantities.
- Match items to the database above when possible
- For items NOT in database, create custom entries with estimated emission factors based on NMEF v2025.1 or similar Australian materials
- Return ONLY valid JSON array, no markdown

Output format:
[
  {
    "name": "Material name from BOQ",
    "quantity": number,
    "unit": "m³|tonne|m²|kg",
    "factor": number,
    "category": "Concrete|Steel|Aluminium|Plasterboard|etc",
    "isCustom": boolean
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
          { role: "user", content: `Parse this BOQ:\n\n${boqText.substring(0, 15000)}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || "";
    
    // Clean up markdown formatting
    const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanResponse);
      return new Response(
        JSON.stringify({ materials: parsed }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw response:", cleanResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("BOQ Import Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});