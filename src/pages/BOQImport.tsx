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
import { validateCarbonFactors } from "@/lib/material-validation";

type ProcessingStage = "upload" | "processing" | "review";
type ProcessingSubStage = "uploading" | "parsing" | "matching" | "complete";

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

      // Validate CSV/text files for negative or all-empty carbon factors
      // Uses shared validation module for consistency with Calculator route
      const validationResult = validateCarbonFactors(text);
      if (!validationResult.valid) {
        console.error('[BOQ Upload] Validation failed:', validationResult.error);
        throw new Error(validationResult.error);
      }

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
