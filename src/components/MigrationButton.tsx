import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export function MigrationButton() {
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const runMigration = async () => {
    const confirmed = confirm('This will migrate your existing Scope 1, 2, and 3 emissions data to the new unified calculator format. ' + 'Your original data will remain untouched. Continue?');
    if (!confirmed) return;
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('migrate-emissions');
      if (error) throw error;
      setResults(data);
      setShowResults(true);
      if (data.summary.migrated > 0) {
        toast.success(`Successfully migrated ${data.summary.migrated} project(s)!`);
      } else {
        toast.info('No new data to migrate');
      }
    } catch (error: any) {
      logger.error('MigrationButton:runMigration', error);
      toast.error(error.message || 'Migration failed');
    } finally {
      setLoading(false);
    }
  };
  return <>
      

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Migration Results
            </DialogTitle>
            <DialogDescription>
              Summary of data migration to unified calculator format
            </DialogDescription>
          </DialogHeader>

          {results && <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {results.summary.migrated}
                  </div>
                  <div className="text-xs text-muted-foreground">Migrated</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.summary.skipped}
                  </div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.summary.failed}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Project Details:</h4>
                {results.results.map((result: any, index: number) => <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${result.status === 'success' ? 'bg-green-50 border-green-200' : result.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    {result.status === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${result.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />}
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-sm">{result.project}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {result.status}
                        {result.reason && `: ${result.reason}`}
                      </div>
                      {result.summary && <div className="text-xs space-y-0.5 mt-2">
                          <div>Scope 1: {result.summary.scope1_emissions} records</div>
                          <div>Scope 2: {result.summary.scope2_emissions} records</div>
                          <div>Scope 3: {result.summary.scope3_emissions} records</div>
                          <div>Materials: {result.summary.materials_migrated} items</div>
                          <div className="font-semibold text-primary">
                            Total: {result.summary.total_tco2e.toFixed(2)} tCO₂e
                          </div>
                        </div>}
                    </div>
                  </div>)}
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </>;
}