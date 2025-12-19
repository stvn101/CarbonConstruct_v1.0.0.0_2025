import { useState, useCallback, useEffect } from "react";
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
  Info, FileCheck, Eye, ArrowRight, Settings2, History, UploadCloud,
  Download, PlayCircle
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
  duplicatesSkipped?: number;
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

interface ImportJob {
  id: string;
  file_name: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  created_at: string;
  completed_at: string | null;
  worksheet_name: string | null;
  header_row: number | null;
  column_mappings: ColumnMapping[] | null;
  validation_preview: Record<string, unknown> | null;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch recent import jobs
  useEffect(() => {
    if (user) {
      fetchRecentJobs();
    }
  }, [user]);

  const fetchRecentJobs = async () => {
    const { data, error } = await supabase
      .from('ice_import_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setRecentJobs(data as ImportJob[]);
    }
  };

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
    
    if (tokens.some((t) => t.includes('material'))) score += 3;
    if (tokens.some((t) => t === 'material' || t === 'materials')) score += 2;
    if (tokens.some((t) => t.includes('name'))) score += 2;
    if (tokens.some((t) => t.includes('category') || t.includes('sub category'))) score += 2;
    if (tokens.some((t) => t.includes('ef') || t.includes('embodied'))) score += 3;
    if (tokens.some((t) => t.includes('kgco2') || t.includes('co2'))) score += 3;
    if (tokens.some((t) => t.includes('unit'))) score += 2;
    if (tokens.some((t) => t.includes('density'))) score += 1;
    if (tokens.some((t) => t.includes('a1') || t.includes('a1-a3'))) score += 2;
    
    if (tokens.length < 3) score -= 5;
    
