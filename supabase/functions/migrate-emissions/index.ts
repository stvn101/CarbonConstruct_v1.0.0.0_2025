import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header to identify user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting migration for user: ${user.id}`);

    // Get all projects for this user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id);

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ message: "No projects found for user", migrated: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let migratedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const project of projects) {
      console.log(`Processing project: ${project.name} (${project.id})`);

      // Check if migration already exists for this project
      const { data: existing } = await supabase
        .from('unified_calculations')
        .select('id')
        .eq('project_id', project.id)
        .eq('is_draft', false)
        .maybeSingle();

      if (existing) {
        console.log(`Skipping project ${project.id} - migration already exists`);
        skippedCount++;
        results.push({ project: project.name, status: 'skipped', reason: 'Already migrated' });
        continue;
      }

      // Fetch all emissions for this project
      const [scope1Result, scope2Result, scope3Result] = await Promise.all([
        supabase.from('scope1_emissions').select('*').eq('project_id', project.id),
        supabase.from('scope2_emissions').select('*').eq('project_id', project.id),
        supabase.from('scope3_emissions').select('*').eq('project_id', project.id)
      ]);

      if (scope1Result.error || scope2Result.error || scope3Result.error) {
        console.error(`Error fetching emissions for project ${project.id}`);
        results.push({ project: project.name, status: 'error', reason: 'Failed to fetch emissions' });
        continue;
      }

      const scope1Data = scope1Result.data || [];
      const scope2Data = scope2Result.data || [];
      const scope3Data = scope3Result.data || [];

      // Skip if no data to migrate
      if (scope1Data.length === 0 && scope2Data.length === 0 && scope3Data.length === 0) {
        console.log(`No emissions data found for project ${project.id}`);
        results.push({ project: project.name, status: 'skipped', reason: 'No data to migrate' });
        continue;
      }

      // Transform Scope 1 (fuel) inputs
      const fuelInputs: any = {};
      scope1Data.forEach((emission: any) => {
        const fuelType = emission.fuel_type?.toLowerCase().replace(/\s+/g, '_');
        if (fuelType && emission.quantity) {
          fuelInputs[fuelType] = emission.quantity;
        }
      });

      // Transform Scope 2 (electricity) inputs
      const electricityInputs: any = {};
      if (scope2Data.length > 0) {
        const totalKwh = scope2Data.reduce((sum: number, e: any) => sum + (e.quantity || 0), 0);
        electricityInputs.kwh = totalKwh;
      }

      // Transform Scope 3 materials
      const materials = scope3Data
        .filter((e: any) => e.category_name?.includes('Material') || e.lca_stage)
        .map((emission: any) => ({
          id: emission.id,
          name: emission.activity_description || emission.subcategory || 'Unknown Material',
          quantity: emission.quantity || 0,
          unit: emission.unit || 'kg',
          factor: emission.emission_factor || 0,
          category: emission.subcategory || 'Custom',
          source: 'Migrated Data',
          isCustom: false
        }));

      // Transform Scope 3 transport inputs
      const transportInputs: any = {};
      scope3Data
        .filter((e: any) => e.category_name?.includes('Transport') || e.category === 4)
        .forEach((emission: any) => {
          if (emission.quantity) {
            // Try to map to known transport types
            const desc = (emission.activity_description || '').toLowerCase();
            if (desc.includes('car') || desc.includes('commute')) {
              transportInputs.commute_car = (transportInputs.commute_car || 0) + emission.quantity;
            } else if (desc.includes('waste')) {
              transportInputs.waste = (transportInputs.waste || 0) + emission.quantity;
            }
          }
        });

      // Calculate totals
      let scope1Total = 0;
      let scope2Total = 0;
      let scope3MaterialsTotal = 0;
      let scope3TransportTotal = 0;

      scope1Data.forEach((e: any) => { scope1Total += e.emissions_tco2e || 0; });
      scope2Data.forEach((e: any) => { scope2Total += e.emissions_tco2e || 0; });
      
      scope3Data.forEach((e: any) => {
        const emissions = e.emissions_tco2e || 0;
        if (e.category_name?.includes('Material') || e.lca_stage) {
          scope3MaterialsTotal += emissions;
        } else if (e.category_name?.includes('Transport') || e.category === 4) {
          scope3TransportTotal += emissions;
        }
      });

      const totals = {
        scope1: scope1Total,
        scope2: scope2Total,
        scope3_materials: scope3MaterialsTotal,
        scope3_transport: scope3TransportTotal,
        total: scope1Total + scope2Total + scope3MaterialsTotal + scope3TransportTotal
      };

      // Insert into unified_calculations
      const { error: insertError } = await supabase
        .from('unified_calculations')
        .insert([{
          project_id: project.id,
          user_id: user.id,
          materials: materials as any,
          fuel_inputs: fuelInputs as any,
          electricity_inputs: electricityInputs as any,
          transport_inputs: transportInputs as any,
          totals: totals as any,
          is_draft: false
        }]);

      if (insertError) {
        console.error(`Failed to insert for project ${project.id}:`, insertError);
        results.push({ project: project.name, status: 'error', reason: insertError.message });
        continue;
      }

      console.log(`Successfully migrated project ${project.id}`);
      migratedCount++;
      results.push({ 
        project: project.name, 
        status: 'success',
        summary: {
          scope1_emissions: scope1Data.length,
          scope2_emissions: scope2Data.length,
          scope3_emissions: scope3Data.length,
          materials_migrated: materials.length,
          total_tco2e: totals.total
        }
      });
    }

    return new Response(
      JSON.stringify({
        message: "Migration completed",
        summary: {
          total_projects: projects.length,
          migrated: migratedCount,
          skipped: skippedCount,
          failed: results.filter(r => r.status === 'error').length
        },
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    // Log full error details on the server for diagnostics
    console.error("Migration Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An internal error occurred during migration.",
        error_code: "MIGRATION_ERROR"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});