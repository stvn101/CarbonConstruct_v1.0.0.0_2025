import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function DataMigration() {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string>('');

  const handleMigration = async () => {
    if (!user) {
      toast.error('You must be logged in to migrate data');
      return;
    }

    // Confirm with user
    const confirmed = window.confirm(
      'This will migrate your existing emissions data from Scope 1, 2, and 3 tables into the new unified calculator format. This is a one-time operation. Continue?'
    );

    if (!confirmed) return;

    setMigrating(true);
    setProgress(0);
    setMigrationStatus('idle');
    
    try {
      // Call the migration edge function
      const { data, error } = await supabase.functions.invoke('migrate-emissions', {
        body: { userId: user.id }
      });

      if (error) {
        throw error;
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setProgress(100);
      setMigrationStatus('success');
      setMigrationDetails(
        data?.message || 
        `Successfully migrated data. Projects updated: ${data?.projectsProcessed || 0}`
      );
      toast.success('Data migration completed successfully!');
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      setMigrationDetails(error.message || 'Failed to migrate data. Please try again.');
      toast.error('Migration failed: ' + (error.message || 'Unknown error'));
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Data Migration</CardTitle>
            <CardDescription>
              Migrate legacy emissions data to the new unified calculator format
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This tool migrates data from the old Scope 1, 2, and 3 tables into the new unified 
            calculator format. This is a one-time operation and should only be run if you have 
            existing data in the old format. Your original data will not be deleted.
          </AlertDescription>
        </Alert>

        {migrating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Migration progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {migrationStatus === 'success' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Migration Successful</AlertTitle>
            <AlertDescription>{migrationDetails}</AlertDescription>
          </Alert>
        )}

        {migrationStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Migration Failed</AlertTitle>
            <AlertDescription>{migrationDetails}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleMigration} 
          disabled={migrating}
          className="w-full"
        >
          {migrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating Data...
            </>
          ) : (
            'Start Migration'
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: This migration can be run multiple times safely. Duplicate data will not be created.
        </p>
      </CardContent>
    </Card>
  );
}
