import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ICEMaterial {
  material_name: string;
  material_category: string;
  subcategory?: string | null;
  unit: string;
  ef_total: number;
  ef_a1a3?: number | null;
  data_source: string;
  data_quality_rating?: string | null;
  notes?: string | null;
  year?: number;
  region?: string;
  eco_platform_compliant?: boolean;
}

// Column position detection for __EMPTY columns
interface ColumnPositions {
  materialNameCol: string | null;
  efTotalCol: string | null;
  unitCol: string | null;
  dqiCol: string | null;
  commentsCol: string | null;
  canonicalNameCol: string | null;
}

// Known ICE material category names for section header detection
const CATEGORY_NAMES = [
  'aggregates', 'aluminium', 'aluminum', 'asphalt', 'bitumen', 'brass', 'bricks', 'bronze',
  'carpet', 'cement', 'mortar', 'ceramics', 'clay', 'concrete', 'copper',
  'glass', 'insulation', 'iron', 'lead', 'lime', 'linoleum', 'miscellaneous',
  'paint', 'paper', 'plaster', 'plastics', 'rubber', 'sealants', 'adhesives',
  'soil', 'steel', 'stainless', 'stone', 'timber', 'tin', 'titanium', 'vinyl', 'zinc',
  'aggregates and sand', 'aggregates & sand', 'cement & mortar', 'sealants & adhesives'
];

// Material profile sheet names for backup parsing
const MATERIAL_PROFILE_SHEETS = [
  'Aggregates & Sand',
  'Aluminium',
  'Asphalt',
  'Bitumen',
  'Bricks',
  'Carpet',
  'Cement & Mortar',
  'Ceramics',
  'Clay',
  'Concrete',
  'Glass',
  'Insulation',
  'Iron',
  'Lead',
  'Lime',
  'Paint',
  'Paper',
  'Plaster',
  'Plastics',
  'Rubber',
  'Sealants & Adhesives',
  'Soil',
  'Steel',
  'Stone',
  'Timber',
  'Tin',
  'Vinyl',
  'Zinc'
];

// Normalize material name for deduplication
function normalizeMaterialName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"');
}

// Normalize unit for consistency
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kgs': 'kg',
    'm2': 'm²',
    'm²': 'm²',
    'sqm': 'm²',
    'square meter': 'm²',
    'square metre': 'm²',
    'm3': 'm³',
    'm³': 'm³',
    'cbm': 'm³',
    'cubic meter': 'm³',
    'cubic metre': 'm³',
    'm': 'm',
    'meter': 'm',
    'metre': 'm',
    'meters': 'm',
    'metres': 'm',
    't': 'tonne',
    'tonne': 'tonne',
    'tonnes': 'tonne',
    'ton': 'tonne',
    'tons': 'tonne',
    'l': 'L',
    'litre': 'L',
    'liter': 'L',
    'litres': 'L',
    'liters': 'L',
  };

  const lower = unit.toLowerCase().trim();
  return unitMap[lower] || unit.trim();
}

