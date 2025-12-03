import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EPDRecord {
  material_category: string;
  subcategory: string | null;
  material_name: string;
  publish_date: string | null;
  expiry_date: string | null;
  plant_location: string | null;
  epd_number: string | null;
  data_source: string;
  epd_url: string | null;
  unit: string;
  ef_total: number;
  ef_a1a3: number | null;
  carbon_sequestration: number | null;
  manufacturer: string | null;
  state: string | null;
  region: string;
  data_quality_tier: string;
  year: number | null;
}

// Parse Australian date format (DD/MM/YYYY) or Excel serial number
function parseDate(value: any): string | null {
  if (!value) return null;
  
  // Handle Excel serial date numbers
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  const str = String(value).trim();
  if (!str) return null;
  
  // Try DD/MM/YYYY format
  const parts = str.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d && m && y && d <= 31 && m <= 12) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Try ISO format
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toISOString().split('T')[0];
  }
  
  return null;
}

// Parse scientific notation and regular numbers
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  const str = String(value).trim();
  if (!str) return null;
  
  // Handle scientific notation (e.g., 2.07E+02)
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Extract manufacturer from material long name
function extractManufacturer(longName: string): string | null {
  if (!longName) return null;
  
  const patterns = [
    /\(([^)]+)\)\s*$/,  // Match content in parentheses at end
    /\(([^)]+)\)/,      // Match any parentheses content
  ];
  
  for (const pattern of patterns) {
    const match = longName.match(pattern);
    if (match && match[1]) {
      const manufacturer = match[1].trim();
      // Filter out plant names that aren't manufacturers
      if (!manufacturer.includes('Plant') && 
          !manufacturer.includes('Quarry') &&
          manufacturer.length > 2 &&
          manufacturer.length < 50) {
        return manufacturer;
      }
    }
  }
  
  return null;
}

// Extract state from location string
function extractState(location: string | null): string | null {
  if (!location) return null;
  
  const stateMap: Record<string, string> = {
    'NSW': 'NSW', 'New South Wales': 'NSW',
    'VIC': 'VIC', 'Victoria': 'VIC',
    'QLD': 'QLD', 'Queensland': 'QLD',
    'WA': 'WA', 'Western Australia': 'WA',
    'SA': 'SA', 'South Australia': 'SA',
    'TAS': 'TAS', 'Tasmania': 'TAS',
    'NT': 'NT', 'Northern Territory': 'NT',
    'ACT': 'ACT', 'Australian Capital Territory': 'ACT',
  };
  
  for (const [key, value] of Object.entries(stateMap)) {
    if (location.toUpperCase().includes(key.toUpperCase())) {
      return value;
    }
  }
  
  return null;
}

// Clean EPD URL (remove backslashes and fix encoding)
function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  return url.replace(/\\/g, '').trim() || null;
}

