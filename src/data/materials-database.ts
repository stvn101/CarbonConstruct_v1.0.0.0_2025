/**
 * Local Materials Database - No Supabase dependency
 * Comprehensive schema designed for Australian construction materials
 * Sources: NABERS 2025, ICM Database 2019, AusLCI, Open CEDA
 */

export interface Material {
  // Core identification
  id: string;
  name: string;
  category: MaterialCategory;
  subcategory: string;
  
  // Units & measurement
  unit: MaterialUnit;
  density_kg_per_m3?: number; // For unit conversions
  
  // Emission factors (kg CO2e per declared unit)
  // EN 15804 LCA Stages
  ef_a1a3: number;           // Product stage (cradle-to-gate) - MOST IMPORTANT
  ef_a4?: number;            // Transport to site
  ef_a5?: number;            // Construction/installation
  ef_b1b5?: number;          // Use stage
  ef_c1c4?: number;          // End of life
  ef_d?: number;             // Benefits beyond system boundary
  ef_total: number;          // Total embodied carbon
  
  // Data quality & uncertainty
  data_source: DataSource;
  data_quality_tier: DataQualityTier;
  uncertainty_percent?: number;
  
  // Australian context
  region: AustralianRegion;
  suppliers?: string[];
  recycled_content_percent?: number;
  carbon_sequestration_kg?: number; // For timber (negative value)
  
  // Metadata
  year: number;
  epd_url?: string;
  notes?: string;
  is_verified: boolean;
}

export type MaterialCategory = 
  | 'concrete'
  | 'cement'
  | 'steel'
  | 'aluminium'
  | 'timber'
  | 'glass'
  | 'insulation'
  | 'plasterboard'
  | 'brick'
  | 'roofing'
  | 'flooring'
  | 'paint'
  | 'adhesives'
  | 'waterproofing'
  | 'plastics'
  | 'mechanical'
  | 'electrical'
  | 'plumbing'
  | 'other';

export type MaterialUnit = 
  | 'kg'
  | 'm3'      // cubic meters
  | 'm2'      // square meters
  | 'm'       // linear meters
  | 'each'
  | 'tonne'
  | 'L'       // liters
  | 'kWh';

export type DataSource = 
  | 'NABERS_2025'
  | 'ICM_2019'
  | 'AusLCI'
  | 'Open_CEDA'
  | 'EPD_Australasia'
  | 'ICE_Database'
  | 'Custom';

export type DataQualityTier = 
  | 'tier_1'  // Excellent - Product-specific EPD
  | 'tier_2'  // Good - Industry average EPD
  | 'tier_3'  // Fair - Generic database
  | 'tier_4'  // Poor - Estimate/proxy
  | 'unrated';

export type AustralianRegion = 
  | 'National'
  | 'NSW'
  | 'VIC'
  | 'QLD'
  | 'SA'
  | 'WA'
  | 'TAS'
  | 'NT'
  | 'ACT';

