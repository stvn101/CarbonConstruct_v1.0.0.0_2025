import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas (matching client-side schemas)
const MaterialSchema = z.object({
  id: z.string(),
  category: z.string().min(1).max(50),
  typeId: z.string().min(1).max(50),
  name: z.string().min(1, "Material name is required").max(100, "Material name too long"),
  unit: z.string().min(1).max(20),
  factor: z.number().nonnegative("Emission factor cannot be negative").max(100000, "Emission factor too high"),
  source: z.string().max(100),
  quantity: z.number().nonnegative("Quantity cannot be negative").max(1000000, "Quantity too large"),
  isCustom: z.boolean()
});

const FuelInputsSchema = z.record(
  z.string().max(50), 
  z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(1000000, "Quantity too large")
  ])
);

const ElectricityInputsSchema = z.object({
  kwh: z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(10000000, "Quantity too large")
  ]).optional()
});

// A4 Transport item schema for detailed transport tracking
const A4TransportItemSchema = z.object({
  id: z.string(),
  materialName: z.string().max(200),
  weight: z.number().nonnegative().max(10000000),
  distance: z.number().nonnegative().max(100000),
  mode: z.string().max(50),
  emissions: z.number().nonnegative().max(100000000)
});

const TransportInputsSchema = z.object({
  a4_transport_items: z.array(A4TransportItemSchema).max(500).optional(),
  a4_total_emissions: z.number().nonnegative().max(100000000).optional()
}).catchall(
  z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(10000000, "Quantity too large")
  ])
);

// EN 15978 B1-B7: Use Phase Validation Schemas
const MaintenanceItemSchema = z.object({
  id: z.string(),
  type: z.enum(['painting_interior', 'painting_exterior', 'carpet_replacement', 'hvac_maintenance', 'roof_maintenance', 'facade_cleaning', 'general_repairs']),
  areaSqm: z.number().nonnegative().max(10000000)
});

const ReplacementItemSchema = z.object({
  id: z.string(),
  type: z.enum(['hvac_system', 'roofing', 'flooring', 'facade_panels', 'windows', 'lifts', 'electrical', 'plumbing']),
  areaSqm: z.number().nonnegative().max(10000000)
});

const UsePhaseEmissionsSchema = z.object({
  b1_use: z.number().nonnegative().max(100000000),
  b2_maintenance: z.number().nonnegative().max(100000000),
  b3_repair: z.number().nonnegative().max(100000000),
  b4_replacement: z.number().nonnegative().max(100000000),
  b5_refurbishment: z.number().nonnegative().max(100000000),
  b6_operational_energy: z.number().nonnegative().max(100000000),
  b7_operational_water: z.number().nonnegative().max(100000000),
  total: z.number().nonnegative().max(100000000)
}).optional();

const UsePhaseInputsSchema = z.object({
  buildingLifespan: z.number().min(1).max(200).optional(),
  maintenanceItems: z.array(MaintenanceItemSchema).max(100).optional(),
  replacementItems: z.array(ReplacementItemSchema).max(100).optional(),
  refurbishmentScenario: z.enum(['none', 'minor', 'major']).optional(),
  annualElectricity: z.union([z.string(), z.number()]).optional(),
  annualGas: z.union([z.string(), z.number()]).optional(),
  renewablePercent: z.union([z.string(), z.number()]).optional(),
  annualWater: z.union([z.string(), z.number()]).optional(),
  refrigerantCharge: z.union([z.string(), z.number()]).optional(),
  refrigerantGWP: z.union([z.string(), z.number()]).optional()
}).optional();

// EN 15978 C1-C4: End-of-Life Validation Schemas
const WasteFractionSchema = z.object({
  material: z.enum(['concrete', 'steel', 'timber', 'brick', 'glass', 'plasterboard', 'mixed_waste', 'plastics', 'insulation', 'aluminium']),
  tonnes: z.number().nonnegative().max(10000000),
  recyclePercent: z.number().min(0).max(100),
  landfillPercent: z.number().min(0).max(100),
  incinerationPercent: z.number().min(0).max(100)
});

const EndOfLifeEmissionsSchema = z.object({
  c1_deconstruction: z.number().nonnegative().max(100000000),
  c2_transport: z.number().nonnegative().max(100000000),
  c3_waste_processing: z.number().nonnegative().max(100000000),
  c4_disposal: z.number().nonnegative().max(100000000),
  total: z.number().nonnegative().max(100000000)
}).optional();

const EndOfLifeInputsSchema = z.object({
  demolitionMethod: z.enum(['conventional', 'selective', 'deconstruction', 'implosion']).optional(),
  transportDistance: z.union([z.string(), z.number()]).optional(),
  wasteFractions: z.array(WasteFractionSchema).max(20).optional()
}).optional();