// Column name mapping for ICE spreadsheet variations (ICE Database V4.1 Oct 2025)
// Also includes mapped column names that the frontend sends after transformation
const COLUMN_MAPPINGS: Record<string, string[]> = {
  material_name: [
    // Direct mapped names from frontend
    'material_name', 'Material', 'Materials', 'Material Name', 'Name',
    'MATERIAL', 'Material name', 'MATERIALS',
    // ICE V4.1 patterns
    'Name Exactly as in ICE DB'
  ],
  material_category: [
    'material_category', 'Category', 'Material Category', 'Main Category',
    'CATEGORY', 'Material Type'
  ],
  subcategory: [
    'subcategory', 'Sub-Category', 'Subcategory', 'Sub Category',
    'SUB-CATEGORY', 'Sub-category', 'Sub_Category'
  ],
  unit: [
    'unit', 'Unit', 'Units', 'UNIT', 'Functional Unit',
    'UNITS', 'Unit of measurement'
  ],
  ef_total: [
    // Direct mapped name from frontend
    'ef_total',
    // ICE V4.1 specific headers
    'EF (kgCO2e/ unit)', 'EF (kgCO2e/unit)', 'EF(kgCO2e/unit)',
    'EF (kgCO2e / unit)', 'Embodied Carbon (kgCO2e/kg)',
    'EF kgCO2e/kg', 'kgCO2e/kg', 'kgCO2e / kg',
    'Embodied Carbon - kgCO2e per tonne', 'Embodied Carbon -  kgCO2e per tonne',
    'Embodied Carbon - kgCO2e/kg',
    // Generic headers
    'EF Total', 'EF', 'Embodied Carbon', 'Total EF',
    'GWP', 'Total GWP', 'EF_Total', 'GWP Total', 'Total GWP-fossil',
    'EF (kgCO2e)', 'kgCO2e'
  ],
  ef_a1a3: [
    'ef_a1a3', 'EF A1-A3', 'A1-A3', 'Process EF', 'A1A3',
    'Modules A1-A3', 'A1-A3 EF', 'A1-A3 (kgCO2e)', 'A1-A3 EF (kgCO2e)'
  ],
  ef_d: [
    'ef_d', 'Module D', 'EF D', 'D', 'Mod D', 'Module_D'
  ],
  data_quality: [
    'data_quality', 'data_quality_tier', 'DQI Score', 'DQI', 'Data Quality',
    'Quality', 'Data Quality Rating', 'Quality Score'
  ],
  notes: [
    'notes', 'Notes', 'Comments', 'Comment', 'Description',
    'NOTES', 'Additional Notes', 'Remarks'
  ],
  year: [
    'year', 'Year', 'Reference Year', 'Data Year',
    'YEAR', 'Source Year', 'Validity'
  ],
  density: [
    'density', 'Density', 'Density (kg/m3)', 'kg/m³',
    'Density (kg/m³)', 'DENSITY'
  ],
  recycled_content: [
    'recycled_content', 'Recycled Content', 'Recycled', 'Recycled %',
    '% Recycled', 'Recycled Content (%)'
  ],
};

function findColumnValue(row: Record<string, unknown>, targetField: string): unknown {
  const possibleNames = COLUMN_MAPPINGS[targetField] || [targetField];
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return undefined;
}

// Check if a value looks like a section/category header
function isCategoryHeader(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const lower = value.toLowerCase().trim();

  // Skip if it's "Materials" header text
  if (lower === 'materials' || lower.includes('embodied carbon') || lower.includes('kgco2e')) {
    return false;
  }

  // Check if it matches a known category
  return CATEGORY_NAMES.some(cat => lower === cat || lower.startsWith(cat + ' '));
}

// Check if a row looks like a header row
function isHeaderRow(row: Record<string, unknown>): boolean {
  const values = Object.values(row).map(v => String(v || '').toLowerCase());
  const headerKeywords = ['materials', 'embodied carbon', 'kgco2e', 'comments', 'dqi', 'ef ('];
  return headerKeywords.some(kw => values.some(v => v.includes(kw)));
}

// Detect if we have __EMPTY columns (indicates non-standard header structure)
function hasEmptyColumnNames(row: Record<string, unknown>): boolean {
  const keys = Object.keys(row);
  const emptyCount = keys.filter(k => k.startsWith('__EMPTY')).length;
  return emptyCount > keys.length * 0.3; // More than 30% are __EMPTY columns
}

