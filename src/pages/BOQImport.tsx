import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BOQUploader } from "@/components/BOQUploader";
import { BOQProcessingStatus } from "@/components/BOQProcessingStatus";
import { BOQMaterialReview } from "@/components/BOQMaterialReview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import * as XLSX from 'xlsx';

type ProcessingStage = "upload" | "processing" | "review";
type ProcessingSubStage = "uploading" | "parsing" | "matching" | "complete";

/**
 * Validates carbon factor column in CSV data.
 * - FAILS if all carbon factors are empty (incomplete data)
 * - FAILS if any carbon factors are negative (data error)
 * - PASSES non-numeric text like TBC, N/A (AI can handle these)
 */
function validateCarbonFactors(csvText: string): { valid: boolean; error?: string } {
  console.log('[BOQ Validation] Starting validation of CSV content...');
  const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);
  console.log(`[BOQ Validation] Found ${lines.length} lines`);
  
  if (lines.length < 2) {
    console.log('[BOQ Validation] Skipping - less than 2 lines');
    return { valid: true };
  }

  const headerRow = lines[0].toLowerCase();
  
  // Check if this looks like a BOQ with carbon factor column
  const carbonFactorPatterns = [
    'carbon factor',
    'carbon_factor',
    'kgco2e',
    'ef_total',
    'emission factor',
    'emission_factor',
    'co2e'
  ];
  
  const hasFactorColumn = carbonFactorPatterns.some(pattern => 
    headerRow.includes(pattern)
  );
  
  console.log(`[BOQ Validation] Header row: "${headerRow}"`);
  console.log(`[BOQ Validation] Has factor column: ${hasFactorColumn}`);
  
  if (!hasFactorColumn) {
    console.log('[BOQ Validation] No carbon factor column found - skipping validation');
    return { valid: true };
  }

  // Find the column index
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const factorColIndex = headers.findIndex(h => 
    carbonFactorPatterns.some(pattern => h.includes(pattern))
  );
  
  if (factorColIndex === -1) return { valid: true };

  // Collect stats
  const negativeRows: { row: number; value: string }[] = [];
  let emptyCount = 0;
  let validNumericCount = 0;
  let textValueCount = 0;
  const dataRowCount = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const columns = row.split(',').map(c => c.trim());
    
    if (columns.length <= factorColIndex) {
      emptyCount++;
      continue;
    }
    
    const factorValue = columns[factorColIndex].trim();
    void factorValue.toLowerCase(); // Normalized for logging
    
    // Check empty
    if (factorValue === '') {
      emptyCount++;
      continue;
    }
    
    // Check if it's a number
    const parsedNum = parseFloat(factorValue);
    
    if (!isNaN(parsedNum)) {
      // It's a number - check if negative
      if (parsedNum < 0) {
        negativeRows.push({ row: i + 1, value: factorValue });
      } else {
        validNumericCount++;
      }
    } else {
      // It's text (TBC, N/A, etc.) - count but don't fail
      textValueCount++;
      console.log(`[BOQ Validation] Row ${i + 1}: Text value "${factorValue}" - will let AI handle`);
    }
  }

  console.log(`[BOQ Validation] Stats: ${validNumericCount} valid, ${emptyCount} empty, ${textValueCount} text, ${negativeRows.length} negative`);

  // FAIL: Any negative values
  if (negativeRows.length > 0) {
    const examples = negativeRows.slice(0, 3).map(r => `Row ${r.row}: "${r.value}"`).join(', ');
    return {
      valid: false,
      error: `Carbon factors cannot be negative. Found ${negativeRows.length} negative value(s): ${examples}. Please correct these values before uploading.`
    };
  }

  // FAIL: All factors are empty (no data to process)
  if (emptyCount === dataRowCount) {
    return {
      valid: false,
      error: `All carbon factor values are empty. Please provide at least some carbon factor data, or upload a BOQ without a carbon factor column to have the AI estimate values.`
    };
  }

  console.log('[BOQ Validation] Validation passed');
  return { valid: true };
}

interface Material {
  material_name: string;
  quantity: number;
  unit: string;
  category: string;
  matched_epd_id?: string;
  confidence?: number;
  ef_total?: number;
}

