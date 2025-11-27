import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting for public endpoint (IP-based)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 contact emails per hour per IP

function checkIpRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const existing = rateLimitMap.get(ip);
  
  // Clean up old entries
  if (existing && existing.resetAt < now) {
    rateLimitMap.delete(ip);
  }
  
  const current = rateLimitMap.get(ip);
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: new Date(now + RATE_LIMIT_WINDOW_MS) };
  }
  
  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: new Date(current.resetAt) };
  }
  
  current.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - current.count, resetAt: new Date(current.resetAt) };
}

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// HTML escape function to prevent XSS attacks
const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    const rateLimitResult = checkIpRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[send-contact-email] Rate limit exceeded for IP ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate inputs
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Escape user inputs to prevent XSS
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml(subject.trim());
    const safeMessage = escapeHtml(message.trim());

    // Send email to support team
    const emailResponse = await resend.emails.send({
      from: "CarbonConstruct <onboarding@resend.dev>",
      to: ["support@carbonconstruct.com.au"],
      replyTo: email,
      subject: `Support Request: ${safeSubject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "CarbonConstruct <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message",
      html: `
        <h1>Thank you for contacting us, ${safeName}!</h1>
        <p>We have received your message about: <strong>${safeSubject}</strong></p>
        <p>Our support team will get back to you as soon as possible.</p>
        <hr />
        <p><em>Your message:</em></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
        <br />
        <p>Best regards,<br>The CarbonConstruct Team</p>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
