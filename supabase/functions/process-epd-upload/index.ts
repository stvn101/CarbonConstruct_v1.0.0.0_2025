import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EPD extraction prompt for AI
const EXTRACTION_PROMPT = `You are an expert at extracting Environmental Product Declaration (EPD) data from PDF documents.

Extract the following information from the EPD PDF content. Return a JSON object with these fields:

{
  "products": [
    {
      "product_name": "Full product name",
      "manufacturer": "Company/manufacturer name",
      "epd_number": "EPD registration/reference number (e.g., S-P-01234, EPD-IES-0012345)",
      "functional_unit": "The declared unit (e.g., '1 kg', '1 m²', '1 tonne')",
      "unit": "Just the unit part (kg, m², m³, tonne, piece, m, etc.)",
      "gwp_a1a3": "GWP-total for A1-A3 (Product stage) as a number in kgCO2e",
      "gwp_a4": "GWP for A4 (Transport to site) as a number or null",
      "gwp_a5": "GWP for A5 (Installation) as a number or null", 
      "gwp_b1b5": "GWP for B1-B5 (Use stage) as a number or null",
      "gwp_c1c4": "GWP for C1-C4 (End of life) as a number or null",
      "gwp_d": "GWP for Module D (Benefits/loads) as a number or null",
      "gwp_total": "Total GWP if provided, or sum of all stages",
      "valid_until": "Expiry date in YYYY-MM-DD format or null",
      "geographic_scope": "Geographic scope (e.g., 'Australia', 'Australia and New Zealand', 'Global')",
      "material_category": "Category like 'Steel', 'Concrete', 'Insulation', 'Timber', 'Plastics', etc.",
      "plant_location": "Manufacturing plant location if specified",
      "data_source": "EPD program operator (e.g., 'EPD Australasia', 'International EPD System')",
      "recycled_content": "Recycled content percentage as a number or null",
      "notes": "Any important notes about the product or data"
    }
  ],
  "extraction_confidence": "high/medium/low",
  "extraction_notes": "Any notes about extraction quality or missing data"
}

Important rules:
1. Extract ALL products/variants if the EPD covers multiple products
2. GWP values should be numbers only (no units in the value)
3. If a lifecycle stage value is not provided, use null
4. The unit should match the declared/functional unit (kg, m², m³, tonne, piece, m, etc.)
5. Be precise with EPD registration numbers - they're critical for traceability
6. If you can't find specific data, use null rather than guessing
7. Return valid JSON only, no markdown or extra text`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: hasAdminRole } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, pdfText, fileName, storagePath } = await req.json();

    if (action === 'extract') {
      // Extract EPD data from PDF text using AI
      if (!pdfText || pdfText.length < 100) {
        return new Response(
          JSON.stringify({ error: 'PDF text is too short or empty' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'AI service not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[process-epd-upload] Processing ${fileName}, text length: ${pdfText.length}`);

      // Call Lovable AI to extract EPD data
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: `Extract EPD data from this document:\n\nFilename: ${fileName}\n\n${pdfText.substring(0, 30000)}` }
          ],
          temperature: 0.1,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[process-epd-upload] AI error:', errorText);
        return new Response(
          JSON.stringify({ error: 'AI extraction failed', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;

      if (!content) {
        return new Response(
          JSON.stringify({ error: 'No response from AI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse the JSON response
      let extractedData;
      try {
        // Try to extract JSON from the response (handle markdown code blocks)
        let jsonStr = content;
        if (content.includes('```json')) {
          jsonStr = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
          jsonStr = content.split('```')[1].split('```')[0];
        }
        extractedData = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        console.error('[process-epd-upload] JSON parse error:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to parse AI response',
            rawResponse: content.substring(0, 500)
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[process-epd-upload] Extracted ${extractedData.products?.length || 0} products`);

      return new Response(
        JSON.stringify({
          success: true,
          fileName,
          storagePath,
          ...extractedData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save') {
      // Save approved materials to database
      const { materials } = await req.json();
      
      if (!materials || !Array.isArray(materials) || materials.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No materials to save' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const serviceClient = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const insertData = materials.map((m: any) => ({
        material_name: m.product_name,
        material_category: m.material_category || 'Other',
        manufacturer: m.manufacturer,
        epd_number: m.epd_number,
        epd_url: m.storage_url || null,
        unit: m.unit || 'kg',
        ef_a1a3: m.gwp_a1a3 || 0,
        ef_a4: m.gwp_a4 || 0,
        ef_a5: m.gwp_a5 || 0,
        ef_b1b5: m.gwp_b1b5 || 0,
        ef_c1c4: m.gwp_c1c4 || 0,
        ef_d: m.gwp_d || 0,
        ef_total: m.gwp_total || m.gwp_a1a3 || 0,
        expiry_date: m.valid_until || null,
        region: m.geographic_scope || 'Australia',
        plant_location: m.plant_location,
        data_source: m.data_source || 'EPD Upload',
        recycled_content: m.recycled_content || 0,
        notes: m.notes,
        data_quality_tier: 'verified_epd',
      }));

      const { data, error } = await serviceClient
        .from('materials_epd')
        .insert(insertData)
        .select();

      if (error) {
        console.error('[process-epd-upload] Insert error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save materials', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[process-epd-upload] Saved ${data.length} materials`);

      return new Response(
        JSON.stringify({
          success: true,
          inserted: data.length,
          materials: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-epd-upload] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
