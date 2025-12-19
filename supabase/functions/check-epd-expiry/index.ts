import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

/**
 * Cron job edge function that runs daily to check for expiring EPD materials
 * and sends reminder emails to users who have enabled notifications
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringMaterial {
  material_name: string;
  epd_number: string | null;
  manufacturer: string | null;
  expiry_date: string;
  days_until_expiry: number;
  project_name: string;
}

interface UserMaterialGroup {
  user_id: string;
  email: string;
  materials: ExpiringMaterial[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting daily EPD expiry check...");

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with reminder settings enabled
    const { data: reminderSettings, error: settingsError } = await supabase
      .from("epd_reminder_settings")
      .select("*")
      .eq("enabled", true)
      .eq("email_notifications", true);

    if (settingsError) {
      console.error("Error fetching reminder settings:", settingsError);
      throw settingsError;
    }

    if (!reminderSettings || reminderSettings.length === 0) {
      console.log("No users with EPD reminders enabled");
      return new Response(
        JSON.stringify({ message: "No users with EPD reminders enabled", emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${reminderSettings.length} users with reminders enabled`);

    let totalEmailsSent = 0;
    const today = new Date();

    for (const settings of reminderSettings) {
      try {
        // Check if we should send based on reminder_days settings
        // Default to 30, 60, 90 days if not set
        const reminderDays = settings.reminder_days || [30, 60, 90];
        const maxReminderDays = Math.max(...reminderDays);

        // Get user's projects with unified calculations
        const { data: calculations, error: calcError } = await supabase
          .from("unified_calculations")
          .select(`
            materials,
            projects!inner(name)
          `)
          .eq("user_id", settings.user_id);

        if (calcError) {
          console.error(`Error fetching calculations for user ${settings.user_id}:`, calcError);
          continue;
        }

        if (!calculations || calculations.length === 0) {
          console.log(`No calculations found for user ${settings.user_id}`);
          continue;
        }

        // Collect all expiring materials across all projects
        const expiringMaterials: ExpiringMaterial[] = [];

        for (const calc of calculations) {
          const materials = calc.materials as any[] || [];
          const projectName = (calc.projects as any)?.name || 'Unknown Project';

          for (const material of materials) {
            if (!material.expiryDate) continue;

            const expiryDate = new Date(material.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Include if expired or within the max reminder window
            if (daysUntilExpiry <= maxReminderDays) {
              expiringMaterials.push({
                material_name: material.name || material.material_name || 'Unknown Material',
                epd_number: material.epdNumber || material.epd_number || null,
                manufacturer: material.manufacturer || null,
                expiry_date: material.expiryDate,
                days_until_expiry: daysUntilExpiry,
                project_name: projectName,
              });
            }
          }
        }

        if (expiringMaterials.length === 0) {
          console.log(`No expiring materials found for user ${settings.user_id}`);
          continue;
        }

        // Check if any materials match the reminder days thresholds
        const shouldSendReminder = expiringMaterials.some(m => {
          // Always send for expired materials
          if (m.days_until_expiry < 0) return true;
          // Check if days until expiry matches any of the reminder thresholds
          return reminderDays.some(threshold => 
            m.days_until_expiry <= threshold && m.days_until_expiry > threshold - 7
          );
        });

        // Also check last reminder sent - don't send more than once per day
        if (settings.last_reminder_sent) {
          const lastSent = new Date(settings.last_reminder_sent);
          const hoursSinceLastReminder = (today.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastReminder < 23) {
            console.log(`Skipping user ${settings.user_id} - reminder sent less than 24 hours ago`);
            continue;
          }
        }

        if (!shouldSendReminder) {
          console.log(`No reminder threshold matched for user ${settings.user_id}`);
          continue;
        }

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(settings.user_id);
        if (userError || !userData.user?.email) {
          console.error(`Error fetching user ${settings.user_id}:`, userError);
          continue;
        }

        const userEmail = userData.user.email;

        // Group materials by urgency
        const expired = expiringMaterials.filter(m => m.days_until_expiry < 0);
        const critical = expiringMaterials.filter(m => m.days_until_expiry >= 0 && m.days_until_expiry <= 30);
        const warning = expiringMaterials.filter(m => m.days_until_expiry > 30 && m.days_until_expiry <= 90);

        // Build email HTML
        const formatMaterialRow = (m: ExpiringMaterial) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.material_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.epd_number || 'N/A'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.manufacturer || 'Unknown'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.project_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.expiry_date}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: ${m.days_until_expiry < 0 ? '#dc2626' : m.days_until_expiry <= 30 ? '#ea580c' : '#ca8a04'};">
              ${m.days_until_expiry < 0 ? 'EXPIRED' : `${m.days_until_expiry} days`}
            </td>
          </tr>
        `;

        const buildSection = (title: string, items: ExpiringMaterial[], color: string) => {
          if (items.length === 0) return '';
          return `
            <div style="margin-bottom: 24px;">
              <h3 style="color: ${color}; margin-bottom: 12px;">${title} (${items.length})</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Material</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">EPD Number</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Manufacturer</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Project</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Expiry Date</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(formatMaterialRow).join('')}
                </tbody>
              </table>
            </div>
          `;
        };

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>EPD Expiry Reminder</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 900px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Daily EPD Expiry Reminder</h1>
                <p style="color: #d1fae5; margin: 8px 0 0 0;">CarbonConstruct Automated Material Certification Check</p>
              </div>
              
              <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="margin-bottom: 24px;">
                  This is your scheduled EPD expiry reminder. The following materials in your projects have EPD certifications that 
                  ${expired.length > 0 ? 'have expired or ' : ''}are approaching their expiry dates.
                </p>
                
                ${buildSection('Expired EPDs - Immediate Action Required', expired, '#dc2626')}
                ${buildSection('Critical - Expiring Within 30 Days', critical, '#ea580c')}
                ${buildSection('Warning - Expiring Within 90 Days', warning, '#ca8a04')}
                
                <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
                  <h4 style="margin: 0 0 8px 0; color: #166534;">Recommended Actions:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #166534;">
                    <li>Contact manufacturers or program operators to request updated EPDs</li>
                    <li>Check your Supplier Contacts in CarbonConstruct for quick access to renewal contacts</li>
                    <li>Search EPD registries (EPD Australasia, EPD International) for newer versions</li>
                    <li>Consider alternative materials with valid certifications if renewals are delayed</li>
                  </ul>
                </div>
                
                <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
                  This is an automated daily reminder from CarbonConstruct. You can manage your notification preferences and reminder schedule in the Settings page.
                  <br>Reminder thresholds: ${reminderDays.sort((a, b) => b - a).join(', ')} days before expiry.
                </p>
              </div>
            </body>
          </html>
        `;

        const subjectParts = [];
        if (expired.length > 0) subjectParts.push(`${expired.length} expired`);
        if (critical.length > 0) subjectParts.push(`${critical.length} expiring soon`);
        if (warning.length > 0 && subjectParts.length === 0) subjectParts.push(`${warning.length} warnings`);

        const { error: emailError } = await resend.emails.send({
          from: "CarbonConstruct <notifications@resend.dev>",
          to: [userEmail],
          subject: `Daily EPD Alert: ${subjectParts.join(', ')} materials require attention`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          continue;
        }

        // Update last reminder sent
        await supabase
          .from("epd_reminder_settings")
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq("user_id", settings.user_id);

        console.log(`Sent EPD reminder to ${userEmail} for ${expiringMaterials.length} materials`);
        totalEmailsSent++;

      } catch (userError) {
        console.error(`Error processing user ${settings.user_id}:`, userError);
        continue;
      }
    }

    console.log(`Daily EPD check complete. Sent ${totalEmailsSent} reminder emails.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: totalEmailsSent,
        usersChecked: reminderSettings.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in check-epd-expiry cron:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
