// --- FIX START: Bulk upload carbon factor validation (branch: fix/bulk-upload-carbon-factor-validation) ---
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Trash2, Edit2, Save, FolderOpen, FileSpreadsheet, Download, Eye, ShieldCheck
} from "lucide-react";
import ExcelJS from 'exceljs';

// NABERS EPD List v2025.1 - All 31 columns exactly as specified
interface ExtractedProduct {
  // Column 1-4: Material identification
  material_type: string;
  material_classification: string | null;
  material_category_matching: string | null;
  material_long_name: string;
  // Column 5-6: Validity dates
  data_valid_start: string | null;
  data_valid_end: string | null;
  // Column 7-11: EPD metadata
  location: string | null;
  registration_number: string | null;
  version: string | null;
  program: string | null;
  reference_link: string | null;
  // Column 12: Unit info
  declared_unit: string;
  // Column 13-16: Physical properties
  density_kg_m3: number | null;
  area_density_kg_m2: number | null;
  mass_per_m_kg: number | null;
  mass_per_unit_kg: number | null;
  // Column 17-21: GWP per declared quantity
  gwp_total_quantity: number | null;
  gwp_fossil_quantity: number | null;
  gwp_biogenic_quantity: number | null;
  gwp_luluc_quantity: number | null;
  gwp_stored_quantity: number | null;
  // Column 22-23: Upfront carbon per quantity
  upfront_carbon_emissions_quantity: number | null;
  upfront_carbon_storage_quantity: number | null;
  // Column 24-28: GWP per kg
  gwp_total_kg: number | null;
  gwp_fossil_kg: number | null;
  gwp_biogenic_kg: number | null;
  gwp_luluc_kg: number | null;
  gwp_stored_kg: number | null;
  // Column 29-30: Upfront carbon per kg
  upfront_carbon_emissions_kg: number | null;
  upfront_carbon_storage_kg: number | null;
  // Column 31: Record metadata
  record_added_to_database: string | null;
  // Storage reference (internal)
  storage_url?: string;
}

// Column mapping result for validation display
interface ColumnMappingResult {
  columnName: string;
  expectedHeaders: string[];
  foundHeader: string | null;
  foundIndex: number;
  required: boolean;
}

interface ProcessedFile {
  fileName: string;
  storagePath: string | null;
  status: 'pending' | 'extracting' | 'extracted' | 'error' | 'approved' | 'saved';
  products: ExtractedProduct[];
  extractionConfidence: string;
  extractionNotes: string;
  error?: string;
  fileType: 'pdf' | 'spreadsheet';
  columnMapping?: ColumnMappingResult[];
}

