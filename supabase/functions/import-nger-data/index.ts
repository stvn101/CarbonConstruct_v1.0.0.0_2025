import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NGERMaterial {
  material_category: string;
  subcategory: string | null;
  material_name: string;
  unit: string;
  data_quality_tier: string;
  uncertainty_percent: number;
  ef_a1a3: number;
  ef_total: number;
  carbon_sequestration: number;
  data_source: string;
  region: string;
  year: number;
  notes: string | null;
}

interface EmissionFactor {
  scope: number;
  category: string;
  subcategory: string | null;
  fuel_type: string | null;
  region: string | null;
  unit: string;
  factor_value: number;
  source: string;
  methodology: string | null;
  year: number;
}

// Parse CSV content
function parseCSV(content: string): string[][] {
  const lines = content.trim().split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Parse number safely
function parseNumber(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// NGER Materials CSV data (embedded for reliability)
const NGER_MATERIALS_CSV = `material_type,material_category,unit,data_quality,uncertainty_pct,a1a3_default_per_unit,a1a3_max_per_unit,a1a3_min_per_unit,a1a3_avg_per_unit,a1a3_default_per_kg,a1a3_max_per_kg,a1a3_min_per_kg,a1a3_avg_per_kg,carbon_storage_per_unit,carbon_storage_per_kg,conversion_factor,conversion_unit
Concrete in-situ,≤10 MPa,m³,Tier 3,1.1,273.0,248.0,142.0,181.0,0.114,0.103,0.059,0.0755,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>10 MPa to ≤20 MPa,m³,Tier 1,1.02,371.0,364.0,136.0,201.0,0.155,0.152,0.0567,0.0836,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>20 MPa to ≤25 MPa,m³,Tier 1,1.02,426.0,417.0,149.0,222.0,0.177,0.174,0.0621,0.0924,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>25 MPa to ≤32 MPa,m³,Tier 1,1.02,468.0,459.0,167.0,249.0,0.195,0.191,0.0696,0.104,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>32 MPa to ≤40 MPa,m³,Tier 1,1.02,556.0,545.0,198.0,305.0,0.232,0.227,0.0825,0.127,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>40 MPa to ≤50 MPa,m³,Tier 1,1.02,621.0,609.0,101.0,354.0,0.259,0.254,0.0421,0.148,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>50 MPa to ≤65 MPa,m³,Tier 2,1.05,640.0,609.0,274.0,402.0,0.267,0.254,0.114,0.167,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>65 MPa to ≤80 MPa,m³,Tier 2,1.05,690.0,657.0,301.0,425.0,0.287,0.274,0.125,0.177,0.0,0.0,2400.0,kg/m³
Concrete in-situ,>80 MPa +,m³,Tier 3,1.1,781.0,710.0,438.0,561.0,0.325,0.296,0.184,0.234,0.0,0.0,2400.0,kg/m³
Concrete in-situ,Kerb,m³,Tier 1,1.02,468.0,459.0,167.0,249.0,0.195,0.191,0.0696,0.104,0.0,0.0,2400.0,kg/m³
Concrete precast panel,Precast concrete panel (inc. reinforcing),tonne,Untiered,1.0,439.0,439.0,69.3,233.0,0.439,0.439,0.0693,0.233,0.0,0.0,1000.0,kg/tonne
Concrete precast panel,Hollow core - precast concrete (inc. reinforcing),m³,Tier 4,1.2,428.0,357.0,317.0,339.0,0.29,0.242,0.215,0.229,0.0,0.0,1480.0,kg/m³
Concrete block,Concrete block (exc. core fill or reinforcing),tonne,Tier 3,1.1,264.0,240.0,112.0,159.0,0.264,0.24,0.112,0.159,0.0,0.0,1000.0,kg/tonne
Concrete block,Solid AAC (no fill or reinforcing),m³,Tier 4,1.2,278.0,232.0,150.0,190.0,0.724,0.603,0.334,0.437,0.0,0.0,435.0,kg/m³
Reinforcing steel,Bar & mesh reinforcing steel,tonne,Tier 2,1.05,3650.0,3480.0,309.0,1600.0,3.65,3.48,0.309,1.6,0.0,0.0,1000.0,kg/tonne
Reinforcing steel,Fibre & strand reinforcing steel,tonne,Tier 2,1.05,3650.0,3480.0,309.0,1600.0,3.65,3.48,0.309,1.6,0.0,0.0,1000.0,kg/tonne
Structural steel,Structural sections steel (welded beam columns angles plates piles etc) (hot rolled),tonne,Tier 2,1.05,3910.0,3720.0,558.0,2270.0,3.91,3.72,0.558,2.27,0.0,0.0,1000.0,kg/tonne
Structural steel,Structural formwork and decking steel (cold rolled - light weight),tonne,Tier 2,1.05,4050.0,3860.0,2730.0,3010.0,4.05,3.86,2.73,3.01,0.0,0.0,1000.0,kg/tonne
Structural steel,Structural framing steel (cold rolled - lightweight),tonne,Tier 2,1.05,4050.0,3860.0,2730.0,3010.0,4.05,3.86,2.73,3.01,0.0,0.0,1000.0,kg/tonne
Structural steel,Galvanised structural sections steel (hot rolled),tonne,Tier 1,1.02,4190.0,4100.0,581.0,2400.0,4.19,4.1,0.581,2.4,0.0,0.0,1000.0,kg/tonne
Structural steel,Painted structural sections steel (hot rolled),tonne,Tier 2,1.05,4340.0,4130.0,580.0,2410.0,4.34,4.13,0.58,2.41,0.0,0.0,1000.0,kg/tonne
Stainless steel,Stainless steel (general),tonne,Tier 4,1.2,5990.0,4990.0,2800.0,3510.0,5.99,4.99,2.8,3.51,0.0,0.0,1000.0,kg/tonne
Timber,Softwood,m³,Tier 2,1.05,349.0,332.0,113.0,188.0,0.633,0.603,0.205,0.366,857.0,1.64,514.0,kg/m³
Timber,Hardwood,m³,Tier 2,1.05,591.0,563.0,104.0,347.0,0.804,0.765,0.126,0.466,1170.0,1.54,744.0,kg/m³
Timber,Timber poles - piles,m³,Tier 2,1.05,591.0,563.0,104.0,347.0,0.804,0.765,0.126,0.466,1170.0,1.54,744.0,kg/m³
Timber (engineered),Plywood,m³,Tier 2,1.05,968.0,922.0,235.0,498.0,1.77,1.69,0.396,0.978,841.0,1.64,509.0,kg/m³
Timber (engineered),Particleboard,m³,Tier 2,1.05,880.0,838.0,322.0,650.0,1.23,1.17,0.488,0.915,1140.0,1.62,711.0,kg/m³
Timber (engineered),GLT & CLT (softwood),m³,Tier 2,1.05,565.0,539.0,53.8,242.0,1.26,1.2,0.114,0.467,823.0,1.61,518.0,kg/m³
Timber (engineered),GLT & CLT (hardwood),m³,Tier 3,1.1,841.0,765.0,627.0,690.0,1.25,1.13,0.93,1.02,1090.0,1.61,674.0,kg/m³
Timber (engineered),LVL,m³,Tier 3,1.1,442.0,402.0,94.4,298.0,1.0,0.913,0.155,0.587,843.0,1.6,507.0,kg/m³
Timber (engineered),OSB,m³,Tier 4,1.2,461.0,384.0,101.0,194.0,0.767,0.64,0.165,0.318,1020.0,1.66,610.0,kg/m³
Brick,Clay brick,tonne,Tier 4,1.2,464.0,387.0,47.8,184.0,0.464,0.387,0.0478,0.184,0.0,0.0,1000.0,kg/tonne
Brick,Concrete brick,tonne,Tier 3,1.1,264.0,240.0,112.0,159.0,0.264,0.24,0.112,0.159,0.0,0.0,1000.0,kg/tonne
Brick,Stone brick,tonne,Tier 4,1.2,542.0,452.0,67.1,239.0,0.542,0.452,0.0671,0.239,0.0,0.0,1000.0,kg/tonne
Aggregate,Quarried fill and base material,tonne,Tier 3,1.1,10.2,9.24,3.26,6.66,0.0102,0.00924,0.00326,0.00666,0.0,0.0,1000.0,kg/tonne
Aggregate,Recycled fill material,tonne,Tier 4,1.2,11.5,9.55,0.492,3.82,0.0115,0.00955,0.000492,0.00382,0.0,0.0,1000.0,kg/tonne
Aggregate,Stabilised sand,m³,Tier 2,1.05,361.0,344.0,67.8,185.0,0.206,0.197,0.0387,0.105,0.0,0.0,1760.0,kg/m³
Asphalt,Asphalt,tonne,Tier 2,1.05,141.0,134.0,5.83,71.4,0.141,0.134,0.00583,0.0714,0.0,0.0,1000.0,kg/tonne
Roof tiles,Clay and terracotta roof tiles,tonne,Tier 4,1.2,682.0,568.0,47.8,310.0,0.682,0.568,0.0478,0.31,0.0,0.0,1000.0,kg/tonne
Roof tiles,Concrete roof tiles,tonne,Tier 3,1.1,264.0,240.0,112.0,159.0,0.264,0.24,0.112,0.159,0.0,0.0,1000.0,kg/tonne
Steel cladding/roofing,Steel sheeting - metallic coat,m²,Tier 1,1.02,64.0,62.7,8.4,19.1,5.12,5.01,2.72,3.15,0.0,0.0,6.05,kg/m²
Steel cladding/roofing,Steel sheeting - painted,m²,Tier 1,1.02,25.4,24.9,9.49,14.8,5.49,5.38,2.98,3.47,0.0,0.0,4.28,kg/m²
Aluminium cladding/roofing,Aluminium sheeting,kg,Tier 4,1.2,20.8,17.4,5.48,11.8,20.8,17.4,5.48,11.8,0.0,0.0,1.0,kg/kg
Cement cladding/roofing,GRC,tonne,Tier 4,1.2,869.0,724.0,408.0,544.0,0.869,0.724,0.408,0.544,0.0,0.0,1000.0,kg/tonne
Cement cladding/roofing,Fibre cement board,m²,Tier 2,1.05,48.2,45.9,4.5,12.6,1.39,1.32,0.307,0.882,0.0251,0.00216,14.2,kg/m²
Cement cladding/roofing,Plasterboard,m²,Tier 4,1.2,8.2,6.83,1.49,3.37,0.473,0.394,0.175,0.304,0.393,0.04,11.1,kg/m²
Glazing,Glass (treated or untreated),kg,Tier 4,1.2,2.38,1.98,1.1,1.66,2.38,1.98,1.1,1.66,0.0,0.0,1.0,kg/kg
Extruded aluminium,Aluminium extruded uncoated,tonne,Tier 2,1.05,30200.0,28800.0,3490.0,17400.0,30.2,28.8,3.49,17.4,0.0,0.0,1000.0,kg/tonne
Extruded aluminium,Aluminium extruded powder coated,tonne,Tier 2,1.05,32000.0,30500.0,5150.0,18200.0,32.0,30.5,5.15,18.2,0.0,0.0,1000.0,kg/tonne
Extruded aluminium,Aluminium extruded anodised,tonne,Tier 2,1.05,34200.0,32600.0,7290.0,19300.0,34.2,32.6,7.29,19.3,0.0,0.0,1000.0,kg/tonne
Floors,Carpet flooring,m²,Tier 4,1.2,34.2,28.5,4.1,13.3,13.3,11.1,1.34,4.13,0.0,0.0,3.21,kg/m²
Floors,Vinyl flooring,m²,Tier 3,1.1,37.8,34.4,5.63,15.9,8.64,7.85,0.868,3.12,0.0,0.0,5.1,kg/m²
Floors,Rubber flooring,m²,Tier 4,1.2,19.5,16.2,0.378,8.69,10.2,8.54,0.43,3.94,0.0,0.0,2.2,kg/m²
Floors,Timber flooring,m³,Tier 2,1.05,591.0,563.0,104.0,347.0,0.804,0.765,0.126,0.466,1170.0,1.54,744.0,kg/m³
Floors,Laminate flooring,m²,Tier 4,1.2,5.69,4.74,2.67,3.71,0.814,0.679,0.384,0.531,0.0,0.0,6.98,kg/m²
Lifts,Category 5 6 for high rise buildings (>10 floors),#,Tier 4,1.2,311000.0,259000.0,99900.0,167000.0,0.0,0.0,0.0,0.0,0.0,0.0,,kg/#
Lifts,Category 3 4 for medium rise buildings (4-10 floors),#,Tier 4,1.2,141000.0,117000.0,4490.0,41500.0,0.0,0.0,0.0,0.0,0.0,0.0,,kg/#
Lifts,Category 1 2 for low rise buildings (<4 floors),#,Tier 4,1.2,34600.0,28800.0,4500.0,14200.0,0.0,0.0,0.0,0.0,0.0,0.0,,kg/#
MEP,Low or mid rise office hotel or retail building (≤10 floors),m²,Untiered,1.0,67.0,67.0,41.3,55.3,3.11,3.11,2.77,2.95,0.0,0.0,18.8,kg/m²
MEP,Residential building,m²,Untiered,1.0,57.4,57.4,41.2,46.8,2.69,2.69,2.26,2.26,0.0,0.0,20.7,kg/m²
MEP,Warehouse or industrial building,m²,Untiered,1.0,13.4,13.4,11.8,12.6,2.77,2.77,1.59,2.18,0.0,0.0,5.77,kg/m²
MEP,High rise office hotel or retail building (>10 floors),m²,Untiered,1.0,74.8,74.8,48.9,62.6,3.88,3.88,2.88,3.24,0.0,0.0,19.3,kg/m²
MEP,Hospital or high services intensity building,m²,Untiered,1.0,74.8,74.8,55.1,66.0,3.95,3.95,2.91,3.29,0.0,0.0,20.1,kg/m²`;

// NGER Operational Factors CSV data (embedded)
const NGER_OPERATIONAL_CSV = `scope,category,subcategory,fuel_type,region,unit,co2_factor,ch4_factor,n2o_factor,total_co2e,ec_gj_per_unit,notes,nger_method,source
1,Stationary Energy,Liquid Fuels,Diesel,Australia,L,2.68460,0.00010,0.00007,2.68534,38.6,Stationary combustion only - NOT transport,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Diesel,Australia,GJ,69.9,0.003,0.002,70.0,,Stationary combustion only - NOT transport,Method 1,NGA 2024 Table 1
1,Transport,Liquid Fuels,Diesel,Australia,L,2.68460,0.00010,0.00019,2.68586,38.6,Transport use - registered vehicles,Method 1,NGA 2024 Table 1
1,Transport,Liquid Fuels,Diesel Heavy Vehicle Euro IV+,Australia,L,2.68460,0.00010,0.00015,2.68572,38.6,Heavy vehicle Euro IV or later,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Petrol,Australia,L,2.31300,0.00007,0.00006,2.31366,34.2,Stationary combustion,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Petrol,Australia,GJ,67.6,0.002,0.002,67.7,,Stationary combustion,Method 1,NGA 2024 Table 1
1,Transport,Liquid Fuels,Petrol,Australia,L,2.31300,0.00007,0.00012,2.31379,34.2,Transport use - registered vehicles,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Aviation Turbine Fuel,Australia,L,2.52700,0.00007,0.00006,2.52766,37.4,Jet A/A-1,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Aviation Gasoline,Australia,L,2.24600,0.00007,0.00006,2.24666,33.2,Aviation petrol,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,Fuel Oil,Australia,L,2.77000,0.00007,0.00007,2.77067,40.9,Heavy fuel oil,Method 1,NGA 2024 Table 1
1,Stationary Energy,Liquid Fuels,LPG,Australia,L,1.59000,0.00003,0.00001,1.59006,26.2,Liquefied petroleum gas,Method 1,NGA 2024 Table 1
1,Stationary Energy,Gaseous Fuels,Natural Gas,NSW Metro,GJ,51.5,0.1,0.0001,51.6,,NSW metropolitan pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,NSW Regional,GJ,51.5,0.1,0.0001,51.6,,NSW regional pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,VIC Metro,GJ,51.4,0.1,0.0001,51.5,,VIC metropolitan pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,VIC Regional,GJ,51.4,0.1,0.0001,51.5,,VIC regional pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,QLD Metro,GJ,51.4,0.1,0.0001,51.5,,QLD metropolitan pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,QLD Regional,GJ,51.4,0.1,0.0001,51.5,,QLD regional pipeline,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,SA,GJ,51.3,0.1,0.0001,51.4,,SA pipeline network,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,WA,GJ,51.4,0.1,0.0001,51.5,,WA pipeline network,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,TAS,GJ,51.3,0.1,0.0001,51.4,,TAS pipeline network,Method 1,NGA 2024 Table 2
1,Stationary Energy,Gaseous Fuels,Natural Gas,NT,GJ,54.6,0.1,0.0001,54.7,,NT pipeline network,Method 1,NGA 2024 Table 2
1,Industrial Processes,Cement,Limestone Calcination,Australia,t,440,0,0,440,,CaCO3 calcination - raw material basis,Method 1 Process,NGER Determination
1,Industrial Processes,Cement,Dolomite Calcination,Australia,t,477,0,0,477,,CaMg(CO3)2 calcination - raw material basis,Method 1 Process,NGER Determination
1,Fugitive,Refrigerants,HFC-134a,Australia,kg,0,0,0,1300,,Global warming potential AR4,Method 1,NGA 2024 Table 6
1,Fugitive,Refrigerants,R410A,Australia,kg,0,0,0,1924,,Blend 50% HFC-32 + 50% HFC-125,Method 1,NGA 2024 Table 6
1,Fugitive,Refrigerants,HFC-32,Australia,kg,0,0,0,677,,Lower GWP alternative,Method 1,NGA 2024 Table 6
1,Fugitive,Refrigerants,R407C,Australia,kg,0,0,0,1624,,Blend refrigerant,Method 1,NGA 2024 Table 6
2,Purchased Electricity,Grid,Location-Based,NSW,kWh,0.66,0,0,0.66,,Includes ACT - location-based method,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,VIC,kWh,0.77,0,0,0.77,,Location-based method,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,QLD,kWh,0.66,0,0,0.66,,Location-based method,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,SA,kWh,0.21,0,0,0.21,,High renewable penetration,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,WA,kWh,0.48,0,0,0.48,,SWIS grid only,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,TAS,kWh,0.16,0,0,0.16,,Hydropower dominated,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Location-Based,NT,kWh,0.51,0,0,0.51,,Darwin-Katherine system,Method 1,NGA 2024 Table 4
2,Purchased Electricity,Grid,Market-Based,Australia,kWh,0,0,0,0,,100% GreenPower or LGCs - zero emissions,Method 2,NGA 2024 s3.5
3,Fuel Extraction,Well-to-Tank,Diesel,Australia,GJ,3.6,0,0,3.6,,Upstream extraction & transport,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Petrol,Australia,GJ,3.3,0,0,3.3,,Upstream extraction & transport,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,NSW Metro,GJ,13.1,0,0,13.1,,Pipeline leakage & extraction,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,VIC Metro,GJ,4.0,0,0,4.0,,VIC has lower leakage,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,QLD Metro,GJ,8.8,0,0,8.8,,Pipeline leakage & extraction,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,SA,GJ,7.2,0,0,7.2,,Pipeline leakage & extraction,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,WA,GJ,7.6,0,0,7.6,,Pipeline leakage & extraction,Method 1,NGA 2024 Table 5
3,Fuel Extraction,Well-to-Tank,Natural Gas,TAS,GJ,4.8,0,0,4.8,,Pipeline leakage & extraction,Method 1,NGA 2024 Table 5
3,Transmission & Distribution,Electricity,Grid Losses,NSW,kWh,0.07,0,0,0.07,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Transmission & Distribution,Electricity,Grid Losses,VIC,kWh,0.07,0,0,0.07,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Transmission & Distribution,Electricity,Grid Losses,QLD,kWh,0.07,0,0,0.07,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Transmission & Distribution,Electricity,Grid Losses,SA,kWh,0.02,0,0,0.02,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Transmission & Distribution,Electricity,Grid Losses,WA,kWh,0.05,0,0,0.05,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Transmission & Distribution,Electricity,Grid Losses,TAS,kWh,0.02,0,0,0.02,,T&D losses - location-based,Method 1,NGA 2024 Table 4
3,Waste,Solid Waste,C&D Waste Generic,Australia,t,0.2,0,0,0.2,,Generic construction & demolition,Method 1,NGA 2024 Table 8
3,Waste,Solid Waste,Timber to Landfill,Australia,t,0.43,0,0,1.5,,DOC=0.43 with MCF calculation,Method 2,NGER Determination
3,Waste,Solid Waste,Paper to Landfill,Australia,t,0.40,0,0,1.4,,DOC=0.40 with MCF calculation,Method 2,NGER Determination
3,Waste,Solid Waste,Food to Landfill,Australia,t,0.15,0,0,0.5,,DOC=0.15 with MCF calculation,Method 2,NGER Determination
3,Water,Potable Water,Supply & Treatment,NSW,kL,0.51,0,0,0.51,,Water supply embodied emissions,Regional,GHG Protocol
3,Water,Potable Water,Supply & Treatment,VIC,kL,0.68,0,0,0.68,,Water supply embodied emissions,Regional,GHG Protocol
3,Water,Potable Water,Supply & Treatment,QLD,kL,0.23,0,0,0.23,,Water supply embodied emissions,Regional,GHG Protocol
3,Water,Potable Water,Supply & Treatment,SA,kL,0.36,0,0,0.36,,Water supply embodied emissions,Regional,GHG Protocol
3,Water,Potable Water,Supply & Treatment,WA,kL,0.35,0,0,0.35,,Water supply embodied emissions,Regional,GHG Protocol
3,Water,Wastewater,Treatment & Disposal,NSW,kL,0.79,0,0,0.79,,Wastewater treatment,Regional,GHG Protocol
3,Water,Wastewater,Treatment & Disposal,VIC,kL,0.93,0,0,0.93,,Wastewater treatment,Regional,GHG Protocol
3,Water,Wastewater,Treatment & Disposal,QLD,kL,0.32,0,0,0.32,,Wastewater treatment,Regional,GHG Protocol
3,Water,Wastewater,Treatment & Disposal,SA,kL,0.55,0,0,0.55,,Wastewater treatment,Regional,GHG Protocol
3,Water,Wastewater,Treatment & Disposal,WA,kL,0.49,0,0,0.49,,Wastewater treatment,Regional,GHG Protocol`;

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

    const { action } = await req.json();
    console.log(`[import-nger-data] Action: ${action}, User: ${user.id}`);

    if (action === 'import-materials') {
      // Parse NGER materials
      const rows = parseCSV(NGER_MATERIALS_CSV);
      const dataRows = rows.slice(1); // Skip header
      
      const materials: NGERMaterial[] = [];
      
      for (const row of dataRows) {
        if (row.length < 6) continue;
        
        const materialType = row[0]?.trim();
        const classification = row[1]?.trim();
        const unit = row[2]?.trim();
        const dataQuality = row[3]?.trim();
        const uncertainty = parseNumber(row[4]);
        const efA1A3 = parseNumber(row[5]);
        const carbonStorage = parseNumber(row[13] || '0');
        
        if (!materialType || !efA1A3) continue;
        
        const materialName = `${materialType} - ${classification} (NGER 2025)`;
        
        materials.push({
          material_category: materialType,
          subcategory: classification || null,
          material_name: materialName,
          unit: unit || 'kgCO2e',
          data_quality_tier: dataQuality?.toLowerCase().replace(' ', '_') || 'nger_verified',
          uncertainty_percent: uncertainty * 100, // Convert from decimal
          ef_a1a3: efA1A3,
          ef_total: efA1A3,
          carbon_sequestration: carbonStorage,
          data_source: 'NGER Materials Database v2025.1',
          region: 'Australia',
          year: 2025,
          notes: `Data quality: ${dataQuality}`,
        });
      }
      
      console.log(`[import-nger-data] Parsed ${materials.length} NGER materials`);
      
      // Insert in batches
      const batchSize = 100;
      let inserted = 0;
      let failed = 0;
      
      for (let i = 0; i < materials.length; i += batchSize) {
        const batch = materials.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('materials_epd')
          .insert(batch);
        
        if (insertError) {
          console.error(`[import-nger-data] Batch error:`, insertError);
          failed += batch.length;
        } else {
          inserted += batch.length;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        type: 'materials',
        total: materials.length,
        inserted,
        failed
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (action === 'import-operational') {
      // Parse NGER operational factors
      const rows = parseCSV(NGER_OPERATIONAL_CSV);
      const dataRows = rows.slice(1); // Skip header
      
      const factors: EmissionFactor[] = [];
      
      for (const row of dataRows) {
        if (row.length < 10) continue;
        
        const scope = parseInt(row[0], 10);
        const category = row[1]?.trim();
        const subcategory = row[2]?.trim();
        const fuelType = row[3]?.trim();
        const region = row[4]?.trim();
        const unit = row[5]?.trim();
        const totalCO2e = parseNumber(row[9]);
        const methodology = row[12]?.trim();
        const source = row[13]?.trim();
        
        if (!category || !totalCO2e) continue;
        
        factors.push({
          scope,
          category,
          subcategory: subcategory || null,
          fuel_type: fuelType || null,
          region: region || 'Australia',
          unit: unit || 'kgCO2e',
          factor_value: totalCO2e,
          source: source || 'NGA 2024',
          methodology: methodology || null,
          year: 2024,
        });
      }
      
      console.log(`[import-nger-data] Parsed ${factors.length} operational factors`);
      
      // Clear existing NGER operational factors
      await supabase
        .from('emission_factors')
        .delete()
        .eq('source', 'NGA 2024');
      
      // Insert in batches
      const batchSize = 50;
      let inserted = 0;
      let failed = 0;
      
      for (let i = 0; i < factors.length; i += batchSize) {
        const batch = factors.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('emission_factors')
          .insert(batch);
        
        if (insertError) {
          console.error(`[import-nger-data] Batch error:`, insertError);
          failed += batch.length;
        } else {
          inserted += batch.length;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        type: 'operational_factors',
        total: factors.length,
        inserted,
        failed
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (action === 'import-all') {
      // Import both materials and operational factors
      const materialsResult = await fetch(req.url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'import-materials' }),
      }).then(r => r.json());
      
      const operationalResult = await fetch(req.url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'import-operational' }),
      }).then(r => r.json());
      
      return new Response(JSON.stringify({ 
        success: true,
        materials: materialsResult,
        operational: operationalResult
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use "import-materials", "import-operational", or "import-all"' 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error('[import-nger-data] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while importing NGER data'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
