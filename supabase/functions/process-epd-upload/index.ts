import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Material validation schema
const VALID_UNITS = ['kg', 'm²', 'm³', 'm', 'tonne', 'piece', 'unit', 'kWh', 'MJ', 'L'];
const VALID_CATEGORIES = [
  'Concrete', 'Steel', 'Timber', 'Insulation', 'Glass', 'Bricks', 
  'Plasterboard', 'Plastics', 'Aluminium', 'Copper', 'Roofing',
  'Flooring', 'Adhesives', 'Paints', 'Pipes', 'Other', 'Cement',
  'Aggregates', 'Asphalt', 'Membranes', 'Cladding', 'Windows'
];

function validateMaterial(m: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!m.product_name || typeof m.product_name !== 'string') {
    errors.push('product_name is required and must be a string');
  } else if (m.product_name.length > 500) {
    errors.push('product_name must be less than 500 characters');
  }
  
  // Numeric validation for GWP values
  const numericFields = ['gwp_a1a3', 'gwp_a4', 'gwp_a5', 'gwp_b1b5', 'gwp_c1c4', 'gwp_d', 'gwp_total', 'recycled_content'];
  for (const field of numericFields) {
    if (m[field] !== null && m[field] !== undefined) {
      const val = Number(m[field]);
      if (isNaN(val)) {
        errors.push(`${field} must be a valid number`);
      } else if (val < -1000 || val > 100000) {
        errors.push(`${field} value ${val} is outside valid range (-1000 to 100000)`);
      }
    }
  }
  
  // Unit validation
  if (m.unit && !VALID_UNITS.includes(m.unit)) {
    // Allow but warn - don't block
    console.warn(`[process-epd-upload] Non-standard unit: ${m.unit}`);
  }
  
  // EPD number format validation (if provided)
  if (m.epd_number && typeof m.epd_number === 'string') {
    if (m.epd_number.length > 100) {
      errors.push('epd_number must be less than 100 characters');
    }
    // Basic pattern check for common EPD formats
    const epdPattern = /^(S-P-|EPD-|EPD_|[A-Z]{2,3}-)/i;
    if (m.epd_number.length > 5 && !epdPattern.test(m.epd_number)) {
      console.warn(`[process-epd-upload] Unusual EPD number format: ${m.epd_number}`);
    }
  }
  
  // String length limits
  const stringFields = ['manufacturer', 'geographic_scope', 'plant_location', 'data_source', 'notes'];
  for (const field of stringFields) {
    if (m[field] && typeof m[field] === 'string' && m[field].length > 500) {
      errors.push(`${field} must be less than 500 characters`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// EPD extraction prompt for AI with ECO Platform fields
const EXTRACTION_PROMPT = `You are an expert at extracting Environmental Product Declaration (EPD) data from PDF documents, with particular expertise in EN 15804+A2 and ECO Platform compliance requirements.

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
      "publish_date": "Publication date in YYYY-MM-DD format or null",
      "geographic_scope": "Geographic scope (e.g., 'Australia', 'Australia and New Zealand', 'Global')",
      "material_category": "Category like 'Steel', 'Concrete', 'Insulation', 'Timber', 'Plastics', etc.",
      "plant_location": "Manufacturing plant location/city if specified",
      "manufacturing_country": "Country of manufacture (e.g., 'Australia', 'China', 'Germany')",
      "manufacturing_city": "City/state of manufacture if specified",
      "data_source": "EPD program operator (e.g., 'EPD Australasia', 'International EPD System')",
      "recycled_content": "Recycled content percentage as a number or null",
      "notes": "Any important notes about the product or data",
      
      "biogenic_carbon_kg_c": "Biogenic carbon content in kg C per declared unit, or null",
      "biogenic_carbon_percentage": "Biogenic carbon as percentage of product mass, or null",
      "carbon_sequestration": "Carbon sequestration value in kgCO2e (negative for stored carbon), or null",
      
      "allocation_method": "Allocation method used (e.g., 'physical', 'economic', 'mass', 'none')",
      "is_co_product": "true if this is a co-product, false otherwise",
      "co_product_type": "Type of co-product if applicable (e.g., 'slag', 'fly_ash', 'recycled_aggregate')",
      "uses_mass_balance": "true if mass balance approach is used for recycled content",
      
      "characterisation_factor_version": "Characterisation factor version (e.g., 'JRC-EF-3.1', 'CML-IA')",
      "ecoinvent_methodology": "Ecoinvent methodology if used (e.g., 'APOS', 'cut-off', 'consequential')",
      
      "data_quality_rating": "Data quality rating if provided (e.g., 'very good', 'good', 'fair', 'poor')",
      "uncertainty_percent": "Uncertainty percentage as a number or null",
      
      "scope1_factor": "Scope 1 emissions factor if separately declared, or null",
      "scope2_factor": "Scope 2 emissions factor if separately declared, or null",
      "scope3_factor": "Scope 3 emissions factor if separately declared, or null"
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
7. Return valid JSON only, no markdown or extra text
8. For biogenic carbon, look for terms like "biogenic carbon content", "carbon stored", "biogenic CO2"
9. For allocation method, look for "allocation", "co-product allocation", "system expansion"
10. For data quality, look for "data quality", "DQR", "data quality rating", "uncertainty"
11. For characterisation factors, look for "EF 3.1", "JRC", "CML", "TRACI", "ReCiPe"`;

// Helper functions for NABERS EPD List v2025.1 data parsing
function extractState(location: string | null): string | null {
  if (!location) return null;
  const loc = location.toUpperCase();
  if (loc.includes('NSW') || loc.includes('SYDNEY') || loc.includes('NEW SOUTH WALES')) return 'NSW';
  if (loc.includes('VIC') || loc.includes('MELBOURNE') || loc.includes('VICTORIA')) return 'VIC';
  if (loc.includes('QLD') || loc.includes('BRISBANE') || loc.includes('QUEENSLAND')) return 'QLD';
  if (loc.includes('SA') || loc.includes('ADELAIDE') || loc.includes('SOUTH AUSTRALIA')) return 'SA';
  if (loc.includes('WA') || loc.includes('PERTH') || loc.includes('WESTERN AUSTRALIA')) return 'WA';
  if (loc.includes('TAS') || loc.includes('HOBART') || loc.includes('TASMANIA')) return 'TAS';
  if (loc.includes('NT') || loc.includes('DARWIN') || loc.includes('NORTHERN TERRITORY')) return 'NT';
  if (loc.includes('ACT') || loc.includes('CANBERRA')) return 'ACT';
  return null;
}

function extractManufacturer(longName: string | null): string | null {
  if (!longName) return null;
  // NABERS format: "Product, details, (Manufacturer) (Location)"
  const match = longName.match(/\(([^)]+)\)\s*\([^)]*\)\s*$/);
  if (match) return match[1].trim();
  // Fallback: last parenthetical
  const lastParen = longName.match(/\(([^)]+)\)\s*$/);
  return lastParen ? lastParen[1].trim() : null;
}