// All 31 NABERS EPD List v2025.1 columns with their search keys and required status
const NABERS_COLUMN_DEFINITIONS: { key: string; searchKeys: string[]; required: boolean }[] = [
  { key: 'material_type', searchKeys: ['material type'], required: true },
  { key: 'material_classification', searchKeys: ['material classification'], required: false },
  { key: 'material_category_matching', searchKeys: ['material category for matching', 'category for matching'], required: false },
  { key: 'material_long_name', searchKeys: ['material long name', 'long name'], required: true },
  { key: 'data_valid_start', searchKeys: ['data valid (start)', 'valid (start)', 'start date'], required: false },
  { key: 'data_valid_end', searchKeys: ['data valid (end)', 'valid (end)', 'end date', 'expiry'], required: false },
  { key: 'location', searchKeys: ['location'], required: false },
  { key: 'registration_number', searchKeys: ['registration number', 'epd number', 'registration'], required: false },
  { key: 'version', searchKeys: ['version'], required: false },
  { key: 'program', searchKeys: ['program', 'programme'], required: false },
  { key: 'reference_link', searchKeys: ['reference link', 'website', 'link', 'url'], required: false },
  { key: 'declared_unit', searchKeys: ['declared unit', 'unit'], required: true },
  { key: 'density_kg_m3', searchKeys: ['density (kg/m3)', 'density'], required: false },
  { key: 'area_density_kg_m2', searchKeys: ['area density (kg/m2)', 'area density'], required: false },
  { key: 'mass_per_m_kg', searchKeys: ['mass per m (kg/m)', 'mass per m'], required: false },
  { key: 'mass_per_unit_kg', searchKeys: ['mass per unit (kg/unit)', 'mass per unit'], required: false },
  { key: 'gwp_total_quantity', searchKeys: ['gwp-total (kg co2e/quanity)', 'gwp-total (kg co2e/quantity)', 'gwp total quantity'], required: true },
  { key: 'gwp_fossil_quantity', searchKeys: ['gwp-fossil (kg co2e/quanity)', 'gwp-fossil (kg co2e/quantity)', 'gwp fossil quantity'], required: false },
  { key: 'gwp_biogenic_quantity', searchKeys: ['gwp-biogenic (kg co2e/quanity)', 'gwp-biogenic (kg co2e/quantity)', 'gwp biogenic quantity'], required: false },
  { key: 'gwp_luluc_quantity', searchKeys: ['gwp-luluc (kg co2e/quanity)', 'gwp-luluc (kg co2e/quantity)', 'gwp luluc quantity'], required: false },
  { key: 'gwp_stored_quantity', searchKeys: ['gwp-stored (kg co2e/quantity)', 'gwp stored quantity'], required: false },
  { key: 'upfront_carbon_emissions_quantity', searchKeys: ['upfront carbon emissions (kg co2e/quantity)', 'upfront emissions quantity'], required: false },
  { key: 'upfront_carbon_storage_quantity', searchKeys: ['upfront carbon storage (kg co2e/quantity)', 'upfront storage quantity'], required: false },
  { key: 'gwp_total_kg', searchKeys: ['gwp-total (kg co2e/kg)', 'gwp total kg'], required: false },
  { key: 'gwp_fossil_kg', searchKeys: ['gwp-fossil (kg co2e/kg)', 'gwp fossil kg'], required: false },
  { key: 'gwp_biogenic_kg', searchKeys: ['gwp-biogenic (kg co2e/kg)', 'gwp biogenic kg'], required: false },
  { key: 'gwp_luluc_kg', searchKeys: ['gwp-luluc (kg co2e/kg)', 'gwp luluc kg'], required: false },
  { key: 'gwp_stored_kg', searchKeys: ['gwp-stored (kg co2e/kg)', 'gwp stored kg'], required: false },
  { key: 'upfront_carbon_emissions_kg', searchKeys: ['upfront carbon emissions (kg co2e/kg)', 'upfront emissions kg'], required: false },
  { key: 'upfront_carbon_storage_kg', searchKeys: ['upfront carbon storage (kg co2e/kg)', 'upfront storage kg'], required: false },
  { key: 'record_added_to_database', searchKeys: ['record added to database', 'record added'], required: false },
];

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.csv', '.xlsx', '.xls'];

const isAcceptedFile = (file: File): boolean => {
  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  const mime = typeof file.type === 'string' ? file.type : '';
  return ACCEPTED_FILE_TYPES.includes(mime) || ACCEPTED_EXTENSIONS.includes(extension);
};

const isSpreadsheetFile = (file: File): boolean => {
  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  const mime = typeof file.type === 'string' ? file.type : '';
  return mime === 'text/csv' ||
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    ['.csv', '.xlsx', '.xls'].includes(extension);
};

