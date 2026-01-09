import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BOQUploader } from "@/components/BOQUploader";
import { BOQProcessingStatus } from "@/components/BOQProcessingStatus";
import { BOQMaterialReview } from "@/components/BOQMaterialReview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileSpreadsheet, Receipt, Upload, ArrowRight, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { validateCarbonFactors } from "@/lib/material-validation";
import { useReconciliation } from "@/hooks/useReconciliation";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const { parseInvoice, createRun, addInvoiceItems, runMatching } = useReconciliation();

  const [stage, setStage] = useState<ProcessingStage>("upload");
  const [processingStage, setProcessingStage] = useState<ProcessingSubStage>("uploading");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsFound, setMaterialsFound] = useState(0);
  const [materialsMatched, setMaterialsMatched] = useState(0);
  
  // Docket upload state
  const [docketFile, setDocketFile] = useState<File | null>(null);
  const [docketParsing, setDocketParsing] = useState(false);
  const [docketItems, setDocketItems] = useState<Array<{
    lineNumber: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number | null;
    totalPrice: number | null;
    category: string | null;
    confidence: number;
  }>>([]);
  const [creatingRun, setCreatingRun] = useState(false);

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

  // Docket upload handlers
  const handleDocketSelect = async (file: File) => {
    setDocketFile(file);
    setDocketParsing(true);
    setDocketItems([]);
    
    try {
      let text = '';
      let fileType = 'csv';
      
      if (file.name.endsWith('.csv')) {
        text = await file.text();
        fileType = 'csv';
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(firstSheet);
        fileType = 'xlsx';
      } else if (file.name.endsWith('.txt')) {
        text = await file.text();
        fileType = 'txt';
      } else {
        throw new Error('Unsupported file type. Please use CSV, Excel, or TXT files.');
      }
      
      const items = await parseInvoice(text, fileType);
      setDocketItems(items);
      
      toast({
        title: 'Docket Parsed',
        description: `Extracted ${items.length} line items from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to parse docket',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDocketParsing(false);
    }
  };

  const handleCreateReconciliationRun = async () => {
    if (!user) {
      toast({ title: 'Please sign in first', variant: 'destructive' });
      return;
    }
    
    if (docketItems.length === 0) {
      toast({ title: 'No items to reconcile', variant: 'destructive' });
      return;
    }
    
    setCreatingRun(true);
    try {
      // Get BOQ from localStorage
      let boqItems: Array<{
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit: string;
        factor: number;
        source: string;
      }> = [];
      
      const stored = localStorage.getItem('calculator-materials');
      if (stored) {
        const parsed = JSON.parse(stored);
        boqItems = parsed.map((m: Record<string, unknown>) => ({
          id: String(m.id || ''),
          name: String(m.name || ''),
          category: String(m.category || ''),
          quantity: Number(m.quantity) || 0,
          unit: String(m.unit || ''),
          factor: Number(m.factor) || 0,
          source: String(m.source || ''),
        }));
      }
      
      // Create run
      const run = await createRun.mutateAsync({
        name: `${docketFile?.name || 'Docket'} - ${new Date().toLocaleDateString()}`,
        projectId: undefined,
        boqItems,
      });
      
      // Add invoice items
      await addInvoiceItems.mutateAsync({
        runId: run.id,
        items: docketItems,
      });
      
      // Run matching
      await runMatching.mutateAsync(run.id);
      
      toast({
        title: 'Reconciliation Started',
        description: 'Redirecting to reconciliation page...',
      });
      
      navigate('/reconciliation');
    } catch (error) {
      toast({
        title: 'Failed to create reconciliation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreatingRun(false);
    }
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
        <h1 className="text-3xl font-bold mb-2">BOQ Import & Dockets</h1>
        <p className="text-muted-foreground">
          Import BOQ materials or upload delivery dockets for reconciliation
        </p>
      </div>

      <Tabs defaultValue="boq" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="boq" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            BOQ Import
          </TabsTrigger>
          <TabsTrigger value="docket" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Docket Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="boq">
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
        </TabsContent>
        
        <TabsContent value="docket">
          <Card className="p-6">
            <div className="text-center mb-6">
              <Receipt className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h2 className="text-xl font-semibold mb-2">Upload Delivery Docket or Receipt</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-3">
                Upload a delivery ticket, invoice, or receipt to compare against your BOQ estimates.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  .csv
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  .xlsx
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  .xls
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  .txt
                </span>
              </div>
            </div>
            
            {!docketFile && !docketParsing && docketItems.length === 0 && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={(e) => e.target.files?.[0] && handleDocketSelect(e.target.files[0])}
                  className="hidden"
                  id="docket-upload"
                />
                <label htmlFor="docket-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <span className="text-sm font-medium">Click to upload or drag and drop</span>
                  <span className="text-xs text-muted-foreground mt-1">CSV, Excel, or TXT files</span>
                </label>
              </div>
            )}
            
            {docketParsing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mr-3" />
                <span>Parsing docket with AI...</span>
              </div>
            )}
            
            {docketItems.length > 0 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Extracted Items ({docketItems.length})</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setDocketItems([]);
                        setDocketFile(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-auto space-y-2">
                    {docketItems.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="bg-background rounded p-2 text-sm flex justify-between">
                        <span className="truncate flex-1">{item.description}</span>
                        <span className="text-muted-foreground ml-2">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                    {docketItems.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{docketItems.length - 10} more items
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateReconciliationRun}
                    disabled={creatingRun}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {creatingRun ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Create Reconciliation Run
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/reconciliation')}>
                    View All Runs
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
