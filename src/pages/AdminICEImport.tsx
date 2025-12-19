import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Database, Upload, FileSpreadsheet, CheckCircle, AlertTriangle,
  RefreshCw, ExternalLink, Loader2, XCircle,
  Info, FileCheck, Eye, ArrowRight, Settings2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { DataSourceAttribution } from "@/components/DataSourceAttribution";
import { AdminSidebar } from "@/components/AdminSidebar";
import * as XLSX from "xlsx";

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
  validationIssues: { material: string; issue: string }[];
  timestamp: string;
}

interface MaterialPreview {
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
  data_quality_tier: string;
}

interface WorksheetInfo {
  name: string;
  rowCount: number;
  detectedHeaderRow: number | null;
  headerScore: number;
}

interface ColumnMapping {
  original: string;
  mappedTo: string;
  sampleValue: string;
}

interface ValidationPreview {
  worksheets: WorksheetInfo[];
  selectedWorksheet: string;
  selectedHeaderRow: number;
  detectedColumns: ColumnMapping[];
  sampleRows: Record<string, unknown>[];
  totalRows: number;
  parsedMaterials: Record<string, unknown>[];
}

type ImportStep = 'idle' | 'parsing' | 'preview' | 'importing' | 'complete';

export default function AdminICEImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ImportStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<MaterialPreview[]>([]);
  const [validationPreview, setValidationPreview] = useState<ValidationPreview | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to access this page.</p>
        <Button onClick={() => navigate("/auth")} className="mt-4">Sign In</Button>
      </div>
    );
  }

  const CHUNK_SIZE = 500;

  const normalize = (v: unknown) => String(v ?? '').trim();

  const scoreHeaderRow = (row: unknown[]): number => {
    const tokens = row.map((c) => normalize(c).toLowerCase()).filter(Boolean);
    let score = 0;
    
    // Key column indicators
    if (tokens.some((t) => t.includes('material'))) score += 3;
    if (tokens.some((t) => t === 'material' || t === 'materials')) score += 2;
    if (tokens.some((t) => t.includes('name'))) score += 2;
    if (tokens.some((t) => t.includes('category') || t.includes('sub category'))) score += 2;
    if (tokens.some((t) => t.includes('ef') || t.includes('embodied'))) score += 3;
    if (tokens.some((t) => t.includes('kgco2') || t.includes('co2'))) score += 3;
    if (tokens.some((t) => t.includes('unit'))) score += 2;
    if (tokens.some((t) => t.includes('density'))) score += 1;
    if (tokens.some((t) => t.includes('a1') || t.includes('a1-a3'))) score += 2;
    
    // Penalty for too few columns
    if (tokens.length < 3) score -= 5;
    
    return score;
  };

  const mapColumnName = (original: string): string => {
    const lower = original.toLowerCase().trim();
    
    // Material name mappings
    if (lower === 'material' || lower === 'materials' || lower === 'material name') return 'material_name';
    if (lower === 'name') return 'material_name';
    
    // Category mappings
    if (lower.includes('sub category') || lower.includes('subcategory')) return 'subcategory';
    if (lower.includes('category')) return 'material_category';
    
    // EF mappings - ICE specific
    if (lower.includes('embodied carbon') && lower.includes('kgco2e/kg')) return 'ef_total';
    if (lower.includes('ef_total') || lower === 'ef total') return 'ef_total';
    if (lower.includes('a1-a3') || lower.includes('a1a3')) return 'ef_a1a3';
    if (lower.includes('a4') && !lower.includes('a1')) return 'ef_a4';
    if (lower.includes('a5') && !lower.includes('a1')) return 'ef_a5';
    if (lower.includes('b1-b5') || lower.includes('b1b5')) return 'ef_b1b5';
    if (lower.includes('c1-c4') || lower.includes('c1c4')) return 'ef_c1c4';
    if (lower.includes('module d') || lower === 'd') return 'ef_d';
    
    // Unit and other mappings
    if (lower === 'unit' || lower === 'units') return 'unit';
    if (lower.includes('density')) return 'density';
    if (lower.includes('recycled')) return 'recycled_content';
    if (lower.includes('data quality')) return 'data_quality_tier';
    if (lower.includes('source') || lower.includes('reference')) return 'data_source';
    if (lower.includes('notes') || lower.includes('comment')) return 'notes';
    
    return original; // Keep original if no mapping found
  };

  const analyzeWorkbook = async (): Promise<ValidationPreview> => {
    setProgressLabel('Loading spreadsheet...');
    setProgress(10);
    
    const response = await fetch('/demo/ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    setProgressLabel('Parsing Excel file...');
    setProgress(30);

    const wb = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: false,
      raw: true,
    });
    
    setWorkbook(wb);
    setProgress(50);
    setProgressLabel('Analyzing worksheets...');

    const worksheets: WorksheetInfo[] = [];
    let bestSheet = { name: '', score: -1, headerRow: 0 };

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      if (!sheet || !sheet['!ref']) {
        worksheets.push({ name: sheetName, rowCount: 0, detectedHeaderRow: null, headerScore: 0 });
        continue;
      }

      const r = XLSX.utils.decode_range(sheet['!ref']);
      const rowCount = r.e.r - r.s.r + 1;

      // Scan first 100 rows for header
      const sampleRange = {
        s: { c: r.s.c, r: r.s.r },
        e: { c: Math.min(r.e.c, r.s.c + 50), r: Math.min(r.e.r, r.s.r + 100) },
      };

      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        range: sampleRange,
        blankrows: false,
        raw: true,
      });

      let bestRowScore = 0;
      let bestRowIndex = 0;

      for (let i = 0; i < aoa.length; i++) {
        const row = aoa[i] ?? [];
        if (Array.isArray(row)) {
          const score = scoreHeaderRow(row);
          if (score > bestRowScore) {
            bestRowScore = score;
            bestRowIndex = sampleRange.s.r + i;
          }
        }
      }

      worksheets.push({
        name: sheetName,
        rowCount,
        detectedHeaderRow: bestRowScore > 5 ? bestRowIndex : null,
        headerScore: bestRowScore,
      });

      if (bestRowScore > bestSheet.score) {
        bestSheet = { name: sheetName, score: bestRowScore, headerRow: bestRowIndex };
      }
    }

    setProgress(70);
    setProgressLabel('Extracting sample data...');

    // Get sample data from best sheet
    const selectedSheet = wb.Sheets[bestSheet.name];
    const headerRow = bestSheet.headerRow;

    // Get column headers
    const headerRange = XLSX.utils.decode_range(selectedSheet['!ref']!);
    const headerAoa = XLSX.utils.sheet_to_json<unknown[]>(selectedSheet, {
      header: 1,
      range: { s: { c: headerRange.s.c, r: headerRow }, e: { c: headerRange.e.c, r: headerRow } },
      raw: true,
    });

    const headers = (headerAoa[0] as unknown[] || []).map((h) => normalize(h));

    // Get sample rows (next 10 rows after header)
    const sampleRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(selectedSheet, {
      defval: null,
      raw: true,
      range: headerRow,
    }).slice(0, 10);

    // Create column mappings
    const detectedColumns: ColumnMapping[] = headers
      .filter(h => h.length > 0)
      .slice(0, 15) // Limit to first 15 columns for display
      .map((original) => ({
        original,
        mappedTo: mapColumnName(original),
        sampleValue: normalize(sampleRows[0]?.[original] ?? ''),
      }));

    // Parse all materials for count
    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(selectedSheet, {
      defval: null,
      raw: true,
      range: headerRow,
    });

    // Filter to likely material rows
    const parsedMaterials = allRows.filter((row) => {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
      return values.length >= 3;
    });

    setProgress(100);
    setProgressLabel('');

    return {
      worksheets,
      selectedWorksheet: bestSheet.name,
      selectedHeaderRow: headerRow,
      detectedColumns,
      sampleRows,
      totalRows: parsedMaterials.length,
      parsedMaterials,
    };
  };

  const startValidation = async () => {
    setIsLoading(true);
    setStep('parsing');
    setProgress(0);

    try {
      const preview = await analyzeWorkbook();
      setValidationPreview(preview);
      setStep('preview');
      toast.success(`Found ${preview.totalRows} potential materials in "${preview.selectedWorksheet}"`);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse spreadsheet');
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorksheetSelection = (sheetName: string) => {
    if (!workbook || !validationPreview) return;

    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) return;

    const wsInfo = validationPreview.worksheets.find(w => w.name === sheetName);
    const headerRow = wsInfo?.detectedHeaderRow ?? 0;

    // Re-extract data for new sheet
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: true,
      range: headerRow,
    });

    const sampleRows = rows.slice(0, 10);
    const headers = Object.keys(sampleRows[0] || {});

    const detectedColumns: ColumnMapping[] = headers
      .filter(h => h.length > 0)
      .slice(0, 15)
      .map((original) => ({
        original,
        mappedTo: mapColumnName(original),
        sampleValue: normalize(sampleRows[0]?.[original] ?? ''),
      }));

    const parsedMaterials = rows.filter((row) => {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
      return values.length >= 3;
    });

    setValidationPreview({
      ...validationPreview,
      selectedWorksheet: sheetName,
      selectedHeaderRow: headerRow,
      detectedColumns,
      sampleRows,
      totalRows: parsedMaterials.length,
      parsedMaterials,
    });
  };

  const updateHeaderRow = (headerRow: number) => {
    if (!workbook || !validationPreview) return;

    const sheet = workbook.Sheets[validationPreview.selectedWorksheet];
    if (!sheet) return;

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: true,
      range: headerRow,
    });

    const sampleRows = rows.slice(0, 10);
    const headers = Object.keys(sampleRows[0] || {});

    const detectedColumns: ColumnMapping[] = headers
      .filter(h => h.length > 0)
      .slice(0, 15)
      .map((original) => ({
        original,
        mappedTo: mapColumnName(original),
        sampleValue: normalize(sampleRows[0]?.[original] ?? ''),
      }));

    const parsedMaterials = rows.filter((row) => {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
      return values.length >= 3;
    });

    setValidationPreview({
      ...validationPreview,
      selectedHeaderRow: headerRow,
      detectedColumns,
      sampleRows,
      totalRows: parsedMaterials.length,
      parsedMaterials,
    });
  };

  const runImport = async (dryRun: boolean) => {
    if (!validationPreview || validationPreview.parsedMaterials.length === 0) {
      toast.error('No materials to import. Please validate the spreadsheet first.');
      return;
    }

    setIsLoading(true);
    setProgress(5);
    setProgressLabel('Preparing import...');
    setStep('importing');

    try {
      const materials = validationPreview.parsedMaterials;
      const totalChunks = Math.ceil(materials.length / CHUNK_SIZE);
      const totalRows = materials.length;

      let totalValid = 0;
      let totalErrors = 0;
      let totalInserted = 0;
      const allErrors: string[] = [];
      const preview: MaterialPreview[] = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalRows);

        setProgressLabel(
          `${dryRun ? 'Validating' : 'Importing'} rows ${start + 1}-${end} of ${totalRows} (chunk ${chunkIndex + 1}/${totalChunks})…`
        );

        const pct = 10 + Math.round(((chunkIndex + 1) / totalChunks) * 80);
        setProgress(pct);

        const { data, error } = await supabase.functions.invoke('import-ice-materials', {
          body: {
            dryRun,
            materials: materials.slice(start, end),
          },
        });

        if (error) {
          throw new Error(error.message || 'Import failed');
        }

        if (dryRun) {
          totalValid += data?.validCount || 0;
        } else {
          totalInserted += data?.inserted || 0;
        }

        totalErrors += data?.errorCount || 0;

        if (Array.isArray(data?.preview) && preview.length < 20) {
          preview.push(...data.preview.slice(0, 20 - preview.length));
        }

        if (Array.isArray(data?.errors) && allErrors.length < 200) {
          for (const e of data.errors) {
            const rowNum = start + (e?.row ?? 0);
            allErrors.push(`Row ${rowNum}: ${e?.error ?? 'Invalid or empty material data'}`);
            if (allErrors.length >= 200) break;
          }
        }
      }

      setProgressLabel('Finalizing…');
      setProgress(95);

      if (dryRun) {
        setPreviewData(preview);
        setImportResult({
          success: true,
          imported: totalValid,
          updated: 0,
          skipped: totalErrors,
          errors: allErrors,
          validationIssues: [],
          timestamp: new Date().toISOString(),
        });
        toast.success(`Validation complete: ${totalValid} materials ready for import`);
      } else {
        setImportResult({
          success: true,
          imported: totalInserted,
          updated: 0,
          skipped: totalErrors,
          errors: allErrors,
          validationIssues: [],
          timestamp: new Date().toISOString(),
        });
        toast.success(`Import complete: ${totalInserted} materials imported`);
      }

      setProgress(100);
      setProgressLabel('');
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      setImportResult({
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        validationIssues: [],
        timestamp: new Date().toISOString(),
      });
      setStep('complete');
    } finally {
      setIsLoading(false);
      setProgressLabel('');
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setPreviewData([]);
    setValidationPreview(null);
    setWorkbook(null);
    setProgress(0);
    setProgressLabel('');
    setStep('idle');
  };

  const goBackToPreview = () => {
    setImportResult(null);
    setPreviewData([]);
    setProgress(0);
    setProgressLabel('');
    setStep('preview');
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-8 max-w-5xl overflow-auto">
        <SEOHead 
          title="ICE Database Import - Admin - CarbonConstruct"
          description="Import and manage ICE Database materials for embodied carbon calculations."
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ICE Database Import</h1>
            <p className="text-muted-foreground">Import Circular Ecology ICE Database V4.1 materials</p>
          </div>
          <DataSourceAttribution source="ICE" variant="badge" showLogo />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={step === 'idle' ? 'default' : 'secondary'} className="gap-1">
            <span>1</span> Select File
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === 'preview' ? 'default' : 'secondary'} className="gap-1">
            <span>2</span> Validate & Preview
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === 'importing' || step === 'complete' ? 'default' : 'secondary'} className="gap-1">
            <span>3</span> Import
          </Badge>
        </div>

        {/* ICE Attribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Data Source Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataSourceAttribution source="ICE" variant="full" showLogo showLink />
          </CardContent>
        </Card>

        {/* Step 1: File Selection */}
        {step === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Select Source File
              </CardTitle>
              <CardDescription>
                Analyze the ICE Database spreadsheet to detect worksheets and headers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium">ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx</p>
                  <p className="text-sm text-muted-foreground">Circular Ecology ICE Database Advanced V4.1 (October 2025)</p>
                </div>
                <Badge variant="secondary">Ready</Badge>
              </div>

              <Button onClick={startValidation} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Analyze & Preview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Parsing Progress */}
        {step === 'parsing' && (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">{progressLabel || 'Analyzing spreadsheet...'}</p>
                <Progress value={progress} className="h-2 max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Validation Preview */}
        {step === 'preview' && validationPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Step 2: Validate & Preview
              </CardTitle>
              <CardDescription>
                Review detected worksheet, header row, and column mappings before importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Worksheet & Header Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Worksheet</Label>
                  <Select
                    value={validationPreview.selectedWorksheet}
                    onValueChange={updateWorksheetSelection}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validationPreview.worksheets.map((ws) => (
                        <SelectItem key={ws.name} value={ws.name}>
                          {ws.name} ({ws.rowCount} rows)
                          {ws.headerScore > 5 && ' ✓'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {validationPreview.worksheets.length} worksheets found
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Header Row (0-indexed)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={validationPreview.selectedHeaderRow}
                    onChange={(e) => updateHeaderRow(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-detected: row {validationPreview.selectedHeaderRow}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Detection Summary</AlertTitle>
                <AlertDescription>
                  Found <strong>{validationPreview.totalRows}</strong> potential material rows 
                  with <strong>{validationPreview.detectedColumns.length}</strong> mapped columns.
                </AlertDescription>
              </Alert>

              {/* Column Mappings */}
              <div className="space-y-2">
                <Label>Detected Column Mappings</Label>
                <div className="rounded-md border max-h-48 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Original Column</TableHead>
                        <TableHead>Maps To</TableHead>
                        <TableHead>Sample Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationPreview.detectedColumns.map((col, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{col.original}</TableCell>
                          <TableCell>
                            <Badge variant={col.mappedTo !== col.original ? 'default' : 'secondary'}>
                              {col.mappedTo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">
                            {col.sampleValue || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Sample Data */}
              <div className="space-y-2">
                <Label>Sample Data (first 5 rows)</Label>
                <div className="rounded-md border overflow-auto max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {validationPreview.detectedColumns.slice(0, 6).map((col, i) => (
                          <TableHead key={i} className="text-xs whitespace-nowrap">
                            {col.mappedTo}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationPreview.sampleRows.slice(0, 5).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {validationPreview.detectedColumns.slice(0, 6).map((col, colIndex) => (
                            <TableCell key={colIndex} className="text-xs truncate max-w-[150px]">
                              {normalize(row[col.original]) || '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={resetImport}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => runImport(true)} 
                  disabled={isLoading || validationPreview.totalRows === 0}
                  variant="secondary"
                  className="flex-1"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate ({validationPreview.totalRows} rows)
                </Button>
                <Button 
                  onClick={() => runImport(false)} 
                  disabled={isLoading || validationPreview.totalRows === 0}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import to Database
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Importing Progress */}
        {step === 'importing' && (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">{progressLabel || 'Importing materials...'}</p>
                <Progress value={progress} className="h-2 max-w-md mx-auto" />
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {step === 'complete' && importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                Step 3: Results
              </CardTitle>
              <CardDescription>
                Summary of the import operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  {previewData.length > 0 && <TabsTrigger value="preview">Preview Data</TabsTrigger>}
                  {importResult.errors.length > 0 && <TabsTrigger value="errors">Errors</TabsTrigger>}
                </TabsList>

                <TabsContent value="summary" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{importResult.imported}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {importResult.updated === 0 && importResult.skipped === 0 ? 'Imported' : 'Ready'}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{importResult.updated}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Updated</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{importResult.skipped}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">Skipped</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{importResult.errors.length}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">Errors</p>
                    </div>
                  </div>

                  {importResult.success && previewData.length > 0 && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Validation Complete</AlertTitle>
                      <AlertDescription>
                        {importResult.imported} materials validated. Click "Import to Database" to save them.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>EF Total</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Quality</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((material, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{material.material_name}</TableCell>
                            <TableCell>{material.material_category}</TableCell>
                            <TableCell>{material.ef_total?.toFixed(4)}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{material.data_quality_tier}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="errors" className="mt-4">
                  <div className="rounded-md border p-4 max-h-64 overflow-auto bg-muted/50">
                    <ul className="space-y-1 text-sm font-mono">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-destructive">{error}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={resetImport}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                {validationPreview && (
                  <Button variant="secondary" onClick={goBackToPreview}>
                    Back to Preview
                  </Button>
                )}
                {importResult.success && previewData.length > 0 && validationPreview && (
                  <Button onClick={() => runImport(false)} disabled={isLoading} className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Import to Database
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/material-database">
                <Database className="h-4 w-4 mr-2" />
                Database Status
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/calculator">
                <ExternalLink className="h-4 w-4 mr-2" />
                Calculator
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
