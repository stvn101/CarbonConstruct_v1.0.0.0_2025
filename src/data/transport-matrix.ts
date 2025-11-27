/**
 * Transport Matrix for A4 Transport Emissions (Material Delivery)
 * Based on Australian NGA emission factors and typical construction logistics
 */

export interface TransportMode {
  id: string;
  name: string;
  co2e_kg_per_tkm: number; // kg CO2e per tonne-kilometre
  description: string;
}

export interface TransportRoute {
  id: string;
  from_region: string;
  to_region: string;
  distance_km: number;
  default_mode: string;
}

export interface TransportCalculation {
  material_tonnes: number;
  distance_km: number;
  mode: string;
  emissions_kg: number;
}

// Australian transport emission factors (kg CO2e per tonne-km)
// Source: National Greenhouse Accounts Factors 2024
export const TRANSPORT_MODES: TransportMode[] = [
  {
    id: 'rigid_truck_small',
    name: 'Rigid Truck (< 3.5t)',
    co2e_kg_per_tkm: 0.207,
    description: 'Light rigid trucks for small deliveries'
  },
  {
    id: 'rigid_truck_medium',
    name: 'Rigid Truck (3.5-12t)',
    co2e_kg_per_tkm: 0.143,
    description: 'Medium rigid trucks for general materials'
  },
  {
    id: 'rigid_truck_heavy',
    name: 'Rigid Truck (> 12t)',
    co2e_kg_per_tkm: 0.089,
    description: 'Heavy rigid trucks for bulk materials'
  },
  {
    id: 'articulated_truck',
    name: 'Articulated Truck (Semi)',
    co2e_kg_per_tkm: 0.062,
    description: 'Semi-trailers for long-haul bulk transport'
  },
  {
    id: 'b_double',
    name: 'B-Double',
    co2e_kg_per_tkm: 0.048,
    description: 'B-Double for high-volume interstate transport'
  },
  {
    id: 'concrete_agitator',
    name: 'Concrete Agitator',
    co2e_kg_per_tkm: 0.156,
    description: 'Ready-mix concrete delivery trucks'
  },
  {
    id: 'rail_freight',
    name: 'Rail Freight',
    co2e_kg_per_tkm: 0.021,
    description: 'Rail transport (where available)'
  },
  {
    id: 'ship_coastal',
    name: 'Coastal Shipping',
    co2e_kg_per_tkm: 0.016,
    description: 'Coastal shipping for ports'
  }
];

