import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[extract-pdf-text] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit (20 PDF extractions per hour per user)
    const rateLimitResult = await checkRateLimit(supabase, user.id, 'extract-pdf-text', {
      windowMinutes: 60,
      maxRequests: 20
    });

    if (!rateLimitResult.allowed) {
      console.log(`[extract-pdf-text] Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[extract-pdf-text] User ${user.id}: Processing PDF`);

    // Get the PDF file from form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!file.type.includes('pdf')) {
      return new Response(
        JSON.stringify({ error: 'File must be a PDF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'PDF file too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[extract-pdf-text] User ${user.id}: File size ${file.size} bytes`);

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Try basic text extraction first
    let text = extractTextFromPDF(uint8Array);
    
    // If basic extraction failed or returned minimal text, use AI extraction
    if (!text || text.trim().length < 100) {
      console.log(`[extract-pdf-text] Basic extraction insufficient (${text?.length || 0} chars), using AI extraction`);
      
      try {
        text = await extractTextWithAI(arrayBuffer);
      } catch (aiError) {
        console.error('[extract-pdf-text] AI extraction failed:', aiError);
        return new Response(
          JSON.stringify({ error: 'Could not extract text from PDF. The PDF may be corrupted or in an unsupported format.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not extract text from PDF. The PDF may be empty or corrupted.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[extract-pdf-text] User ${user.id}: Extracted ${text.length} characters`);

    return new Response(
      JSON.stringify({ text: text.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[extract-pdf-text] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Extract text from PDF using Lovable AI (Gemini) - handles image-based and complex PDFs
 */
async function extractTextWithAI(arrayBuffer: ArrayBuffer): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // Convert to base64
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64 = btoa(String.fromCharCode(...uint8Array));

  const response = await fetch('https://ai.lovable.dev/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL text content from this PDF document. Include all text you can see, preserving the general structure with line breaks between sections. Focus on extracting:
- Product names and descriptions
- Manufacturer information
- Numbers, measurements, and values
- Tables (format as plain text with clear separators)
- Any certification or reference numbers

Return ONLY the extracted text, no commentary or formatting notes.`
            },
            {
              type: 'file',
              file: {
                filename: 'document.pdf',
                file_data: `data:application/pdf;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[extract-pdf-text] AI API error:', errorText);
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Basic PDF text extraction - works for simple text-based PDFs
 */
function extractTextFromPDF(data: Uint8Array): string {
  const decoder = new TextDecoder('latin1');
  const content = decoder.decode(data);
  
  const textParts: string[] = [];
  
  // Extract text from BT...ET blocks (text objects)
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(content)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj operator (show text)
    const tjMatches = textBlock.match(/\(([^)]*)\)\s*Tj/g);
    if (tjMatches) {
      for (const tjMatch of tjMatches) {
        const textMatch = tjMatch.match(/\(([^)]*)\)/);
        if (textMatch) {
          textParts.push(decodeText(textMatch[1]));
        }
      }
    }
    
    // Extract text from TJ operator (show text array)
    const tjArrayMatches = textBlock.match(/\[([\s\S]*?)\]\s*TJ/g);
    if (tjArrayMatches) {
      for (const tjArrayMatch of tjArrayMatches) {
        const arrayContent = tjArrayMatch.match(/\[([\s\S]*?)\]/);
        if (arrayContent) {
          const strings = arrayContent[1].match(/\(([^)]*)\)/g);
          if (strings) {
            for (const str of strings) {
              const textMatch = str.match(/\(([^)]*)\)/);
              if (textMatch) {
                textParts.push(decodeText(textMatch[1]));
              }
            }
          }
        }
      }
    }
  }
  
  // Also try to extract from stream content directly
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamRegex.exec(content)) !== null) {
    const streamContent = match[1];
    
    // Look for readable text patterns
    const readableText = streamContent.match(/\(([A-Za-z0-9\s.,\-:;'"!?@#$%^&*()+=\[\]{}|\\/<>~`]+)\)/g);
    if (readableText) {
      for (const text of readableText) {
        const decoded = text.slice(1, -1);
        if (decoded.length > 2 && /[A-Za-z]/.test(decoded)) {
          textParts.push(decodeText(decoded));
        }
      }
    }
  }
  
  // Clean up and join text
  let result = textParts.join(' ');
  
  // Clean up common PDF artifacts
  result = result
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return result;
}

/**
 * Decode PDF text escape sequences
 */
function decodeText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}
