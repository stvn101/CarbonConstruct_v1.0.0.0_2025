import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EPDMaterial {
  material_name: string;
  epd_number: string | null;
  manufacturer: string | null;
  expiry_date: string;
  days_until_expiry: number;
}

interface ReminderRequest {
  user_id?: string;
  materials?: EPDMaterial[];
  manual_trigger?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { user_id, materials, manual_trigger }: ReminderRequest = await req.json();

    if (!user_id || !materials || materials.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData.user?.email) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = userData.user.email;

    // Check reminder settings
    const { data: settings } = await supabase
      .from("epd_reminder_settings")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!manual_trigger && settings && !settings.email_notifications) {
      return new Response(
        JSON.stringify({ message: "Email notifications disabled for user" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group materials by urgency
    const expired = materials.filter(m => m.days_until_expiry < 0);
    const critical = materials.filter(m => m.days_until_expiry >= 0 && m.days_until_expiry <= 30);
    const warning = materials.filter(m => m.days_until_expiry > 30 && m.days_until_expiry <= 90);

    // Build email HTML
    const formatMaterialRow = (m: EPDMaterial) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.material_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.epd_number || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.manufacturer || 'Unknown'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.expiry_date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: ${m.days_until_expiry < 0 ? '#dc2626' : m.days_until_expiry <= 30 ? '#ea580c' : '#ca8a04'};">
          ${m.days_until_expiry < 0 ? 'EXPIRED' : `${m.days_until_expiry} days`}
        </td>
      </tr>
    `;

    const buildSection = (title: string, items: EPDMaterial[], color: string) => {
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">EPD Expiry Reminder</h1>
            <p style="color: #d1fae5; margin: 8px 0 0 0;">CarbonConstruct Material Certification Alert</p>
          </div>
          
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin-bottom: 24px;">
              The following materials in your projects have EPD certifications that ${expired.length > 0 ? 'have expired or ' : ''}are approaching their expiry dates. 
              Please contact the manufacturers or program operators to request updated EPDs.
            </p>
            
            ${buildSection('Expired EPDs - Immediate Action Required', expired, '#dc2626')}
            ${buildSection('Critical - Expiring Within 30 Days', critical, '#ea580c')}
            ${buildSection('Warning - Expiring Within 90 Days', warning, '#ca8a04')}
            
            <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #166534;">Next Steps:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #166534;">
                <li>Contact manufacturers to request updated EPD certifications</li>
                <li>Check EPD registries for newer versions of expired EPDs</li>
                <li>Consider alternative materials with valid certifications</li>
                <li>Update your project calculations once new EPDs are obtained</li>
              </ul>
            </div>
            
            <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
              This is an automated reminder from CarbonConstruct. You can manage your notification preferences in the Settings page.
            </p>
          </div>
        </body>
      </html>
    `;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "CarbonConstruct <notifications@resend.dev>",
      to: [userEmail],
      subject: `EPD Expiry Alert: ${expired.length > 0 ? `${expired.length} expired` : ''} ${critical.length > 0 ? `${critical.length} expiring soon` : ''} materials require attention`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update last reminder sent
    await supabase
      .from("epd_reminder_settings")
      .upsert({
        user_id,
        last_reminder_sent: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log("EPD reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-epd-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