// Extract year from date
function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.split('-')[0], 10);
  return isNaN(year) ? null : year;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: hasAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!hasAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, fileData, sheetIndex } = await req.json();
    console.log(`[import-nabers-epd] Action: ${action}, User: ${user.id}`);

    if (action === 'clear') {
      const { error: deleteError } = await supabase
        .from('materials_epd')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) throw deleteError;
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Cleared all EPD materials' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'import' && fileData) {
      console.log('[import-nabers-epd] Processing XLSX file...');
      
      // Decode base64 file data
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Parse XLSX
      const workbook = XLSX.read(bytes, { type: 'array' });
      const targetSheet = sheetIndex || 1; // Default to second sheet (EPD list)
      const sheetName = workbook.SheetNames[targetSheet];
      
      if (!sheetName) {
        return new Response(JSON.stringify({ 
          error: `Sheet index ${targetSheet} not found. Available sheets: ${workbook.SheetNames.join(', ')}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`[import-nabers-epd] Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Find header row (starts around row 35 based on analysis)
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(50, rawData.length); i++) {
        const row = rawData[i];
        if (row && row[0] && String(row[0]).toLowerCase().includes('material type')) {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex === -1) {
        return new Response(JSON.stringify({ 
          error: 'Could not find header row with "Material type"',
          preview: rawData.slice(0, 5).map(r => r?.slice(0, 3))
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`[import-nabers-epd] Found header at row ${headerRowIndex}`);
      const headers = rawData[headerRowIndex];
      const dataRows = rawData.slice(headerRowIndex + 1);
      
      // Build column index map
      const colMap: Record<string, number> = {};
      headers.forEach((h: any, i: number) => {
        if (h) colMap[String(h).trim().toLowerCase()] = i;
      });
      
      console.log('[import-nabers-epd] Column map:', Object.keys(colMap).slice(0, 15));
      
      // Find column indices
      const getCol = (searchTerms: string[]): number => {
        for (const term of searchTerms) {
          for (const [key, idx] of Object.entries(colMap)) {
            if (key.includes(term.toLowerCase())) return idx;
          }
        }
        return -1;
      };
      
      const cols = {
        materialType: getCol(['material type']),
        classification: getCol(['material classification']),
        longName: getCol(['material long name', 'long name']),
        validStart: getCol(['data valid (start)', 'valid (start)']),
        validEnd: getCol(['data valid (end)', 'valid (end)']),
        location: getCol(['location']),
        regNumber: getCol(['registration number', 'reg number']),
        dataSource: getCol(['data source']),
        program: getCol(['program']),
        refLink: getCol(['reference link', 'website']),
        unit: getCol(['declared unit']),
        gwpTotal: getCol(['gwp-total', 'gwp total']),
        upfrontCarbon: getCol(['upfront carbon', 'a1-a3']),
        carbonStorage: getCol(['carbon storage', 'sequestration']),
      };
      
      console.log('[import-nabers-epd] Column indices:', cols);
      
      // Process rows
      const records: EPDRecord[] = [];
      let skipped = 0;
      
      for (const row of dataRows) {
        if (!row || !row[cols.materialType] || !row[cols.longName]) {
          skipped++;
          continue;
        }
        
        const gwpTotal = parseNumber(row[cols.gwpTotal]);
        if (gwpTotal === null || gwpTotal <= 0) {
          skipped++;
          continue;
        }
        
        const materialCategory = String(row[cols.materialType] || '').trim();
        const materialName = String(row[cols.longName] || '').trim();
        const location = row[cols.location] ? String(row[cols.location]).trim() : null;
        const publishDate = parseDate(row[cols.validStart]);
        
        records.push({
          material_category: materialCategory,
          subcategory: row[cols.classification] ? String(row[cols.classification]).trim() : null,
          material_name: materialName,
          publish_date: publishDate,
          expiry_date: parseDate(row[cols.validEnd]),
          plant_location: location,
          epd_number: row[cols.regNumber] ? String(row[cols.regNumber]).trim() : null,
          data_source: row[cols.program] ? String(row[cols.program]).trim() : 'NABERS 2025 EPD List',
          epd_url: cleanUrl(row[cols.refLink] ? String(row[cols.refLink]) : null),
          unit: row[cols.unit] ? String(row[cols.unit]).trim() : 'kg',
          ef_total: gwpTotal,
          ef_a1a3: parseNumber(row[cols.upfrontCarbon]),
          carbon_sequestration: parseNumber(row[cols.carbonStorage]),
          manufacturer: extractManufacturer(materialName),
          state: extractState(location),
          region: 'Australia',
          data_quality_tier: 'epd_verified',
          year: extractYear(publishDate),
        });
      }
      
      console.log(`[import-nabers-epd] Parsed ${records.length} records, skipped ${skipped}`);
      
      if (records.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'No valid records found',
          skipped,
          columns: cols,
          sampleRow: dataRows[0]?.slice(0, 20)
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Insert in batches
      const batchSize = 500;
      let inserted = 0;
      let failed = 0;
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('materials_epd')
          .insert(batch);
        
        if (insertError) {
          console.error(`[import-nabers-epd] Batch ${i} error:`, insertError);
          failed += batch.length;
        } else {
          inserted += batch.length;
        }
      }
      
      console.log(`[import-nabers-epd] Complete: ${inserted} inserted, ${failed} failed`);
      
      // Sample records for verification
      const { data: sampleRecords } = await supabase
        .from('materials_epd')
        .select('material_name, epd_number, manufacturer, ef_total, unit')
        .limit(5);
      
      return new Response(JSON.stringify({ 
        success: true,
        total: records.length,
        inserted,
        failed,
        skipped,
        sample: sampleRecords
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use "import" with fileData or "clear"' 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error('[import-nabers-epd] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