// Australian postcode regions with major supply hubs
export const REGIONS: { id: string; name: string; state: string; postcodes: string }[] = [
  // NSW
  { id: 'sydney_cbd', name: 'Sydney CBD', state: 'NSW', postcodes: '2000-2010' },
  { id: 'sydney_west', name: 'Western Sydney', state: 'NSW', postcodes: '2140-2200' },
  { id: 'sydney_north', name: 'Northern Sydney', state: 'NSW', postcodes: '2060-2090' },
  { id: 'sydney_south', name: 'Southern Sydney', state: 'NSW', postcodes: '2200-2234' },
  { id: 'newcastle', name: 'Newcastle', state: 'NSW', postcodes: '2280-2320' },
  { id: 'wollongong', name: 'Wollongong', state: 'NSW', postcodes: '2500-2530' },
  { id: 'central_coast', name: 'Central Coast', state: 'NSW', postcodes: '2250-2263' },
  
  // VIC
  { id: 'melbourne_cbd', name: 'Melbourne CBD', state: 'VIC', postcodes: '3000-3010' },
  { id: 'melbourne_west', name: 'Western Melbourne', state: 'VIC', postcodes: '3011-3030' },
  { id: 'melbourne_north', name: 'Northern Melbourne', state: 'VIC', postcodes: '3040-3090' },
  { id: 'melbourne_east', name: 'Eastern Melbourne', state: 'VIC', postcodes: '3100-3150' },
  { id: 'melbourne_south', name: 'Southern Melbourne', state: 'VIC', postcodes: '3160-3200' },
  { id: 'geelong', name: 'Geelong', state: 'VIC', postcodes: '3210-3230' },
  
  // QLD
  { id: 'brisbane_cbd', name: 'Brisbane CBD', state: 'QLD', postcodes: '4000-4010' },
  { id: 'brisbane_north', name: 'Brisbane North', state: 'QLD', postcodes: '4051-4080' },
  { id: 'brisbane_south', name: 'Brisbane South', state: 'QLD', postcodes: '4100-4130' },
  { id: 'gold_coast', name: 'Gold Coast', state: 'QLD', postcodes: '4210-4230' },
  { id: 'sunshine_coast', name: 'Sunshine Coast', state: 'QLD', postcodes: '4550-4580' },
  { id: 'townsville', name: 'Townsville', state: 'QLD', postcodes: '4810-4820' },
  { id: 'cairns', name: 'Cairns', state: 'QLD', postcodes: '4868-4880' },
  
  // SA
  { id: 'adelaide_cbd', name: 'Adelaide CBD', state: 'SA', postcodes: '5000-5010' },
  { id: 'adelaide_north', name: 'Adelaide North', state: 'SA', postcodes: '5070-5120' },
  { id: 'adelaide_south', name: 'Adelaide South', state: 'SA', postcodes: '5040-5065' },
  
  // WA
  { id: 'perth_cbd', name: 'Perth CBD', state: 'WA', postcodes: '6000-6010' },
  { id: 'perth_north', name: 'Perth North', state: 'WA', postcodes: '6020-6060' },
  { id: 'perth_south', name: 'Perth South', state: 'WA', postcodes: '6100-6170' },
  { id: 'fremantle', name: 'Fremantle', state: 'WA', postcodes: '6158-6168' },
  
  // TAS
  { id: 'hobart', name: 'Hobart', state: 'TAS', postcodes: '7000-7020' },
  { id: 'launceston', name: 'Launceston', state: 'TAS', postcodes: '7248-7260' },
  
  // NT
  { id: 'darwin', name: 'Darwin', state: 'NT', postcodes: '0800-0830' },
  { id: 'alice_springs', name: 'Alice Springs', state: 'NT', postcodes: '0870-0872' },
  
  // ACT
  { id: 'canberra', name: 'Canberra', state: 'ACT', postcodes: '2600-2620' }
];