// Detect column positions based on data patterns for __EMPTY columns
function detectColumnPositions(rows: Record<string, unknown>[]): ColumnPositions {
  const positions: ColumnPositions = {
    materialNameCol: null,
    efTotalCol: null,
    unitCol: null,
    dqiCol: null,
    commentsCol: null,
    canonicalNameCol: null
  };

  // Sample first 100 rows to detect patterns
  const sampleRows = rows.slice(0, 100);
  const columnStats: Record<string, {
    stringCount: number;
    numberCount: number;
    smallNumberCount: number;
    percentCount: number;
    examples: string[]
  }> = {};

  for (const row of sampleRows) {
    for (const [key, value] of Object.entries(row)) {
      if (!columnStats[key]) {
        columnStats[key] = { stringCount: 0, numberCount: 0, smallNumberCount: 0, percentCount: 0, examples: [] };
      }
      if (typeof value === 'string' && value.trim()) {
        columnStats[key].stringCount++;
        if (columnStats[key].examples.length < 5) {
          columnStats[key].examples.push(value.trim());
        }
        // Check for percentage values
        if (value.includes('%')) {
          columnStats[key].percentCount++;
        }
      } else if (typeof value === 'number' && !isNaN(value)) {
        columnStats[key].numberCount++;
        // EF values are typically small (0-100 range)
        if (value >= 0 && value <= 100) {
          columnStats[key].smallNumberCount++;
        }
      }
    }
  }

  console.log('[ICE Import] Column statistics:', JSON.stringify(
    Object.fromEntries(
      Object.entries(columnStats).slice(0, 10).map(([k, v]) => [k, {
        stringCount: v.stringCount,
        numberCount: v.numberCount,
        examples: v.examples.slice(0, 2).join(', ')
      }])
    )
  ));

  // Get all column keys
  const colKeys = Object.keys(columnStats);

  // Sort by column order (to find last string column for canonical name)
  const sortedKeys = colKeys.sort((a, b) => {
    const aNum = parseInt(a.replace('__EMPTY_', '').replace('__EMPTY', '0')) || 0;
    const bNum = parseInt(b.replace('__EMPTY_', '').replace('__EMPTY', '0')) || 0;
    return aNum - bNum;
  });

  // Find material name column: first column with high string count and material-like values
  for (const key of sortedKeys) {
    const stats = columnStats[key];
    if (!stats || stats.stringCount < 10) continue;

    const examples = stats.examples.join(' ').toLowerCase();

    // Detect material name column (contains material terms or common materials)
    const hasMaterialTerms = CATEGORY_NAMES.some(cat => examples.includes(cat)) ||
      examples.includes('general') || examples.includes('recycled') ||
      examples.includes('virgin') || examples.includes('typical') ||
      examples.includes('average');

    if (hasMaterialTerms && !positions.materialNameCol) {
      positions.materialNameCol = key;
      console.log(`[ICE Import] Detected material name column: ${key}`);
      break;
    }
  }

  // Find EF column: high number count with small values (EF values are typically < 100)
  for (const key of sortedKeys) {
    const stats = columnStats[key];
    if (!stats || stats.smallNumberCount < 10) continue;

    // Skip if this is the material name column
    if (key === positions.materialNameCol) continue;

    // EF column should have many numeric values
    if (stats.numberCount > 20 && stats.smallNumberCount > stats.numberCount * 0.5) {
      positions.efTotalCol = key;
      console.log(`[ICE Import] Detected EF total column: ${key}`);
      break;
    }
  }

  // Find DQI column (strings with % signs)
  for (const key of sortedKeys) {
    const stats = columnStats[key];
    if (stats && stats.percentCount > 5 && !positions.dqiCol) {
      positions.dqiCol = key;
      console.log(`[ICE Import] Detected DQI column: ${key}`);
      break;
    }
  }

  // Canonical name is often the last __EMPTY column with strings that match material names
  const stringCols = sortedKeys.filter(k => columnStats[k]?.stringCount > 15);
  if (stringCols.length > 1) {
    // Use the last string column that's not the first material name column
    for (let i = stringCols.length - 1; i >= 0; i--) {
      if (stringCols[i] !== positions.materialNameCol) {
        positions.canonicalNameCol = stringCols[i];
        console.log(`[ICE Import] Detected canonical name column: ${positions.canonicalNameCol}`);
        break;
      }
    }
  }

  return positions;
}