// Australian Construction Materials - Verified Data
export const materialsDatabase: Material[] = [
  // ============================================
  // CONCRETE & CEMENT (40% of building emissions)
  // ============================================
  {
    id: 'concrete-20mpa',
    name: 'Ready Mix Concrete 20MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 320,
    ef_total: 320,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Boral', 'Holcim', 'Hanson'],
    year: 2025,
    notes: 'Most common residential concrete strength - footings, slabs',
    is_verified: true
  },
  {
    id: 'concrete-25mpa',
    name: 'Ready Mix Concrete 25MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 365,
    ef_total: 365,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Boral', 'Holcim', 'Hanson'],
    year: 2025,
    notes: 'Standard commercial/residential strength',
    is_verified: true
  },
  {
    id: 'concrete-32mpa',
    name: 'Ready Mix Concrete 32MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 420,
    ef_total: 420,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Boral', 'Holcim', 'Hanson'],
    year: 2025,
    notes: 'Higher cement content = higher carbon',
    is_verified: true
  },
  {
    id: 'concrete-40mpa',
    name: 'Ready Mix Concrete 40MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 480,
    ef_total: 480,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Boral', 'Holcim', 'Hanson'],
    year: 2025,
    notes: 'High strength structural concrete',
    is_verified: true
  },
  {
    id: 'concrete-50mpa',
    name: 'Ready Mix Concrete 50MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 540,
    ef_total: 540,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'High-rise structural applications',
    is_verified: true
  },
  {
    id: 'concrete-block-190mm',
    name: 'Concrete Masonry Unit 190mm',
    category: 'concrete',
    subcategory: 'masonry',
    unit: 'each',
    ef_a1a3: 2.6,
    ef_total: 2.6,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Standard concrete block',
    is_verified: true
  },
  {
    id: 'cement-gp',
    name: 'General Purpose Cement (GP)',
    category: 'cement',
    subcategory: 'portland',
    unit: 'kg',
    ef_a1a3: 0.82,
    ef_total: 0.82,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Standard Portland cement',
    is_verified: true
  },
  {
    id: 'cement-blended',
    name: 'Blended Cement (GB)',
    category: 'cement',
    subcategory: 'blended',
    unit: 'kg',
    ef_a1a3: 0.59,
    ef_total: 0.59,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Contains supplementary cementitious materials',
    is_verified: true
  },

  // ============================================
  // STEEL & METALS (25% of building emissions)
  // ============================================
  {
    id: 'rebar-500e-12mm',
    name: 'Reinforcing Bar 500E 12mm',
    category: 'steel',
    subcategory: 'reinforcing',
    unit: 'kg',
    ef_a1a3: 1.65,
    ef_total: 1.65,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['InfraBuild', 'Arrium'],
    recycled_content_percent: 90,
    year: 2025,
    notes: 'Made from recycled cars and appliances',
    is_verified: true
  },
  {
    id: 'rebar-500e-16mm',
    name: 'Reinforcing Bar 500E 16mm',
    category: 'steel',
    subcategory: 'reinforcing',
    unit: 'kg',
    ef_a1a3: 1.65,
    ef_total: 1.65,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['InfraBuild', 'Arrium'],
    recycled_content_percent: 90,
    year: 2025,
    notes: 'Most common residential rebar size',
    is_verified: true
  },
  {
    id: 'steel-mesh-sl82',
    name: 'Steel Reinforcing Mesh SL82',
    category: 'steel',
    subcategory: 'mesh',
    unit: 'kg',
    ef_a1a3: 1.70,
    ef_total: 1.70,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['InfraBuild', 'Smorgon Steel'],
    year: 2025,
    notes: 'Standard slab mesh, 6mm @ 200mm centers',
    is_verified: true
  },
  {
    id: 'structural-steel-ub',
    name: 'Structural Steel Universal Beam',
    category: 'steel',
    subcategory: 'structural',
    unit: 'kg',
    ef_a1a3: 1.75,
    ef_total: 1.75,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['BlueScope', 'InfraBuild'],
    recycled_content_percent: 85,
    year: 2025,
    notes: 'Hot rolled sections, high recycled content',
    is_verified: true
  },
  {
    id: 'colorbond-roofing',
    name: 'COLORBOND Steel Roofing 0.42mm',
    category: 'roofing',
    subcategory: 'metal',
    unit: 'm2',
    ef_a1a3: 11.8,
    ef_total: 11.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['BlueScope Steel'],
    year: 2025,
    notes: 'Iconic Australian product, Port Kembla manufacture',
    is_verified: true
  },
  {
    id: 'aluminium-primary',
    name: 'Aluminium Primary',
    category: 'aluminium',
    subcategory: 'primary',
    unit: 'kg',
    ef_a1a3: 20.4,
    ef_total: 22.0,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'High embodied carbon - consider alternatives',
    is_verified: true
  },
  {
    id: 'aluminium-secondary',
    name: 'Aluminium Secondary (Recycled)',
    category: 'aluminium',
    subcategory: 'recycled',
    unit: 'kg',
    ef_a1a3: 1.68,
    ef_total: 1.97,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    recycled_content_percent: 100,
    year: 2019,
    notes: 'From old scrap - 90% less carbon than primary',
    is_verified: true
  },

  // ============================================
  // TIMBER (Carbon storing - can be negative)
  // ============================================
  {
    id: 'pine-h2-90x45',
    name: 'H2 Treated Pine Framing 90x45mm',
    category: 'timber',
    subcategory: 'softwood-treated',
    unit: 'kg',
    density_kg_per_m3: 550,
    ef_a1a3: 0.35,
    ef_total: 0.35,
    carbon_sequestration_kg: -1.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Tilling Timber', 'ITI Australia'],
    year: 2025,
    notes: 'Plantation grown, sustainable, carbon negative',
    is_verified: true
  },
  {
    id: 'pine-h2-90x35',
    name: 'H2 Treated Pine Framing 90x35mm',
    category: 'timber',
    subcategory: 'softwood-treated',
    unit: 'kg',
    density_kg_per_m3: 550,
    ef_a1a3: 0.35,
    ef_total: 0.35,
    carbon_sequestration_kg: -1.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Tilling Timber', 'ITI Australia'],
    year: 2025,
    notes: 'Lightweight framing',
    is_verified: true
  },
  {
    id: 'hardwood-structural',
    name: 'Hardwood Structural Timber',
    category: 'timber',
    subcategory: 'hardwood',
    unit: 'kg',
    density_kg_per_m3: 850,
    ef_a1a3: 0.45,
    ef_total: 0.45,
    carbon_sequestration_kg: -1.6,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Australian hardwood species',
    is_verified: true
  },
  {
    id: 'plywood-structural',
    name: 'Structural Plywood',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm2',
    ef_a1a3: 3.2,
    ef_total: 3.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Per m² at 12mm thickness',
    is_verified: true
  },
  {
    id: 'lvl-beam',
    name: 'Laminated Veneer Lumber (LVL)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    ef_a1a3: 450,
    ef_total: 450,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Engineered timber beam',
    is_verified: true
  },
  {
    id: 'glulam-beam',
    name: 'Glue Laminated Timber (Glulam)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    ef_a1a3: 380,
    ef_total: 380,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Low carbon alternative to steel beams',
    is_verified: true
  },
  {
    id: 'clt-panel',
    name: 'Cross Laminated Timber (CLT)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    ef_a1a3: 320,
    ef_total: 320,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Mass timber panels - replaces concrete',
    is_verified: true
  },

  // ============================================
  // GLASS
  // ============================================
  {
    id: 'float-glass-4mm',
    name: 'Float Glass 4mm',
    category: 'glass',
    subcategory: 'float',
    unit: 'm2',
    ef_a1a3: 6.8,
    ef_total: 6.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Standard window glass',
    is_verified: true
  },
  {
    id: 'float-glass-6mm',
    name: 'Float Glass 6mm',
    category: 'glass',
    subcategory: 'float',
    unit: 'm2',
    ef_a1a3: 10.2,
    ef_total: 10.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Thicker window glass',
    is_verified: true
  },
  {
    id: 'double-glazed-unit',
    name: 'Double Glazed Unit (IGU)',
    category: 'glass',
    subcategory: 'insulated',
    unit: 'm2',
    ef_a1a3: 25.5,
    ef_total: 25.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: '4mm-12mm air-4mm typical',
    is_verified: true
  },

  // ============================================
  // INSULATION
  // ============================================
  {
    id: 'glasswool-r2.5',
    name: 'Glasswool Batts R2.5',
    category: 'insulation',
    subcategory: 'mineral-wool',
    unit: 'm2',
    ef_a1a3: 1.35,
    ef_total: 1.35,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['CSR Bradford', 'Knauf'],
    recycled_content_percent: 80,
    year: 2025,
    notes: 'Wall insulation, high recycled content',
    is_verified: true
  },
  {
    id: 'glasswool-r4.0',
    name: 'Glasswool Batts R4.0',
    category: 'insulation',
    subcategory: 'mineral-wool',
    unit: 'm2',
    ef_a1a3: 2.1,
    ef_total: 2.1,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['CSR Bradford', 'Knauf'],
    recycled_content_percent: 80,
    year: 2025,
    notes: 'Ceiling insulation',
    is_verified: true
  },
  {
    id: 'xps-insulation',
    name: 'Extruded Polystyrene (XPS)',
    category: 'insulation',
    subcategory: 'foam',
    unit: 'm3',
    ef_a1a3: 105,
    ef_total: 105,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'High carbon - use mineral wool where possible',
    is_verified: true
  },
  {
    id: 'eps-insulation',
    name: 'Expanded Polystyrene (EPS)',
    category: 'insulation',
    subcategory: 'foam',
    unit: 'm3',
    ef_a1a3: 88,
    ef_total: 88,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Lower carbon than XPS',
    is_verified: true
  },

  // ============================================
  // PLASTERBOARD & LININGS
  // ============================================
  {
    id: 'plasterboard-10mm',
    name: 'Plasterboard 10mm Standard',
    category: 'plasterboard',
    subcategory: 'standard',
    unit: 'm2',
    ef_a1a3: 2.4,
    ef_total: 2.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['CSR Gyprock', 'Knauf', 'BGC'],
    year: 2025,
    notes: 'Standard internal lining',
    is_verified: true
  },
  {
    id: 'plasterboard-13mm',
    name: 'Plasterboard 13mm Standard',
    category: 'plasterboard',
    subcategory: 'standard',
    unit: 'm2',
    ef_a1a3: 3.1,
    ef_total: 3.1,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['CSR Gyprock', 'Knauf', 'BGC'],
    year: 2025,
    notes: 'Most common thickness',
    is_verified: true
  },
  {
    id: 'plasterboard-fire-rated',
    name: 'Plasterboard Fire Rated (Fyrchek)',
    category: 'plasterboard',
    subcategory: 'fire-rated',
    unit: 'm2',
    ef_a1a3: 4.2,
    ef_total: 4.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['CSR Gyprock', 'Knauf'],
    year: 2025,
    notes: 'Fire-rated applications',
    is_verified: true
  },
  {
    id: 'fibre-cement-6mm',
    name: 'Fibre Cement Sheet 6mm',
    category: 'plasterboard',
    subcategory: 'fibre-cement',
    unit: 'm2',
    ef_a1a3: 5.8,
    ef_total: 5.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    suppliers: ['James Hardie'],
    year: 2025,
    notes: 'External cladding, wet areas',
    is_verified: true
  },

  // ============================================
  // BRICK & MASONRY
  // ============================================
  {
    id: 'clay-brick-standard',
    name: 'Clay Brick Standard',
    category: 'brick',
    subcategory: 'clay',
    unit: 'each',
    ef_a1a3: 0.63,
    ef_total: 0.63,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    suppliers: ['Austral Bricks', 'PGH Bricks'],
    year: 2025,
    notes: 'Standard 230x110x76mm brick',
    is_verified: true
  },
  {
    id: 'clay-brick-per-kg',
    name: 'Clay Brick',
    category: 'brick',
    subcategory: 'clay',
    unit: 'kg',
    ef_a1a3: 0.25,
    ef_total: 0.30,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'Per kg basis for quantity calculations',
    is_verified: true
  },

  // ============================================
  // FLOORING
  // ============================================
  {
    id: 'ceramic-tiles',
    name: 'Ceramic Floor Tiles',
    category: 'flooring',
    subcategory: 'ceramic',
    unit: 'm2',
    ef_a1a3: 12.5,
    ef_total: 12.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Standard ceramic tiles',
    is_verified: true
  },
  {
    id: 'porcelain-tiles',
    name: 'Porcelain Floor Tiles',
    category: 'flooring',
    subcategory: 'porcelain',
    unit: 'm2',
    ef_a1a3: 15.8,
    ef_total: 15.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Higher firing temperature than ceramic',
    is_verified: true
  },
  {
    id: 'carpet-tiles',
    name: 'Carpet Tiles (Nylon)',
    category: 'flooring',
    subcategory: 'carpet',
    unit: 'm2',
    ef_a1a3: 8.2,
    ef_total: 8.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Commercial carpet tiles',
    is_verified: true
  },
  {
    id: 'vinyl-flooring',
    name: 'Vinyl Sheet Flooring',
    category: 'flooring',
    subcategory: 'vinyl',
    unit: 'm2',
    ef_a1a3: 6.5,
    ef_total: 6.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Commercial vinyl flooring',
    is_verified: true
  },

  // ============================================
  // PAINT & COATINGS
  // ============================================
  {
    id: 'acrylic-paint',
    name: 'Acrylic Paint (Water-based)',
    category: 'paint',
    subcategory: 'water-based',
    unit: 'L',
    ef_a1a3: 2.1,
    ef_total: 2.1,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    suppliers: ['Dulux', 'Taubmans', 'Wattyl'],
    year: 2025,
    notes: 'Interior/exterior acrylic',
    is_verified: true
  },
  {
    id: 'alkyd-paint',
    name: 'Alkyd Paint (Solvent-based)',
    category: 'paint',
    subcategory: 'solvent-based',
    unit: 'L',
    ef_a1a3: 3.2,
    ef_total: 4.6,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2019,
    notes: 'Higher emissions than water-based',
    is_verified: true
  },

  // ============================================
  // WATERPROOFING & MEMBRANES
  // ============================================
  {
    id: 'bitumen-membrane',
    name: 'Bitumen Waterproof Membrane',
    category: 'waterproofing',
    subcategory: 'bitumen',
    unit: 'm2',
    ef_a1a3: 4.8,
    ef_total: 4.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Roof and below-ground waterproofing',
    is_verified: true
  },
  {
    id: 'pvc-membrane',
    name: 'PVC Waterproof Membrane',
    category: 'waterproofing',
    subcategory: 'synthetic',
    unit: 'm2',
    ef_a1a3: 6.2,
    ef_total: 6.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Single-ply roofing membrane',
    is_verified: true
  },

  // ============================================
  // ADHESIVES & SEALANTS
  // ============================================
  {
    id: 'tile-adhesive',
    name: 'Tile Adhesive (Cement-based)',
    category: 'adhesives',
    subcategory: 'cement-based',
    unit: 'kg',
    ef_a1a3: 1.35,
    ef_total: 1.78,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2019,
    notes: 'Standard tile adhesive mortar',
    is_verified: true
  },
  {
    id: 'silicone-sealant',
    name: 'Silicone Sealant',
    category: 'adhesives',
    subcategory: 'sealant',
    unit: 'kg',
    ef_a1a3: 5.2,
    ef_total: 5.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'General purpose silicone',
    is_verified: true
  },

  // ============================================
  // PLASTICS & POLYMERS
  // ============================================
  {
    id: 'pvc-pipe',
    name: 'PVC Pipe',
    category: 'plastics',
    subcategory: 'pvc',
    unit: 'kg',
    ef_a1a3: 3.1,
    ef_total: 3.1,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Drainage and water supply',
    is_verified: true
  },
  {
    id: 'hdpe-pipe',
    name: 'HDPE Pipe',
    category: 'plastics',
    subcategory: 'hdpe',
    unit: 'kg',
    ef_a1a3: 2.4,
    ef_total: 2.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'High density polyethylene',
    is_verified: true
  },
  {
    id: 'polycarbonate-sheet',
    name: 'Polycarbonate Sheet',
    category: 'plastics',
    subcategory: 'polycarbonate',
    unit: 'm2',
    ef_a1a3: 8.5,
    ef_total: 8.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Roofing/skylights at 6mm',
    is_verified: true
  },

  // ============================================
  // ADDITIONAL CONCRETE (NABERS 2025)
  // ============================================
  {
    id: 'concrete-10mpa',
    name: 'Ready Mix Concrete 10MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 273,
    ef_total: 273,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    uncertainty_percent: 10,
    region: 'National',
    year: 2025,
    notes: 'Low strength concrete for backfill/blinding',
    is_verified: true
  },
  {
    id: 'concrete-65mpa',
    name: 'Ready Mix Concrete 65MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 640,
    ef_total: 640,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'High strength - high rise columns',
    is_verified: true
  },
  {
    id: 'concrete-80mpa',
    name: 'Ready Mix Concrete 80MPa',
    category: 'concrete',
    subcategory: 'ready-mix',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 690,
    ef_total: 690,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Very high strength concrete',
    is_verified: true
  },
  {
    id: 'concrete-precast-panel',
    name: 'Precast Concrete Panel (inc. reinforcing)',
    category: 'concrete',
    subcategory: 'precast',
    unit: 'tonne',
    ef_a1a3: 439,
    ef_total: 439,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Wall, deck, or balcony panel with reinforcing',
    is_verified: true
  },
  {
    id: 'concrete-hollowcore',
    name: 'Hollow Core Precast Slab',
    category: 'concrete',
    subcategory: 'precast',
    unit: 'm3',
    density_kg_per_m3: 1480,
    ef_a1a3: 428,
    ef_total: 428,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Per m³ including voids, with reinforcing',
    is_verified: true
  },
  {
    id: 'aac-block',
    name: 'AAC Block (Hebel)',
    category: 'concrete',
    subcategory: 'aac',
    unit: 'm3',
    density_kg_per_m3: 435,
    ef_a1a3: 278,
    ef_total: 278,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Autoclaved Aerated Concrete blocks',
    is_verified: true
  },
  {
    id: 'aac-panel',
    name: 'AAC Panel (inc. reinforcing)',
    category: 'concrete',
    subcategory: 'aac',
    unit: 'kg',
    ef_a1a3: 0.641,
    ef_total: 0.641,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Hebel panels with reinforcement',
    is_verified: true
  },
  {
    id: 'concrete-20mpa-30fly',
    name: 'Concrete 20MPa 30% Fly Ash',
    category: 'concrete',
    subcategory: 'low-carbon',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 236,
    ef_total: 281,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'Lower carbon with fly ash SCM',
    is_verified: true
  },
  {
    id: 'concrete-32mpa-30ggbfs',
    name: 'Concrete 32MPa 30% GGBFS',
    category: 'concrete',
    subcategory: 'low-carbon',
    unit: 'm3',
    density_kg_per_m3: 2400,
    ef_a1a3: 332,
    ef_total: 393,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'Lower carbon with slag cement',
    is_verified: true
  },

  // ============================================
  // ADDITIONAL STEEL (NABERS 2025)
  // ============================================
  {
    id: 'reinforcing-steel-bar-mesh',
    name: 'Reinforcing Steel (Bar & Mesh)',
    category: 'steel',
    subcategory: 'reinforcing',
    unit: 'tonne',
    ef_a1a3: 3650,
    ef_total: 3650,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Includes rebar, mesh, fibre, cages, strand',
    is_verified: true
  },
  {
    id: 'structural-steel-hot-rolled',
    name: 'Structural Steel (Hot Rolled)',
    category: 'steel',
    subcategory: 'structural',
    unit: 'tonne',
    ef_a1a3: 3910,
    ef_total: 3910,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Beams, columns, angles, hollow sections',
    is_verified: true
  },
  {
    id: 'structural-steel-cold-rolled',
    name: 'Structural Steel (Cold Rolled)',
    category: 'steel',
    subcategory: 'framing',
    unit: 'tonne',
    ef_a1a3: 4050,
    ef_total: 4050,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Formwork, decking, lightweight framing',
    is_verified: true
  },
  {
    id: 'structural-steel-galvanised',
    name: 'Structural Steel (Galvanised)',
    category: 'steel',
    subcategory: 'structural',
    unit: 'tonne',
    ef_a1a3: 4190,
    ef_total: 4190,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Hot-dip galvanised structural sections',
    is_verified: true
  },
  {
    id: 'stainless-steel',
    name: 'Stainless Steel',
    category: 'steel',
    subcategory: 'stainless',
    unit: 'tonne',
    ef_a1a3: 5990,
    ef_total: 5990,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'General stainless steel',
    is_verified: true
  },
  {
    id: 'steel-cladding-metallic',
    name: 'Steel Cladding (Metallic Coat)',
    category: 'steel',
    subcategory: 'cladding',
    unit: 'm2',
    ef_a1a3: 64,
    ef_total: 64,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Zincalume and similar coated steel',
    is_verified: true
  },
  {
    id: 'steel-cladding-painted',
    name: 'Steel Cladding (Painted/COLORBOND)',
    category: 'steel',
    subcategory: 'cladding',
    unit: 'm2',
    ef_a1a3: 25.4,
    ef_total: 25.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2025,
    notes: 'Painted steel cladding 0.42-1.0mm BMT',
    is_verified: true
  },

  // ============================================
  // ADDITIONAL ALUMINIUM (NABERS 2025)
  // ============================================
  {
    id: 'aluminium-cladding',
    name: 'Aluminium Sheeting/Cladding',
    category: 'aluminium',
    subcategory: 'cladding',
    unit: 'kg',
    ef_a1a3: 20.8,
    ef_total: 20.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Various thicknesses',
    is_verified: true
  },
  {
    id: 'aluminium-extruded-uncoated',
    name: 'Aluminium Extruded (Uncoated)',
    category: 'aluminium',
    subcategory: 'extruded',
    unit: 'tonne',
    ef_a1a3: 30200,
    ef_total: 30200,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Curtain walls, facades, framing',
    is_verified: true
  },
  {
    id: 'aluminium-extruded-powder-coated',
    name: 'Aluminium Extruded (Powder Coated)',
    category: 'aluminium',
    subcategory: 'extruded',
    unit: 'tonne',
    ef_a1a3: 32000,
    ef_total: 32000,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Window frames, louvres, external shading',
    is_verified: true
  },
  {
    id: 'aluminium-extruded-anodised',
    name: 'Aluminium Extruded (Anodised)',
    category: 'aluminium',
    subcategory: 'extruded',
    unit: 'tonne',
    ef_a1a3: 34200,
    ef_total: 34200,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Anodised finish for durability',
    is_verified: true
  },

  // ============================================
  // ADDITIONAL TIMBER (NABERS 2025)
  // ============================================
  {
    id: 'timber-softwood-m3',
    name: 'Softwood Timber',
    category: 'timber',
    subcategory: 'softwood',
    unit: 'm3',
    density_kg_per_m3: 514,
    ef_a1a3: 349,
    ef_total: 349,
    carbon_sequestration_kg: -857,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Radiata pine - treated/untreated',
    is_verified: true
  },
  {
    id: 'timber-hardwood-m3',
    name: 'Hardwood Timber',
    category: 'timber',
    subcategory: 'hardwood',
    unit: 'm3',
    density_kg_per_m3: 744,
    ef_a1a3: 591,
    ef_total: 591,
    carbon_sequestration_kg: -1170,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Australian hardwood species',
    is_verified: true
  },
  {
    id: 'plywood-m3',
    name: 'Plywood',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    density_kg_per_m3: 509,
    ef_a1a3: 968,
    ef_total: 968,
    carbon_sequestration_kg: -841,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Bracing, structural, formwork',
    is_verified: true
  },
  {
    id: 'particleboard-m3',
    name: 'Particleboard',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    density_kg_per_m3: 711,
    ef_a1a3: 880,
    ef_total: 880,
    carbon_sequestration_kg: -1140,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Walling, flooring applications',
    is_verified: true
  },
  {
    id: 'mdf-m3',
    name: 'Medium Density Fibreboard (MDF)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    density_kg_per_m3: 722,
    ef_a1a3: 1320,
    ef_total: 1320,
    carbon_sequestration_kg: -1230,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Decorative wall panels, joinery',
    is_verified: true
  },
  {
    id: 'osb-m3',
    name: 'Oriented Strand Board (OSB)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    density_kg_per_m3: 610,
    ef_a1a3: 461,
    ef_total: 461,
    carbon_sequestration_kg: -1020,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Sheathing, flooring substrate',
    is_verified: true
  },
  {
    id: 'clt-softwood',
    name: 'CLT/GLT (Softwood)',
    category: 'timber',
    subcategory: 'mass-timber',
    unit: 'm3',
    density_kg_per_m3: 518,
    ef_a1a3: 565,
    ef_total: 565,
    carbon_sequestration_kg: -823,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Mass timber - replaces concrete/steel',
    is_verified: true
  },
  {
    id: 'clt-hardwood',
    name: 'CLT/GLT (Hardwood)',
    category: 'timber',
    subcategory: 'mass-timber',
    unit: 'm3',
    density_kg_per_m3: 674,
    ef_a1a3: 841,
    ef_total: 841,
    carbon_sequestration_kg: -1090,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Mass timber from hardwood',
    is_verified: true
  },
  {
    id: 'lvl-m3',
    name: 'Laminated Veneer Lumber (LVL)',
    category: 'timber',
    subcategory: 'engineered',
    unit: 'm3',
    density_kg_per_m3: 507,
    ef_a1a3: 442,
    ef_total: 442,
    carbon_sequestration_kg: -843,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Structural beams and headers',
    is_verified: true
  },
  {
    id: 'timber-weatherboard',
    name: 'Timber Weatherboards',
    category: 'timber',
    subcategory: 'cladding',
    unit: 'm3',
    density_kg_per_m3: 512,
    ef_a1a3: 349,
    ef_total: 349,
    carbon_sequestration_kg: -848,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'External timber cladding',
    is_verified: true
  },

  // ============================================
  // ADDITIONAL FLOORING (NABERS 2025)
  // ============================================
  {
    id: 'carpet-flooring',
    name: 'Carpet Flooring (General)',
    category: 'flooring',
    subcategory: 'carpet',
    unit: 'm2',
    ef_a1a3: 34.2,
    ef_total: 34.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Various carpet types',
    is_verified: true
  },
  {
    id: 'vinyl-flooring-commercial',
    name: 'Vinyl Flooring (Commercial)',
    category: 'flooring',
    subcategory: 'vinyl',
    unit: 'm2',
    ef_a1a3: 37.8,
    ef_total: 37.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Commercial grade vinyl',
    is_verified: true
  },
  {
    id: 'rubber-flooring',
    name: 'Rubber Flooring',
    category: 'flooring',
    subcategory: 'rubber',
    unit: 'm2',
    ef_a1a3: 19.5,
    ef_total: 19.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Gyms, commercial spaces',
    is_verified: true
  },
  {
    id: 'laminate-flooring',
    name: 'Laminate Flooring',
    category: 'flooring',
    subcategory: 'laminate',
    unit: 'm2',
    ef_a1a3: 5.69,
    ef_total: 5.69,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Click-lock laminate',
    is_verified: true
  },
  {
    id: 'hybrid-flooring',
    name: 'Hybrid Flooring (SPC/WPC)',
    category: 'flooring',
    subcategory: 'hybrid',
    unit: 'm2',
    ef_a1a3: 15.6,
    ef_total: 15.6,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Stone/wood plastic composite',
    is_verified: true
  },
  {
    id: 'linoleum-flooring',
    name: 'Linoleum Flooring',
    category: 'flooring',
    subcategory: 'linoleum',
    unit: 'm2',
    ef_a1a3: 3.99,
    ef_total: 3.99,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Natural material flooring',
    is_verified: true
  },
  {
    id: 'epoxy-flooring',
    name: 'Epoxy Flooring',
    category: 'flooring',
    subcategory: 'epoxy',
    unit: 'kg',
    ef_a1a3: 3.84,
    ef_total: 3.84,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Concrete floor coating',
    is_verified: true
  },
  {
    id: 'access-flooring',
    name: 'Access/Raised Flooring',
    category: 'flooring',
    subcategory: 'access',
    unit: 'm2',
    ef_a1a3: 83.6,
    ef_total: 83.6,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Data centres, commercial offices',
    is_verified: true
  },

  // ============================================
  // WINDOWS & DOORS (NABERS 2025)
  // ============================================
  {
    id: 'window-aluminium-generic',
    name: 'Window - Aluminium Frame',
    category: 'glass',
    subcategory: 'windows',
    unit: 'm2',
    ef_a1a3: 255,
    ef_total: 255,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Generic aluminium framed window',
    is_verified: true
  },
  {
    id: 'window-timber-generic',
    name: 'Window - Timber Frame',
    category: 'glass',
    subcategory: 'windows',
    unit: 'm2',
    ef_a1a3: 327,
    ef_total: 327,
    carbon_sequestration_kg: -5.99,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Generic timber framed window',
    is_verified: true
  },
  {
    id: 'door-timber-glazed',
    name: 'Door - Timber with Glazing',
    category: 'glass',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 78.4,
    ef_total: 78.4,
    carbon_sequestration_kg: -27.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Timber door with glass panels',
    is_verified: true
  },
  {
    id: 'door-steel-glazed',
    name: 'Door - Steel with Glazing',
    category: 'glass',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 190,
    ef_total: 190,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Steel door with glass panels',
    is_verified: true
  },
  {
    id: 'door-aluminium-glazed',
    name: 'Door - Aluminium with Glazing',
    category: 'glass',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 415,
    ef_total: 415,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Aluminium framed glass door',
    is_verified: true
  },
  {
    id: 'door-timber-solid',
    name: 'Door - Timber Solid',
    category: 'timber',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 117,
    ef_total: 117,
    carbon_sequestration_kg: -68.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Solid timber internal/external door',
    is_verified: true
  },
  {
    id: 'door-steel-solid',
    name: 'Door - Steel Solid',
    category: 'steel',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 399,
    ef_total: 399,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Solid steel door',
    is_verified: true
  },
  {
    id: 'roller-door',
    name: 'Roller/Garage Door',
    category: 'steel',
    subcategory: 'doors',
    unit: 'm2',
    ef_a1a3: 132,
    ef_total: 132,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Sectional/roller doors with motor',
    is_verified: true
  },

  // ============================================
  // WALL SYSTEMS (NABERS 2025)
  // ============================================
  {
    id: 'wall-steel-1side-pb',
    name: 'Wall System - Steel Frame 1 Side PB',
    category: 'plasterboard',
    subcategory: 'wall-systems',
    unit: 'm2',
    ef_a1a3: 15,
    ef_total: 15,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: '92mm stud, single plasterboard',
    is_verified: true
  },
  {
    id: 'wall-steel-2side-pb',
    name: 'Wall System - Steel Frame 2 Sides PB',
    category: 'plasterboard',
    subcategory: 'wall-systems',
    unit: 'm2',
    ef_a1a3: 20.8,
    ef_total: 20.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: '92mm stud, double plasterboard',
    is_verified: true
  },
  {
    id: 'wall-timber-2side-pb',
    name: 'Wall System - Timber Frame 2 Sides PB',
    category: 'plasterboard',
    subcategory: 'wall-systems',
    unit: 'm2',
    ef_a1a3: 15,
    ef_total: 15,
    carbon_sequestration_kg: -9.43,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Timber stud with double plasterboard',
    is_verified: true
  },
  {
    id: 'ceiling-steel-suspended-pb',
    name: 'Ceiling System - Steel Suspended PB',
    category: 'plasterboard',
    subcategory: 'ceiling-systems',
    unit: 'm2',
    ef_a1a3: 10.7,
    ef_total: 10.7,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Suspended plasterboard ceiling',
    is_verified: true
  },
  {
    id: 'ceiling-tile',
    name: 'Ceiling Tile (Mineral)',
    category: 'plasterboard',
    subcategory: 'ceiling-systems',
    unit: 'm2',
    ef_a1a3: 7.95,
    ef_total: 7.95,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Suspended ceiling tiles',
    is_verified: true
  },

  // ============================================
  // BRICK & MASONRY (NABERS 2025 + ICM)
  // ============================================
  {
    id: 'clay-brick-tonne',
    name: 'Clay Brick',
    category: 'brick',
    subcategory: 'clay',
    unit: 'tonne',
    ef_a1a3: 464,
    ef_total: 464,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Fired clay masonry bricks',
    is_verified: true
  },
  {
    id: 'concrete-brick-tonne',
    name: 'Concrete Brick/Block',
    category: 'brick',
    subcategory: 'concrete',
    unit: 'tonne',
    ef_a1a3: 264,
    ef_total: 264,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Concrete masonry units',
    is_verified: true
  },
  {
    id: 'stone-brick-tonne',
    name: 'Stone Brick/Paver',
    category: 'brick',
    subcategory: 'stone',
    unit: 'tonne',
    ef_a1a3: 542,
    ef_total: 542,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Natural stone masonry',
    is_verified: true
  },

  // ============================================
  // AGGREGATES (NABERS 2025)
  // ============================================
  {
    id: 'aggregate-quarry',
    name: 'Quarried Aggregate/Fill',
    category: 'concrete',
    subcategory: 'aggregate',
    unit: 'tonne',
    ef_a1a3: 10.2,
    ef_total: 10.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Road base, backfill, ballast',
    is_verified: true
  },
  {
    id: 'aggregate-recycled',
    name: 'Recycled Aggregate',
    category: 'concrete',
    subcategory: 'aggregate',
    unit: 'tonne',
    ef_a1a3: 11.5,
    ef_total: 11.5,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'From crushed recycled concrete',
    is_verified: true
  },
  {
    id: 'stabilised-sand',
    name: 'Stabilised Sand',
    category: 'concrete',
    subcategory: 'aggregate',
    unit: 'm3',
    density_kg_per_m3: 1760,
    ef_a1a3: 361,
    ef_total: 361,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Sand with stabiliser 7-25%',
    is_verified: true
  },
  {
    id: 'asphalt',
    name: 'Asphalt Mix',
    category: 'concrete',
    subcategory: 'asphalt',
    unit: 'tonne',
    ef_a1a3: 141,
    ef_total: 141,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'General asphalt mix',
    is_verified: true
  },

  // ============================================
  // ROOFING (NABERS 2025)
  // ============================================
  {
    id: 'roof-tiles-clay',
    name: 'Clay/Terracotta Roof Tiles',
    category: 'roofing',
    subcategory: 'tiles',
    unit: 'tonne',
    ef_a1a3: 682,
    ef_total: 682,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Traditional clay tiles',
    is_verified: true
  },
  {
    id: 'roof-tiles-concrete',
    name: 'Concrete Roof Tiles',
    category: 'roofing',
    subcategory: 'tiles',
    unit: 'tonne',
    ef_a1a3: 264,
    ef_total: 264,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Concrete roof tiles',
    is_verified: true
  },

  // ============================================
  // INSULATION (NABERS 2025)
  // ============================================
  {
    id: 'rockwool-insulation',
    name: 'Rockwool/Stone Wool Insulation',
    category: 'insulation',
    subcategory: 'mineral-wool',
    unit: 'kg',
    ef_a1a3: 3.63,
    ef_total: 4.23,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2019,
    notes: 'Fire-resistant mineral wool',
    is_verified: true
  },
  {
    id: 'polyurethane-insulation',
    name: 'Polyurethane Foam Insulation',
    category: 'insulation',
    subcategory: 'foam',
    unit: 'kg',
    ef_a1a3: 4.8,
    ef_total: 4.8,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_3',
    region: 'National',
    year: 2025,
    notes: 'Spray foam or rigid boards',
    is_verified: true
  },

  // ============================================
  // MEP (NABERS 2025)
  // ============================================
  {
    id: 'mep-office-low-rise',
    name: 'MEP Services - Office/Retail (Low Rise)',
    category: 'mechanical',
    subcategory: 'building-services',
    unit: 'm2',
    ef_a1a3: 67,
    ef_total: 67,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'M&E&P for ≤10 floor buildings',
    is_verified: true
  },
  {
    id: 'mep-residential',
    name: 'MEP Services - Residential',
    category: 'mechanical',
    subcategory: 'building-services',
    unit: 'm2',
    ef_a1a3: 57.4,
    ef_total: 57.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Mechanical, electrical, plumbing',
    is_verified: true
  },
  {
    id: 'mep-warehouse',
    name: 'MEP Services - Warehouse/Industrial',
    category: 'mechanical',
    subcategory: 'building-services',
    unit: 'm2',
    ef_a1a3: 13.4,
    ef_total: 13.4,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Basic services for industrial',
    is_verified: true
  },

  // ============================================
  // COPPER & PLUMBING (ICM 2019)
  // ============================================
  {
    id: 'copper-pipe',
    name: 'Copper Pipe/Tube',
    category: 'plumbing',
    subcategory: 'copper',
    unit: 'kg',
    ef_a1a3: 4.04,
    ef_total: 5.39,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'Water supply, HVAC',
    is_verified: true
  },
  {
    id: 'copper-secondary',
    name: 'Copper (Recycled)',
    category: 'plumbing',
    subcategory: 'copper',
    unit: 'kg',
    ef_a1a3: 1.87,
    ef_total: 2.34,
    recycled_content_percent: 100,
    data_source: 'ICM_2019',
    data_quality_tier: 'tier_1',
    region: 'National',
    year: 2019,
    notes: 'Secondary copper from recycling',
    is_verified: true
  },

  // ============================================
  // CURTAIN WALL (NABERS 2025)
  // ============================================
  {
    id: 'curtain-wall-type1',
    name: 'Curtain Wall - 100% DGU',
    category: 'glass',
    subcategory: 'curtain-wall',
    unit: 'm2',
    ef_a1a3: 435,
    ef_total: 435,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Aluminium unitised 100% double glazing',
    is_verified: true
  },
  {
    id: 'curtain-wall-type2',
    name: 'Curtain Wall - Aluminium Clad 50% DGU',
    category: 'glass',
    subcategory: 'curtain-wall',
    unit: 'm2',
    ef_a1a3: 656,
    ef_total: 656,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'With aluminium spandrel panels',
    is_verified: true
  },
  {
    id: 'curtain-wall-double-skin',
    name: 'Curtain Wall - Double Skin Facade',
    category: 'glass',
    subcategory: 'curtain-wall',
    unit: 'm2',
    ef_a1a3: 1300,
    ef_total: 1300,
    data_source: 'NABERS_2025',
    data_quality_tier: 'unrated',
    region: 'National',
    year: 2025,
    notes: 'Deep cavity double skin facade',
    is_verified: true
  },

  // ============================================
  // GRC & SPECIALIST (NABERS 2025)
  // ============================================
  {
    id: 'grc',
    name: 'Glass Reinforced Concrete (GRC)',
    category: 'concrete',
    subcategory: 'grc',
    unit: 'tonne',
    ef_a1a3: 869,
    ef_total: 869,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_4',
    region: 'National',
    year: 2025,
    notes: 'Architectural cladding panels',
    is_verified: true
  },
  {
    id: 'structural-insulated-panel-100',
    name: 'SIP Panel (≤100mm)',
    category: 'insulation',
    subcategory: 'sip',
    unit: 'm2',
    ef_a1a3: 67.2,
    ef_total: 67.2,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Structural insulated panels thin',
    is_verified: true
  },
  {
    id: 'structural-insulated-panel-thick',
    name: 'SIP Panel (>100mm)',
    category: 'insulation',
    subcategory: 'sip',
    unit: 'm2',
    ef_a1a3: 89,
    ef_total: 89,
    data_source: 'NABERS_2025',
    data_quality_tier: 'tier_2',
    region: 'National',
    year: 2025,
    notes: 'Structural insulated panels thick',
    is_verified: true
  }
];

