// Scope 3 Category-Specific Field Configurations
// Aligned with ISO 14064-1, NGER, NCC 2024, and Australian construction standards

import { z } from "zod";

export interface CategoryField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'multiselect';
  options?: { value: string; label: string }[];
  unit?: string;
  required?: boolean;
  description?: string;
  conditional?: { field: string; value: any };
  presets?: any[];
}

// Australian States for location-based emission factors
export const australianStates = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'International', label: 'International' },
];

// Transport modes for Australian context
export const transportModes = [
  { value: 'road_light', label: 'Road - Light Truck' },
  { value: 'road_medium', label: 'Road - Medium Truck' },
  { value: 'road_heavy', label: 'Road - Heavy Truck' },
  { value: 'road_rigid', label: 'Road - Rigid Truck' },
  { value: 'road_semi', label: 'Road - Semi-trailer' },
  { value: 'road_bdouble', label: 'Road - B-Double' },
  { value: 'rail_freight', label: 'Rail - Freight' },
  { value: 'sea_container', label: 'Sea - Container Ship' },
  { value: 'sea_bulk', label: 'Sea - Bulk Carrier' },
  { value: 'air_freight', label: 'Air - Freight' },
  { value: 'multimodal', label: 'Multimodal' },
];

// Vehicle types for Australian fleet
export const vehicleTypes = [
  { value: 'small_car', label: 'Small Car' },
  { value: 'medium_car', label: 'Medium Car' },
  { value: 'large_car', label: 'Large Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'ute', label: 'Ute' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Motorcycle' },
];

// Fuel types aligned with NGER
export const fuelTypes = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol (Gasoline)' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG (Compressed Natural Gas)' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid_petrol', label: 'Hybrid - Petrol' },
  { value: 'hybrid_diesel', label: 'Hybrid - Diesel' },
  { value: 'biodiesel', label: 'Biodiesel' },
  { value: 'ethanol', label: 'Ethanol' },
];

// Waste types for Australian construction
export const wasteTypes = [
  { value: 'general_construction', label: 'General Construction Waste' },
  { value: 'concrete_masonry', label: 'Concrete & Masonry' },
  { value: 'timber', label: 'Timber' },
  { value: 'metal_steel', label: 'Metal & Steel' },
  { value: 'cardboard_paper', label: 'Cardboard & Paper' },
  { value: 'plastics', label: 'Plastics' },
  { value: 'insulation', label: 'Insulation Materials' },
  { value: 'asphalt', label: 'Asphalt' },
  { value: 'hazardous', label: 'Hazardous Waste' },
  { value: 'green_waste', label: 'Green Waste' },
];

// Disposal methods aligned with Australian waste hierarchy
export const disposalMethods = [
  { value: 'landfill', label: 'Landfill' },
  { value: 'recycling', label: 'Recycling' },
  { value: 'composting', label: 'Composting' },
  { value: 'incineration', label: 'Incineration (Energy Recovery)' },
  { value: 'reuse_onsite', label: 'Reuse On-Site' },
  { value: 'reuse_offsite', label: 'Reuse Off-Site' },
];

// Construction equipment types
export const equipmentTypes = [
  { value: 'excavator', label: 'Excavator' },
  { value: 'crane_tower', label: 'Tower Crane' },
  { value: 'crane_mobile', label: 'Mobile Crane' },
  { value: 'concrete_pump', label: 'Concrete Pump' },
  { value: 'scaffolding', label: 'Scaffolding System' },
  { value: 'site_office', label: 'Site Office/Facility' },
  { value: 'formwork', label: 'Formwork System' },
  { value: 'compactor', label: 'Compactor' },
  { value: 'generator', label: 'Generator' },
];

