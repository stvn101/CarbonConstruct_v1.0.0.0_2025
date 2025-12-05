// Material Database with Australian Emission Factors (v2.3)
export const MATERIAL_DB = {
  concrete: {
    label: "Concrete (In-Situ)",
    unit: "m³",
    items: [
      { id: 'c_20', name: "Concrete 20 MPa", factor: 201, source: "NMEF v2025.1" },
      { id: 'c_25', name: "Concrete 25 MPa", factor: 222, source: "NMEF v2025.1" },
      { id: 'c_32', name: "Concrete 32 MPa", factor: 249, source: "NMEF v2025.1" },
      { id: 'c_40', name: "Concrete 40 MPa", factor: 305, source: "NMEF v2025.1" },
      { id: 'c_50', name: "Concrete 50 MPa", factor: 354, source: "NMEF v2025.1" }
    ]
  },
  steel: {
    label: "Steel & Framing",
    unit: "Tonnes",
    items: [
      { id: 's_struc_cold', name: "Steel Framing (Cold Rolled/Studs)", factor: 3013, source: "NMEF v2025.1" },
      { id: 's_rebar', name: "Reinforcing Steel (Rebar)", factor: 1380, source: "NMEF v2025.1" },
      { id: 's_struc_hot', name: "Structural Steel (Hot Rolled)", factor: 1250, source: "NMEF v2025.1" },
      { id: 'al_ext', name: "Aluminium Extruded (Generic)", factor: 12741, source: "NMEF v2025.1" }
    ]
  },
  masonry: {
    label: "Walls & Linings",
    unit: "m²",
    items: [
      { id: 'm_plaster_10', name: "Plasterboard 10mm", factor: 5.9, source: "NMEF v2025.1" },
      { id: 'm_plaster_13', name: "Plasterboard 13mm", factor: 7.2, source: "NMEF v2025.1" },
      { id: 'm_aac_panel', name: "AAC Panel (Hebel)", factor: 0.45, source: "NMEF v2025.1" },
      { id: 'm_glass', name: "Flat Glass (Generic)", factor: 1.66, source: "NMEF v2025.1" },
      { id: 'm_fc_sheet', name: "Fibre Cement Sheet (Generic)", factor: 7.2, source: "NMEF v2025.1" }
    ]
  },
  flooring: {
    label: "Flooring",
    unit: "m²",
    items: [
      { id: 'f_carpet_tile', name: "Carpet Tiles (Nylon)", factor: 13.2, source: "NMEF v2025.1" },
      { id: 'f_vinyl', name: "Vinyl Flooring", factor: 15.9, source: "NMEF v2025.1" },
      { id: 'f_timber_eng', name: "Engineered Timber Flooring", factor: 9.5, source: "NMEF v2025.1 (Est)" },
      { id: 'f_ceramic', name: "Ceramic Tiles", factor: 11.0, source: "NMEF v2025.1 (Est)" }
    ]
  },
  doors_windows: {
    label: "Windows & Doors",
    unit: "m²",
    items: [
      { id: 'd_solid_timber', name: "Door - Solid Timber", factor: 28, source: "NMEF v2025.1 (Est)" },
      { id: 'd_alum_glass', name: "Window/Door - Alum Frame Glazed", factor: 65, source: "NMEF v2025.1 (Est)" }
    ]
  },
  timber: {
    label: "Timber & Wood",
    unit: "m³",
    items: [
      { id: 't_soft', name: "Sawn Softwood (Pine)", factor: 233, source: "NMEF v2025.1" },
      { id: 't_hard', name: "Sawn Hardwood", factor: 320, source: "NMEF v2025.1" },
      { id: 't_lvl', name: "LVL Timber", factor: 430, source: "NMEF v2025.1" }
    ]
  }
} as const;

export const FUEL_FACTORS = {
  diesel_transport: { name: "Diesel (Transport)", unit: "Litres", factor: 2.7 },
  diesel_stationary: { name: "Diesel (Stationary)", unit: "Litres", factor: 2.7 },
  petrol: { name: "Petrol (Unleaded)", unit: "Litres", factor: 2.3 },
  lpg: { name: "LPG", unit: "Litres", factor: 1.6 },
  natural_gas: { name: "Natural Gas", unit: "GJ", factor: 51.5 }
} as const;

export const STATE_ELEC_FACTORS = {
  NSW: { factor: 0.66, name: "New South Wales" },
  VIC: { factor: 0.85, name: "Victoria" },
  QLD: { factor: 0.72, name: "Queensland" },
  SA: { factor: 0.25, name: "South Australia" },
  WA: { factor: 0.51, name: "Western Australia" },
  TAS: { factor: 0.17, name: "Tasmania" },
  NT: { factor: 0.54, name: "Northern Territory" },
  ACT: { factor: 0.66, name: "ACT" }
} as const;

export const TRANSPORT_FACTORS = {
  commute_car: { name: "Staff Commute (Car)", unit: "Total km", factor: 0.22 },
  commute_ute: { name: "Staff Commute (Ute)", unit: "Total km", factor: 0.28 },
  waste_general: { name: "Waste Transport", unit: "Tonnes", factor: 1200 }
} as const;

