import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

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
  factor: z.number().positive("Emission factor must be positive").max(100000, "Emission factor too high"),
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

const TransportInputsSchema = z.record(
  z.string().max(50),
  z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(10000000, "Quantity too large")
  ])
);

const ProjectDetailsSchema = z.object({
  name: z.string().max(200, "Project name too long").optional(),
  location: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']),
  period: z.string().max(100).optional(),
  auditor: z.string().max(100).optional()
});

const CalculationDataSchema = z.object({
  projectDetails: ProjectDetailsSchema,
  materials: z.array(MaterialSchema).max(500, "Too many materials (max 500)"),
  fuelInputs: FuelInputsSchema,
  electricityInputs: ElectricityInputsSchema,
  transportInputs: TransportInputsSchema
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
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[validate-calculation] Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    console.log(`[validate-calculation] Authenticated user: ${user.id}`);

    // Check rate limit (30 requests per 5 minutes for validation)
    const rateLimitResult = await checkRateLimit(
      supabaseClient,
      user.id,
      'validate-calculation',
      { windowMinutes: 5, maxRequests: 30 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      console.warn(`[validate-calculation] User ${user.id}: Rate limit exceeded. Reset in ${resetInSeconds}s`);
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

    console.log(`[validate-calculation] User ${user.id}: Rate limit OK (${rateLimitResult.remaining} remaining)`);

    // Parse request body
    const body = await req.json();
    
    // Validate calculation data
    console.log(`[validate-calculation] User ${user.id}: Validating calculation data`);
    
    const result = CalculationDataSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      );
      
      console.error(`[validate-calculation] User ${user.id}: Validation failed - ${errors.join(', ')}`);
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          errors 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-calculation] User ${user.id}: Validation successful - ${result.data.materials.length} materials validated`);

    // Return validated data
    return new Response(
      JSON.stringify({ 
        valid: true, 
        data: result.data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[validate-calculation] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Validation failed" 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
