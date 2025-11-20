import { PresetOption } from "@/components/ui/number-input-with-presets";

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