// Employee Commute Factors (kgCO2e per km)
export const COMMUTE_FACTORS = {
  car_petrol: { name: "Car (Petrol)", unit: "km", factor: 0.22 },
  car_diesel: { name: "Car (Diesel)", unit: "km", factor: 0.24 },
  car_hybrid: { name: "Car (Hybrid)", unit: "km", factor: 0.12 },
  car_ev: { name: "Electric Vehicle", unit: "km", factor: 0.05 },
  ute: { name: "Ute/4WD", unit: "km", factor: 0.28 },
  motorcycle: { name: "Motorcycle", unit: "km", factor: 0.11 },
  bus: { name: "Bus", unit: "km", factor: 0.089 },
  train: { name: "Train/Light Rail", unit: "km", factor: 0.041 },
  bicycle: { name: "Bicycle/Walk", unit: "km", factor: 0 }
} as const;

// Waste Emission Factors (kgCO2e per kg of waste)
export const WASTE_FACTORS = {
  general_landfill: { name: "General Waste (Landfill)", unit: "kg", factor: 0.58 },
  construction_mixed: { name: "Mixed C&D Waste", unit: "kg", factor: 0.42 },
  concrete_waste: { name: "Concrete/Masonry Waste", unit: "kg", factor: 0.013 },
  timber_waste: { name: "Timber Waste (Landfill)", unit: "kg", factor: 1.8 },
  metal_waste: { name: "Metal Waste (Recycled)", unit: "kg", factor: -0.5 },
  plastic_waste: { name: "Plastic Waste", unit: "kg", factor: 2.1 },
  plasterboard_waste: { name: "Plasterboard Waste", unit: "kg", factor: 0.35 },
  packaging_waste: { name: "Packaging/Cardboard", unit: "kg", factor: 0.21 }
} as const;

// A5 On-Site Construction Emission Factors (kgCO2e per unit)
export const A5_EQUIPMENT_FACTORS = {
  // Site Equipment (per operating hour)
  excavator_small: { name: "Excavator (Small <10t)", unit: "hours", factor: 27, category: "equipment" },
  excavator_medium: { name: "Excavator (Medium 10-20t)", unit: "hours", factor: 45, category: "equipment" },
  excavator_large: { name: "Excavator (Large >20t)", unit: "hours", factor: 68, category: "equipment" },
  loader_skid: { name: "Skid Steer Loader", unit: "hours", factor: 15, category: "equipment" },
  loader_wheel: { name: "Wheel Loader", unit: "hours", factor: 35, category: "equipment" },
  crane_mobile: { name: "Mobile Crane", unit: "hours", factor: 55, category: "equipment" },
  crane_tower: { name: "Tower Crane", unit: "hours", factor: 25, category: "equipment" },
  forklift: { name: "Forklift (Diesel)", unit: "hours", factor: 12, category: "equipment" },
  forklift_electric: { name: "Forklift (Electric)", unit: "hours", factor: 3.5, category: "equipment" },
  concrete_pump: { name: "Concrete Pump", unit: "hours", factor: 85, category: "equipment" },
  compactor: { name: "Plate Compactor", unit: "hours", factor: 4.5, category: "equipment" },
  roller: { name: "Vibrating Roller", unit: "hours", factor: 22, category: "equipment" },
  
  // Generators (per operating hour based on load)
  generator_10kva: { name: "Generator 10 kVA", unit: "hours", factor: 7.5, category: "generator" },
  generator_25kva: { name: "Generator 25 kVA", unit: "hours", factor: 15, category: "generator" },
  generator_50kva: { name: "Generator 50 kVA", unit: "hours", factor: 28, category: "generator" },
  generator_100kva: { name: "Generator 100 kVA", unit: "hours", factor: 52, category: "generator" },
  generator_250kva: { name: "Generator 250 kVA", unit: "hours", factor: 120, category: "generator" },
  
  // Installation Activities (per m² or unit installed)
  concrete_pour: { name: "Concrete Placement", unit: "m³", factor: 8.5, category: "installation" },
  formwork_install: { name: "Formwork Install/Strip", unit: "m²", factor: 2.2, category: "installation" },
  rebar_fix: { name: "Reinforcement Fixing", unit: "tonnes", factor: 45, category: "installation" },
  steel_erection: { name: "Structural Steel Erection", unit: "tonnes", factor: 65, category: "installation" },
  cladding_install: { name: "Cladding Installation", unit: "m²", factor: 3.8, category: "installation" },
  glazing_install: { name: "Glazing Installation", unit: "m²", factor: 5.5, category: "installation" },
  roofing_install: { name: "Roofing Installation", unit: "m²", factor: 4.2, category: "installation" },
  mep_rough_in: { name: "M&E Rough-In", unit: "m²", factor: 6.5, category: "installation" },
  painting: { name: "Painting/Finishing", unit: "m²", factor: 1.8, category: "installation" },
  
  // Site Facilities (per day)
  site_office: { name: "Site Office (HVAC)", unit: "days", factor: 18, category: "facilities" },
  site_lighting: { name: "Site Lighting", unit: "days", factor: 8.5, category: "facilities" },
  welfare_facilities: { name: "Welfare Facilities", unit: "days", factor: 12, category: "facilities" },
  dewatering_pump: { name: "Dewatering Pump", unit: "hours", factor: 8, category: "facilities" }
} as const;
