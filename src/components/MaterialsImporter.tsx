import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

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
    
    // Poll for updates every 3 seconds if there are active jobs
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

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Please upload an Excel or CSV file');
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('materials-data')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create import job
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

      // Trigger import edge function
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

      // Refresh jobs list
      await fetchJobs();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
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
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Materials Database Importer
        </CardTitle>
        <CardDescription>
          Import materials from NABERS EPD lists, ICM Database, or custom Excel files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary/50 transition-colors">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload Excel (.xlsx, .xls) or CSV files
          </p>
          <label htmlFor="materials-file-upload">
            <Button
              disabled={uploading}
              onClick={() => document.getElementById('materials-file-upload')?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
            <input
              id="materials-file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Supported Files Info */}
        <Alert>
          <AlertDescription>
            <strong>Supported files:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>NABERS National Material Emission Factors Database (v2025.1)</li>
              <li>NABERS EPD List (v2025.1)</li>
              <li>ICM Database (2019)</li>
              <li>Custom materials spreadsheets with columns: Material Name, Category, Unit, Embodied Carbon</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Import Jobs List */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Import History</h3>
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

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
                  {getStatusIcon(job.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </p>
                    
                    {job.status === 'processing' && job.records_total > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{job.records_processed} / {job.records_total} records</span>
                          <span>{getProgressPercentage(job)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(job)} className="h-1" />
                      </div>
                    )}

                    {job.status === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Imported {job.records_processed} materials
                      </p>
                    )}

                    {job.status === 'failed' && job.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        Error: {job.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}