import { Database, CheckCircle, BarChart3, FileCheck, Clock, Layers, PieChart, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterialsDatabaseStats } from "@/hooks/useMaterialsDatabaseStats";
import { SEOHead } from "@/components/SEOHead";

export default function MaterialDatabaseStatus() {
  const { data: stats, isLoading, error } = useMaterialsDatabaseStats();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEOHead 
          title="Materials Database Status - CarbonConstruct"
          description="View the status and validation statistics of the CarbonConstruct materials database."
        />
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-semibold">Unable to load database status</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <SEOHead 
        title="Materials Database Status - CarbonConstruct"
        description="Real-time validation statistics and data quality metrics for the CarbonConstruct EPD materials database."
      />
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Database Validated
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Materials Database Status
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real-time validation statistics and data quality metrics for our EPD materials database. 
          All emission factors are sourced from verified Environmental Product Declarations.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalMaterials.toLocaleString()}</p>
                )}
                <p className="text-xs text-muted-foreground">Total Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalCategories}</p>
                )}
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.validationStatus.passRate}%</p>
                )}
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalSources}</p>
                )}
                <p className="text-xs text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Data Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Source Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of materials by EPD data source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : (
              stats?.sourceDistribution.slice(0, 6).map((source) => (
                <div key={source.source} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]" title={source.source}>
                      {source.source}
                    </span>
                    <span className="text-muted-foreground">
                      {source.count.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Top Categories
            </CardTitle>
            <CardDescription>
              Materials count by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats?.categoryBreakdown.map((cat) => (
                  <Badge key={cat.category} variant="secondary" className="text-xs">
                    {cat.category} <span className="ml-1 opacity-70">({cat.count})</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Data Quality Metrics
            </CardTitle>
            <CardDescription>
              Metadata completeness across the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With EPD Reference Number</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(stats?.metadataCompleteness.withEpdNumber || 0) / (stats?.totalMaterials || 1) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round((stats?.metadataCompleteness.withEpdNumber || 0) / (stats?.totalMaterials || 1) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Manufacturer Data</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(stats?.metadataCompleteness.withManufacturer || 0) / (stats?.totalMaterials || 1) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round((stats?.metadataCompleteness.withManufacturer || 0) / (stats?.totalMaterials || 1) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With EPD URL Link</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(stats?.metadataCompleteness.withEpdUrl || 0) / (stats?.totalMaterials || 1) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round((stats?.metadataCompleteness.withEpdUrl || 0) / (stats?.totalMaterials || 1) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With State/Region Data</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(stats?.metadataCompleteness.withState || 0) / (stats?.totalMaterials || 1) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round((stats?.metadataCompleteness.withState || 0) / (stats?.totalMaterials || 1) * 100)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Validation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Validation Status
            </CardTitle>
            <CardDescription>
              Database validation and compliance information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Validation Passed</span>
                  </div>
                  <Badge className="bg-emerald-600">{stats?.validationStatus.passRate}%</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last Validated: {stats?.validationStatus.lastValidationDate}
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Methodology:</strong> {stats?.validationStatus.methodology}
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  <p>
                    All emission factors are validated against NABERS v2025.1 standards. 
                    Continuous monthly validation ensures data accuracy. Materials flagged for review 
                    are monitored but remain usable with documented justifications.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unit Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Distribution</CardTitle>
          <CardDescription>
            Materials broken down by measurement unit type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats?.unitDistribution.map((item) => (
                <Badge key={item.unit} variant="outline" className="text-sm py-1.5 px-3">
                  <span className="font-mono font-medium">{item.unit}</span>
                  <span className="ml-2 text-muted-foreground">{item.count.toLocaleString()}</span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Statement */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Data Compliance Statement</h3>
              <p className="text-sm text-muted-foreground">
                The CarbonConstruct materials database contains {stats?.totalMaterials.toLocaleString() || "4,000+"} verified 
                Environmental Product Declarations (EPDs) sourced from EPD Australasia, ICM Database 2019, 
                and international EPD registries. All emission factors are validated against NABERS v2025.1 
                standards with continuous monthly validation processes to ensure data accuracy and regulatory compliance.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : "Recently"} • 
                Version: v2025.1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