// Category-specific field configurations
export const categoryFields: Record<number, CategoryField[]> = {
  // Category 1: Purchased Goods and Services
  1: [
    { name: 'material_type', label: 'Material Type', type: 'select', required: true, options: [
      { value: 'concrete', label: 'Concrete' },
      { value: 'steel', label: 'Steel' },
      { value: 'timber', label: 'Timber' },
      { value: 'aluminium', label: 'Aluminium' },
      { value: 'glass', label: 'Glass' },
      { value: 'brick', label: 'Brick' },
      { value: 'insulation', label: 'Insulation' },
      { value: 'plasterboard', label: 'Plasterboard' },
      { value: 'paint', label: 'Paint & Coatings' },
      { value: 'aggregate', label: 'Aggregates' },
    ]},
    { name: 'material_grade', label: 'Material Grade/Specification', type: 'text', description: 'e.g., N32 concrete, 500MPa steel' },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'tonnes', label: 'Tonnes' },
      { value: 'm3', label: 'Cubic Metres (m³)' },
      { value: 'm2', label: 'Square Metres (m²)' },
      { value: 'kg', label: 'Kilograms' },
      { value: 'units', label: 'Units/Items' },
    ]},
    { name: 'supplier_location', label: 'Supplier Location', type: 'select', required: true, options: australianStates },
    { name: 'transport_distance', label: 'Transport Distance to Site (km)', type: 'number' },
    { name: 'recycled_content', label: 'Recycled Content (%)', type: 'number', description: '0-100%' },
    { name: 'epd_available', label: 'EPD Available', type: 'toggle', description: 'Environmental Product Declaration' },
    { name: 'epd_reference', label: 'EPD Reference Number', type: 'text', conditional: { field: 'epd_available', value: true } },
    { name: 'emission_factor', label: 'Embodied Carbon Factor (kg CO2-e per unit)', type: 'number', required: true, description: 'Auto-populated based on material or enter manually' },
  ],
  
  // Category 2: Capital Goods
  2: [
    { name: 'equipment_type', label: 'Equipment Type', type: 'select', required: true, options: equipmentTypes },
    { name: 'equipment_spec', label: 'Equipment Specification', type: 'text', description: 'Model, capacity, etc.' },
    { name: 'purchase_cost', label: 'Purchase/Lease Cost (AUD)', type: 'number' },
    { name: 'lifespan_years', label: 'Estimated Lifespan (years)', type: 'number', required: true },
    { name: 'equipment_weight', label: 'Equipment Weight (tonnes)', type: 'number' },
    { name: 'manufacturing_location', label: 'Manufacturing Location', type: 'select', options: australianStates },
    { name: 'depreciation_method', label: 'Depreciation Method', type: 'select', options: [
      { value: 'straight_line', label: 'Straight Line' },
      { value: 'project_allocation', label: 'Project Allocation' },
    ]},
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per $1000 AUD or per tonne)', type: 'number', required: true },
  ],
  
  // Category 3: Fuel and Energy Activities (Upstream)
  3: [
    { name: 'energy_type', label: 'Energy Type', type: 'select', required: true, options: [
      { value: 'electricity', label: 'Electricity' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'petrol', label: 'Petrol' },
      { value: 'lpg', label: 'LPG' },
      { value: 'natural_gas', label: 'Natural Gas' },
    ]},
    { name: 'production_method', label: 'Extraction/Production Method', type: 'select', options: [
      { value: 'coal_fired', label: 'Coal-fired' },
      { value: 'gas_fired', label: 'Gas-fired' },
      { value: 'renewable', label: 'Renewable' },
      { value: 'mixed_grid', label: 'Mixed Grid' },
    ]},
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'kWh', label: 'kWh' },
      { value: 'L', label: 'Litres' },
      { value: 'kg', label: 'Kilograms' },
      { value: 'm3', label: 'Cubic Metres' },
    ]},
    { name: 'supplier', label: 'Supplier/Source', type: 'text' },
    { name: 'transmission_loss', label: 'Transmission/Distribution Loss (%)', type: 'number', description: 'Typically 5-10%' },
    { name: 'emission_factor', label: 'Upstream Emission Factor (kg CO2-e per unit)', type: 'number', required: true },
  ],
  
  // Category 4: Upstream Transportation & Distribution
  4: [
    { name: 'transport_mode', label: 'Transport Mode', type: 'select', required: true, options: transportModes },
    { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: [
      { value: 'rigid_truck', label: 'Rigid Truck' },
      { value: 'semi_trailer', label: 'Semi-trailer' },
      { value: 'bdouble', label: 'B-Double' },
      { value: 'container', label: 'Container' },
    ]},
    { name: 'fuel_type', label: 'Fuel Type', type: 'select', options: fuelTypes },
    { name: 'load_weight', label: 'Load Weight (tonnes)', type: 'number', required: true },
    { name: 'distance', label: 'Distance (km)', type: 'number', required: true },
    { name: 'return_empty', label: 'Return Trip Empty', type: 'toggle', description: 'Does vehicle return empty?' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per tonne-km)', type: 'number', required: true },
  ],
  
  // Category 5: Waste Generated in Operations
  5: [
    { name: 'waste_type', label: 'Waste Type', type: 'select', required: true, options: wasteTypes },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'tonnes', label: 'Tonnes' },
      { value: 'm3', label: 'Cubic Metres' },
    ]},
    { name: 'disposal_method', label: 'Disposal Method', type: 'select', required: true, options: disposalMethods },
    { name: 'facility_location', label: 'Waste Facility Location', type: 'select', options: australianStates },
    { name: 'transport_distance', label: 'Transport Distance to Facility (km)', type: 'number' },
    { name: 'diversion_rate', label: 'Diversion Rate (%)', type: 'number', description: 'For recycling/reuse' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per tonne)', type: 'number', required: true },
  ],
  
  // Category 6: Business Travel
  6: [
    { name: 'travel_type', label: 'Travel Type', type: 'select', required: true, options: [
      { value: 'air_domestic', label: 'Air - Domestic' },
      { value: 'air_international', label: 'Air - International' },
      { value: 'road_hire', label: 'Road - Hire Car' },
      { value: 'road_taxi', label: 'Road - Taxi' },
      { value: 'rail', label: 'Rail' },
      { value: 'accommodation', label: 'Accommodation' },
    ]},
    { name: 'travel_class', label: 'Travel Class (Air)', type: 'select', options: [
      { value: 'economy', label: 'Economy' },
      { value: 'business', label: 'Business' },
      { value: 'first', label: 'First Class' },
    ], conditional: { field: 'travel_type', value: 'air' } },
    { name: 'distance', label: 'Distance (km) or Route', type: 'number' },
    { name: 'num_trips', label: 'Number of Trips', type: 'number', required: true },
    { name: 'num_travelers', label: 'Number of Travelers', type: 'number', required: true },
    { name: 'accommodation_nights', label: 'Accommodation Nights', type: 'number', conditional: { field: 'travel_type', value: 'accommodation' } },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per passenger-km or per night)', type: 'number', required: true },
  ],
  
  // Category 7: Employee Commuting
  7: [
    { name: 'num_employees', label: 'Number of Employees', type: 'number', required: true },
    { name: 'days_per_week', label: 'Average Days Worked per Week', type: 'number', required: true },
    { name: 'commute_distance', label: 'Average One-Way Commute Distance (km)', type: 'number', required: true },
    { name: 'transport_mode', label: 'Transport Mode', type: 'select', required: true, options: [
      { value: 'car_solo', label: 'Car - Solo' },
      { value: 'car_carpool', label: 'Car - Carpool' },
      { value: 'public_transport', label: 'Public Transport' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'bicycle', label: 'Bicycle' },
      { value: 'walk', label: 'Walk' },
    ]},
    { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: vehicleTypes, conditional: { field: 'transport_mode', value: 'car' } },
    { name: 'fuel_type', label: 'Fuel Type', type: 'select', options: fuelTypes, conditional: { field: 'transport_mode', value: 'car' } },
    { name: 'occupancy', label: 'Average Occupancy (people)', type: 'number', conditional: { field: 'transport_mode', value: 'car_carpool' } },
    { name: 'public_mode', label: 'Public Transport Mode', type: 'select', options: [
      { value: 'bus', label: 'Bus' },
      { value: 'train', label: 'Train' },
      { value: 'tram', label: 'Tram' },
      { value: 'ferry', label: 'Ferry' },
    ], conditional: { field: 'transport_mode', value: 'public_transport' } },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per passenger-km)', type: 'number', required: true },
  ],
  
  // Category 8: Upstream Leased Assets
  8: [
    { name: 'asset_type', label: 'Asset Type', type: 'select', required: true, options: [
      { value: 'office_space', label: 'Office Space' },
      { value: 'equipment', label: 'Equipment' },
      { value: 'vehicles', label: 'Vehicles' },
      { value: 'storage', label: 'Storage Facility' },
      { value: 'site_compound', label: 'Site Compound' },
    ]},
    { name: 'asset_description', label: 'Asset Description', type: 'text' },
    { name: 'floor_area', label: 'Floor Area (m²)', type: 'number' },
    { name: 'energy_consumption', label: 'Annual Energy Consumption (kWh/year)', type: 'number' },
    { name: 'fuel_consumption', label: 'Annual Fuel Consumption (L/year)', type: 'number' },
    { name: 'lease_duration', label: 'Lease Duration (months)', type: 'number', required: true },
    { name: 'location', label: 'Location', type: 'select', options: australianStates },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per m² per year or per unit)', type: 'number', required: true },
  ],
  
  // Category 9: Downstream Transportation & Distribution
  9: [
    { name: 'transport_mode', label: 'Transport Mode', type: 'select', required: true, options: transportModes },
    { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: [
      { value: 'rigid_truck', label: 'Rigid Truck' },
      { value: 'semi_trailer', label: 'Semi-trailer' },
      { value: 'bdouble', label: 'B-Double' },
      { value: 'container', label: 'Container' },
    ]},
    { name: 'fuel_type', label: 'Fuel Type', type: 'select', options: fuelTypes },
    { name: 'load_weight', label: 'Load Weight (tonnes)', type: 'number', required: true },
    { name: 'distance', label: 'Distance (km)', type: 'number', required: true },
    { name: 'return_empty', label: 'Return Trip Empty', type: 'toggle' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per tonne-km)', type: 'number', required: true },
  ],
  
  // Category 10: Processing of Sold Products
  10: [
    { name: 'product_type', label: 'Product/Material Type', type: 'text', required: true },
    { name: 'processing_method', label: 'Processing Method', type: 'select', options: [
      { value: 'cutting', label: 'Cutting' },
      { value: 'welding', label: 'Welding' },
      { value: 'assembly', label: 'Assembly' },
      { value: 'treatment', label: 'Treatment/Coating' },
      { value: 'fabrication', label: 'Fabrication' },
    ]},
    { name: 'energy_used', label: 'Energy Used in Processing (kWh)', type: 'number' },
    { name: 'fuel_used', label: 'Fuel Used in Processing (L or kg)', type: 'number' },
    { name: 'quantity_processed', label: 'Quantity Processed', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'units', label: 'Units' },
      { value: 'tonnes', label: 'Tonnes' },
      { value: 'm3', label: 'Cubic Metres' },
    ]},
    { name: 'processing_location', label: 'Processing Location', type: 'select', options: australianStates },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per unit)', type: 'number', required: true },
  ],
  
  // Category 11: Use of Sold Products
  11: [
    { name: 'product_type', label: 'Product/Asset Type', type: 'text', required: true, description: 'e.g., Building, Infrastructure' },
    { name: 'useful_life', label: 'Expected Useful Life (years)', type: 'number', required: true },
    { name: 'annual_energy', label: 'Annual Energy Consumption (kWh/year)', type: 'number' },
    { name: 'annual_fuel', label: 'Annual Fuel Consumption (L/year or kg/year)', type: 'number' },
    { name: 'maintenance_freq', label: 'Maintenance Requirements (per year)', type: 'number' },
    { name: 'emission_factor', label: 'Operational Emission Factor (kg CO2-e per year)', type: 'number', required: true },
  ],
  
  // Category 12: End-of-Life Treatment of Sold Products
  12: [
    { name: 'waste_type', label: 'Waste Type', type: 'select', required: true, options: wasteTypes },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'tonnes', label: 'Tonnes' },
      { value: 'm3', label: 'Cubic Metres' },
    ]},
    { name: 'disposal_method', label: 'Disposal Method', type: 'select', required: true, options: disposalMethods },
    { name: 'facility_location', label: 'Facility Location', type: 'select', options: australianStates },
    { name: 'transport_distance', label: 'Transport Distance (km)', type: 'number' },
    { name: 'diversion_rate', label: 'Diversion Rate (%)', type: 'number' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per tonne)', type: 'number', required: true },
  ],
  
  // Category 13: Downstream Leased Assets
  13: [
    { name: 'asset_type', label: 'Asset Type', type: 'select', required: true, options: [
      { value: 'office_space', label: 'Office Space' },
      { value: 'equipment', label: 'Equipment' },
      { value: 'vehicles', label: 'Vehicles' },
      { value: 'storage', label: 'Storage Facility' },
      { value: 'building', label: 'Building' },
    ]},
    { name: 'asset_description', label: 'Asset Description', type: 'text' },
    { name: 'floor_area', label: 'Floor Area (m²)', type: 'number' },
    { name: 'energy_consumption', label: 'Annual Energy Consumption (kWh/year)', type: 'number' },
    { name: 'fuel_consumption', label: 'Annual Fuel Consumption (L/year)', type: 'number' },
    { name: 'lease_duration', label: 'Lease Duration (months)', type: 'number', required: true },
    { name: 'location', label: 'Location', type: 'select', options: australianStates },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per m² per year or per unit)', type: 'number', required: true },
  ],
  
  // Category 14: Franchises
  14: [
    { name: 'num_locations', label: 'Number of Franchise Locations', type: 'number', required: true },
    { name: 'avg_floor_area', label: 'Average Floor Area per Location (m²)', type: 'number' },
    { name: 'avg_energy', label: 'Average Energy Consumption per Location (kWh/year)', type: 'number' },
    { name: 'avg_fuel', label: 'Average Fuel Consumption per Location (L/year)', type: 'number' },
    { name: 'avg_revenue', label: 'Average Revenue per Location (AUD/year)', type: 'number', description: 'For allocation' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per franchise or per $ revenue)', type: 'number', required: true },
  ],
  
  // Category 15: Investments
  15: [
    { name: 'investment_type', label: 'Investment Type', type: 'select', required: true, options: [
      { value: 'equity', label: 'Equity' },
      { value: 'debt', label: 'Debt' },
      { value: 'project_finance', label: 'Project Finance' },
      { value: 'managed_funds', label: 'Managed Funds' },
    ]},
    { name: 'investment_amount', label: 'Investment Amount (AUD)', type: 'number', required: true },
    { name: 'investment_sector', label: 'Investment Sector', type: 'select', options: [
      { value: 'construction', label: 'Construction' },
      { value: 'real_estate', label: 'Real Estate' },
      { value: 'infrastructure', label: 'Infrastructure' },
      { value: 'energy', label: 'Energy' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'ownership_share', label: 'Ownership Share (%)', type: 'number', description: '0-100%' },
    { name: 'investee_emissions', label: 'Investee Company/Project Emissions (tonnes CO2-e per year)', type: 'number', description: 'If known' },
    { name: 'emission_factor', label: 'Emission Factor (kg CO2-e per $1000 invested or per % ownership)', type: 'number', required: true },
  ],
};

// Australian emission factors (NGER-aligned, 2024 values)
export const australianEmissionFactors: Record<string, number> = {
  // Transport - tonne-km
  'transport_road_light': 0.62,
  'transport_road_medium': 0.47,
  'transport_road_heavy': 0.36,
  'transport_road_rigid': 0.42,
  'transport_road_semi': 0.31,
  'transport_road_bdouble': 0.28,
  'transport_rail': 0.025,
  'transport_sea_container': 0.012,
  'transport_air': 1.24,
  
  // Vehicles - per km
  'vehicle_small_car_petrol': 0.155,
  'vehicle_medium_car_petrol': 0.192,
  'vehicle_large_car_petrol': 0.248,
  'vehicle_suv_petrol': 0.265,
  'vehicle_small_car_diesel': 0.128,
  'vehicle_medium_car_diesel': 0.155,
  'vehicle_small_car_electric': 0.085, // Grid average
  'vehicle_motorcycle': 0.095,
  
  // Waste - per tonne
  'waste_landfill_general': 1.12,
  'waste_landfill_concrete': 0.02,
  'waste_recycling_metal': -1.47, // Negative = carbon saving
  'waste_recycling_cardboard': -0.74,
  'waste_recycling_timber': -0.38,
  
  // Materials - per tonne (embodied carbon)
  'material_concrete_general': 350,
  'material_concrete_n32': 380,
  'material_steel_virgin': 2100,
  'material_steel_recycled': 630,
  'material_timber_hardwood': 260,
  'material_timber_softwood': 180,
  'material_aluminium_virgin': 11500,
  'material_aluminium_recycled': 800,
  'material_brick': 220,
  'material_glass': 850,
  
  // Business travel - per passenger-km
  'travel_air_domestic_economy': 0.158,
  'travel_air_domestic_business': 0.237,
  'travel_air_international_economy': 0.115,
  'travel_air_international_business': 0.345,
  'travel_rail': 0.035,
  'travel_taxi': 0.192,
  'travel_accommodation_per_night': 35,
};
