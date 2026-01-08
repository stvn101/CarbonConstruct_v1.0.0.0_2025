import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size for AI extraction (5MB) to prevent CPU timeouts
const MAX_AI_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Convert ArrayBuffer to base64 using chunked processing to avoid stack overflow
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
    const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

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

    // Check if user is admin (gets higher rate limit)
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    
    // Admin users get 100 extractions/hour, regular users get 20
    const maxRequests = isAdmin ? 100 : 20;
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, user.id, 'extract-pdf-text', {
      windowMinutes: 60,
      maxRequests
    });

    if (!rateLimitResult.allowed) {
      console.log(`[extract-pdf-text] Rate limit exceeded for user ${user.id} (limit: ${maxRequests})`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded (${maxRequests}/hour). Please try again later.`,
          resetAt: rateLimitResult.resetAt.toISOString(),
          remaining: rateLimitResult.remaining
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[extract-pdf-text] User ${user.id}: Processing PDF (remaining: ${rateLimitResult.remaining}/${maxRequests})`);

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

    // Check file size (max 20MB for upload)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'PDF file too large. Maximum size is 20MB.' }),
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
      
      // Check file size limit for AI extraction (5MB) to prevent CPU timeouts
      if (arrayBuffer.byteLength > MAX_AI_FILE_SIZE) {
        console.log(`[extract-pdf-text] File too large for AI extraction: ${arrayBuffer.byteLength} bytes`);
        return new Response(
          JSON.stringify({ 
            error: `PDF too large for AI extraction (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB. Please use a smaller file or a text-based PDF.` 
          }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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

  // Convert to base64 using chunked processing (fixes stack overflow on large files)
  const base64 = arrayBufferToBase64(arrayBuffer);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              text: `You are an expert at extracting text from Environmental Product Declaration (EPD) PDF documents.

Extract ALL text content from this PDF document. This is critical for compliance documentation.

Focus on extracting:
- Product names and descriptions
- Manufacturer and company information
- EPD registration/reference numbers (e.g., S-P-01234, EPD-IES-0012345)
- All GWP (Global Warming Potential) values in tables:
  - A1-A3 (Product stage)
  - A4 (Transport)
  - A5 (Installation)
  - B1-B7 (Use stage)
  - C1-C4 (End of life)
  - Module D (Benefits)
- Declared/functional unit (e.g., 1 kg, 1 m², 1 tonne)
- Geographic scope
- Valid until / expiry dates
- Recycled content percentages
- Plant/manufacturing location
- Program operator (e.g., EPD Australasia, International EPD System)

Format tables clearly with separators. Preserve numeric precision.
Return ONLY the extracted text, no commentary.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`
              }
            }
          ]
        }
      ],
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