// Check if a row is valid material data when using positional detection
function isValidMaterialRowPositional(row: Record<string, unknown>, positions: ColumnPositions): boolean {
  if (!positions.materialNameCol || !positions.efTotalCol) return false;

  const materialName = row[positions.materialNameCol];
  const efValue = row[positions.efTotalCol];

  // Must have a material name string
  if (!materialName || typeof materialName !== 'string') return false;
  const name = materialName.trim();
  if (name.length < 2 || name.length > 200) return false;

  // Skip category headers and section headers
  if (isCategoryHeader(name)) return false;
  if (isHeaderRow(row)) return false;

  // Skip version notices and metadata
  const lowerName = name.toLowerCase();
  if (lowerName.includes('version:') || lowerName.includes('ice v') ||
      lowerName.includes('circular ecology') || lowerName.includes('copyright')) {
    return false;
  }

  // Must have a numeric EF value
  const ef = typeof efValue === 'number' ? efValue : parseFloat(String(efValue));
  if (isNaN(ef) || ef < 0 || ef > 1000) return false;

  return true;
}

// Infer category from material name
function inferCategoryFromName(materialName: string): string {
  const lower = materialName.toLowerCase();

  if (lower.includes('aggregate') || lower.includes('gravel') || lower.includes('sand')) return 'Aggregates';
  if (lower.includes('aluminium') || lower.includes('aluminum')) return 'Aluminium';
  if (lower.includes('asphalt') || lower.includes('road surface')) return 'Asphalt';
  if (lower.includes('bitumen')) return 'Bitumen';
  if (lower.includes('brick') || lower.includes('clay brick')) return 'Bricks';
  if (lower.includes('carpet') || lower.includes('nylon') || lower.includes('polyamide')) return 'Carpet';
  if (lower.includes('cement') || lower.includes('cem i') || lower.includes('cem ii') || lower.includes('ggbs')) return 'Cement';
  if (lower.includes('mortar') || lower.includes('screed')) return 'Mortar';
  if (lower.includes('ceramic') || lower.includes('tile')) return 'Ceramics';
  if (lower.includes('concrete') || lower.includes('precast') || lower.includes('ready-mix')) return 'Concrete';
  if (lower.includes('copper')) return 'Copper';
  if (lower.includes('glass') || lower.includes('glazing')) return 'Glass';
  if (lower.includes('insulation') || lower.includes('eps') || lower.includes('xps') || lower.includes('mineral wool')) return 'Insulation';
  if (lower.includes('steel') || lower.includes('rebar') || lower.includes('reinforcement')) return 'Steel';
  if (lower.includes('timber') || lower.includes('wood') || lower.includes('clt') || lower.includes('glulam')) return 'Timber';
  if (lower.includes('plaster') || lower.includes('gypsum') || lower.includes('plasterboard')) return 'Plaster';
  if (lower.includes('paint') || lower.includes('coating')) return 'Paint';
  if (lower.includes('plastic') || lower.includes('pvc') || lower.includes('hdpe') || lower.includes('ldpe')) return 'Plastics';
  if (lower.includes('rubber')) return 'Rubber';
  if (lower.includes('vinyl') || lower.includes('linoleum')) return 'Vinyl';
  if (lower.includes('iron')) return 'Iron';
  if (lower.includes('lead')) return 'Lead';
  if (lower.includes('lime')) return 'Lime';
  if (lower.includes('zinc')) return 'Zinc';
  if (lower.includes('stone') || lower.includes('marble') || lower.includes('granite')) return 'Stone';

  return 'General';
}