export function BulkEPDUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<{ fileIndex: number; productIndex: number } | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [strictMode, setStrictMode] = useState(false);
  const [showColumnMapping, setShowColumnMapping] = useState<number | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isAcceptedFile);
    if (droppedFiles.length === 0) {
      toast.error('Only PDF, CSV, and Excel files are accepted');
      return;
    }
    setFiles(prev => [...prev, ...droppedFiles]);
    const pdfCount = droppedFiles.filter(f => f.type === 'application/pdf').length;
    const spreadsheetCount = droppedFiles.length - pdfCount;
    toast.success(`Added ${droppedFiles.length} file${droppedFiles.length > 1 ? 's' : ''} (${pdfCount} PDF, ${spreadsheetCount} spreadsheet)`);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(isAcceptedFile);
    if (selectedFiles.length === 0) {
      toast.error('Only PDF, CSV, and Excel files are accepted');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
    const pdfCount = selectedFiles.filter(f => f.type === 'application/pdf').length;
    const spreadsheetCount = selectedFiles.length - pdfCount;
    toast.success(`Added ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} (${pdfCount} PDF, ${spreadsheetCount} spreadsheet)`);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Download XLSX template with EXACT NABERS EPD List v2025.1 headers (all 31 columns)
  const downloadTemplate = async () => {
    // Exact headers from NABERS EPD List v2025.1
    const headers = [
      'Material type',
      'Material classification',
      'Material category for matching emission factor',
      'Material long name',
      'Data valid (start)',
      'Data valid (end)',
      'Location',
      'Registration number',
      'Version',
      'Program',
      'Reference link - Website',
      'Declared unit',
      'Density (kg/m3)',
      'Area density (kg/m2)',
      'Mass per m (kg/m)',
      'Mass per unit (kg/unit)',
      'GWP-total (kg CO2e/quanity)',
      'GWP-fossil (kg CO2e/quanity)',
      'GWP-biogenic (kg CO2e/quanity)',
      'GWP-luluc (kg CO2e/quanity)',
      'GWP-stored (kg CO2e/quantity)',
      'Upfront carbon emissions (kg CO2e/quantity)',
      'Upfront carbon storage (kg CO2e/quantity)',
      'GWP-total (kg CO2e/kg)',
      'GWP-fossil (kg CO2e/kg)',
      'GWP-biogenic (kg CO2e/kg)',
      'GWP-luluc (kg CO2e/kg)',
      'GWP-stored (kg CO2e/kg)',
      'Upfront carbon emissions (kg CO2e/kg)',
      'Upfront carbon storage (kg CO2e/kg)',
      'Record added to database'
    ];

    // Example row matching NABERS format
    const exampleRow = [
      'Concrete (in-situ)',
      'Concrete, 32 MPa',
      '>25 MPa to ≤32 MPa',
      'Concrete, 32 MPa, in-situ, no reinforcement, (Example) (Holcim) (NSW)',
      '1/1/2024',
      '31/12/2028',
      'Sydney, NSW',
      'S-P-12345',
      'Version 1',
      'EPD Australasia',
      'https://epd-australasia.com/example-epd.pdf',
      'm³',
      '2400',
      '',
      '',
      '',
      '320.5',
      '318.2',
      '2.3',
      '',
      '',
      '320.5',
      '0',
      '0.1335',
      '0.1326',
      '0.00096',
      '',
      '',
      '0.1335',
      '0',
      'Version 1.0'
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('EPD Materials');

    // Add headers
    worksheet.addRow(headers);
    // Add example row
    worksheet.addRow(exampleRow);

    // Set column widths for all 31 columns
    const columnWidths = [
      20,  // Material type
      22,  // Material classification
      35,  // Material category for matching emission factor
      60,  // Material long name
      14,  // Data valid (start)
      14,  // Data valid (end)
      20,  // Location
      16,  // Registration number
      12,  // Version
      18,  // Program
      50,  // Reference link - Website
      12,  // Declared unit
      15,  // Density (kg/m3)
      18,  // Area density (kg/m2)
      16,  // Mass per m (kg/m)
      18,  // Mass per unit (kg/unit)
      25,  // GWP-total (kg CO2e/quanity)
      25,  // GWP-fossil (kg CO2e/quanity)
      28,  // GWP-biogenic (kg CO2e/quanity)
      25,  // GWP-luluc (kg CO2e/quanity)
      26,  // GWP-stored (kg CO2e/quantity)
      35,  // Upfront carbon emissions (kg CO2e/quantity)
      35,  // Upfront carbon storage (kg CO2e/quantity)
      22,  // GWP-total (kg CO2e/kg)
      22,  // GWP-fossil (kg CO2e/kg)
      25,  // GWP-biogenic (kg CO2e/kg)
      22,  // GWP-luluc (kg CO2e/kg)
      22,  // GWP-stored (kg CO2e/kg)
      32,  // Upfront carbon emissions (kg CO2e/kg)
      32,  // Upfront carbon storage (kg CO2e/kg)
      22,  // Record added to database
    ];

    worksheet.columns = columnWidths.map((width, index) => ({
      key: `col${index + 1}`,
      width
    }));

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'NABERS_EPD_Import_Template_v2025.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('NABERS EPD template downloaded! Fill it out and upload.');
  };

  const parseSpreadsheetFile = async (file: File): Promise<{ products: ExtractedProduct[]; columnMapping: ColumnMappingResult[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const extension = '.' + file.name.split('.').pop()?.toLowerCase();
          let headers: string[] = [];
          let dataRows: string[][] = [];

          if (extension === '.csv') {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim());

            if (lines.length < 2) {
              reject(new Error('File must have a header row and at least one data row'));
              return;
            }

            headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
            dataRows = lines.slice(1).map(line => parseCSVLine(line));
          } else {
            const data = e.target?.result as ArrayBuffer;
            const workbook = new ExcelJS.Workbook();

            workbook.xlsx.load(data).then(() => {
              const firstSheet = workbook.worksheets[0];
              if (!firstSheet) {
                reject(new Error('Excel file has no worksheets'));
                return;
              }

              const jsonData: string[][] = [];
              firstSheet.eachRow((row) => {
                const rowData: string[] = [];
                row.eachCell({ includeEmpty: true }, (cell) => {
                  rowData.push(String(cell.value ?? ''));
                });
                jsonData.push(rowData);
              });

              if (jsonData.length < 2) {
                reject(new Error('Excel file must have a header row and at least one data row'));
                return;
              }

              headers = (jsonData[0] || []).map(h => String(h || '').toLowerCase().trim());
              dataRows = jsonData.slice(1);

              processData();
            }).catch(reject);
            return; // Exit early since we'll process async
          }

          processData();

          function processData() {

            // Build column mapping using NABERS_COLUMN_DEFINITIONS
            const columnMapping: ColumnMappingResult[] = [];
            const columnMap: Record<string, number> = {};

            for (const def of NABERS_COLUMN_DEFINITIONS) {
              let foundIndex = -1;
              let foundHeader: string | null = null;

              for (const searchKey of def.searchKeys) {
                const needle = searchKey.toLowerCase();
                const idx = headers.findIndex(h => (h ?? '').includes(needle));
                if (idx !== -1) {
                  foundIndex = idx;
                  foundHeader = headers[idx];
                  break;
                }
              }

              columnMap[def.key] = foundIndex;
              columnMapping.push({
                columnName: def.key,
                expectedHeaders: def.searchKeys,
                foundHeader,
                foundIndex,
                required: def.required,
              });
            }

            const parseNumber = (value: string | undefined): number | null => {
              if (!value || value.trim() === '') return null;
              const num = parseFloat(value.replace(/[^0-9.eE+-]/g, ''));
              return isNaN(num) ? null : num;
            };

            const products: ExtractedProduct[] = [];
            for (const values of dataRows) {
              if (values.length === 0 || values.every(v => !v.trim())) continue;

              const getValue = (idx: number): string | null => {
                if (idx === -1 || idx >= values.length) return null;
                const val = values[idx]?.trim();
                return val || null;
              };

              // --- FIX STEP 2: Add carbon factor validation and flag missing ---
              const gwpTotalQuantity = parseNumber(getValue(columnMap.gwp_total_quantity) ?? undefined);
              const gwpTotalKg = parseNumber(getValue(columnMap.gwp_total_kg) ?? undefined);
              const missingCarbonFactor = gwpTotalQuantity === null && gwpTotalKg === null;

              products.push({
                material_type: getValue(columnMap.material_type) || 'Unknown',
                material_classification: getValue(columnMap.material_classification),
                material_category_matching: getValue(columnMap.material_category_matching),
                material_long_name: getValue(columnMap.material_long_name) || 'Unknown Material',
                data_valid_start: getValue(columnMap.data_valid_start),
                data_valid_end: getValue(columnMap.data_valid_end),
                location: getValue(columnMap.location),
                registration_number: getValue(columnMap.registration_number),
                version: getValue(columnMap.version),
                program: getValue(columnMap.program),
                reference_link: getValue(columnMap.reference_link),
                declared_unit: getValue(columnMap.declared_unit) || 'kg',
                density_kg_m3: parseNumber(getValue(columnMap.density_kg_m3) ?? undefined),
                area_density_kg_m2: parseNumber(getValue(columnMap.area_density_kg_m2) ?? undefined),
                mass_per_m_kg: parseNumber(getValue(columnMap.mass_per_m_kg) ?? undefined),
                mass_per_unit_kg: parseNumber(getValue(columnMap.mass_per_unit_kg) ?? undefined),
                gwp_total_quantity: gwpTotalQuantity,
                gwp_fossil_quantity: parseNumber(getValue(columnMap.gwp_fossil_quantity) ?? undefined),
                gwp_biogenic_quantity: parseNumber(getValue(columnMap.gwp_biogenic_quantity) ?? undefined),
                gwp_luluc_quantity: parseNumber(getValue(columnMap.gwp_luluc_quantity) ?? undefined),
                gwp_stored_quantity: parseNumber(getValue(columnMap.gwp_stored_quantity) ?? undefined),
                upfront_carbon_emissions_quantity: parseNumber(getValue(columnMap.upfront_carbon_emissions_quantity) ?? undefined),
                upfront_carbon_storage_quantity: parseNumber(getValue(columnMap.upfront_carbon_storage_quantity) ?? undefined),
                gwp_total_kg: gwpTotalKg,
                gwp_fossil_kg: parseNumber(getValue(columnMap.gwp_fossil_kg) ?? undefined),
                gwp_biogenic_kg: parseNumber(getValue(columnMap.gwp_biogenic_kg) ?? undefined),
                gwp_luluc_kg: parseNumber(getValue(columnMap.gwp_luluc_kg) ?? undefined),
                gwp_stored_kg: parseNumber(getValue(columnMap.gwp_stored_kg) ?? undefined),
                upfront_carbon_emissions_kg: parseNumber(getValue(columnMap.upfront_carbon_emissions_kg) ?? undefined),
                upfront_carbon_storage_kg: parseNumber(getValue(columnMap.upfront_carbon_storage_kg) ?? undefined),
                record_added_to_database: getValue(columnMap.record_added_to_database),
                // --- FIX STEP 2: Flag for missing carbon factor ---
                missingCarbonFactor,
              });
            }

            const validProducts = products.filter(p =>
              p.material_long_name !== 'Unknown Material' ||
              p.gwp_total_quantity !== null ||
              p.gwp_total_kg !== null
            );

            resolve({ products: validProducts, columnMapping });
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));

      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (extension === '.csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Helper to parse CSV line handling quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const extractTextFromPDF = async (file: File, retryCount = 0): Promise<string> => {
    const MAX_RETRIES = 3;
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

      // Handle rate limit with retry + exponential backoff
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const waitTime = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
        console.log(`[BulkEPDUploader] Rate limited, retrying in ${waitTime / 1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        toast.info(`Rate limited, retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return extractTextFromPDF(file, retryCount + 1);
      }

      // Handle file too large
      if (response.status === 413) {
        throw new Error(`PDF too large (max 5MB for AI extraction). Try a smaller file.`);
      }

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
    const fileIsSpreadsheet = isSpreadsheetFile(file);
    const result: ProcessedFile = {
      fileName: file.name,
      storagePath: null,
      status: 'extracting',
      products: [],
      extractionConfidence: '',
      extractionNotes: '',
      fileType: fileIsSpreadsheet ? 'spreadsheet' : 'pdf',
    };

    try {
      if (fileIsSpreadsheet) {
        // Handle spreadsheet file - parse locally
        const { products, columnMapping } = await parseSpreadsheetFile(file);
        const foundCount = columnMapping.filter(c => c.foundIndex !== -1).length;
        const missingRequired = columnMapping.filter(c => c.required && c.foundIndex === -1);

        return {
          ...result,
          status: 'extracted',
          products,
          columnMapping,
          extractionConfidence: missingRequired.length === 0 ? 'high' : 'medium',
          extractionNotes: `Parsed ${products.length} materials. Mapped ${foundCount}/31 columns.${missingRequired.length > 0 ? ` Missing required: ${missingRequired.map(c => c.columnName).join(', ')}` : ''}`,
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
      fileType: isSpreadsheetFile(f) ? 'spreadsheet' as const : 'pdf' as const,
    }));
    setProcessedFiles(initialFiles);

    // Separate PDFs and spreadsheets - process PDFs sequentially, spreadsheets in batches
    const pdfFiles = files.filter(f => !isSpreadsheetFile(f));
    const spreadsheetFiles = files.filter(f => isSpreadsheetFile(f));

    const results: ProcessedFile[] = [];
    let globalIndex = 0;

    // Process PDFs sequentially with delay to avoid rate limits
    if (pdfFiles.length > 0) {
      toast.info(`Processing ${pdfFiles.length} PDF file(s) sequentially...`);

      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const fileIndex = files.indexOf(file);
        setCurrentFile(fileIndex);

        // Update status to extracting
        setProcessedFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'extracting' } : f
        ));

        const result = await processSingleFile(file, fileIndex, session);

        setProcessedFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? result : f
        ));

        if (result.status === 'extracted') {
          toast.success(`${result.fileName}: ${result.products.length} products extracted`);
        } else if (result.status === 'error') {
          toast.error(`${result.fileName}: ${result.error}`);
        }

        results.push(result);
        globalIndex++;

        // 3-second delay between PDFs to avoid rate limits
        if (i < pdfFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // Process spreadsheets in batches of 3 (they're local parsing, no rate limit)
    if (spreadsheetFiles.length > 0) {
      const BATCH_SIZE = 3;
      toast.info(`Processing ${spreadsheetFiles.length} spreadsheet file(s)...`);

      for (let i = 0; i < spreadsheetFiles.length; i += BATCH_SIZE) {
        const batch = spreadsheetFiles.slice(i, i + BATCH_SIZE);

        // Update status to extracting for this batch
        batch.forEach(file => {
          const fileIndex = files.indexOf(file);
          setProcessedFiles(prev => prev.map((f, idx) =>
            idx === fileIndex ? { ...f, status: 'extracting' } : f
          ));
        });

        // Process batch in parallel
        const batchResults = await Promise.all(
          batch.map(file => processSingleFile(file, files.indexOf(file), session))
        );

        // Update results
        batchResults.forEach((result) => {
          const fileIndex = files.findIndex(f => f.name === result.fileName);
          setProcessedFiles(prev => prev.map((f, idx) =>
            idx === fileIndex ? result : f
          ));

          if (result.status === 'extracted') {
            toast.success(`${result.fileName}: ${result.products.length} products extracted`);
          } else if (result.status === 'error') {
            toast.error(`${result.fileName}: ${result.error}`);
          }
        });

        results.push(...batchResults);
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


    // --- FIX STEP 4: Block saving in strict mode if any product is missing carbon factor ---
    if (strictMode) {
      const filesWithMissingColumns = approvedFiles.filter(f => {
        if (!f.columnMapping) return true;
        return f.columnMapping.some(c => c.foundIndex === -1);
      });

      const filesWithMissingCarbonFactor = approvedFiles.filter(f =>
        f.products.some(p => p.missingCarbonFactor)
      );

      if (filesWithMissingColumns.length > 0) {
        toast.error(`Strict mode: ${filesWithMissingColumns.length} file(s) have missing columns. Disable strict mode or fix the spreadsheet.`);
        return;
      }
      if (filesWithMissingCarbonFactor.length > 0) {
        toast.error(`Strict mode: ${filesWithMissingCarbonFactor.length} file(s) have products missing carbon factor. Fix the spreadsheet or disable strict mode.`);
        return;
      }
    }

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
                Drop EPD PDF or Excel/CSV files here. PDFs use AI extraction, spreadsheets are parsed directly.
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
                  accept=".pdf,.csv,.xlsx,.xls"
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
                    Supports PDF, XLSX/XLS, and CSV files • Max 20MB each
                  </p>
                </label>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-center gap-2 py-2">
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download XLSX Template
                </Button>
                <span className="text-xs text-muted-foreground">
                  Pre-formatted with all required columns
                </span>
              </div>

              {/* Strict Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <div>
                    <Label htmlFor="strict-mode" className="font-medium">Strict Import Mode</Label>
                    <p className="text-xs text-muted-foreground">Block saving unless all 31 NABERS columns are mapped</p>
                  </div>
                </div>
                <Switch
                  id="strict-mode"
                  checked={strictMode}
                  onCheckedChange={setStrictMode}
                />
              </div>

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
                      const fileIsSpreadsheet = isSpreadsheetFile(file);
                      const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                      return (
                        <div key={i} className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {fileIsSpreadsheet ? (
                              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {extension}
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
                      Process {files.length} file{files.length !== 1 ? 's' : ''}
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
                        {file.columnMapping && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowColumnMapping(fileIndex)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Columns ({file.columnMapping.filter(c => c.foundIndex !== -1).length}/31)
                          </Button>
                        )}
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
                            <div key={productIndex} className={`border rounded-lg p-4 bg-muted/30${product.missingCarbonFactor ? ' border-amber-500 bg-amber-50' : ''}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{product.material_long_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {product.material_type} • {product.material_classification || 'Unclassified'}
                                  </p>
                                  {product.registration_number && (
                                    <p className="text-xs text-primary mt-1">EPD: {product.registration_number}</p>
                                  )}
                                  {product.location && (
                                    <p className="text-xs text-muted-foreground">Location: {product.location}</p>
                                  )}
                                  {/* --- FIX STEP 3: Show warning if missing carbon factor --- */}
                                  {product.missingCarbonFactor && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                                      <span className="text-xs text-amber-700 font-semibold">Missing carbon factor: GWP Total and GWP/kg are both empty. Cannot calculate emissions.</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingProduct({ fileIndex, productIndex })}
                                    aria-label={`Edit ${product.material_long_name}`}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProduct(fileIndex, productIndex)}
                                    aria-label={`Delete ${product.material_long_name}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">GWP Total:</span>{' '}
                                  <span className="font-medium">{product.gwp_total_quantity ?? '-'} kgCO₂e/{product.declared_unit}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">GWP Fossil:</span>{' '}
                                  <span className="font-medium">{product.gwp_fossil_quantity ?? '-'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">GWP/kg:</span>{' '}
                                  <span className="font-medium">{product.gwp_total_kg ?? '-'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Density:</span>{' '}
                                  <span className="font-bold text-primary">{product.density_kg_m3 ?? '-'} kg/m³</span>
                                </div>
                              </div>

                              {product.program && (
                                <p className="text-xs text-muted-foreground mt-2">Program: {product.program}</p>
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
      {/* Column Mapping Dialog */}
      {showColumnMapping !== null && processedFiles[showColumnMapping]?.columnMapping && (
        <Dialog open onOpenChange={() => setShowColumnMapping(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Column Mapping - {processedFiles[showColumnMapping].fileName}</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NABERS Column</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Matched Header</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedFiles[showColumnMapping].columnMapping!.map((col, i) => (
                  <TableRow key={i} className={col.foundIndex === -1 ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-medium">
                      {col.columnName.replace(/_/g, ' ')}
                      {col.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
                    </TableCell>
                    <TableCell>
                      {col.foundIndex !== -1 ? (
                        <Badge className="bg-emerald-500"><CheckCircle className="h-3 w-3 mr-1" />Found</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Missing</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {col.foundHeader || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      )}

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
            <Label>Material Long Name</Label>
            <Input
              value={form.material_long_name}
              onChange={(e) => setForm({ ...form, material_long_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Material Type</Label>
            <Input
              value={form.material_type || ''}
              onChange={(e) => setForm({ ...form, material_type: e.target.value })}
            />
          </div>

          <div>
            <Label>Material Classification</Label>
            <Input
              value={form.material_classification || ''}
              onChange={(e) => setForm({ ...form, material_classification: e.target.value })}
            />
          </div>

          <div>
            <Label>Registration Number (EPD)</Label>
            <Input
              value={form.registration_number || ''}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
            />
          </div>

          <div>
            <Label>Declared Unit</Label>
            <Select value={form.declared_unit} onValueChange={(v) => setForm({ ...form, declared_unit: v })}>
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
            <Label>Location</Label>
            <Input
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Sydney, NSW"
            />
          </div>

          <div>
            <Label>Program</Label>
            <Input
              value={form.program || ''}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="EPD Australasia"
            />
          </div>

          <div>
            <Label>Density (kg/m³)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.density_kg_m3 ?? ''}
              onChange={(e) => setForm({ ...form, density_kg_m3: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP-Total (per quantity)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_total_quantity ?? ''}
              onChange={(e) => setForm({ ...form, gwp_total_quantity: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP-Fossil (per quantity)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_fossil_quantity ?? ''}
              onChange={(e) => setForm({ ...form, gwp_fossil_quantity: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP-Biogenic (per quantity)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.gwp_biogenic_quantity ?? ''}
              onChange={(e) => setForm({ ...form, gwp_biogenic_quantity: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>GWP-Total (per kg)</Label>
            <Input
              type="number"
              step="0.000001"
              value={form.gwp_total_kg ?? ''}
              onChange={(e) => setForm({ ...form, gwp_total_kg: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>Upfront Carbon Emissions (per quantity)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.upfront_carbon_emissions_quantity ?? ''}
              onChange={(e) => setForm({ ...form, upfront_carbon_emissions_quantity: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div>
            <Label>Data Valid (Start)</Label>
            <Input
              value={form.data_valid_start || ''}
              onChange={(e) => setForm({ ...form, data_valid_start: e.target.value })}
              placeholder="1/1/2024"
            />
          </div>

          <div>
            <Label>Data Valid (End)</Label>
            <Input
              value={form.data_valid_end || ''}
              onChange={(e) => setForm({ ...form, data_valid_end: e.target.value })}
              placeholder="31/12/2028"
            />
          </div>

          <div className="col-span-2">
            <Label>Reference Link</Label>
            <Input
              value={form.reference_link || ''}
              onChange={(e) => setForm({ ...form, reference_link: e.target.value })}
              placeholder="https://epd-australasia.com/..."
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
