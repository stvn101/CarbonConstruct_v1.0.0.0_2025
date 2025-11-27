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
