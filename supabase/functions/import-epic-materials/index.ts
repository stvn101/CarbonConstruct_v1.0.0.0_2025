import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EPiCMaterial {
  material_name: string;
  material_category: string;
  subcategory: string | null;
  unit: string;
  ef_total: number;
  data_source: string;
  region: string;
  year: number;
  manufacturer: string;
  epd_url: string | null;
  data_quality_tier: string;
  eco_platform_compliant: boolean;
  notes: string | null;
}

function normalizeUnit(unit: string | null): string {
  if (!unit) return "kg";
  const normalized = unit.trim().toLowerCase();
  
  if (normalized === "m²" || normalized === "m2" || normalized === "sqm") return "m2";
  if (normalized === "m³" || normalized === "m3" || normalized === "cum") return "m3";
  if (normalized === "no." || normalized === "no" || normalized === "each" || normalized === "pcs") return "no.";
  if (normalized === "m" || normalized === "lm" || normalized === "linear m") return "m";
  if (normalized === "kg" || normalized === "kgs") return "kg";
  if (normalized === "t" || normalized === "tonne" || normalized === "tonnes") return "tonne";
  if (normalized === "l" || normalized === "litre" || normalized === "liter") return "L";
  
  return unit.trim();
}

function parseEfValue(value: any): number | null {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  
  if (isNaN(num) || num < 0) return null;
  return num;
}