function normalizeUnit(unit: string): string {
  if (!unit) return 'kg';
  const u = unit.toLowerCase().trim();
  if (u === 'm³' || u === 'm3' || u === 'cubic metre' || u === 'cubic meter') return 'm³';
  if (u === 'm²' || u === 'm2' || u === 'square metre' || u === 'square meter') return 'm²';
  if (u === 'm' || u === 'metre' || u === 'meter' || u === 'linear metre') return 'm';
  if (u === 'kg' || u === 'kilogram' || u === 'kilograms') return 'kg';
  if (u === 't' || u === 'tonne' || u === 'tonnes' || u === 'ton') return 'tonne';
  if (u === 'unit' || u === 'piece' || u === 'each' || u === 'item') return 'unit';
  return unit;
}

function parseNABERSDate(dateValue: any): string | null {
  if (!dateValue) return null;
  // Handle Excel serial dates (numbers)
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
    return date.toISOString().split('T')[0];
  }
  // Handle string dates in various formats
  const str = String(dateValue).trim();
  // DD/MM/YYYY (Australian format)
  const auMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (auMatch) {
    return `${auMatch[3]}-${auMatch[2].padStart(2, '0')}-${auMatch[1].padStart(2, '0')}`;
  }
  // YYYY-MM-DD (ISO format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Try native parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return null;
}