// EN 15978 Module D: Beyond Building Lifecycle Validation Schemas
const RecyclingItemSchema = z.object({
  material: z.enum(['steel', 'aluminium', 'concrete', 'timber', 'glass', 'copper', 'plastics', 'brick', 'plasterboard']),
  tonnes: z.number().nonnegative().max(10000000)
});

const ReuseItemSchema = z.object({
  material: z.enum(['steel', 'aluminium', 'concrete', 'timber', 'glass', 'copper', 'plastics', 'brick', 'plasterboard']),
  tonnes: z.number().nonnegative().max(10000000),
  reusePercent: z.number().min(0).max(100)
});

const EnergyRecoveryItemSchema = z.object({
  material: z.enum(['timber', 'plastics', 'mixed_waste']),
  tonnes: z.number().nonnegative().max(10000000)
});

const ModuleDEmissionsSchema = z.object({
  recycling_credits: z.number().max(0), // Should be negative (credits)
  reuse_credits: z.number().max(0),
  energy_recovery_credits: z.number().max(0),
  total: z.number().max(0)
}).optional();

const ModuleDInputsSchema = z.object({
  recyclingItems: z.array(RecyclingItemSchema).max(20).optional(),
  reuseItems: z.array(ReuseItemSchema).max(20).optional(),
  energyRecoveryItems: z.array(EnergyRecoveryItemSchema).max(20).optional()
}).optional();

// Totals schema with EN 15978 lifecycle stages
const TotalsSchema = z.object({
  scope1: z.number().optional(),
  scope2: z.number().optional(),
  scope3_materials: z.number().optional(),
  scope3_transport: z.number().optional(),
  total: z.number().optional(),
  a1a3: z.number().optional(),
  a4: z.number().optional(),
  a5: z.number().optional(),
  b1b7: z.number().optional(),
  c1c4: z.number().optional(),
  d: z.number().optional(),
  usePhase: UsePhaseEmissionsSchema,
  endOfLife: EndOfLifeEmissionsSchema,
  moduleD: ModuleDEmissionsSchema
}).optional();

const ProjectDetailsSchema = z.object({
  name: z.string().max(200, "Project name too long").optional(),
  location: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']),
  period: z.string().max(100).optional(),
  auditor: z.string().max(100).optional(),
  buildingSqm: z.number().nonnegative().max(10000000).optional()
});

const CalculationDataSchema = z.object({
  projectDetails: ProjectDetailsSchema,
  materials: z.array(MaterialSchema).max(500, "Too many materials (max 500)"),
  fuelInputs: FuelInputsSchema,
  electricityInputs: ElectricityInputsSchema,
  transportInputs: TransportInputsSchema,
  usePhaseInputs: UsePhaseInputsSchema,
  endOfLifeInputs: EndOfLifeInputsSchema,
  moduleDInputs: ModuleDInputsSchema,
  totals: TotalsSchema
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[validate-calculation] No authorization header provided");
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'validate-calculation',
        details: 'Missing authorization header'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Anon client for auth verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Service role client for rate limiting (requires elevated permissions)
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[validate-calculation] Authentication failed");
      logSecurityEvent({
        event_type: 'invalid_token',
        ip_address: getClientIP(req),
        endpoint: 'validate-calculation',
        details: 'Invalid or expired token'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    console.log(`[validate-calculation] Authenticated user: ${user.id.substring(0, 8)}...`);

    // Check rate limit using service role client (30 requests per 5 minutes for validation)
    const rateLimitResult = await checkRateLimit(
      supabaseServiceClient,
      user.id,
      'validate-calculation',
      { windowMinutes: 5, maxRequests: 30 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      console.warn(`[validate-calculation] Rate limit exceeded. Reset in ${resetInSeconds}s`);
      
      // Log security event for rate limit violation
      logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        user_id: user.id,
        ip_address: getClientIP(req),
        endpoint: 'validate-calculation',
        details: `Rate limit exceeded. Reset in ${resetInSeconds}s`
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
          retryAfter: resetInSeconds
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSeconds)
          } 
        }
      );
    }

    console.log(`[validate-calculation] Rate limit OK (${rateLimitResult.remaining} remaining)`);

    // Parse request body
    const body = await req.json();
    
    // Validate calculation data
    console.log(`[validate-calculation] Validating calculation data`);
    
    const result = CalculationDataSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      );
      
      console.error(`[validate-calculation] Validation failed`);
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          errors 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-calculation] Validation successful - ${result.data.materials.length} materials validated`);

    // Return validated data
    return new Response(
      JSON.stringify({ 
        valid: true, 
        data: result.data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[validate-calculation] Error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ 
        error: "Validation failed" 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
