import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, CheckCircle2, XCircle, Loader2, FileSpreadsheet } from 'lucide-react';

interface EPDItem {
  name: string;
  url: string;
  index: number;
}

interface ImportResult {
  success: string[];
  failed: { name: string; error: string }[];
  total: number;
}

export const BluescopeEPDImporter = () => {
  const { toast } = useToast();
  const [epds, setEpds] = useState<EPDItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [individualResults, setIndividualResults] = useState<Map<number, 'success' | 'failed' | 'pending'>>(new Map());

  const loadEPDList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-bluescope-epd', {
        body: { action: 'list' }
      });

      if (error) throw error;

      setEpds(data.epds || []);
      toast({
        title: 'EPD List Loaded',
        description: `Found ${data.total} BlueScope EPDs to import`,
      });
    } catch (error) {
      console.error('Error loading EPDs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load EPD list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const importSingleEPD = async (index: number) => {
    setCurrentIndex(index);
    setIndividualResults(prev => new Map(prev).set(index, 'pending'));

    try {
      const { data, error } = await supabase.functions.invoke('import-bluescope-epd', {
        body: { action: 'import-single', epdIndex: index }
      });

      if (error) throw error;

      if (data.success) {
        setIndividualResults(prev => new Map(prev).set(index, 'success'));
        toast({
          title: 'Import Successful',
          description: data.message,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      setIndividualResults(prev => new Map(prev).set(index, 'failed'));
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCurrentIndex(-1);
    }
  };

  const importAllEPDs = async () => {
    setImporting(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-bluescope-epd', {
        body: { action: 'import-all' }
      });

      if (error) throw error;

      setResults(data);
      
      // Update individual results
      const newResults = new Map<number, 'success' | 'failed' | 'pending'>();
      data.success.forEach((name: string) => {
        const epd = epds.find(e => e.name === name);
        if (epd) newResults.set(epd.index, 'success');
      });
      data.failed.forEach((item: { name: string }) => {
        const epd = epds.find(e => e.name === item.name);
        if (epd) newResults.set(epd.index, 'failed');
      });
      setIndividualResults(newResults);

      toast({
        title: 'Bulk Import Complete',
        description: `Imported ${data.success.length}/${data.total} EPDs`,
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: 'Bulk Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const successCount = Array.from(individualResults.values()).filter(v => v === 'success').length;
  const failedCount = Array.from(individualResults.values()).filter(v => v === 'failed').length;
  const progress = epds.length > 0 ? ((successCount + failedCount) / epds.length) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          BlueScope EPD Importer
        </CardTitle>
        <CardDescription>
          Import 34 missing BlueScope EPDs directly from PDF sources using AI extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={loadEPDList} 
            disabled={loading || importing}
            variant="outline"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Load EPD List
          </Button>
          
          {epds.length > 0 && (
            <Button 
              onClick={importAllEPDs} 
              disabled={importing}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Import All ({epds.length})
            </Button>
          )}
        </div>

        {epds.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {successCount + failedCount}/{epds.length}</span>
                <span className="flex gap-2">
                  <Badge variant="default" className="bg-emerald-500">{successCount} success</Badge>
                  {failedCount > 0 && <Badge variant="destructive">{failedCount} failed</Badge>}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-4 space-y-2">
                {epds.map((epd) => {
                  const status = individualResults.get(epd.index);
                  const isCurrentlyImporting = currentIndex === epd.index;
                  
                  return (
                    <div 
                      key={epd.index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {status === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        )}
                        {status === 'failed' && (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                        {status === 'pending' && (
                          <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                        )}
                        {!status && (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span className="truncate text-sm">{epd.name}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => importSingleEPD(epd.index)}
                        disabled={importing || isCurrentlyImporting || status === 'success'}
                        className="flex-shrink-0 ml-2"
                      >
                        {isCurrentlyImporting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : status === 'success' ? (
                          'Done'
                        ) : status === 'failed' ? (
                          'Retry'
                        ) : (
                          'Import'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        {results && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Import Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-emerald-600">✓ Successfully imported: {results.success.length}</p>
              {results.failed.length > 0 && (
                <div className="text-destructive">
                  <p>✗ Failed: {results.failed.length}</p>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {results.failed.slice(0, 5).map((f, i) => (
                      <li key={i}>{f.name}: {f.error}</li>
                    ))}
                    {results.failed.length > 5 && (
                      <li>...and {results.failed.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
