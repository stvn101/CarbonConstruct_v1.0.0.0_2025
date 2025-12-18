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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Database, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, 
  RefreshCw, ExternalLink, ArrowLeft, Loader2, XCircle,
  Info, FileCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { DataSourceAttribution } from "@/components/DataSourceAttribution";

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

export default function AdminICEImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<MaterialPreview[]>([]);
  const [currentStep, setCurrentStep] = useState<'ready' | 'previewing' | 'importing' | 'complete'>('ready');

  // Check admin access
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

  const runImport = async (dryRun: boolean) => {
    setIsImporting(true);
    setProgress(10);
    setCurrentStep(dryRun ? 'previewing' : 'importing');

    try {
      setProgress(30);
      
      const { data, error } = await supabase.functions.invoke('import-ice-materials', {
        body: { 
          dryRun,
          sourceFile: '/demo/ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx'
        }
      });

      setProgress(90);

      if (error) {
        throw new Error(error.message || 'Import failed');
      }

      if (dryRun && data?.preview) {
        setPreviewData(data.preview.slice(0, 20));
        setImportResult({
          success: true,
          imported: data.totalRecords || 0,
          updated: 0,
          skipped: data.skipped || 0,
          errors: data.errors || [],
          validationIssues: data.validationIssues || [],
          timestamp: new Date().toISOString()
        });
        toast.success(`Preview complete: ${data.totalRecords} materials ready for import`);
      } else {
        setImportResult({
          success: data?.success ?? true,
          imported: data?.imported || 0,
          updated: data?.updated || 0,
          skipped: data?.skipped || 0,
          errors: data?.errors || [],
          validationIssues: data?.validationIssues || [],
          timestamp: new Date().toISOString()
        });
        toast.success(`Import complete: ${data?.imported || 0} materials imported`);
      }

      setProgress(100);
      setCurrentStep('complete');
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
        timestamp: new Date().toISOString()
      });
      setCurrentStep('complete');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setPreviewData([]);
    setProgress(0);
    setCurrentStep('ready');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      <SEOHead 
        title="ICE Database Import - Admin - CarbonConstruct"
        description="Import and manage ICE Database materials for embodied carbon calculations."
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/monitoring">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ICE Database Import</h1>
            <p className="text-muted-foreground">Import Circular Ecology ICE Database V4.1 materials</p>
          </div>
        </div>
        <DataSourceAttribution source="ICE" variant="badge" showLogo />
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

      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Controls
          </CardTitle>
          <CardDescription>
            Import ICE Database V4.1 materials into the CarbonConstruct materials database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source File Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
            <div className="flex-1">
              <p className="font-medium">ICE_DB_Advanced_V4.1_-_Oct_2025.xlsx</p>
              <p className="text-sm text-muted-foreground">Circular Ecology ICE Database Advanced V4.1 (October 2025)</p>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>

          {/* Dry Run Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="dry-run" className="font-medium">Preview Mode (Dry Run)</Label>
                <p className="text-sm text-muted-foreground">
                  Preview materials before importing to the database
                </p>
              </div>
            </div>
            <Switch 
              id="dry-run" 
              checked={isDryRun} 
              onCheckedChange={setIsDryRun}
              disabled={isImporting}
            />
          </div>

          {/* Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep === 'previewing' ? 'Analyzing materials...' : 'Importing materials...'}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => runImport(isDryRun)} 
              disabled={isImporting}
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isDryRun ? 'Previewing...' : 'Importing...'}
                </>
              ) : (
                <>
                  {isDryRun ? <FileCheck className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isDryRun ? 'Preview Import' : 'Run Import'}
                </>
              )}
            </Button>
            
            {importResult && (
              <Button variant="outline" onClick={resetImport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {isDryRun ? 'Preview Results' : 'Import Results'}
            </CardTitle>
            <CardDescription>
              {isDryRun ? 'Review before running the actual import' : 'Summary of the import operation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                {previewData.length > 0 && <TabsTrigger value="preview">Preview Data</TabsTrigger>}
                {importResult.errors.length > 0 && <TabsTrigger value="errors">Errors</TabsTrigger>}
                {importResult.validationIssues.length > 0 && <TabsTrigger value="validation">Validation</TabsTrigger>}
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-2xl font-bold text-emerald-700">{importResult.imported}</p>
                    <p className="text-sm text-emerald-600">{isDryRun ? 'Ready to Import' : 'Imported'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-700">{importResult.updated}</p>
                    <p className="text-sm text-blue-600">Updated</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
                    <p className="text-sm text-amber-600">Skipped</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-700">{importResult.errors.length}</p>
                    <p className="text-sm text-red-600">Errors</p>
                  </div>
                </div>

                {isDryRun && importResult.success && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ready to Import</AlertTitle>
                    <AlertDescription>
                      {importResult.imported} materials are ready. Disable "Preview Mode" and click "Run Import" to add them to the database.
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
                        <TableHead>EF (kgCO₂e)</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Quality</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((material, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {material.material_name}
                          </TableCell>
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
                {previewData.length === 20 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 20 of {importResult.imported} materials
                  </p>
                )}
              </TabsContent>

              <TabsContent value="errors" className="mt-4">
                <div className="space-y-2">
                  {importResult.errors.map((error, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="validation" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Issue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.validationIssues.map((issue, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{issue.material}</TableCell>
                          <TableCell className="text-amber-600">{issue.issue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Related Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/materials/status">
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Database Status
              </Button>
            </Link>
            <Link to="/admin/material-verification">
              <Button variant="outline" size="sm">
                <FileCheck className="h-4 w-4 mr-2" />
                Material Verification
              </Button>
            </Link>
            <Link to="/calculator">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