// Helper functions for database operations
export function getMaterialById(id: string): Material | undefined {
  return materialsDatabase.find(m => m.id === id);
}

export function getMaterialsByCategory(category: MaterialCategory): Material[] {
  return materialsDatabase.filter(m => m.category === category);
}

export function searchMaterials(query: string): Material[] {
  const lowerQuery = query.toLowerCase();
  return materialsDatabase.filter(m => 
    m.name.toLowerCase().includes(lowerQuery) ||
    m.category.toLowerCase().includes(lowerQuery) ||
    m.subcategory.toLowerCase().includes(lowerQuery) ||
    m.notes?.toLowerCase().includes(lowerQuery)
  );
}

export function getMaterialCategories(): MaterialCategory[] {
  return [...new Set(materialsDatabase.map(m => m.category))];
}

export function getUnitLabel(unit: MaterialUnit): string {
  const labels: Record<MaterialUnit, string> = {
    kg: 'kg',
    m3: 'm³',
    m2: 'm²',
    m: 'm',
    each: 'each',
    tonne: 't',
    L: 'L',
    kWh: 'kWh'
  };
  return labels[unit];
}

export function getCategoryLabel(category: MaterialCategory): string {
  const labels: Record<MaterialCategory, string> = {
    concrete: 'Concrete & Cement',
    cement: 'Cement',
    steel: 'Steel & Metals',
    aluminium: 'Aluminium',
    timber: 'Timber',
    glass: 'Glass',
    insulation: 'Insulation',
    plasterboard: 'Plasterboard & Linings',
    brick: 'Brick & Masonry',
    roofing: 'Roofing',
    flooring: 'Flooring',
    paint: 'Paint & Coatings',
    adhesives: 'Adhesives & Sealants',
    waterproofing: 'Waterproofing',
    plastics: 'Plastics & Polymers',
    mechanical: 'Mechanical Services',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    other: 'Other'
  };
  return labels[category];
}
