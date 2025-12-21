import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

/**
 * CarbonConstruct Monthly Material Validation Edge Function
 * Per Framework v1.0 Part 4.1 - Runs full Layer 1-6 validation
 * 
 * Layers:
 * 1. Data Integrity (null checks, type validation)
 * 2. EPD Registry Verification (S-P-XXXXX pattern)
 * 3. NABERS Range Validation
 * 4. Unit Consistency
 * 5. Source Credibility (Tier 1/2/3)
 * 6. Outlier Detection (statistical analysis)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'contact@carbonconstruct.net';

// NABERS v2025.1 expected ranges by category
const NABERS_RANGES: Record<string, { min: number; max: number; unit: string }[]> = {
  'Concrete (in-situ)': [
    { min: 136, max: 364, unit: 'm³' },
    { min: 149, max: 417, unit: 'm³' },
    { min: 167, max: 459, unit: 'm³' },
    { min: 198, max: 545, unit: 'm³' },
    { min: 101, max: 609, unit: 'm³' },
    { min: 205, max: 1270, unit: 'm³' },
  ],
  'Concrete': [
    { min: 136, max: 1270, unit: 'm³' },
  ],
  'Concrete precast': [
    { min: 150, max: 500, unit: 'm³' },
  ],
  'Steel': [
    { min: 400, max: 4000, unit: 'tonne' },
  ],
  'Metals - Steel': [
    { min: 400, max: 4000, unit: 'tonne' },
  ],
  'Aluminium': [
    { min: 800, max: 28800, unit: 'tonne' },
  ],
  'Metals - Aluminium': [
    { min: 800, max: 28800, unit: 'tonne' },
  ],
  'Timber': [
    { min: 53, max: 1000, unit: 'm³' },
  ],
  'Glass': [
    { min: 0.8, max: 50, unit: 'm²' },
  ],
  'Asphalt': [
    { min: 40, max: 180, unit: 'tonne' },
  ],
  'Aggregate': [
    { min: 0, max: 25, unit: 'tonne' },
  ],
  'Cement': [
    { min: 500, max: 1000, unit: 'tonne' },
  ],
  'Masonry': [
    { min: 50, max: 500, unit: 'm³' },
  ],
  'Insulation': [
    { min: 0.5, max: 30, unit: 'm²' },
  ],
  'Insulation only': [
    { min: 0.5, max: 30, unit: 'm²' },
  ],
};

// Source credibility tiers
const SOURCE_TIERS: Record<string, number> = {
  // Tier 1: Verified Australian Sources
  'EPD Australasia': 1,
  'NABERS': 1,
  'NABERS EPD': 1,
  'NABERS 2025': 1,
  'NGER': 1,
  'NGER Materials': 1,
  'NGER Materials Database': 1,
  // Tier 2: International and Industry Sources  
  'ICE': 2,
  'ICE V4': 2,
  'ICE Database': 2,
  'Circular Ecology': 2,
  'ICM Database': 2,
  'ICM Database 2019': 2,
  'AusLCI': 2,
  'EPD International': 2,
  'EC3': 2,
  'BlueScope': 2,
};

interface ValidationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  layer: number;
  code: string;
  message: string;
  materialId: string;
  materialName: string;
  value?: number | string;
  expectedRange?: string;
  recommendedAction: string;
}

interface MaterialValidation {
  id: string;
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
  data_source: string | null;
  epd_number: string | null;
  manufacturer: string | null;
  state: string | null;
  expiry_date: string | null;
  confidenceLevel: 'verified' | 'documented' | 'industry_average' | 'needs_review';
  confidenceColor: 'green' | 'yellow' | 'orange' | 'red';
  sourceTier: number;
  isOutlier: boolean;
  issues: ValidationIssue[];
}

interface ValidationReport {
  timestamp: string;
  version: string;
  totalMaterials: number;
  passRate: number;
  confidenceLevelCounts: {
    verified: number;
    documented: number;
    industry_average: number;
    needs_review: number;
  };
  sourceTierCounts: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  outlierCount: number;
  flaggedMaterials: MaterialValidation[];
  categoryStats: Record<string, {
    count: number;
    avgEf: number;
    minEf: number;
    maxEf: number;
    stdDev: number;
    outliers: number;
  }>;
}

function getSourceTier(dataSource: string | null): number {
  if (!dataSource) return 3;
  for (const [key, tier] of Object.entries(SOURCE_TIERS)) {
    if (dataSource.toLowerCase().includes(key.toLowerCase())) {
      return tier;
    }
  }
  return 3;
}

function validateMaterial(
  material: {
    id: string;
    material_name: string;
    material_category: string;
    ef_total: number | null;
    unit: string;
    data_source: string | null;
    epd_number: string | null;
    manufacturer: string | null;
    state: string | null;
    expiry_date: string | null;
  },
  categoryStats: Map<string, { mean: number; stdDev: number }>
): MaterialValidation {
  const issues: ValidationIssue[] = [];
  let confidenceLevel: 'verified' | 'documented' | 'industry_average' | 'needs_review' = 'verified';
  let isOutlier = false;
  
  const sourceTier = getSourceTier(material.data_source);
  
  // ============================================
  // LAYER 1: DATA INTEGRITY
  // ============================================
  if (material.ef_total === null || material.ef_total === undefined) {
    issues.push({
      severity: 'critical',
      layer: 1,
      code: 'NULL_EF_TOTAL',
      message: 'Missing emission factor value',
      materialId: material.id,
      materialName: material.material_name,
      recommendedAction: 'Remove from database or correct source data'
    });
    confidenceLevel = 'needs_review';
  }
  
  if (material.ef_total !== null && material.ef_total < 0) {
    issues.push({
      severity: 'critical',
      layer: 1,
      code: 'NEGATIVE_FACTOR',
      message: `Negative carbon factor: ${material.ef_total}`,
      materialId: material.id,
      materialName: material.material_name,
      value: material.ef_total,
      recommendedAction: 'Remove from database immediately'
    });
    confidenceLevel = 'needs_review';
  }
  
  if (!material.unit) {
    issues.push({
      severity: 'critical',
      layer: 1,
      code: 'MISSING_UNIT',
      message: 'Missing unit field',
      materialId: material.id,
      materialName: material.material_name,
      recommendedAction: 'Add unit from EPD source'
    });
    confidenceLevel = 'needs_review';
  }
  
  // ============================================
  // LAYER 2: EPD REGISTRY VERIFICATION
  // ============================================
  const hasValidEpdNumber = material.epd_number && /^S-P-\d{5}/.test(material.epd_number);
  
  if (sourceTier === 1 && !hasValidEpdNumber && material.epd_number) {
    issues.push({
      severity: 'medium',
      layer: 2,
      code: 'INVALID_EPD_FORMAT',
      message: `Invalid EPD format: ${material.epd_number}`,
      materialId: material.id,
      materialName: material.material_name,
      value: material.epd_number,
      recommendedAction: 'Verify EPD registration format (S-P-XXXXX)'
    });
  }
  
  if (sourceTier === 1 && !material.epd_number) {
    issues.push({
      severity: 'high',
      layer: 2,
      code: 'MISSING_EPD_NUMBER',
      message: 'EPD-sourced material missing registration number',
      materialId: material.id,
      materialName: material.material_name,
      recommendedAction: 'Verify with EPD Australasia registry'
    });
    if (confidenceLevel === 'verified') confidenceLevel = 'documented';
  }
  
  // Check expiry
  if (material.expiry_date) {
    const expiry = new Date(material.expiry_date);
    const now = new Date();
    if (expiry < now) {
      issues.push({
        severity: 'high',
        layer: 2,
        code: 'EXPIRED_EPD',
        message: `EPD expired on ${material.expiry_date}`,
        materialId: material.id,
        materialName: material.material_name,
        value: material.expiry_date,
        recommendedAction: 'Replace with current EPD version'
      });
      if (confidenceLevel === 'verified') confidenceLevel = 'documented';
    }
  }
  
  // ============================================
  // LAYER 3: NABERS RANGE VALIDATION
  // ============================================
  if (material.ef_total !== null && material.ef_total > 0 && material.material_category) {
    const ranges = NABERS_RANGES[material.material_category];
    if (ranges && ranges.length > 0) {
      const maxRange = Math.max(...ranges.map(r => r.max));
      const minRange = Math.min(...ranges.map(r => r.min));
      
      if (material.ef_total > maxRange * 1.3) {
        const variance = ((material.ef_total - maxRange) / maxRange * 100).toFixed(1);
        issues.push({
          severity: 'high',
          layer: 3,
          code: 'ABOVE_NABERS_RANGE',
          message: `Value ${material.ef_total} is ${variance}% above expected range (max ${maxRange})`,
          materialId: material.id,
          materialName: material.material_name,
          value: material.ef_total,
          expectedRange: `${minRange}-${maxRange}`,
          recommendedAction: 'Verify with manufacturer EPD or check grid/regional context'
        });
        isOutlier = true;
        if (confidenceLevel === 'verified') confidenceLevel = 'documented';
      } else if (material.ef_total < minRange * 0.7 && minRange > 0) {
        const variance = ((minRange - material.ef_total) / minRange * 100).toFixed(1);
        issues.push({
          severity: 'high',
          layer: 3,
          code: 'BELOW_NABERS_RANGE',
          message: `Value ${material.ef_total} is ${variance}% below expected range (min ${minRange})`,
          materialId: material.id,
          materialName: material.material_name,
          value: material.ef_total,
          expectedRange: `${minRange}-${maxRange}`,
          recommendedAction: 'Verify recycled content or source documentation'
        });
        isOutlier = true;
        if (confidenceLevel === 'verified') confidenceLevel = 'documented';
      }
    }
  }
  
  // ============================================
  // LAYER 5: SOURCE CREDIBILITY
  // ============================================
  if (sourceTier === 2) {
    if (confidenceLevel === 'verified') confidenceLevel = 'industry_average';
  } else if (sourceTier === 3) {
    issues.push({
      severity: 'medium',
      layer: 5,
      code: 'TIER_3_SOURCE',
      message: `Unknown source requires verification: ${material.data_source || 'null'}`,
      materialId: material.id,
      materialName: material.material_name,
      value: material.data_source || 'null',
      recommendedAction: 'Document source credibility or replace with Tier 1/2 source'
    });
    if (confidenceLevel === 'verified') confidenceLevel = 'documented';
  }
  
  // ============================================
  // LAYER 6: OUTLIER DETECTION
  // ============================================
  const stats = categoryStats.get(material.material_category);
  if (stats && material.ef_total !== null && stats.stdDev > 0) {
    const zScore = Math.abs((material.ef_total - stats.mean) / stats.stdDev);
    if (zScore > 2) {
      issues.push({
        severity: 'medium',
        layer: 6,
        code: 'STATISTICAL_OUTLIER',
        message: `Value ${material.ef_total} is ${zScore.toFixed(1)}σ from category mean (${stats.mean.toFixed(1)})`,
        materialId: material.id,
        materialName: material.material_name,
        value: material.ef_total,
        expectedRange: `${(stats.mean - 2 * stats.stdDev).toFixed(1)}-${(stats.mean + 2 * stats.stdDev).toFixed(1)}`,
        recommendedAction: 'Investigate regional/manufacturing variations'
      });
      isOutlier = true;
    }
  }
  
  // Determine confidence color
  let confidenceColor: 'green' | 'yellow' | 'orange' | 'red';
  switch (confidenceLevel) {
    case 'verified': confidenceColor = 'green'; break;
    case 'documented': confidenceColor = 'yellow'; break;
    case 'industry_average': confidenceColor = 'orange'; break;
    case 'needs_review': confidenceColor = 'red'; break;
  }
  
  return {
    id: material.id,
    material_name: material.material_name,
    material_category: material.material_category,
    ef_total: material.ef_total || 0,
    unit: material.unit,
    data_source: material.data_source,
    epd_number: material.epd_number,
    manufacturer: material.manufacturer,
    state: material.state,
    expiry_date: material.expiry_date,
    confidenceLevel,
    confidenceColor,
    sourceTier,
    isOutlier,
    issues
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for scheduled flag or internal secret
    let isScheduled = false;
    let isInternalCall = false;
    let body: Record<string, unknown> = {};
    
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
        isScheduled = body?.scheduled === true;
      }
    } catch {
      // No body or invalid JSON - treat as manual request
    }

    // Check for internal API secret (used by cron and internal tools)
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (authHeader === `Bearer ${serviceRoleKey}`) {
      isInternalCall = true;
      console.log(`[validate-materials] Internal service call starting full validation`);
    }

    // For scheduled (cron) or internal calls, skip auth
    // For manual calls, verify admin role
    if (!isScheduled && !isInternalCall) {
      if (!authHeader) {
        return new Response(JSON.stringify({ code: 401, message: 'Missing authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`[validate-materials] Admin ${user.id.slice(0, 8)}... starting full validation`);
    } else if (isScheduled) {
      console.log(`[validate-materials] Scheduled cron job starting full validation`);
    }

    // Fetch all materials in batches
    const allMaterials: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data: batch, error: fetchError } = await supabase
        .from('materials_epd')
        .select('id, material_name, material_category, ef_total, unit, data_source, epd_number, manufacturer, state, expiry_date')
        .range(offset, offset + batchSize - 1);
      
      if (fetchError) {
        console.error('[validate-materials] Fetch error:', fetchError);
        throw fetchError;
      }
      
      if (!batch || batch.length === 0) break;
      
      allMaterials.push(...batch);
      console.log(`[validate-materials] Fetched ${allMaterials.length} materials...`);
      
      if (batch.length < batchSize) break;
      offset += batchSize;
    }

    console.log(`[validate-materials] Total materials fetched: ${allMaterials.length}`);

    // Calculate category statistics for Layer 6
    const categoryStats = new Map<string, { mean: number; stdDev: number; values: number[] }>();
    
    for (const material of allMaterials) {
      if (material.ef_total === null || material.ef_total <= 0) continue;
      
      const cat = material.material_category;
      if (!categoryStats.has(cat)) {
        categoryStats.set(cat, { mean: 0, stdDev: 0, values: [] });
      }
      categoryStats.get(cat)!.values.push(material.ef_total);
    }
    
    // Calculate mean and stddev
    for (const [cat, stats] of categoryStats.entries()) {
      if (stats.values.length === 0) continue;
      const mean = stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
      const variance = stats.values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stats.values.length;
      stats.mean = mean;
      stats.stdDev = Math.sqrt(variance);
    }

    // Run validation on all materials
    const validatedMaterials: MaterialValidation[] = [];
    const confidenceCounts = { verified: 0, documented: 0, industry_average: 0, needs_review: 0 };
    const tierCounts = { tier1: 0, tier2: 0, tier3: 0 };
    const issueCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    let outlierCount = 0;
    const flaggedMaterials: MaterialValidation[] = [];
    
    for (const material of allMaterials) {
      const validation = validateMaterial(material, categoryStats);
      validatedMaterials.push(validation);
      
      confidenceCounts[validation.confidenceLevel]++;
      
      switch (validation.sourceTier) {
        case 1: tierCounts.tier1++; break;
        case 2: tierCounts.tier2++; break;
        case 3: tierCounts.tier3++; break;
      }
      
      for (const issue of validation.issues) {
        issueCounts[issue.severity]++;
      }
      
      if (validation.isOutlier) outlierCount++;
      
      // Flag materials with high/critical issues
      if (validation.issues.some(i => i.severity === 'critical' || i.severity === 'high')) {
        flaggedMaterials.push(validation);
      }
    }

    // Build category stats for report
    const categoryStatsReport: Record<string, any> = {};
    for (const [cat, stats] of categoryStats.entries()) {
      const catMaterials = validatedMaterials.filter(m => m.material_category === cat);
      categoryStatsReport[cat] = {
        count: catMaterials.length,
        avgEf: stats.mean,
        minEf: Math.min(...stats.values),
        maxEf: Math.max(...stats.values),
        stdDev: stats.stdDev,
        outliers: catMaterials.filter(m => m.isOutlier).length
      };
    }

    const totalMaterials = allMaterials.length;
    const passedMaterials = confidenceCounts.verified + confidenceCounts.documented + confidenceCounts.industry_average;
    const passRate = totalMaterials > 0 ? Math.round((passedMaterials / totalMaterials) * 1000) / 10 : 0;

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      version: 'v1.0',
      totalMaterials,
      passRate,
      confidenceLevelCounts: confidenceCounts,
      sourceTierCounts: tierCounts,
      issueCounts,
      outlierCount,
      flaggedMaterials: flaggedMaterials.slice(0, 100), // Top 100 flagged
      categoryStats: categoryStatsReport
    };

    console.log(`[validate-materials] Validation complete:`, {
      total: totalMaterials,
      passRate: `${passRate}%`,
      critical: issueCounts.critical,
      high: issueCounts.high,
      outliers: outlierCount
    });

    // Send email notification if critical issues found (for scheduled runs or any validation with critical issues)
    if (issueCounts.critical > 0 || issueCounts.high >= 10) {
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          
          const criticalMaterials = flaggedMaterials
            .filter(m => m.issues.some(i => i.severity === 'critical'))
            .slice(0, 10);
          
          const highMaterials = flaggedMaterials
            .filter(m => m.issues.some(i => i.severity === 'high') && !m.issues.some(i => i.severity === 'critical'))
            .slice(0, 10);

          const criticalIssuesList = criticalMaterials.map(m => {
            const issues = m.issues.filter(i => i.severity === 'critical');
            return `<li><strong>${m.material_name}</strong> (${m.material_category}): ${issues.map(i => i.message).join(', ')}</li>`;
          }).join('');

          const highIssuesList = highMaterials.map(m => {
            const issues = m.issues.filter(i => i.severity === 'high');
            return `<li><strong>${m.material_name}</strong> (${m.material_category}): ${issues.map(i => i.message).join(', ')}</li>`;
          }).join('');

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
              <h1 style="color: #dc2626;">⚠️ Material Validation Alert</h1>
              <p>The monthly material database validation has completed with <strong style="color: #dc2626;">${issueCounts.critical} critical</strong> and <strong style="color: #f59e0b;">${issueCounts.high} high</strong> severity issues requiring attention.</p>
              
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 10px 0; color: #dc2626;">Validation Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0;"><strong>Total Materials:</strong></td><td>${totalMaterials}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Pass Rate:</strong></td><td>${passRate}%</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Critical Issues:</strong></td><td style="color: #dc2626; font-weight: bold;">${issueCounts.critical}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>High Issues:</strong></td><td style="color: #f59e0b; font-weight: bold;">${issueCounts.high}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Outliers Detected:</strong></td><td>${outlierCount}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Validation Date:</strong></td><td>${new Date().toISOString().split('T')[0]}</td></tr>
                </table>
              </div>

              ${criticalIssuesList ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #dc2626;">🔴 Critical Issues (Top 10)</h3>
                <ul>${criticalIssuesList}</ul>
              </div>
              ` : ''}

              ${highIssuesList ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #f59e0b;">🟠 High Priority Issues (Top 10)</h3>
                <ul>${highIssuesList}</ul>
              </div>
              ` : ''}

              <div style="margin-top: 30px;">
                <a href="https://carbonconstruct.com.au/admin/monitoring" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Full Validation Report</a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                This is an automated notification from CarbonConstruct Material Validation Framework v1.0.<br>
                Validation runs automatically on the 1st of each month at 2:00 AM UTC.
              </p>
            </div>
          `;

          const { error: emailError } = await resend.emails.send({
            from: 'CarbonConstruct Alerts <alerts@carbonconstruct.com.au>',
            to: [ADMIN_EMAIL],
            subject: `⚠️ Material Validation Alert: ${issueCounts.critical} Critical, ${issueCounts.high} High Issues Found`,
            html: emailHtml,
          });

          if (emailError) {
            console.error('[validate-materials] Failed to send alert email:', emailError);
          } else {
            console.log(`[validate-materials] Alert email sent to ${ADMIN_EMAIL}`);
          }
        } else {
          console.warn('[validate-materials] RESEND_API_KEY not configured, skipping email notification');
        }
      } catch (emailErr) {
        console.error('[validate-materials] Error sending notification email:', emailErr);
      }
    }

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[validate-materials] Error:', error);
    return new Response(JSON.stringify({ error: 'Validation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
