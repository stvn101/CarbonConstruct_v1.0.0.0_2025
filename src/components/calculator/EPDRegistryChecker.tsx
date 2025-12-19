/**
 * EPD Registry Checker Component
 * Checks EPD registries for updated versions of materials
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpiringMaterial {
  id: string;
  material_name: string;
  epd_number?: string | null;
  manufacturer?: string | null;
  expiry_date: string;
  days_until_expiry: number;
}

interface RegistryResult {
  epd_number: string;
  found: boolean;
  registry: string;
  registry_url?: string;
  updated_version?: string;
  new_expiry_date?: string;
  is_newer: boolean;
  error?: string;
}

interface EPDRegistryCheckerProps {
  expiringMaterials?: ExpiringMaterial[];
}

const EPD_REGISTRIES = [
  {
    name: 'EPD Australasia',
    url: 'https://www.epd-australasia.com/epd-search/',
    description: 'Australian and NZ EPDs',
  },
  {
    name: 'EPD International',
    url: 'https://www.environdec.com/library',
    description: 'Global EPD database',
  },
  {
    name: 'EPD Ireland (IGBC)',
    url: 'https://www.igbc.ie/epd/',
    description: 'Irish EPD programme',
  },
  {
    name: 'InData (ECO Platform)',
    url: 'https://www.oekobaudat.de/en.html',
    description: 'European construction EPDs',
  },
];

export function EPDRegistryChecker({ expiringMaterials = [] }: EPDRegistryCheckerProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<RegistryResult[]>([]);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const materialsWithEPD = expiringMaterials.filter(m => m.epd_number);

  const handleCheckRegistries = async () => {
    if (materialsWithEPD.length === 0) {
      toast({
        title: "No materials to check",
        description: "No expiring materials have EPD numbers.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('check-epd-registry', {
        body: {
          materials: materialsWithEPD.map(m => ({
            epd_number: m.epd_number,
            current_expiry_date: m.expiry_date,
            manufacturer: m.manufacturer,
            material_name: m.material_name,
          })),
        },
      });

      if (error) throw error;

      setResults(data.results || []);
      setCheckedAt(new Date());

      const summary = data.summary || {};
      toast({
        title: "Registry check complete",
        description: `Checked ${summary.total_checked} EPDs. ${summary.newer_available || 0} updates may be available.`,
      });
    } catch (error: any) {
      console.error('Error checking registries:', error);
      toast({
        title: "Check failed",
        description: error.message || "Failed to check EPD registries.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              EPD Registry Integration
            </CardTitle>
            <CardDescription>
              Check EPD registries for updated versions of expiring materials
            </CardDescription>
          </div>
          <Button 
            onClick={handleCheckRegistries}
            disabled={isChecking || materialsWithEPD.length === 0}
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Check Registries
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Registry Quick Links */}
        <div>
          <h4 className="text-sm font-medium mb-3">EPD Registries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EPD_REGISTRIES.map(registry => (
              <a
                key={registry.name}
                href={registry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <span className="font-medium text-sm">{registry.name}</span>
                  <p className="text-xs text-muted-foreground">{registry.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        {/* Materials to Check */}
        {materialsWithEPD.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">
              Materials with EPD Numbers ({materialsWithEPD.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {materialsWithEPD.map(material => {
                const result = results.find(r => r.epd_number === material.epd_number);
                return (
                  <div 
                    key={material.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-medium">{material.material_name}</span>
                      <span className="text-muted-foreground ml-2">({material.epd_number})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result ? (
                        result.is_newer ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Update Available
                          </Badge>
                        ) : result.found ? (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Manual Check Needed
                          </Badge>
                        )
                      ) : (
                        <Badge 
                          variant="outline"
                          className={material.days_until_expiry < 0 
                            ? 'border-red-300 text-red-700' 
                            : material.days_until_expiry <= 30 
                              ? 'border-orange-300 text-orange-700'
                              : ''
                          }
                        >
                          {material.days_until_expiry < 0 
                            ? 'Expired' 
                            : `${material.days_until_expiry}d left`}
                        </Badge>
                      )}
                      {result?.registry_url && (
                        <a
                          href={result.registry_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Check Results */}
        {results.length > 0 && checkedAt && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Check Results</h4>
              <span className="text-xs text-muted-foreground">
                Checked at {checkedAt.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {results.filter(r => r.found).length}
                </div>
                <div className="text-xs text-muted-foreground">Found in Registry</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {results.filter(r => r.is_newer).length}
                </div>
                <div className="text-xs text-muted-foreground">Updates Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {results.filter(r => !r.found).length}
                </div>
                <div className="text-xs text-muted-foreground">Manual Check</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              EPD registries may require manual verification. Click registry links above to search directly.
            </p>
          </div>
        )}

        {/* Empty State */}
        {materialsWithEPD.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No expiring materials with EPD numbers to check.</p>
            <p className="text-sm">Add EPD numbers to your materials to enable registry checks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
