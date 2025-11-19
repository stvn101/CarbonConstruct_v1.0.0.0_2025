import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, Loader2, Database, Sparkles, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { bulkImportMaterials } from '@/lib/bulk-materials-import';

interface ImportJob {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records_processed: number;
  records_total: number;
  error_message: string | null;
  created_at: string;
}

export function MaterialsImporter() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    
    setRefreshing(true);
    const { data, error } = await supabase
      .from('materials_import_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs((data || []) as ImportJob[]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchJobs();
    
    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(j => j.status === 'pending' || j.status === 'processing');
      if (hasActiveJobs) {
        fetchJobs();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, jobs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Please upload an Excel or CSV file');
      return;
    }

    setUploading(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('materials-data')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: job, error: jobError } = await supabase
        .from('materials_import_jobs')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          status: 'pending',
        })
        .select()
        .single();

      if (jobError) throw jobError;

      toast.success(`File uploaded! Import started for ${file.name}`);

      const { error: functionError } = await supabase.functions.invoke('import-materials', {
        body: {
          jobId: job.id,
          filePath: filePath,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        toast.error('Failed to start import process');
      }

      await fetchJobs();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDirectImport = async () => {
    setUploading(true);
    try {
      const { importAustralianMaterials } = await import('@/lib/import-australian-materials');
      const result = await importAustralianMaterials();
      
      if (result.success) {
        toast.success(`Successfully imported ${result.count} Australian materials!`);
        await fetchJobs();
      } else {
        toast.error('Failed to import materials');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import materials');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkImport = async () => {
    setUploading(true);
    const loadingToast = toast.loading('Importing materials from uploaded files...');
    
    try {
      const result = await bulkImportMaterials((current, total, message) => {
        toast.loading(`${message} (${current}/${total})`, { id: loadingToast });
      });
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.imported} materials!`);
      } else {
        toast.warning(`Imported ${result.imported} materials with ${result.errors} errors`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Bulk import error:', error);
      toast.error('Failed to import materials from files');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <Loader2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getProgressPercentage = (job: ImportJob) => {
    if (job.records_total === 0) return 0;
    return Math.round((job.records_processed / job.records_total) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Database Import</CardTitle>
        <CardDescription>
          Quick start with Australian materials or upload your own emission factor files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Quick Start: Australian Materials</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Instantly load 30+ verified Australian construction materials with carbon data
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                  <li>✓ Concrete, steel, timber & more</li>
                  <li>✓ Based on Australian standards</li>
                  <li>✓ Ready to use immediately</li>
                </ul>
              </div>
              <Button
                onClick={handleDirectImport}
                disabled={uploading}
                size="lg"
                className="shrink-0"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Import Now
                  </>
                )}
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Import NABERS & ICM Databases</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Import thousands of materials from uploaded NABERS 2025.1 and ICM 2019 databases
              </p>
              <Button
                onClick={handleBulkImport}
                disabled={uploading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import All Files Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or upload custom files</span>
          </div>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Upload Your Own Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Excel (.xlsx, .xls) or CSV files supported
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                disabled={uploading}
                asChild
                variant="outline"
                size="lg"
              >
                <span className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Choose File
                    </>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Supports: ICM Database, NABERS NMEF v2025.1, EPD Lists
            </p>
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent Imports</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchJobs}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-sm">{job.file_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                  </div>

                  {(job.status === 'processing' || job.status === 'completed') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {job.records_processed} / {job.records_total} records
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(job)} />
                    </div>
                  )}

                  {job.error_message && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">
                        {job.error_message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {job.status === 'completed' && (
                    <p className="text-xs text-green-600">
                      ✓ Successfully imported {job.records_processed} materials
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
