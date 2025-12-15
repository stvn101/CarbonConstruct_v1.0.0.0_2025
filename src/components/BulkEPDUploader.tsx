import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Upload, FileText, CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, Trash2, Edit2, Save, FolderOpen, FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";

interface ExtractedProduct {
  product_name: string;
  manufacturer: string | null;
  epd_number: string | null;
  functional_unit: string | null;
  unit: string;
  gwp_a1a3: number | null;
  gwp_a4: number | null;
  gwp_a5: number | null;
  gwp_b1b5: number | null;
  gwp_c1c4: number | null;
  gwp_d: number | null;
  gwp_total: number | null;
  valid_until: string | null;
  geographic_scope: string | null;
  material_category: string;
  plant_location: string | null;
  data_source: string | null;
  recycled_content: number | null;
  notes: string | null;
  storage_url?: string;
}

interface ProcessedFile {
  fileName: string;
  storagePath: string | null;
  status: 'pending' | 'extracting' | 'extracted' | 'error' | 'approved' | 'saved';
  products: ExtractedProduct[];
  extractionConfidence: string;
  extractionNotes: string;
  error?: string;
  fileType: 'pdf' | 'xlsx';
}

const MATERIAL_CATEGORIES = [
  'Concrete', 'Steel', 'Timber', 'Insulation', 'Glass', 'Bricks', 
  'Plasterboard', 'Plastics', 'Aluminium', 'Copper', 'Roofing',
  'Flooring', 'Adhesives', 'Paints', 'Pipes', 'Other'
];

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.xlsx', '.xls'];

const isAcceptedFile = (file: File): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_FILE_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
};

const isExcelFile = (file: File): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return file.type.includes('spreadsheet') || file.type.includes('excel') || 
         extension === '.xlsx' || extension === '.xls';
};