function extractCategory(value: any): string {
  if (!value) return "General";
  const str = String(value).trim();
  return str || "General";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action = "import", fileData } = body;

    console.log(`EPiC Import: Action=${action}`);

    if (action === "clear") {
      // Clear only EPiC materials
      const { data: deletedData, error: deleteError } = await supabase
        .from("materials_epd")
        .delete()
        .eq("data_source", "EPiC Database 2024")
        .select("id");

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, deleted: deletedData?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Import action
    let workbook: XLSX.WorkBook;

    if (fileData) {
      // Parse from uploaded base64 file
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      workbook = XLSX.read(bytes, { type: "array" });
    } else {
      // Fetch from demo folder
      const response = await fetch(`${supabaseUrl.replace("/rest/v1", "")}/storage/v1/object/public/materials-data/epic-database-2024.xlsx`);
      
      if (!response.ok) {
        // Try fetching from a public URL or embedded data
        console.log("Fetching EPiC from public demo folder...");
        
        // Use embedded minimal dataset for now - in production would fetch from storage
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Please upload the EPiC Database XLSX file" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const buffer = await response.arrayBuffer();
      workbook = XLSX.read(buffer, { type: "array" });
    }

    // Find the main data sheet (usually "Database" or first sheet with data)
    const sheetNames = workbook.SheetNames;
    console.log(`Available sheets: ${sheetNames.join(", ")}`);
    
    // Find the sheet with data - look for "Database", "Materials", or use first sheet
    let dataSheet: XLSX.WorkSheet | null = null;
    let sheetName = "";
    
    for (const name of ["Database", "Materials", "EPiC Database", "Data", ...sheetNames]) {
      if (workbook.Sheets[name]) {
        dataSheet = workbook.Sheets[name];
        sheetName = name;
        break;
      }
    }
    
    if (!dataSheet) {
      throw new Error("No data sheet found in workbook");
    }

    console.log(`Using sheet: ${sheetName}`);

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(dataSheet, { header: 1, defval: null });
    console.log(`Total rows: ${rawData.length}`);

    // Find header row (look for "Material" or "Category" in first 20 rows)
    let headerRowIndex = -1;
    let headers: string[] = [];
    
    for (let i = 0; i < Math.min(20, rawData.length); i++) {
      const row = rawData[i] as any[];
      if (!row) continue;
      
      const rowStr = row.map(c => String(c || "").toLowerCase()).join(" ");
      if (rowStr.includes("material") && (rowStr.includes("category") || rowStr.includes("ghg") || rowStr.includes("embodied"))) {
        headerRowIndex = i;
        headers = row.map(c => String(c || "").trim());
        console.log(`Found header row at index ${i}: ${headers.slice(0, 8).join(", ")}`);
        break;
      }
    }

    if (headerRowIndex === -1) {
      // Default to first row as header
      headerRowIndex = 0;
      headers = (rawData[0] as any[]).map(c => String(c || "").trim());
    }

    // Find column indices
    const findColumn = (names: string[]): number => {
      for (const name of names) {
        const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const categoryCol = findColumn(["Category"]);
    const typeCol = findColumn(["Type", "Subcategory"]);
    const materialCol = findColumn(["Material", "Name", "Material Name"]);
    const unitCol = findColumn(["Functional unit", "Unit", "FU"]);
    const ghgCol = findColumn(["Embodied GHG", "GHG", "kgCO2e", "Carbon"]);
    const infoCol = findColumn(["More information", "Link", "URL", "DOI"]);

    console.log(`Column mapping: Category=${categoryCol}, Type=${typeCol}, Material=${materialCol}, Unit=${unitCol}, GHG=${ghgCol}, Info=${infoCol}`);

    if (materialCol === -1 || ghgCol === -1) {
      throw new Error("Cannot find required columns (Material, GHG) in the spreadsheet");
    }

    // Parse materials
    const materials: EPiCMaterial[] = [];
    let currentCategory = "General";
    let currentType = "";

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (!row || row.length === 0) continue;

      // Update category/type if present (handle merged cells)
      if (categoryCol !== -1 && row[categoryCol]) {
        currentCategory = extractCategory(row[categoryCol]);
      }
      if (typeCol !== -1 && row[typeCol]) {
        currentType = String(row[typeCol]).trim();
      }

      // Get material name
      const materialName = row[materialCol] ? String(row[materialCol]).trim() : null;
      if (!materialName || materialName === "-" || materialName.length < 2) continue;

      // Get GHG value
      const ghgValue = parseEfValue(row[ghgCol]);
      if (ghgValue === null || ghgValue === 0) continue;

      // Get unit
      const unit = unitCol !== -1 ? normalizeUnit(row[unitCol]) : "kg";

      // Get info URL
      const infoUrl = infoCol !== -1 && row[infoCol] ? String(row[infoCol]).trim() : null;

      const material: EPiCMaterial = {
        material_name: materialName,
        material_category: currentCategory,
        subcategory: currentType || null,
        unit,
        ef_total: ghgValue,
        data_source: "EPiC Database 2024",
        region: "Australia",
        year: 2024,
        manufacturer: "University of Melbourne",
        epd_url: infoUrl,
        data_quality_tier: "national_lci",
        eco_platform_compliant: true,
        notes: "EPiC Database - Environmental Performance in Construction (Crawford, Stephan & Prideaux, 2024)"
      };

      materials.push(material);
    }

    console.log(`Parsed ${materials.length} valid materials from EPiC Database`);

    if (materials.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No valid materials found in the file. Check file format." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing EPiC materials to avoid duplicates
    const { data: existingMaterials } = await supabase
      .from("materials_epd")
      .select("material_name")
      .eq("data_source", "EPiC Database 2024");

    const existingNames = new Set((existingMaterials || []).map(m => m.material_name.toLowerCase()));

    // Filter out duplicates
    const newMaterials = materials.filter(m => !existingNames.has(m.material_name.toLowerCase()));
    const duplicates = materials.length - newMaterials.length;

    console.log(`New materials: ${newMaterials.length}, Duplicates skipped: ${duplicates}`);

    // Batch insert
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < newMaterials.length; i += batchSize) {
      const batch = newMaterials.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from("materials_epd")
        .insert(batch)
        .select("id");

      if (error) {
        console.error(`Batch insert error (${i}-${i + batchSize}):`, error);
        failed += batch.length;
      } else {
        inserted += data?.length || 0;
      }
    }

    // Get category breakdown
    const categoryBreakdown: Record<string, number> = {};
    newMaterials.forEach(m => {
      categoryBreakdown[m.material_category] = (categoryBreakdown[m.material_category] || 0) + 1;
    });

    // Sample records for verification
    const sample = newMaterials.slice(0, 5).map(m => ({
      name: m.material_name,
      category: m.material_category,
      ef_total: m.ef_total,
      unit: m.unit
    }));

    console.log(`EPiC Import complete: Inserted=${inserted}, Failed=${failed}, Duplicates=${duplicates}`);

    return new Response(
      JSON.stringify({
        success: true,
        total: materials.length,
        inserted,
        failed,
        duplicates,
        skipped: duplicates,
        categories: categoryBreakdown,
        sample
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("EPiC Import error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