function buildNotes(m: any): string | null {
  const notes: string[] = [];
  if (m.density_kg_m3) notes.push(`Density: ${m.density_kg_m3} kg/m³`);
  if (m.area_density_kg_m2) notes.push(`Area density: ${m.area_density_kg_m2} kg/m²`);
  if (m.mass_per_m_kg) notes.push(`Mass per m: ${m.mass_per_m_kg} kg/m`);
  if (m.mass_per_unit_kg) notes.push(`Mass per unit: ${m.mass_per_unit_kg} kg/unit`);
  if (m.gwp_stored_kg || m.gwp_stored_quantity) notes.push(`GWP-stored: ${m.gwp_stored_kg || m.gwp_stored_quantity} kgCO2e`);
  if (m.version) notes.push(`Version: ${m.version}`);
  return notes.length > 0 ? notes.join('; ') : null;
}

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

    // Rate limiting: 10 EPD uploads per hour for admins
    const rateLimitResult = await checkRateLimit(supabase, user.id, 'process-epd-upload', {
      windowMinutes: 60,
      maxRequests: 10
    });

    if (!rateLimitResult.allowed) {
      console.log(`[process-epd-upload] Rate limit exceeded for admin ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      // Limit batch size
      if (materials.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Maximum 100 materials per batch' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate all materials before saving
      const validationErrors: { index: number; errors: string[] }[] = [];
      for (let i = 0; i < materials.length; i++) {
        const result = validateMaterial(materials[i]);
        if (!result.valid) {
          validationErrors.push({ index: i, errors: result.errors });
        }
      }

      if (validationErrors.length > 0) {
        console.error('[process-epd-upload] Validation errors:', validationErrors);
        return new Response(
          JSON.stringify({ 
            error: 'Material validation failed',
            validationErrors 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const serviceClient = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Map NABERS EPD List v2025.1 fields to database columns
      const insertData = materials.map((m: any) => ({
        // Core identification - map from NABERS format
        material_name: String(m.material_long_name || m.product_name || '').substring(0, 500),
        material_category: m.material_type || m.material_category || 'Other',
        subcategory: m.material_classification || m.material_category_matching || null,
        
        // EPD metadata
        epd_number: m.registration_number || m.epd_number ? String(m.registration_number || m.epd_number).substring(0, 100) : null,
        epd_url: m.reference_link || m.epd_url || m.storage_url || null,
        
        // Location data
        plant_location: m.location || m.plant_location ? String(m.location || m.plant_location).substring(0, 500) : null,
        state: extractState(m.location),
        region: 'Australia',
        manufacturer: extractManufacturer(m.material_long_name || m.product_name),
        manufacturing_country: 'Australia',
        
        // Unit and physical properties
        unit: normalizeUnit(m.declared_unit || m.unit || 'kg'),
        
        // GWP values - NABERS uses "upfront carbon emissions" for A1-A3
        // Use per-kg values if available, otherwise per-quantity
        ef_a1a3: Number(m.upfront_carbon_emissions_kg) || Number(m.upfront_carbon_emissions_quantity) || Number(m.gwp_a1a3) || 0,
        ef_total: Number(m.gwp_total_kg) || Number(m.gwp_total_quantity) || Number(m.gwp_total) || 0,
        ef_a4: Number(m.gwp_a4) || 0,
        ef_a5: Number(m.gwp_a5) || 0,
        ef_b1b5: Number(m.gwp_b1b5) || 0,
        ef_c1c4: Number(m.gwp_c1c4) || 0,
        ef_d: Number(m.gwp_d) || 0,
        
        // NEW NABERS-specific GWP breakdown columns
        gwp_fossil_a1a3: Number(m.gwp_fossil_kg) || Number(m.gwp_fossil_quantity) || null,
        gwp_biogenic_a1a3: Number(m.gwp_biogenic_kg) || Number(m.gwp_biogenic_quantity) || null,
        gwp_luluc_a1a3: Number(m.gwp_luluc_kg) || Number(m.gwp_luluc_quantity) || null,
        
        // Dates
        expiry_date: parseNABERSDate(m.data_valid_end || m.valid_until),
        publish_date: parseNABERSDate(m.data_valid_start || m.publish_date),
        date_added: parseNABERSDate(m.record_added_to_database),
        date_updated: new Date().toISOString().split('T')[0],
        
        // Data source info
        data_source: 'NABERS EPD List v2025.1',
        program_operator: m.program || null,
        epd_type: m.version || null,
        
        // Carbon storage
        carbon_sequestration: Number(m.upfront_carbon_storage_kg) || Number(m.upfront_carbon_storage_quantity) || null,
        biogenic_carbon_kg_c: m.biogenic_carbon_kg_c != null ? Number(m.biogenic_carbon_kg_c) : null,
        
        // Data quality
        data_quality_tier: 'verified_epd',
        data_quality_rating: m.data_quality_rating || null,
        
        // Physical properties (for reference, not stored in separate columns yet)
        notes: buildNotes(m),
        
        // Default compliance fields
        characterisation_factor_version: 'JRC-EF-3.1',
        eco_platform_compliant: true,
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
