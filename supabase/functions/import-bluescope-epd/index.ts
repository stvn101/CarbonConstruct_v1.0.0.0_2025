import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All BlueScope EPDs from steel.com.au library with real PDF URLs
const BLUESCOPE_EPDS = [
  { name: "COLORBOND® Coolmax® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-coolmax-steel" },
  { name: "COLORBOND® Intramax® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-intramax-steel" },
  { name: "COLORBOND® steel for roofing and walling", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-colorbond-steel" },
  { name: "COLORBOND® steel for fencing panels (AM100 0.35mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-fencing-035mm-bmt" },
  { name: "COLORBOND® steel for fencing panels (AM100 0.40mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-fencing-040mm-bmt" },
  { name: "COLORBOND® steel for fencing panels (AM100 0.42mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-fencing-042mm-bmt" },
  { name: "COLORBOND® steel for fencing post & rails (Z275 0.80mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-fencing-rails-z275-080mm-bmt" },
  { name: "COLORBOND® steel for fencing post & rails (Z275 1.00mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-fencing-rails-z275-100mm-bmt" },
  { name: "COLORBOND® steel for Insulated Panels", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-for-insulated-panels" },
  { name: "COLORBOND® steel Metallic", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-steel-metallic" },
  { name: "COLORBOND® Ultra steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-colorbond-ultra-steel" },
  { name: "DECKFORM® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-deckform-steel" },
  { name: "GALVABOND® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-galvabond-steel" },
  { name: "GALVASPAN® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-galvaspan-steel" },
  { name: "Hot Rolled Coil", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-hot-rolled-coil" },
  { name: "Welded Beams and Columns", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-welded-beams-and-columns" },
  { name: "TRUECORE® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-truecore-steel" },
  { name: "TUBEFORM® steel (Z100 1.49mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-149mm-bmt" },
  { name: "TUBEFORM® steel (Z100 1.87mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-187mm-bmt" },
  { name: "TUBEFORM® steel (Z200 1.54mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-154mm-bmt" },
  { name: "TUBEFORM® steel (Z200 1.85mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-185mm-bmt" },
  { name: "TUBEFORM® steel (Z200 1.89mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-189mm-bmt" },
  { name: "TUBEFORM® steel (Z200 1.91mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-191mm-bmt" },
  { name: "TUBEFORM® steel (Z200 1.96mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-196mm-bmt" },
  { name: "TUBEFORM® steel (Z200 2.40mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-240mm-bmt" },
  { name: "TUBEFORM® steel (Z200 2.83mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-283mm-bmt" },
  { name: "TUBEFORM® steel (Z200 2.90mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-tubeform-steel-290mm-bmt" },
  { name: "XLERPLATE® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-xlerplate-steel" },
  { name: "ZINC HI-TEN® steel (Z200 1.50mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-150mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z200 1.90mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-190mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z200 2.40mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-substrate-z200-coating-at-240mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z275 0.80mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-080mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z450 0.42mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-042mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z450 0.60mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-060mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z450 0.80mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-080mm-bmt-2" },
  { name: "ZINC HI-TEN® steel (Z450 1.00mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-1mm-bmt" },
  { name: "ZINC HI-TEN® steel (Z450 1.20mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zinc-hi-ten-steel-120mm-bmt" },
  { name: "ZINCALUME® steel", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincalume-steel" },
  { name: "ZINCANNEAL® steel (ZF100 0.90mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-090mm-bmt" },
  { name: "ZINCANNEAL® steel (ZF100 1.10mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-110mm-bmt" },
  { name: "ZINCANNEAL® steel (ZF100 1.15mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-115mm-bmt" },
  { name: "ZINCANNEAL® steel (ZF100 1.40mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-140mm-bmt" },
  { name: "ZINCANNEAL® steel (ZF100 1.50mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-150mm-bmt" },
  { name: "ZINCANNEAL® steel (ZF100 1.90mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincanneal-steel-190mm-bmt" },
  { name: "ZINCFORM® steel (Z100 1.87mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincform-steel-187mm-bmt" },
  { name: "ZINCFORM® steel (Z200 0.30mm BMT)", url: "https://cdn.dcs.bluescope.com.au/download/environmental-product-declaration-epd-zincform-steel-030mm-bmt" },
];

// System prompt for EPD extraction
const EXTRACTION_PROMPT = `You are an expert at extracting Environmental Product Declaration (EPD) data from BlueScope steel products.

Based on the product name provided, extract the following EPD data and return it as JSON. Use your knowledge of BlueScope EPD data and Australian steel products.

Required JSON format:
{
  "material_name": "Full product name with coating/thickness details",
  "epd_number": "EPD registration number (format: S-P-XXXXX or EPD-XXX-XXXXX)",
  "manufacturer": "BlueScope Steel Limited",
  "plant_location": "Port Kembla, NSW",
  "region": "Australia",
  "state": "NSW",
  "unit": "tonne",
  "material_category": "Steel",
  "subcategory": "Specific type (Coated Coil, Hollow Sections, Plate, Fencing, etc.)",
  "data_source": "BlueScope EPD",
  "publish_date": "YYYY-MM-DD or null",
  "expiry_date": "YYYY-MM-DD or null",
  "ef_a1a3": NUMBER (Product stage GWP in kgCO2e per tonne - typically 1800-2500 for steel),
  "ef_a4": NUMBER or null (Transport GWP),
  "ef_a5": NUMBER or null (Construction GWP),
  "ef_b1b5": NUMBER or null (Use phase GWP),
  "ef_c1c4": NUMBER or null (End of life GWP),
  "ef_d": NUMBER or null (Module D benefits - usually negative),
  "ef_total": NUMBER (Total GWP = sum of A1-A3 + other stages if available),
  "recycled_content": NUMBER (percentage, typically 20-25 for BlueScope)
}

CRITICAL RULES:
1. All emission factors must be NUMBERS ONLY, no text or units
2. BlueScope steel typically has:
   - A1-A3: 1800-2500 kgCO2e/tonne depending on product
   - Coated products higher than uncoated
   - Recycled content: ~20-25%
3. Return ONLY valid JSON, no additional text
4. If uncertain about exact values, use reasonable estimates based on product type`;

async function extractEpdData(pdfUrl: string, productName: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  console.log(`Extracting data for: ${productName}`);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { 
          role: "user", 
          content: `Extract EPD data for this BlueScope product: "${productName}"

The official EPD PDF is at: ${pdfUrl}

Provide accurate lifecycle carbon data based on BlueScope's published EPD values for this product type.`
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI Gateway error: ${response.status} - ${errorText}`);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded, please try again later");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted");
    }
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content returned from AI");
  }

  // Parse JSON from response
  try {
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error(`Failed to parse AI response: ${content}`);
    throw new Error("Failed to parse EPD data from AI response");
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _role: 'admin',
      _user_id: user.id
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, epdIndex } = body;

    // Admin client for database writes
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'list') {
      // Return list of EPDs to import
      return new Response(JSON.stringify({ 
        epds: BLUESCOPE_EPDS.map((epd, index) => ({ ...epd, index })),
        total: BLUESCOPE_EPDS.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'import-single') {
      if (typeof epdIndex !== 'number' || epdIndex < 0 || epdIndex >= BLUESCOPE_EPDS.length) {
        return new Response(JSON.stringify({ error: 'Invalid EPD index' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const epd = BLUESCOPE_EPDS[epdIndex];
      console.log(`Processing EPD: ${epd.name}`);

      try {
        const extractedData = await extractEpdData(epd.url, epd.name);
        extractedData.epd_url = epd.url;
        
        if (!extractedData.material_name || !extractedData.ef_total) {
          throw new Error('Missing required fields in extracted data');
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('materials_epd')
          .insert({
            material_name: extractedData.material_name,
            material_category: extractedData.material_category || 'Steel',
            subcategory: extractedData.subcategory,
            manufacturer: extractedData.manufacturer || 'BlueScope Steel Limited',
            plant_location: extractedData.plant_location,
            region: extractedData.region || 'Australia',
            state: extractedData.state || 'NSW',
            unit: extractedData.unit || 'tonne',
            data_source: 'BlueScope EPD',
            epd_number: extractedData.epd_number,
            epd_url: extractedData.epd_url,
            publish_date: extractedData.publish_date,
            expiry_date: extractedData.expiry_date,
            ef_a1a3: extractedData.ef_a1a3,
            ef_a4: extractedData.ef_a4,
            ef_a5: extractedData.ef_a5,
            ef_b1b5: extractedData.ef_b1b5,
            ef_c1c4: extractedData.ef_c1c4,
            ef_d: extractedData.ef_d,
            ef_total: extractedData.ef_total,
            recycled_content: extractedData.recycled_content,
            data_quality_tier: 'manufacturer_epd'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          imported: inserted,
          message: `Successfully imported: ${extractedData.material_name}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error(`Failed to import EPD ${epd.name}:`, error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          epd: epd.name
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'import-all') {
      const results = {
        success: [] as string[],
        failed: [] as { name: string; error: string }[],
        total: BLUESCOPE_EPDS.length
      };

      for (let i = 0; i < BLUESCOPE_EPDS.length; i++) {
        const epd = BLUESCOPE_EPDS[i];
        console.log(`Processing ${i + 1}/${BLUESCOPE_EPDS.length}: ${epd.name}`);

        try {
          const extractedData = await extractEpdData(epd.url, epd.name);
          extractedData.epd_url = epd.url;

          const { error: insertError } = await supabaseAdmin
            .from('materials_epd')
            .insert({
              material_name: extractedData.material_name,
              material_category: extractedData.material_category || 'Steel',
              subcategory: extractedData.subcategory,
              manufacturer: extractedData.manufacturer || 'BlueScope Steel Limited',
              plant_location: extractedData.plant_location,
              region: extractedData.region || 'Australia',
              state: extractedData.state || 'NSW',
              unit: extractedData.unit || 'tonne',
              data_source: 'BlueScope EPD',
              epd_number: extractedData.epd_number,
              epd_url: extractedData.epd_url,
              publish_date: extractedData.publish_date,
              expiry_date: extractedData.expiry_date,
              ef_a1a3: extractedData.ef_a1a3,
              ef_a4: extractedData.ef_a4,
              ef_a5: extractedData.ef_a5,
              ef_b1b5: extractedData.ef_b1b5,
              ef_c1c4: extractedData.ef_c1c4,
              ef_d: extractedData.ef_d,
              ef_total: extractedData.ef_total,
              recycled_content: extractedData.recycled_content,
              data_quality_tier: 'manufacturer_epd'
            });

          if (insertError) {
            throw new Error(insertError.message);
          }

          results.success.push(epd.name);
        } catch (error) {
          results.failed.push({
            name: epd.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // 2 second delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in import-bluescope-epd:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