// Pre-calculated distances between major regions (km)
// Based on road distances for typical construction material routes
export const TRANSPORT_ROUTES: TransportRoute[] = [
  // Sydney internal
  { id: 'syd_cbd_west', from_region: 'sydney_cbd', to_region: 'sydney_west', distance_km: 35, default_mode: 'rigid_truck_heavy' },
  { id: 'syd_cbd_north', from_region: 'sydney_cbd', to_region: 'sydney_north', distance_km: 20, default_mode: 'rigid_truck_heavy' },
  { id: 'syd_cbd_south', from_region: 'sydney_cbd', to_region: 'sydney_south', distance_km: 25, default_mode: 'rigid_truck_heavy' },
  
  // Sydney to regional NSW
  { id: 'syd_newcastle', from_region: 'sydney_cbd', to_region: 'newcastle', distance_km: 160, default_mode: 'articulated_truck' },
  { id: 'syd_wollongong', from_region: 'sydney_cbd', to_region: 'wollongong', distance_km: 85, default_mode: 'articulated_truck' },
  { id: 'syd_central_coast', from_region: 'sydney_cbd', to_region: 'central_coast', distance_km: 90, default_mode: 'articulated_truck' },
  { id: 'syd_canberra', from_region: 'sydney_cbd', to_region: 'canberra', distance_km: 290, default_mode: 'articulated_truck' },
  
  // Melbourne internal
  { id: 'mel_cbd_west', from_region: 'melbourne_cbd', to_region: 'melbourne_west', distance_km: 20, default_mode: 'rigid_truck_heavy' },
  { id: 'mel_cbd_north', from_region: 'melbourne_cbd', to_region: 'melbourne_north', distance_km: 18, default_mode: 'rigid_truck_heavy' },
  { id: 'mel_cbd_east', from_region: 'melbourne_cbd', to_region: 'melbourne_east', distance_km: 22, default_mode: 'rigid_truck_heavy' },
  { id: 'mel_cbd_south', from_region: 'melbourne_cbd', to_region: 'melbourne_south', distance_km: 30, default_mode: 'rigid_truck_heavy' },
  { id: 'mel_geelong', from_region: 'melbourne_cbd', to_region: 'geelong', distance_km: 75, default_mode: 'articulated_truck' },
  
  // Brisbane internal
  { id: 'bne_cbd_north', from_region: 'brisbane_cbd', to_region: 'brisbane_north', distance_km: 15, default_mode: 'rigid_truck_heavy' },
  { id: 'bne_cbd_south', from_region: 'brisbane_cbd', to_region: 'brisbane_south', distance_km: 18, default_mode: 'rigid_truck_heavy' },
  { id: 'bne_gold_coast', from_region: 'brisbane_cbd', to_region: 'gold_coast', distance_km: 80, default_mode: 'articulated_truck' },
  { id: 'bne_sunshine', from_region: 'brisbane_cbd', to_region: 'sunshine_coast', distance_km: 100, default_mode: 'articulated_truck' },
  
  // Interstate routes (long haul)
  { id: 'syd_mel', from_region: 'sydney_cbd', to_region: 'melbourne_cbd', distance_km: 880, default_mode: 'b_double' },
  { id: 'syd_bne', from_region: 'sydney_cbd', to_region: 'brisbane_cbd', distance_km: 920, default_mode: 'b_double' },
  { id: 'mel_ade', from_region: 'melbourne_cbd', to_region: 'adelaide_cbd', distance_km: 730, default_mode: 'b_double' },
  { id: 'bne_cairns', from_region: 'brisbane_cbd', to_region: 'cairns', distance_km: 1700, default_mode: 'b_double' },
  { id: 'bne_townsville', from_region: 'brisbane_cbd', to_region: 'townsville', distance_km: 1350, default_mode: 'b_double' },
  { id: 'per_ade', from_region: 'perth_cbd', to_region: 'adelaide_cbd', distance_km: 2700, default_mode: 'b_double' },
  
  // Perth internal
  { id: 'per_cbd_north', from_region: 'perth_cbd', to_region: 'perth_north', distance_km: 20, default_mode: 'rigid_truck_heavy' },
  { id: 'per_cbd_south', from_region: 'perth_cbd', to_region: 'perth_south', distance_km: 18, default_mode: 'rigid_truck_heavy' },
  { id: 'per_fremantle', from_region: 'perth_cbd', to_region: 'fremantle', distance_km: 22, default_mode: 'rigid_truck_heavy' },
  
  // Adelaide internal
  { id: 'ade_cbd_north', from_region: 'adelaide_cbd', to_region: 'adelaide_north', distance_km: 15, default_mode: 'rigid_truck_heavy' },
  { id: 'ade_cbd_south', from_region: 'adelaide_cbd', to_region: 'adelaide_south', distance_km: 12, default_mode: 'rigid_truck_heavy' },
  
  // Tasmania (requires shipping)
  { id: 'mel_hobart', from_region: 'melbourne_cbd', to_region: 'hobart', distance_km: 650, default_mode: 'ship_coastal' },
  { id: 'mel_launceston', from_region: 'melbourne_cbd', to_region: 'launceston', distance_km: 480, default_mode: 'ship_coastal' },
  
  // NT routes
  { id: 'ade_darwin', from_region: 'adelaide_cbd', to_region: 'darwin', distance_km: 3000, default_mode: 'b_double' },
  { id: 'darwin_alice', from_region: 'darwin', to_region: 'alice_springs', distance_km: 1500, default_mode: 'b_double' }
];

// Material-specific transport defaults
export interface MaterialTransportDefault {
  materialCategory: string;
  defaultMode: string;
  typicalDistance_km: number;
  notes: string;
}