export default function BOQImport() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stage, setStage] = useState<ProcessingStage>("upload");
  const [processingStage, setProcessingStage] = useState<ProcessingSubStage>("uploading");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsFound, setMaterialsFound] = useState(0);
  const [materialsMatched, setMaterialsMatched] = useState(0);

  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setStage("processing");
    setProcessingStage("uploading");
    setProgress(10);

    try {
      // Step 1: Extract text from file based on type
      let text = '';
      const fileNameLower = file.name.toLowerCase();
      
      if (fileNameLower.match(/\.xlsx?$/)) {
        // Parse Excel file using xlsx library
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Extract text from all sheets
        const textParts: string[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv.trim()) {
            textParts.push(`Sheet: ${sheetName}\n${csv}`);
          }
        }
        text = textParts.join('\n\n');
        
        toast({ 
          title: "📊 Excel file parsed", 
          description: `Extracted ${text.length.toLocaleString()} characters from ${workbook.SheetNames.length} sheet(s)`,
          duration: 2000
        });
      } else if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.txt')) {
        text = await file.text();
      } else if (fileNameLower.endsWith('.pdf')) {
        // For PDF, use the extract-pdf-text edge function
        setProcessingStage("parsing");
        setProgress(20);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke('extract-pdf-text', {
          body: formData,
        });
        
        if (pdfError || !pdfData?.text) {
          throw new Error(`PDF extraction failed: ${pdfError?.message || 'No text extracted'}`);
        }
        text = pdfData.text;
      } else {
        // Try to read as text
        text = await file.text();
      }

      if (!text || text.trim().length < 10) {
        throw new Error("Could not extract meaningful text from file. Please check the file format.");
      }

      // Validate CSV/text files for non-numeric or negative carbon factors
      // Also validate Excel files after conversion to CSV
      console.log('[BOQ Upload] Running carbon factor validation...');
      console.log('[BOQ Upload] File type:', fileNameLower);
      const validationResult = validateCarbonFactors(text);
      console.log('[BOQ Upload] Validation result:', validationResult);
      if (!validationResult.valid) {
        console.error('[BOQ Upload] Validation failed:', validationResult.error);
        throw new Error(validationResult.error);
      }
      console.log('[BOQ Upload] Validation passed');

      setProgress(40);
      setProcessingStage("parsing");

      // Step 2: Call Supabase Edge Function to parse BOQ with extracted text
      const { data, error: functionError } = await supabase.functions.invoke("parse-boq", {
        body: { text },
      });

      if (functionError) {
        throw new Error(`Processing failed: ${functionError.message}`);
      }

      setProgress(70);
      setProcessingStage("matching");

      // Step 3: Process the results
      if (data && data.materials) {
        const parsedMaterials = data.materials as Material[];
        setMaterials(parsedMaterials);
        setMaterialsFound(parsedMaterials.length);
        setMaterialsMatched(
          parsedMaterials.filter((m) => m.matched_epd_id).length
        );

        setProgress(100);
        setProcessingStage("complete");

        // Wait a moment before transitioning to review
        setTimeout(() => {
          setStage("review");
        }, 1000);

        toast({
          title: "BOQ Processed Successfully",
          description: `Found ${parsedMaterials.length} materials in your BOQ file`,
        });
      } else {
        throw new Error("No materials found in the response");
      }
    } catch (error) {
      console.error("BOQ processing error:", error);
      toast({
        title: "Processing Failed",
        description:
          error instanceof Error ? error.message : "Failed to process BOQ file",
        variant: "destructive",
      });
      setStage("upload");
      setProgress(0);
    }
  };

  const handleConfirmMaterials = (selectedMaterials: Material[]) => {
    // Navigate to calculator with selected materials
    navigate("/calculator", {
      state: {
        importedMaterials: selectedMaterials,
      },
    });

    toast({
      title: "Materials Imported",
      description: `${selectedMaterials.length} materials ready to add to your calculation`,
    });
  };

  const handleBackToUpload = () => {
    setStage("upload");
    setProgress(0);
    setMaterials([]);
    setMaterialsFound(0);
    setMaterialsMatched(0);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/calculator")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calculator
        </Button>
        <h1 className="text-3xl font-bold mb-2">BOQ Import</h1>
        <p className="text-muted-foreground">
          Import materials from your Bill of Quantities to calculate embodied carbon
        </p>
      </div>

      {stage === "upload" && (
        <BOQUploader onFileUpload={handleFileSelect} />
      )}

      {stage === "processing" && (
        <BOQProcessingStatus
          progress={progress}
          status={`${processingStage} - ${fileName} (${materialsFound} found, ${materialsMatched} matched)`}
        />
      )}

      {stage === "review" && (
        <BOQMaterialReview
          materials={materials}
          onConfirm={handleConfirmMaterials}
          onCancel={handleBackToUpload}
        />
      )}
    </div>
  );
}