// Infer unit from material name and EF value
function inferUnitFromValue(efValue: number, materialName: string): string {
  const lower = materialName.toLowerCase();

  // Wall composites are per m2
  if (lower.includes('wall') || lower.includes('per m2') || lower.includes('per sqm')) return 'm²';
  if (lower.includes('per m3') || lower.includes('per cubic')) return 'm³';
  if (lower.includes('single brick') || lower.includes('one brick')) return 'unit';

  // Most ICE data is per kg
  return 'kg';
}

// Parse a row using positional detection
function parseICERowPositional(
  row: Record<string, unknown>,
  positions: ColumnPositions,
  currentCategory: string
): ICEMaterial | null {
  try {
    const materialName = String(row[positions.materialNameCol!] || '').trim();
    const efValue = row[positions.efTotalCol!];

    // Parse EF value
    let ef_total: number;
    if (typeof efValue === 'number') {
      ef_total = efValue;
    } else {
      const cleaned = String(efValue || '').replace(/[^\d.-]/g, '');
      ef_total = parseFloat(cleaned);
    }

    if (isNaN(ef_total) || ef_total < 0) return null;

    // Get canonical name if available (often more accurate)
    let canonicalName = materialName;
    if (positions.canonicalNameCol) {
      const canonical = row[positions.canonicalNameCol];
      if (canonical && typeof canonical === 'string' && canonical.trim().length > 2) {
        canonicalName = canonical.trim();
      }
    }

    // Get DQI score if available
    let dqiScore: string | undefined;
    if (positions.dqiCol) {
      const dqi = row[positions.dqiCol];
      if (dqi) {
        dqiScore = String(dqi).trim();
      }
    }

    // Infer category from material name or use current section category
    const category = inferCategoryFromName(canonicalName || materialName) || currentCategory || 'General';
    const unit = inferUnitFromValue(ef_total, canonicalName || materialName);

    return {
      material_name: normalizeMaterialName(canonicalName || materialName),
      material_category: category,
      subcategory: null,
      unit,
      ef_total,
      data_source: 'ICE V4.1 - Circular Ecology',
      region: 'UK',
      data_quality_rating: dqiScore || null,
      notes: dqiScore ? `DQI: ${dqiScore}` : null,
      year: 2025,
      eco_platform_compliant: true
    };
  } catch (error) {
    console.error('[ICE Import] Error parsing row:', error);
    return null;
  }
}

// Standard row parsing (when column names are properly detected)
function parseICERow(row: Record<string, unknown>): ICEMaterial | null {
  const rawName = findColumnValue(row, 'material_name');
  const rawCategory = findColumnValue(row, 'material_category');
  const rawSubcat = findColumnValue(row, 'subcategory');
  const rawUnit = findColumnValue(row, 'unit');
  const rawEfTotal = findColumnValue(row, 'ef_total');
  const rawEfA1A3 = findColumnValue(row, 'ef_a1a3');
  const rawDqi = findColumnValue(row, 'data_quality');
  const rawNotes = findColumnValue(row, 'notes');
  const rawYear = findColumnValue(row, 'year');

  const materialName = rawName ? String(rawName).trim() : '';
  const efTotal = parseFloat(String(rawEfTotal || '0'));

  // Skip rows without valid material name or EF
  if (!materialName || materialName.length < 2 || isNaN(efTotal) || efTotal <= 0) {
    return null;
  }

  // Skip category headers
  if (isCategoryHeader(materialName)) {
    return null;
  }

  // Skip header rows
  if (isHeaderRow(row)) {
    return null;
  }

  const efA1A3 = parseFloat(String(rawEfA1A3 || '0'));
  const year = parseInt(String(rawYear || '2025'));

  // Infer category if not provided
  const category = rawCategory
    ? String(rawCategory).trim()
    : inferCategoryFromName(materialName);

  return {
    material_name: normalizeMaterialName(materialName),
    material_category: category || 'Uncategorized',
    subcategory: rawSubcat ? String(rawSubcat).trim() : undefined,
    unit: normalizeUnit(String(rawUnit || 'kg')),
    ef_total: efTotal,
    ef_a1a3: isNaN(efA1A3) || efA1A3 <= 0 ? undefined : efA1A3,
    data_source: 'ICE V4.1 - Circular Ecology',
    data_quality_rating: rawDqi ? String(rawDqi).trim() : undefined,
    notes: rawNotes ? String(rawNotes).trim() : undefined,
    year: isNaN(year) ? 2025 : year,
    region: 'UK',
    eco_platform_compliant: true,
  };
}

