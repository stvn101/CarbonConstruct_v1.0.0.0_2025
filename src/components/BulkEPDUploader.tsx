// Bulk EPD Uploader with carbon factor validation
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Download,
  RefreshCw,
  Info,
  AlertTriangle,
  FileText
} from "lucide-react";

// NABERS EPD List v2025.1 column structure (31 columns)
const NABERS_COLUMNS = [
  "EPD Number",
  "EPD Name", 
  "EPD Validity Start",
  "EPD Validity End",
  "PCR",
  "Program Operator",
  "Third Party Verified",
  "Manufacturer/Brand Owner",
  "Manufacturing City",
  "Manufacturing State",
  "Manufacturing Country",
  "Declared Unit",
  "GWP-fossil A1-A3",
  "GWP-biogenic A1-A3",
  "GWP-luluc A1-A3",
  "GWP-total A1-A3",
  "GWP-fossil A4",
  "GWP-biogenic A4",
  "GWP-luluc A4",
  "GWP-total A4",
  "GWP-fossil A5",
  "GWP-biogenic A5",
  "GWP-luluc A5",
  "GWP-total A5",
  "GWP-fossil C1-C4",
  "GWP-biogenic C1-C4",
  "GWP-luluc C1-C4",
  "GWP-total C1-C4",
  "GWP-fossil D",
  "GWP-biogenic D",
  "GWP-luluc D",
  "GWP-total D"
];

// Carbon factor validation ranges by category
const CARBON_FACTOR_RANGES: Record<string, { min: number; max: number; typical: number }> = {
  "Concrete": { min: 50, max: 800, typical: 300 },
  "Steel": { min: 500, max: 3500, typical: 1800 },
  "Timber": { min: -500, max: 500, typical: 50 },
  "Aluminium": { min: 5000, max: 25000, typical: 12000 },
  "Glass": { min: 500, max: 2500, typical: 1200 },
  "Insulation": { min: 1, max: 15, typical: 5 },
  "Plastics": { min: 2000, max: 8000, typical: 4000 },
  "Bricks": { min: 100, max: 500, typical: 250 },
  "Cement": { min: 600, max: 1200, typical: 900 },
  "Default": { min: 0.01, max: 50000, typical: 500 }
};

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "success" | "error";
  progress: number;
  message?: string;
  validationResults?: ValidationResult[];
}

interface ValidationResult {
  row: number;
  field: string;
  value: string | number | null;
  issue: "missing" | "invalid" | "outlier" | "warning";
  message: string;
  suggestion?: string;
}

interface ParsedMaterial {
  epd_number: string;
  material_name: string;
  manufacturer: string;
  manufacturing_city: string;
  manufacturing_country: string;
  unit: string;
  gwp_fossil_a1a3: number | null;
  gwp_biogenic_a1a3: number | null;
  gwp_luluc_a1a3: number | null;
  ef_a1a3: number | null;
  ef_a4: number | null;
  ef_a5: number | null;
  ef_c1c4: number | null;
  ef_d: number | null;
  ef_total: number;
  publish_date: string | null;
  expiry_date: string | null;
  program_operator: string | null;
  data_source: string;
  material_category: string;
  state: string | null;
}

