import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, CheckCircle, AlertTriangle, Loader2, ExternalLink, BarChart3, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { AdminSidebar } from "@/components/AdminSidebar";

// Circular Ecology logo for ICE Database attribution
const CircularEcologyLogo = () => (
  <a 
    href="https://circularecology.com" 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
    title="ICE Database by Circular Ecology"
  >
    <img 
      src="/logos/circular-ecology-logo.png" 
      alt="Circular Ecology" 
      className="h-8 w-auto"
    />
  </a>
);

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}

export default function AdminICEImport() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [materialCount, setMaterialCount] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch current material count
  useEffect(() => {
    async function fetchCount() {
      const { count, error } = await supabase
        .from("materials_epd")
        .select("*", { count: "exact", head: true })
        .eq("data_source", "ICE V4.1 - Circular Ecology");
      
      if (!error && count !== null) {
        setMaterialCount(count);
      }
    }
    if (user) fetchCount();
  }, [user, result]);

  const handleImport = async () => {
    setIsImporting(true);
    setProgress(10);
    setResult(null);

    try {
      // Fetch pre-processed ICE materials JSON
      setProgress(20);
      const response = await fetch("/demo/ice-materials-v4.1.json");
      
      if (!response.ok) {
        throw new Error("Failed to load ICE materials data file");
      }

      const materials = await response.json();
      setProgress(40);

      if (!Array.isArray(materials) || materials.length === 0) {
        throw new Error("Invalid materials data format");
      }

      // Call edge function to import
      setProgress(60);
      const { data, error } = await supabase.functions.invoke("import-ice-materials", {
        body: { materials }
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message || "Import failed");
      }

      setResult({
        success: true,
        imported: data?.imported || 0,
        updated: data?.updated || 0,
        errors: data?.errors || []
      });

      toast.success(`Successfully imported ${data?.imported || 0} ICE materials`);
    } catch (error) {
      console.error("Import error:", error);
      setResult({
        success: false,
        imported: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"]
      });
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="ICE Database Import | CarbonConstruct Admin"
        description="Import ICE Database V4.1 materials into CarbonConstruct"
      />

      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">ICE Database Import</h1>
                <p className="text-muted-foreground">
                  Import the Inventory of Carbon and Embodied Energy (ICE) Database V4.1
                </p>
              </div>
              <CircularEcologyLogo />
            </div>

            {/* Main Import Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  ICE Database V4.1 (October 2025)
                </CardTitle>
                <CardDescription>
                  Pre-processed materials database from Circular Ecology. Contains embodied carbon 
                  factors for construction materials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Status */}
                {materialCount !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{materialCount} ICE materials</Badge>
                    currently in database
                  </div>
                )}

                {/* Import Button */}
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  size="lg"
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Import ICE Database
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {isImporting && (
                  <Progress value={progress} className="h-2" />
                )}

                {/* Result */}
                {result && (
                  <Alert variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {result.success ? "Import Complete" : "Import Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {result.success ? (
                        <span>
                          Imported {result.imported} materials, updated {result.updated} existing.
                        </span>
                      ) : (
                        <span>{result.errors.join(", ")}</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Link to="/admin/materials" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Material Analytics</p>
                        <p className="text-sm text-muted-foreground">View charts and statistics</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Link to="/material-database" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Database Status</p>
                        <p className="text-sm text-muted-foreground">Check material health</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Attribution */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <img 
                    src="/logos/circular-ecology-logo.png" 
                    alt="Circular Ecology" 
                    className="h-12 w-auto"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Data Attribution</p>
                    <p>
                      The ICE Database is developed and maintained by{" "}
                      <a 
                        href="https://circularecology.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Circular Ecology
                      </a>
                      . Used under license for embodied carbon calculations in the Australian 
                      construction industry context.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