export const MATERIAL_TRANSPORT_DEFAULTS: MaterialTransportDefault[] = [
  { materialCategory: 'concrete', defaultMode: 'concrete_agitator', typicalDistance_km: 30, notes: 'Ready-mix must be delivered within ~90 minutes' },
  { materialCategory: 'cement', defaultMode: 'articulated_truck', typicalDistance_km: 150, notes: 'Bulk cement from regional plants' },
  { materialCategory: 'steel', defaultMode: 'articulated_truck', typicalDistance_km: 200, notes: 'From steel mills/distributors' },
  { materialCategory: 'timber', defaultMode: 'articulated_truck', typicalDistance_km: 300, notes: 'From mills/treatment plants' },
  { materialCategory: 'brick', defaultMode: 'rigid_truck_heavy', typicalDistance_km: 100, notes: 'From local brick manufacturers' },
  { materialCategory: 'glass', defaultMode: 'rigid_truck_medium', typicalDistance_km: 80, notes: 'Fragile - requires careful handling' },
  { materialCategory: 'insulation', defaultMode: 'rigid_truck_heavy', typicalDistance_km: 150, notes: 'Light but bulky' },
  { materialCategory: 'plasterboard', defaultMode: 'rigid_truck_heavy', typicalDistance_km: 100, notes: 'From local distributors' },
  { materialCategory: 'aluminium', defaultMode: 'articulated_truck', typicalDistance_km: 250, notes: 'From fabricators/smelters' },
  { materialCategory: 'roofing', defaultMode: 'rigid_truck_heavy', typicalDistance_km: 120, notes: 'From manufacturers' }
];

// Helper functions
export function getTransportMode(modeId: string): TransportMode | undefined {
  return TRANSPORT_MODES.find(m => m.id === modeId);
}

export function getRegionByPostcode(postcode: string): typeof REGIONS[0] | undefined {
  const pc = parseInt(postcode);
  return REGIONS.find(r => {
    const [start, end] = r.postcodes.split('-').map(p => parseInt(p));
    return pc >= start && pc <= end;
  });
}

export function findRoute(fromRegion: string, toRegion: string): TransportRoute | undefined {
  return TRANSPORT_ROUTES.find(r => 
    (r.from_region === fromRegion && r.to_region === toRegion) ||
    (r.from_region === toRegion && r.to_region === fromRegion)
  );
}

export function getMaterialTransportDefault(category: string): MaterialTransportDefault | undefined {
  return MATERIAL_TRANSPORT_DEFAULTS.find(m => 
    m.materialCategory.toLowerCase() === category.toLowerCase()
  );
}

export function calculateA4Emissions(
  materialTonnes: number,
  distanceKm: number,
  modeId: string
): TransportCalculation {
  const mode = getTransportMode(modeId);
  const emissionFactor = mode?.co2e_kg_per_tkm || 0.089; // Default to heavy rigid
  
  const emissions_kg = materialTonnes * distanceKm * emissionFactor;
  
  return {
    material_tonnes: materialTonnes,
    distance_km: distanceKm,
    mode: modeId,
    emissions_kg: Math.round(emissions_kg * 100) / 100
  };
}

export function estimateDistanceByPostcodes(
  fromPostcode: string,
  toPostcode: string
): { distance_km: number; route?: TransportRoute; estimated: boolean } {
  const fromRegion = getRegionByPostcode(fromPostcode);
  const toRegion = getRegionByPostcode(toPostcode);
  
  if (!fromRegion || !toRegion) {
    // Estimate based on postcode difference for unknown postcodes
    const diff = Math.abs(parseInt(fromPostcode) - parseInt(toPostcode));
    return { distance_km: Math.max(50, diff * 0.5), estimated: true };
  }
  
  if (fromRegion.id === toRegion.id) {
    return { distance_km: 15, estimated: false }; // Same region
  }
  
  const route = findRoute(fromRegion.id, toRegion.id);
  if (route) {
    return { distance_km: route.distance_km, route, estimated: false };
  }
  
  // Estimate based on state
  if (fromRegion.state === toRegion.state) {
    return { distance_km: 150, estimated: true }; // Same state, no direct route
  }
  
  // Different states - estimate based on typical interstate distances
  return { distance_km: 500, estimated: true };
}