export default function BulkEPDUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFormat, setSelectedFormat] = useState<string>("nabers-v2025.1");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [validateCarbonFactors, setValidateCarbonFactors] = useState(true);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [validationSummary, setValidationSummary] = useState<{
    total: number;
    valid: number;
    warnings: number;
    errors: number;
    outliers: number;
  } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.name.endsWith(".xlsx") || 
      file.name.endsWith(".xls") || 
      file.name.endsWith(".csv")
    );
    
    if (validFiles.length !== droppedFiles.length) {
      toast.warning("Some files were skipped. Only .xlsx, .xls, and .csv files are supported.");
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = selectedFiles.filter(file => 
      file.name.endsWith(".xlsx") || 
      file.name.endsWith(".xls") || 
      file.name.endsWith(".csv")
    );

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  }, []);

  const validateCarbonFactor = (
    value: number,
    category: string,
    field: string,
    row: number
  ): ValidationResult | null => {
    const range = CARBON_FACTOR_RANGES[category] || CARBON_FACTOR_RANGES["Default"];
    
    if (value < range.min || value > range.max) {
      return {
        row,
        field,
        value,
        issue: "outlier",
        message: `Carbon factor ${value} is outside expected range (${range.min} - ${range.max}) for ${category}`,
        suggestion: `Typical value for ${category}: ${range.typical} kgCO2e`
      };
    }

    // Check for suspiciously round numbers
    if (value !== 0 && value % 100 === 0 && value > 1000) {
      return {
        row,
        field,
        value,
        issue: "warning",
        message: `Round number ${value} may indicate estimated/placeholder data`,
        suggestion: "Verify against EPD source document"
      };
    }

    return null;
  };

  const inferCategory = (materialName: string): string => {
    const name = materialName.toLowerCase();
    if (name.includes("concrete") || name.includes("cement")) return "Concrete";
    if (name.includes("steel") || name.includes("rebar") || name.includes("reinforc")) return "Steel";
    if (name.includes("timber") || name.includes("wood") || name.includes("plywood")) return "Timber";
    if (name.includes("aluminium") || name.includes("aluminum")) return "Aluminium";
    if (name.includes("glass") || name.includes("glazing")) return "Glass";
    if (name.includes("insulation") || name.includes("rockwool") || name.includes("glasswool")) return "Insulation";
    if (name.includes("plastic") || name.includes("pvc") || name.includes("hdpe")) return "Plastics";
    if (name.includes("brick") || name.includes("masonry")) return "Bricks";
    return "Default";
  };

  const parseNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return isNaN(num) ? null : num;
  };

  const processFile = async (uploadedFile: UploadedFile): Promise<ParsedMaterial[]> => {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await uploadedFile.file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];
    
    // Convert ExcelJS format to array of arrays
    const jsonData: unknown[][] = [];
    worksheet.eachRow((row, _rowNumber) => {
      const rowData: unknown[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        rowData.push(cell.value);
      });
      jsonData.push(rowData);
    });

    if (jsonData.length < 2) {
      throw new Error("File appears to be empty or has no data rows");
    }

    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);

    // Map headers to expected columns
    const columnMap: Record<string, number> = {};
    headers.forEach((header, index) => {
      const normalizedHeader = String(header).trim().toLowerCase();
      NABERS_COLUMNS.forEach(col => {
        if (normalizedHeader === col.toLowerCase()) {
          columnMap[col] = index;
        }
      });
    });

    const materials: ParsedMaterial[] = [];
    const validationResults: ValidationResult[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // Account for header row and 0-indexing

      const getValue = (colName: string): unknown => {
        const idx = columnMap[colName];
        return idx !== undefined ? row[idx] : null;
      };

      const epdNumber = String(getValue("EPD Number") || "").trim();
      const materialName = String(getValue("EPD Name") || "").trim();

      if (!epdNumber || !materialName) {
        validationResults.push({
          row: rowNum,
          field: "EPD Number / EPD Name",
          value: null,
          issue: "missing",
          message: "Missing required EPD number or name"
        });
        continue;
      }

      const gwpFossilA1A3 = parseNumber(getValue("GWP-fossil A1-A3"));
      const gwpBiogenicA1A3 = parseNumber(getValue("GWP-biogenic A1-A3"));
      const gwpLulucA1A3 = parseNumber(getValue("GWP-luluc A1-A3"));
      const gwpTotalA1A3 = parseNumber(getValue("GWP-total A1-A3"));
      const gwpTotalA4 = parseNumber(getValue("GWP-total A4"));
      const gwpTotalA5 = parseNumber(getValue("GWP-total A5"));
      const gwpTotalC1C4 = parseNumber(getValue("GWP-total C1-C4"));
      const gwpTotalD = parseNumber(getValue("GWP-total D"));

      const efTotal = gwpTotalA1A3 ?? 0;
      const category = inferCategory(materialName);

      // Validate carbon factors if enabled
      if (validateCarbonFactors && efTotal !== 0) {
        const validation = validateCarbonFactor(efTotal, category, "GWP-total A1-A3", rowNum);
        if (validation) {
          validationResults.push(validation);
        }
      }

      const material: ParsedMaterial = {
        epd_number: epdNumber,
        material_name: materialName,
        manufacturer: String(getValue("Manufacturer/Brand Owner") || "").trim(),
        manufacturing_city: String(getValue("Manufacturing City") || "").trim(),
        manufacturing_country: String(getValue("Manufacturing Country") || "").trim(),
        unit: String(getValue("Declared Unit") || "kg").trim(),
        gwp_fossil_a1a3: gwpFossilA1A3,
        gwp_biogenic_a1a3: gwpBiogenicA1A3,
        gwp_luluc_a1a3: gwpLulucA1A3,
        ef_a1a3: gwpTotalA1A3,
        ef_a4: gwpTotalA4,
        ef_a5: gwpTotalA5,
        ef_c1c4: gwpTotalC1C4,
        ef_d: gwpTotalD,
        ef_total: efTotal,
        publish_date: String(getValue("EPD Validity Start") || "").trim() || null,
        expiry_date: String(getValue("EPD Validity End") || "").trim() || null,
        program_operator: String(getValue("Program Operator") || "").trim() || null,
        data_source: "NABERS EPD List v2025.1",
        material_category: category,
        state: String(getValue("Manufacturing State") || "").trim() || null
      };

      materials.push(material);
    }

    // Store validation results on the file object
    uploadedFile.validationResults = validationResults;

    return materials;
  };

  const uploadMaterials = async (materials: ParsedMaterial[]): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    const uploadErrors: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (const material of materials) {
      try {
        if (skipDuplicates) {
          // Check for existing material by EPD number
          const { data: existing } = await supabase
            .from("materials_epd")
            .select("id")
            .eq("epd_number", material.epd_number)
            .maybeSingle();

          if (existing) {
            skipped++;
            continue;
          }
        }

        const { error } = await supabase
          .from("materials_epd")
          .insert({
            epd_number: material.epd_number,
            material_name: material.material_name,
            manufacturer: material.manufacturer,
            manufacturing_city: material.manufacturing_city,
            manufacturing_country: material.manufacturing_country,
            unit: material.unit,
            gwp_fossil_a1a3: material.gwp_fossil_a1a3,
            gwp_biogenic_a1a3: material.gwp_biogenic_a1a3,
            gwp_luluc_a1a3: material.gwp_luluc_a1a3,
            ef_a1a3: material.ef_a1a3,
            ef_a4: material.ef_a4,
            ef_a5: material.ef_a5,
            ef_c1c4: material.ef_c1c4,
            ef_d: material.ef_d,
            ef_total: material.ef_total,
            publish_date: material.publish_date,
            expiry_date: material.expiry_date,
            program_operator: material.program_operator,
            data_source: material.data_source,
            material_category: material.material_category,
            state: material.state
          });

        if (error) {
          uploadErrors.push(`${material.epd_number}: ${error.message}`);
        } else {
          imported++;
        }
      } catch (err) {
        uploadErrors.push(`${material.epd_number}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }

      setProcessedCount(prev => prev + 1);
    }

    return { imported, skipped, errors: uploadErrors };
  };

  const handleProcess = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast.error("No files to process");
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setProcessedCount(0);
    setTotalCount(0);

    let totalValid = 0;
    let totalWarnings = 0;
    let totalErrors = 0;
    let totalOutliers = 0;

    for (const uploadedFile of pendingFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.name === uploadedFile.name 
            ? { ...f, status: "processing" as const, progress: 10 }
            : f
        ));

        const materials = await processFile(uploadedFile);
        
        setFiles(prev => prev.map(f => 
          f.name === uploadedFile.name 
            ? { ...f, progress: 50 }
            : f
        ));

        setTotalCount(prev => prev + materials.length);

        const { imported, skipped, errors: uploadErrors } = await uploadMaterials(materials);

        // Aggregate validation results
        const validationResults = uploadedFile.validationResults || [];
        totalWarnings += validationResults.filter(r => r.issue === "warning").length;
        totalErrors += validationResults.filter(r => r.issue === "missing" || r.issue === "invalid").length;
        totalOutliers += validationResults.filter(r => r.issue === "outlier").length;
        totalValid += materials.length - validationResults.length;

        setFiles(prev => prev.map(f => 
          f.name === uploadedFile.name 
            ? { 
                ...f, 
                status: "success" as const, 
                progress: 100,
                message: `Imported: ${imported}, Skipped: ${skipped}${uploadErrors.length > 0 ? `, Errors: ${uploadErrors.length}` : ""}`
              }
            : f
        ));

        if (uploadErrors.length > 0) {
          setErrors(prev => [...prev, ...uploadErrors.slice(0, 10)]);
        }

        toast.success(`Processed ${uploadedFile.name}: ${imported} imported, ${skipped} skipped`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setFiles(prev => prev.map(f => 
          f.name === uploadedFile.name 
            ? { ...f, status: "error" as const, progress: 0, message: errorMessage }
            : f
        ));
        toast.error(`Error processing ${uploadedFile.name}: ${errorMessage}`);
      }
    }

    setValidationSummary({
      total: totalCount,
      valid: totalValid,
      warnings: totalWarnings,
      errors: totalErrors,
      outliers: totalOutliers
    });

    setIsProcessing(false);
    setActiveTab("results");
  };

  const downloadTemplate = () => {
    const headers = NABERS_COLUMNS.join(",");
    const sampleRow = [
      "S-P-00001",
      "Sample Concrete Mix 32MPa",
      "2024-01-01",
      "2029-01-01",
      "PCR 2019:14",
      "EPD Australasia",
      "Yes",
      "Sample Manufacturer",
      "Sydney",
      "NSW",
      "Australia",
      "1 m3",
      "280.5",
      "-15.2",
      "2.3",
      "267.6",
      "12.5",
      "0",
      "0.1",
      "12.6",
      "5.2",
      "0",
      "0",
      "5.2",
      "25.3",
      "0",
      "0.5",
      "25.8",
      "-45.2",
      "0",
      "-2.1",
      "-47.3"
    ].join(",");

    const csv = `${headers}\n${sampleRow}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nabers-epd-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearAll = () => {
    setFiles([]);
    setErrors([]);
    setProcessedCount(0);
    setTotalCount(0);
    setValidationSummary(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk EPD Uploader
        </CardTitle>
        <CardDescription>
          Import EPD materials from spreadsheet files with automatic validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="format">Import Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nabers-v2025.1">NABERS EPD List v2025.1</SelectItem>
                    <SelectItem value="ice-v4.1">ICE Database v4.1</SelectItem>
                    <SelectItem value="custom">Custom Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={downloadTemplate} className="mt-6">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports .xlsx, .xls, and .csv files
              </p>
              <Input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Files ({files.length})</Label>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        {file.status === "processing" && (
                          <Progress value={file.progress} className="h-1 mt-1" />
                        )}
                        {file.message && (
                          <p className="text-xs text-muted-foreground mt-1">{file.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "pending" && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {file.status === "processing" && (
                          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {file.status === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {file.status === "error" && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(file.name)}
                          disabled={file.status === "processing"}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleProcess}
                disabled={files.filter(f => f.status === "pending").length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing ({processedCount}/{totalCount})
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Process Files
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="skip-duplicates">
                  Skip duplicate EPD numbers
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validate-carbon"
                  checked={validateCarbonFactors}
                  onCheckedChange={(checked) => setValidateCarbonFactors(checked as boolean)}
                />
                <Label htmlFor="validate-carbon">
                  Validate carbon factor ranges
                </Label>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Validation Info</AlertTitle>
                <AlertDescription>
                  Carbon factor validation checks values against expected ranges for material categories.
                  Outliers and suspicious values will be flagged but still imported.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Expected Carbon Factor Ranges (kgCO2e)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(CARBON_FACTOR_RANGES).filter(([key]) => key !== "Default").map(([category, range]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-muted-foreground">{category}:</span>
                      <span>{range.min} - {range.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {validationSummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{validationSummary.total}</div>
                      <p className="text-xs text-muted-foreground">Total Processed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-500">{validationSummary.valid}</div>
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-yellow-500">{validationSummary.warnings}</div>
                      <p className="text-xs text-muted-foreground">Warnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-orange-500">{validationSummary.outliers}</div>
                      <p className="text-xs text-muted-foreground">Outliers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-destructive">{validationSummary.errors}</div>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </CardContent>
                  </Card>
                </div>

                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Import Errors</AlertTitle>
                    <AlertDescription>
                      <ScrollArea className="h-32 mt-2">
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}

                {files.some(f => f.validationResults && f.validationResults.length > 0) && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Validation Issues
                    </h4>
                    <ScrollArea className="h-48">
                      {files.flatMap(f => f.validationResults || []).map((result, i) => (
                        <div key={i} className="text-sm p-2 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              result.issue === "missing" || result.issue === "invalid" ? "destructive" :
                              result.issue === "outlier" ? "default" : "secondary"
                            }>
                              Row {result.row}
                            </Badge>
                            <span className="font-medium">{result.field}</span>
                          </div>
                          <p className="text-muted-foreground mt-1">{result.message}</p>
                          {result.suggestion && (
                            <p className="text-xs text-blue-500 mt-1">{result.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results yet. Process some files to see results.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
