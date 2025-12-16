import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BOQUploader } from "@/components/BOQUploader";
import { BOQProcessingStatus } from "@/components/BOQProcessingStatus";
import { BOQMaterialReview } from "@/components/BOQMaterialReview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      // Step 1: Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `boq-uploads/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("boq-files")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setProgress(30);
      setProcessingStage("parsing");

      // Step 2: Call Supabase Edge Function to parse BOQ
      const { data, error: functionError } = await supabase.functions.invoke("parse-boq", {
        body: {
          file_path: filePath,
          file_name: file.name,
        },
      });

      if (functionError) {
        throw new Error(`Processing failed: ${functionError.message}`);
      }

      setProgress(60);
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
        <BOQUploader onFileSelect={handleFileSelect} isProcessing={false} />
      )}

      {stage === "processing" && (
        <BOQProcessingStatus
          stage={processingStage}
          progress={progress}
          fileName={fileName}
          materialsFound={materialsFound}
          materialsMatched={materialsMatched}
        />
      )}

      {stage === "review" && (
        <BOQMaterialReview
          materials={materials}
          onConfirm={handleConfirmMaterials}
          onBack={handleBackToUpload}
        />
      )}
    </div>
  );
}