    return score;
  };

  const mapColumnName = (original: string): string => {
    const lower = original.toLowerCase().trim();
    
    if (lower === 'material' || lower === 'materials' || lower === 'material name') return 'material_name';
    if (lower === 'name') return 'material_name';
    if (lower.includes('sub category') || lower.includes('subcategory')) return 'subcategory';
    if (lower.includes('category')) return 'material_category';
    if (lower.includes('embodied carbon') && lower.includes('kgco2e/kg')) return 'ef_total';
    if (lower.includes('ef_total') || lower === 'ef total') return 'ef_total';
    if (lower.includes('a1-a3') || lower.includes('a1a3')) return 'ef_a1a3';
    if (lower.includes('a4') && !lower.includes('a1')) return 'ef_a4';
    if (lower.includes('a5') && !lower.includes('a1')) return 'ef_a5';
    if (lower.includes('b1-b5') || lower.includes('b1b5')) return 'ef_b1b5';
    if (lower.includes('c1-c4') || lower.includes('c1c4')) return 'ef_c1c4';
    if (lower.includes('module d') || lower === 'd') return 'ef_d';
    if (lower === 'unit' || lower === 'units') return 'unit';
    if (lower.includes('density')) return 'density';
    if (lower.includes('recycled')) return 'recycled_content';
    if (lower.includes('data quality')) return 'data_quality_tier';
    if (lower.includes('source') || lower.includes('reference')) return 'data_source';
    if (lower.includes('notes') || lower.includes('comment')) return 'notes';
    
    return original;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        toast.success(`File "${file.name}" ready for analysis`);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        toast.success(`File "${file.name}" ready for analysis`);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  }, []);

  const analyzeWorkbook = async (fileSource: 'demo' | 'uploaded'): Promise<ValidationPreview> => {
    setProgressLabel('Loading spreadsheet...');
    setProgress(10);
    
    let arrayBuffer: ArrayBuffer;
    
    if (fileSource === 'uploaded' && uploadedFile) {
      arrayBuffer = await uploadedFile.arrayBuffer();
    } else {
      const response = await fetch('/demo/ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx');
      arrayBuffer = await response.arrayBuffer();
    }

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

    const selectedSheet = wb.Sheets[bestSheet.name];
    const headerRow = bestSheet.headerRow;

    const headerRange = XLSX.utils.decode_range(selectedSheet['!ref']!);
    const headerAoa = XLSX.utils.sheet_to_json<unknown[]>(selectedSheet, {
      header: 1,
      range: { s: { c: headerRange.s.c, r: headerRow }, e: { c: headerRange.e.c, r: headerRow } },
      raw: true,
    });

    const headers = (headerAoa[0] as unknown[] || []).map((h) => normalize(h));

    const sampleRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(selectedSheet, {
      defval: null,
      raw: true,
      range: headerRow,
    }).slice(0, 10);

    const detectedColumns: ColumnMapping[] = headers
      .filter(h => h.length > 0)
      .slice(0, 15)
      .map((original) => ({
        original,
        mappedTo: mapColumnName(original),
        sampleValue: normalize(sampleRows[0]?.[original] ?? ''),
      }));

    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(selectedSheet, {
      defval: null,
      raw: true,
      range: headerRow,
    });

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

  const startValidation = async (fileSource: 'demo' | 'uploaded') => {
    if (fileSource === 'uploaded' && !uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    setIsLoading(true);
    setStep('parsing');
    setProgress(0);

    try {
      const preview = await analyzeWorkbook(fileSource);
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
    setProgressLabel('Creating import job...');
    setStep('importing');

    try {
      // Create import job record
      const fileName = uploadedFile?.name || 'ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx';
      const { data: jobData, error: jobError } = await supabase
        .from('ice_import_jobs')
        .insert([{
          user_id: user.id,
          file_name: fileName,
          file_size_bytes: uploadedFile?.size || 0,
          status: dryRun ? 'validating' : 'importing',
          worksheet_name: validationPreview.selectedWorksheet,
          header_row: validationPreview.selectedHeaderRow,
          total_rows: validationPreview.totalRows,
          column_mappings: JSON.parse(JSON.stringify(validationPreview.detectedColumns)),
          started_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

      if (jobError) {
        console.error('Failed to create import job:', jobError);
      }

      const jobId = jobData?.id || null;
      setCurrentJobId(jobId);

      const materials = validationPreview.parsedMaterials;
      const totalChunks = Math.ceil(materials.length / CHUNK_SIZE);
      const totalRows = materials.length;

      let totalValid = 0;
      let totalErrors = 0;
      let totalInserted = 0;
      let totalDuplicatesSkipped = 0;
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
            jobId,
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
        totalDuplicatesSkipped += data?.duplicatesSkipped || 0;

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

      // Update job as completed
      if (jobId) {
        await supabase
          .from('ice_import_jobs')
          .update({
            status: 'completed',
            processed_rows: totalRows,
            imported_count: dryRun ? totalValid : totalInserted,
            skipped_count: totalDuplicatesSkipped,
            error_count: totalErrors,
            errors: allErrors.slice(0, 100),
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }

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
          duplicatesSkipped: totalDuplicatesSkipped,
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
          duplicatesSkipped: totalDuplicatesSkipped,
        });
        toast.success(`Import complete: ${totalInserted} materials imported`);
      }

      setProgress(100);
      setProgressLabel('');
      setStep('complete');
      fetchRecentJobs();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      
      if (currentJobId) {
        await supabase
          .from('ice_import_jobs')
          .update({
            status: 'failed',
            errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
            completed_at: new Date().toISOString(),
          })
          .eq('id', currentJobId);
      }
      
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
    setUploadedFile(null);
    setProgress(0);
    setProgressLabel('');
    setCurrentJobId(null);
    setStep('idle');
  };

  const goBackToPreview = () => {
    setImportResult(null);
    setPreviewData([]);
    setProgress(0);
    setProgressLabel('');
    setStep('preview');
  };

  // Resume a failed or incomplete import job
  const resumeImportJob = async (job: ImportJob) => {
    if (!job.worksheet_name || job.header_row === null) {
      toast.error('Cannot resume: missing worksheet or header row info');
      return;
    }

    setIsLoading(true);
    setStep('parsing');
    setProgress(10);
    setProgressLabel('Loading original file for resume...');

    try {
      // For now, we can only resume from the demo file
      // In production, you'd store the file in Supabase Storage
      const response = await fetch('/demo/ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx');
      const arrayBuffer = await response.arrayBuffer();

      const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: false, raw: true });
      setWorkbook(wb);

      const sheet = wb.Sheets[job.worksheet_name];
      if (!sheet) {
        throw new Error(`Worksheet "${job.worksheet_name}" not found`);
      }

      setProgress(50);
      setProgressLabel('Parsing remaining rows...');

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null,
        raw: true,
        range: job.header_row,
      });

      // Skip already processed rows
      const startRow = job.processed_rows || 0;
      const remainingRows = rows.slice(startRow);

      if (remainingRows.length === 0) {
        toast.info('All rows already processed');
        setStep('idle');
        setIsLoading(false);
        return;
      }

      const sampleRows = remainingRows.slice(0, 10);
      const headers = Object.keys(sampleRows[0] || {});

      const detectedColumns: ColumnMapping[] = (job.column_mappings || headers
        .filter(h => h.length > 0)
        .slice(0, 15)
        .map((original) => ({
          original,
          mappedTo: mapColumnName(original),
          sampleValue: normalize(sampleRows[0]?.[original] ?? ''),
        })));

      const parsedMaterials = remainingRows.filter((row) => {
        const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
        return values.length >= 3;
      });

      setValidationPreview({
        worksheets: [{ name: job.worksheet_name, rowCount: rows.length, detectedHeaderRow: job.header_row, headerScore: 10 }],
        selectedWorksheet: job.worksheet_name,
        selectedHeaderRow: job.header_row,
        detectedColumns,
        sampleRows,
        totalRows: parsedMaterials.length,
        parsedMaterials,
      });

      setCurrentJobId(job.id);
      setStep('preview');
      toast.success(`Resuming import: ${parsedMaterials.length} remaining rows`);
    } catch (error) {
      console.error('Resume error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resume import');
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // Export materials database to CSV/Excel
  const exportMaterials = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('materials_epd')
        .select('*')
        .order('material_category', { ascending: true })
        .order('material_name', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error('No materials to export');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Materials');

      const fileName = `materials_epd_export_${new Date().toISOString().slice(0, 10)}`;
      
      if (format === 'csv') {
        XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, `${fileName}.xlsx`, { bookType: 'xlsx' });
      }

      toast.success(`Exported ${data.length} materials to ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
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
            <p className="text-muted-foreground">Import Circular Ecology ICE Database materials with deduplication</p>
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

        {/* Step 1: File Selection with Drag & Drop */}
        {step === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Select Source File
              </CardTitle>
              <CardDescription>
                Upload your own ICE spreadsheet or use the bundled demo file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : uploadedFile 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`h-12 w-12 mx-auto mb-4 ${
                  uploadedFile ? 'text-emerald-600' : 'text-muted-foreground'
                }`} />
                {uploadedFile ? (
                  <>
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop your ICE spreadsheet here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse (.xlsx, .xls)</p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {uploadedFile && (
                  <Button onClick={() => startValidation('uploaded')} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Uploaded File
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={() => startValidation('demo')} 
                  disabled={isLoading}
                  variant={uploadedFile ? 'outline' : 'default'}
                  className={uploadedFile ? '' : 'flex-1'}
                >
                  {isLoading && !uploadedFile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Use Demo File (ICE V4.1)
                    </>
                  )}
                </Button>
              </div>

              {/* Demo File Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium">ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx</p>
                  <p className="text-sm text-muted-foreground">Bundled demo: Circular Ecology ICE Database Advanced V4.1</p>
                </div>
                <Badge variant="secondary">Bundled</Badge>
              </div>
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
                Review detected worksheet, header row, and column mappings. Duplicates will be automatically deduplicated.
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
                  Duplicates will be automatically skipped or updated (upsert).
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{importResult.duplicatesSkipped || 0}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Deduped</p>
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

        {/* Export Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Materials Database
            </CardTitle>
            <CardDescription>
              Download all materials from the database for backup or sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => exportMaterials('csv')}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export as CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportMaterials('xlsx')}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Export as Excel
            </Button>
          </CardContent>
        </Card>

        {/* Recent Import Jobs */}
        {recentJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Import Jobs
              </CardTitle>
              <CardDescription>
                Audit trail of ICE database imports. Failed or incomplete jobs can be resumed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Imported</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs.map((job) => {
                      const canResume = (job.status === 'failed' || job.status === 'importing') && 
                                        job.processed_rows < job.total_rows &&
                                        job.worksheet_name;
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium truncate max-w-[200px]">{job.file_name}</TableCell>
                          <TableCell>
                            <Badge variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'failed' ? 'destructive' :
                              'secondary'
                            }>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(job.processed_rows / job.total_rows) * 100} 
                                className="h-2 w-16" 
                              />
                              <span className="text-xs text-muted-foreground">
                                {job.processed_rows}/{job.total_rows}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-emerald-600">{job.imported_count}</TableCell>
                          <TableCell className="text-destructive">{job.error_count}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {canResume && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => resumeImportJob(job)}
                                disabled={isLoading}
                              >
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Resume
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