// Main parsing function - uses positional detection for __EMPTY columns
function parseICEMaterials(rows: Record<string, unknown>[]): ICEMaterial[] {
  if (rows.length === 0) return [];

  // Check if we have __EMPTY columns
  const firstRow = rows[0];
  const usePositionalDetection = hasEmptyColumnNames(firstRow);

  console.log(`[ICE Import] Processing ${rows.length} rows, positional detection: ${usePositionalDetection}`);

  if (usePositionalDetection) {
    // Use position-based detection for non-standard column names
    const positions = detectColumnPositions(rows);

    if (!positions.materialNameCol || !positions.efTotalCol) {
      console.error('[ICE Import] Could not detect required columns:', positions);
      // Fall back to standard parsing
      console.log('[ICE Import] Falling back to standard column mapping');
    } else {
      const materials: ICEMaterial[] = [];
      let currentCategory = 'General';
      let skippedRows = 0;

      for (const row of rows) {
        // Track current category from section headers
        const firstCell = Object.values(row)[0];
        if (typeof firstCell === 'string' && isCategoryHeader(firstCell)) {
          currentCategory = firstCell.trim();
          continue;
        }

        // Skip header rows and invalid rows
        if (!isValidMaterialRowPositional(row, positions)) {
          skippedRows++;
          continue;
        }

        const material = parseICERowPositional(row, positions, currentCategory);
        if (material) {
          materials.push(material);
        }
      }

      console.log(`[ICE Import] Positional parsing: ${materials.length} valid materials, skipped ${skippedRows} rows`);

      // Log sample of parsed materials for debugging
      if (materials.length > 0) {
        console.log('[ICE Import] Sample materials:', JSON.stringify(materials.slice(0, 3), null, 2));
      }

      return materials;
    }
  }

  // Standard column-name based parsing
  const materials: ICEMaterial[] = [];
  let skippedRows = 0;

  for (const row of rows) {
    const material = parseICERow(row);
    if (material) {
      materials.push(material);
    } else {
      skippedRows++;
    }
  }

  console.log(`[ICE Import] Standard parsing: ${materials.length} valid materials, skipped ${skippedRows} rows`);

  if (materials.length > 0) {
    console.log('[ICE Import] Sample materials:', JSON.stringify(materials.slice(0, 3), null, 2));
  }

  return materials;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Check admin role (optional - allow any authenticated user for now)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!roleData;
    console.log(`User ${user.id} is admin: ${isAdmin}`);

    const body = await req.json();
    const { materials, dryRun = false, jobId, useIndividualSheets = false } = body;

    if (!materials || !Array.isArray(materials)) {
      throw new Error('Invalid request: materials array required');
    }

    console.log(`Processing ${materials.length} ICE materials (dryRun: ${dryRun}, jobId: ${jobId || 'none'}, useIndividualSheets: ${useIndividualSheets})`);

    // Log first row's keys for debugging column mapping
    if (materials.length > 0) {
      const sampleRow = materials[0];
      const columnNames = Object.keys(sampleRow);
      console.log(`Detected ${columnNames.length} columns in data:`, columnNames.slice(0, 10).join(', '));
      console.log('Sample row values:', JSON.stringify(sampleRow).slice(0, 500));
    }

    // Parse materials using the unified parsing function
    const parsed = parseICEMaterials(materials);

    if (parsed.length === 0) {
      console.error('[ICE Import] No materials parsed from input!');
      console.error('[ICE Import] Input sample:', JSON.stringify(materials.slice(0, 2)).slice(0, 500));
    }

    // Deduplicate by material name + unit
    const seenKeys = new Set<string>();
    const dedupedMaterials: ICEMaterial[] = [];
    let duplicatesSkipped = 0;

    for (const material of parsed) {
      const dedupeKey = `${material.material_name}|${material.unit}`;
      if (seenKeys.has(dedupeKey)) {
        duplicatesSkipped++;
        continue;
      }
      seenKeys.add(dedupeKey);
      dedupedMaterials.push(material);
    }

    const errors: { row: number; error: string }[] = [];
    const errorCount = materials.length - parsed.length;

    // Add error entries for unparseable rows
    for (let i = 0; i < Math.min(errorCount, 20); i++) {
      errors.push({ row: i, error: 'Invalid or empty material data' });
    }

    console.log(`Parsed ${dedupedMaterials.length} valid materials, ${errorCount} parse errors, ${duplicatesSkipped} duplicates skipped`);

    if (dedupedMaterials.length === 0 && !dryRun) {
      throw new Error(`No valid materials found in input. Parsed 0 out of ${materials.length} rows. Check that the spreadsheet has the correct format and column mappings.`);
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          validCount: dedupedMaterials.length,
          errorCount,
          duplicatesSkipped,
          preview: dedupedMaterials.slice(0, 10),
          errors: errors.slice(0, 20),
          categories: [...new Set(dedupedMaterials.map(m => m.material_category))],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to materials_epd schema with proper data source for dedupe index
    const records = dedupedMaterials.map(m => ({
      material_name: m.material_name,
      material_category: m.material_category,
      subcategory: m.subcategory || null,
      unit: m.unit,
      ef_total: m.ef_total,
      ef_a1a3: m.ef_a1a3 || null,
      data_source: 'ICE Database', // Must match the unique index condition
      data_quality_rating: m.data_quality_rating || null,
      notes: m.notes || null,
      year: m.year,
      region: 'UK',
      eco_platform_compliant: false,
      ecoinvent_methodology: 'hybrid',
      updated_at: new Date().toISOString(),
    }));

    // Batch upsert with conflict handling
    const batchSize = 100;
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      // Use upsert with the unique constraint on (material_name, data_source, unit)
      const { data, error, count } = await supabase
        .from('materials_epd')
        .upsert(batch, {
          onConflict: 'material_name,data_source,unit',
          ignoreDuplicates: false,
        })
        .select('id');

      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error);
        console.error(`Error details:`, JSON.stringify(error));
        // Continue with other batches instead of failing entirely
        errors.push({ row: i, error: `Batch insert failed: ${error.message}` });
        continue;
      }

      const batchCount = data?.length || 0;
      inserted += batchCount;

      // Update job progress if jobId provided
      if (jobId) {
        await supabase
          .from('ice_import_jobs')
          .update({
            processed_rows: Math.min(i + batchSize, records.length),
            imported_count: inserted,
          })
          .eq('id', jobId);
      }

      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, total: ${inserted}`);
    }

    // Update job as completed if jobId provided
    if (jobId) {
      await supabase
        .from('ice_import_jobs')
        .update({
          status: 'completed',
          processed_rows: records.length,
          imported_count: inserted,
          skipped_count: duplicatesSkipped,
          error_count: errors.length,
          errors: errors.slice(0, 100),
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return new Response(
      JSON.stringify({
        success: inserted > 0 || dedupedMaterials.length === 0,
        dryRun: false,
        inserted,
        updated,
        validCount: dedupedMaterials.length,
        errorCount: errors.length,
        duplicatesSkipped,
        categories: [...new Set(dedupedMaterials.map(m => m.material_category))],
        errors: errors.slice(0, 20),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ICE import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
