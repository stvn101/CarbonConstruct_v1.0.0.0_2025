import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Extract text from PDF using basic text extraction
    // This extracts text streams from the PDF structure
    const text = extractTextFromPDF(uint8Array);

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not extract text from PDF. The PDF may be image-based or protected.' }),
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
 * Basic PDF text extraction
 * Extracts text content from PDF text streams
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