export function BulkEPDUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<{ fileIndex: number; productIndex: number } | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isAcceptedFile);
    if (droppedFiles.length === 0) {
      toast.error('Only PDF and Excel files (.xlsx, .xls) are accepted');
      return;
    }
    setFiles(prev => [...prev, ...droppedFiles]);
    const pdfCount = droppedFiles.filter(f => f.type === 'application/pdf').length;
    const xlsxCount = droppedFiles.length - pdfCount;
    toast.success(`Added ${droppedFiles.length} file${droppedFiles.length > 1 ? 's' : ''} (${pdfCount} PDF, ${xlsxCount} Excel)`);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(isAcceptedFile);
    if (selectedFiles.length === 0) {
      toast.error('Only PDF and Excel files (.xlsx, .xls) are accepted');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
    const pdfCount = selectedFiles.filter(f => f.type === 'application/pdf').length;
    const xlsxCount = selectedFiles.length - pdfCount;
    toast.success(`Added ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} (${pdfCount} PDF, ${xlsxCount} Excel)`);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Parse XLSX file and extract products
  const parseExcelFile = async (file: File): Promise<ExtractedProduct[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty or has no data rows'));
            return;
          }

          // Map Excel columns to product fields (flexible column matching)
          const products: ExtractedProduct[] = jsonData.map((row) => {
            const findValue = (keys: string[]): any => {
              for (const key of keys) {
                const matchingKey = Object.keys(row).find(k => 
                  k.toLowerCase().includes(key.toLowerCase())
                );
                if (matchingKey && row[matchingKey] !== null && row[matchingKey] !== undefined && row[matchingKey] !== '') {
                  return row[matchingKey];
                }
              }
              return null;
            };

            const parseNumber = (value: any): number | null => {
              if (value === null || value === undefined || value === '') return null;
              const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
              return isNaN(num) ? null : num;
            };

            return {
              product_name: findValue(['product', 'name', 'material', 'description']) || 'Unknown Product',
              manufacturer: findValue(['manufacturer', 'supplier', 'company', 'producer']),
              epd_number: findValue(['epd', 'number', 'id', 'reference']),
              functional_unit: findValue(['functional', 'declared', 'unit_type']),
              unit: findValue(['unit']) || 'kg',
              gwp_a1a3: parseNumber(findValue(['a1a3', 'a1-a3', 'gwp_a1a3', 'production', 'embodied'])),
              gwp_a4: parseNumber(findValue(['a4', 'gwp_a4', 'transport'])),
              gwp_a5: parseNumber(findValue(['a5', 'gwp_a5', 'construction', 'installation'])),
              gwp_b1b5: parseNumber(findValue(['b1b5', 'b1-b5', 'gwp_b1b5', 'use_phase'])),
              gwp_c1c4: parseNumber(findValue(['c1c4', 'c1-c4', 'gwp_c1c4', 'end_of_life'])),
              gwp_d: parseNumber(findValue(['d', 'gwp_d', 'module_d', 'benefits'])),
              gwp_total: parseNumber(findValue(['total', 'gwp_total', 'gwp', 'carbon'])),
              valid_until: findValue(['valid', 'expiry', 'expires', 'until']),
              geographic_scope: findValue(['geographic', 'region', 'scope', 'country']) || 'Australia',
              material_category: findValue(['category', 'type', 'material_category']) || 'Other',
              plant_location: findValue(['plant', 'location', 'factory', 'site']),
              data_source: findValue(['source', 'data_source', 'database']) || `Excel Import: ${file.name}`,
              recycled_content: parseNumber(findValue(['recycled', 'recycled_content', 'recyclate'])),
              notes: findValue(['notes', 'comments', 'remarks']),
            };
          });

          // Filter out rows that don't have at least a product name and some carbon data
          const validProducts = products.filter(p => 
            p.product_name !== 'Unknown Product' || 
            p.gwp_a1a3 !== null || 
            p.gwp_total !== null
          );

          resolve(validProducts);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-pdf-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract text');
    }

    const { text } = await response.json();
    return text;
  };

  const uploadPDFToStorage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `uploads/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
      .from('epd-archive')
      .upload(path, file, { contentType: 'application/pdf' });

    if (error) throw error;
    return path;
  };

  // Process a single file and return the result
  const processSingleFile = async (
    file: File, 
    _fileIndex: number, 
    session: any
  ): Promise<ProcessedFile> => {
    const fileIsExcel = isExcelFile(file);
    const result: ProcessedFile = {
      fileName: file.name,
      storagePath: null,
      status: 'extracting',
      products: [],
      extractionConfidence: '',
      extractionNotes: '',
      fileType: fileIsExcel ? 'xlsx' : 'pdf',
    };

    try {
      if (fileIsExcel) {
        // Handle Excel file - parse locally
        const products = await parseExcelFile(file);
        
        return {
          ...result,
          status: 'extracted',
          products,
          extractionConfidence: 'high',
          extractionNotes: `Parsed ${products.length} materials from Excel spreadsheet`,
        };
      } else {
        // Handle PDF file - existing flow
        // 1. Upload PDF to storage
        const storagePath = await uploadPDFToStorage(file);
        result.storagePath = storagePath;

        // 2. Extract text from PDF
        const pdfText = await extractTextFromPDF(file);

        if (!pdfText || pdfText.length < 50) {
          throw new Error('Could not extract text from PDF. It may be image-based or corrupted.');
        }

        // 3. Send to AI for EPD extraction
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-epd-upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'extract',
            pdfText,
            fileName: file.name,
            storagePath,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Extraction failed');
        }

        const extractionResult = await response.json();

        return {
          ...result,
          status: 'extracted',
          products: extractionResult.products || [],
          extractionConfidence: extractionResult.extraction_confidence || 'unknown',
          extractionNotes: extractionResult.extraction_notes || '',
        };
      }
    } catch (error: any) {
      console.error(`Error processing ${file.name}:`, error);
      return {
        ...result,
        status: 'error',
        error: error.message,
      };
    }
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to process');
      return;
    }

    setIsProcessing(true);
    setProcessedFiles([]);
    setCurrentFile(0);

    const { data: { session } } = await supabase.auth.getSession();

    // Initialize all files as pending
    const initialFiles: ProcessedFile[] = files.map(f => ({
      fileName: f.name,
      storagePath: null,
      status: 'pending' as const,
      products: [],
      extractionConfidence: '',
      extractionNotes: '',
      fileType: isExcelFile(f) ? 'xlsx' as const : 'pdf' as const,
    }));
    setProcessedFiles(initialFiles);

    // Process files in batches of 3 for parallel processing
    const BATCH_SIZE = 3;
    const results: ProcessedFile[] = [];

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      setCurrentFile(i);
      
      // Update status to extracting for this batch
      setProcessedFiles(prev => prev.map((f, idx) => 
        idx >= i && idx < i + BATCH_SIZE ? { ...f, status: 'extracting' } : f
      ));

      toast.info(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(files.length/BATCH_SIZE)}...`);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((file, batchIdx) => processSingleFile(file, i + batchIdx, session))
      );

      // Update results
      batchResults.forEach((result, batchIdx) => {
        const globalIdx = i + batchIdx;
        setProcessedFiles(prev => prev.map((f, idx) => 
          idx === globalIdx ? result : f
        ));
        
        if (result.status === 'extracted') {
          toast.success(`${result.fileName}: ${result.products.length} products extracted`);
        } else if (result.status === 'error') {
          toast.error(`${result.fileName}: ${result.error}`);
        }
      });

      results.push(...batchResults);

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    
    const successCount = results.filter(r => r.status === 'extracted').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`All ${successCount} files processed successfully!`);
    } else {
      toast.info(`Processed ${successCount} files, ${errorCount} failed.`);
    }
  };

  const updateProduct = (fileIndex: number, productIndex: number, updates: Partial<ExtractedProduct>) => {
    setProcessedFiles(prev => prev.map((f, fi) => 
      fi === fileIndex ? {
        ...f,
        products: f.products.map((p, pi) => 
          pi === productIndex ? { ...p, ...updates } : p
        )
      } : f
    ));
  };

  const removeProduct = (fileIndex: number, productIndex: number) => {
    setProcessedFiles(prev => prev.map((f, fi) => 
      fi === fileIndex ? {
        ...f,
        products: f.products.filter((_, pi) => pi !== productIndex)
      } : f
    ));
  };

  const approveFile = (fileIndex: number) => {
    setProcessedFiles(prev => prev.map((f, i) => 
      i === fileIndex ? { ...f, status: 'approved' } : f
    ));
  };

  const saveApprovedMaterials = async () => {
    const approvedFiles = processedFiles.filter(f => f.status === 'approved');
    const allMaterials = approvedFiles.flatMap(f => 
      f.products.map(p => ({ ...p, storage_url: f.storagePath }))
    );

    if (allMaterials.length === 0) {
      toast.error('No approved materials to save');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-epd-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          materials: allMaterials,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const result = await response.json();
      setSavedCount(prev => prev + result.inserted);

      // Mark files as saved
      setProcessedFiles(prev => prev.map(f => 
        f.status === 'approved' ? { ...f, status: 'saved' } : f
      ));

      toast.success(`Saved ${result.inserted} materials to database!`);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    }
  };

  const getStatusBadge = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'extracting': return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Extracting</Badge>;
      case 'extracted': return <Badge className="bg-amber-500">Review</Badge>;
      case 'approved': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'saved': return <Badge className="bg-primary">Saved</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
    }
  };

  const totalProducts = processedFiles.reduce((sum, f) => sum + f.products.length, 0);
  const approvedProducts = processedFiles
    .filter(f => f.status === 'approved' || f.status === 'saved')
    .reduce((sum, f) => sum + f.products.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PDFs Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{files.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Products Extracted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">{approvedProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saved to DB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{savedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <FileText className="h-4 w-4" />
            Review & Edit ({processedFiles.length})
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Bulk EPD Upload
              </CardTitle>
              <CardDescription>
                Drop EPD PDF or Excel files here. PDFs use AI extraction, Excel files are parsed directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="epd-file-upload"
                />
                <label htmlFor="epd-file-upload" className="cursor-pointer">
                  <div className="flex justify-center gap-4 mb-4">
                    <FileText className="h-10 w-10 text-primary/50" />
                    <FileSpreadsheet className="h-10 w-10 text-emerald-500/50" />
                  </div>
                  <p className="font-medium">Drop EPD files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF and Excel (.xlsx, .xls) • Max 20MB each
                  </p>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Files to Process ({files.length})</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFiles([])}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    {files.map((file, i) => {
                      const fileIsExcel = isExcelFile(file);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {fileIsExcel ? (
                              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {fileIsExcel ? 'Excel' : 'PDF'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeFile(i)} aria-label={`Remove file ${file.name}`}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </ScrollArea>
                </div>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing: {files[currentFile]?.name}</span>
                    <span>{currentFile + 1} / {files.length}</span>
                  </div>
                  <Progress value={((currentFile + 1) / files.length) * 100} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={processFiles}
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Process {files.length} PDF{files.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          {processedFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files processed yet. Upload and process PDFs first.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bulk Actions */}
              <div className="flex gap-4 items-center">
                <Button
                  onClick={saveApprovedMaterials}
                  disabled={approvedProducts === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save {approvedProducts} Approved Materials
                </Button>
                <span className="text-sm text-muted-foreground">
                  {processedFiles.filter(f => f.status === 'extracted').length} files pending review
                </span>
              </div>

              {/* File Cards */}
              {processedFiles.map((file, fileIndex) => (
                <Card key={fileIndex} className={file.status === 'error' ? 'border-destructive' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">{file.fileName}</CardTitle>
                          <CardDescription>
                            {file.products.length} product{file.products.length !== 1 ? 's' : ''} extracted
                            {file.extractionConfidence && ` • Confidence: ${file.extractionConfidence}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(file.status)}
                        {file.status === 'extracted' && (
                          <Button size="sm" onClick={() => approveFile(fileIndex)} className="bg-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve All
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {file.error && (
                    <CardContent className="pt-0">
                      <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{file.error}</span>
                      </div>
                    </CardContent>
                  )}

                  {file.products.length > 0 && (
                    <CardContent className="pt-0">
                      <ScrollArea className="max-h-96">
                        <div className="space-y-3">
                          {file.products.map((product, productIndex) => (
                            <div key={productIndex} className="border rounded-lg p-4 bg-muted/30">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{product.product_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {product.manufacturer || 'Unknown manufacturer'} • {product.material_category}
                                  </p>
                                  {product.epd_number && (
                                    <p className="text-xs text-primary mt-1">EPD: {product.epd_number}</p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setEditingProduct({ fileIndex, productIndex })}
                                    aria-label={`Edit ${product.product_name}`}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeProduct(fileIndex, productIndex)}
                                    aria-label={`Delete ${product.product_name}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">A1-A3:</span>{' '}
                                  <span className="font-medium">{product.gwp_a1a3 ?? '-'} kgCO₂e/{product.unit}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">A4:</span>{' '}
                                  <span className="font-medium">{product.gwp_a4 ?? '-'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">A5:</span>{' '}
                                  <span className="font-medium">{product.gwp_a5 ?? '-'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total:</span>{' '}
                                  <span className="font-bold text-primary">{product.gwp_total ?? product.gwp_a1a3 ?? '-'}</span>
                                </div>
                              </div>

                              {product.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">{product.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {file.extractionNotes && (
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          AI Notes: {file.extractionNotes}
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={processedFiles[editingProduct.fileIndex]?.products[editingProduct.productIndex]}
          onSave={(updates) => {
            updateProduct(editingProduct.fileIndex, editingProduct.productIndex, updates);
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

function EditProductDialog({
  product,
  onSave,
  onClose,
}: {
  product: ExtractedProduct;
  onSave: (updates: Partial<ExtractedProduct>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...product });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Product Name</Label>
            <Input
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Manufacturer</Label>
            <Input
              value={form.manufacturer || ''}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
          </div>

          <div>
            <Label>EPD Number</Label>
            <Input
              value={form.epd_number || ''}
              onChange={(e) => setForm({ ...form, epd_number: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={form.material_category} onValueChange={(v) => setForm({ ...form, material_category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="tonne">tonne</SelectItem>
                <SelectItem value="m²">m²</SelectItem>
                <SelectItem value="m³">m³</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="piece">piece</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>GWP A1-A3 (kgCO₂e)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_a1a3 ?? ''}
              onChange={(e) => setForm({ ...form, gwp_a1a3: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP A4</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_a4 ?? ''}
              onChange={(e) => setForm({ ...form, gwp_a4: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP A5</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_a5 ?? ''}
              onChange={(e) => setForm({ ...form, gwp_a5: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP B1-B5</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_b1b5 ?? ''}
              onChange={(e) => setForm({ ...form, gwp_b1b5: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP C1-C4</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_c1c4 ?? ''}
              onChange={(e) => setForm({ ...form, gwp_c1c4: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP Module D</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_d ?? ''}
              onChange={(e) => setForm({ ...form, gwp_d: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>Geographic Scope</Label>
            <Input
              value={form.geographic_scope || ''}
              onChange={(e) => setForm({ ...form, geographic_scope: e.target.value })}
              placeholder="Australia"
            />
          </div>

          <div>
            <Label>Valid Until</Label>
            <Input
              type="date"
              value={form.valid_until || ''}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
