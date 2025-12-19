import { Database, CheckCircle, BarChart3, FileCheck, Clock, Layers, PieChart, AlertTriangle, Shield, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterialsDatabaseStats, DataSourceStats } from "@/hooks/useMaterialsDatabaseStats";
import { SEOHead } from "@/components/SEOHead";
import { DataSourceAttribution, MultiSourceAttribution } from "@/components/DataSourceAttribution";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
          6-Layer Validation Framework v1.0
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Materials Database Status
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real-time validation statistics using our comprehensive 6-layer validation framework. 
          All emission factors validated against NABERS v2025.1 standards.
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
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
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
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
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
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
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
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold">{stats?.totalSources}</p>
                )}
                <p className="text-xs text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Levels & Source Tiers */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Confidence Levels
            </CardTitle>
            <CardDescription>Material confidence distribution per Framework v1.0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Skeleton className="h-32 w-full" /> : (
              <>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Verified EPD</span>
                  <Badge className="bg-emerald-600">{stats?.confidenceLevelCounts.verified.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-600" /> Documented Variant</span>
                  <Badge className="bg-yellow-600">{stats?.confidenceLevelCounts.documented.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                  <span className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-600" /> Industry Average</span>
                  <Badge className="bg-orange-600">{stats?.confidenceLevelCounts.industry_average.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                  <span className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Needs Review</span>
                  <Badge variant="destructive">{stats?.confidenceLevelCounts.needs_review.toLocaleString()}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Source Credibility Tiers
            </CardTitle>
            <CardDescription>Data source classification per Layer 5</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Skeleton className="h-32 w-full" /> : (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Tier 1: EPD Australasia / NABERS</span><span className="font-medium">{stats?.sourceTierCounts.tier1.toLocaleString()}</span></div>
                  <Progress value={(stats?.sourceTierCounts.tier1 || 0) / (stats?.totalMaterials || 1) * 100} className="h-2 bg-emerald-100" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Tier 2: ICM / International EPD</span><span className="font-medium">{stats?.sourceTierCounts.tier2.toLocaleString()}</span></div>
                  <Progress value={(stats?.sourceTierCounts.tier2 || 0) / (stats?.totalMaterials || 1) * 100} className="h-2 bg-amber-100" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Tier 3: Requires Review</span><span className="font-medium">{stats?.sourceTierCounts.tier3.toLocaleString()}</span></div>
                  <Progress value={(stats?.sourceTierCounts.tier3 || 0) / (stats?.totalMaterials || 1) * 100} className="h-2 bg-red-100" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Source Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources Breakdown
          </CardTitle>
          <CardDescription>
            Material counts and import status by data source
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats?.dataSourceStats && Object.entries(stats.dataSourceStats).map(([key, source]: [string, DataSourceStats]) => (
                <div 
                  key={key} 
                  className={`p-4 rounded-lg border ${
                    source.count > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/50 border-muted'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{source.name}</p>
                  <p className="text-2xl font-bold mt-1">{source.count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{source.percentage}% of total</p>
                  {source.lastImported && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(source.lastImported).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart and Source Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Data Source Distribution
            </CardTitle>
            <CardDescription>
              Visual breakdown of materials by source
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <Pie
                    data={stats?.dataSourceStats ? Object.entries(stats.dataSourceStats)
                      .filter(([, s]) => (s as DataSourceStats).count > 0)
                      .map(([, s]) => ({
                        name: (s as DataSourceStats).name,
                        value: (s as DataSourceStats).count,
                        percentage: (s as DataSourceStats).percentage
                      })) : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, payload }) => `${name}: ${payload?.percentage || 0}%`}
                    labelLine={false}
                  >
                    {stats?.dataSourceStats && Object.entries(stats.dataSourceStats)
                      .filter(([, s]) => (s as DataSourceStats).count > 0)
                      .map(([, ], index) => {
                        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Materials']}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Data Source Distribution List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              All Data Sources
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">

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

      {/* Data Sources Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources & Attribution
          </CardTitle>
          <CardDescription>
            Authoritative sources for embodied carbon emission factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <>
              {/* ICE Database Attribution */}
              <DataSourceAttribution source="ICE" variant="full" showLogo showLink />
              
              {/* Other Sources */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Additional Data Sources</p>
                <MultiSourceAttribution sources={["EPD", "NABERS", "NGER"]} />
              </div>
            </>
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
                Environmental Product Declarations (EPDs) sourced from Circular Ecology ICE Database V4.1, EPD Australasia, 
                NABERS, and international EPD registries. All emission factors are validated against NABERS v2025.1 
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
