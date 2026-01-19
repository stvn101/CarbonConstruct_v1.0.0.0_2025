import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  FileText,
  RefreshCw,
  BarChart3,
  Search,
  Layers,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import BuildingTransparencyLogo from "@/assets/BuildingTransparency-Logo.webp";
import CircularEcologyLogo from "@/assets/CircularEcology-Logo.webp";
import UnitedFacadeLogo from "@/assets/UnitedFacade-Logo.webp";

interface DataSource {
  name: string;
  shortName: string;
  logo?: string;
  logoBg?: string;
  description: string;
  materialCount: string;
  priority: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Partner";
  tierLabel: string;
  uncertainty: string;
  integrationType: "Static Import" | "Live API" | "Periodic Sync";
  features: string[];
  technicalDetails: string[];
  url: string;
  coverage: string;
}

const dataSources: DataSource[] = [
  {
    name: "EPiC Database 2024",
    shortName: "EPiC",
    description:
      "The Environmental Performance in Construction (EPiC) Database from the University of Melbourne provides comprehensive Australian-specific lifecycle assessment data for construction materials.",
    materialCount: "350+",
    priority: 1,
    tier: "Tier 2",
    tierLabel: "National LCI",
    uncertainty: "±10%",
    integrationType: "Static Import",
    features: [
      "Australian-specific lifecycle data",
      "University-verified methodology",
      "DOI links for academic citation",
      "Split header structure handling",
      "GWP data with full LCA stages",
    ],
    technicalDetails: [
      "Imported via 'import-epic-materials' edge function",
      "Handles EPiC's unique split header CSV structure",
      "Automatic unit normalization to kgCO2e/kg",
      "Priority 1 in source hierarchy",
    ],
    url: "https://msd.unimelb.edu.au/research/projects/current/epic",
    coverage: "Australia",
  },
  {
    name: "ICE Database V4.1",
    shortName: "ICE",
    logo: CircularEcologyLogo,
    logoBg: "bg-white",
    description:
      "The Inventory of Carbon and Energy (ICE) from Circular Ecology is the world's most widely used embodied carbon database, providing comprehensive emission factors for construction materials.",
    materialCount: "511",
    priority: 2,
    tier: "Tier 2",
    tierLabel: "National LCI",
    uncertainty: "±15%",
    integrationType: "Static Import",
    features: [
      "Global industry standard dataset",
      "Comprehensive material coverage",
      "Regular updates and versioning",
      "Cradle-to-gate emission factors",
      "Accepted as Australian proxy data",
    ],
    technicalDetails: [
      "Excel import with column mapping",
      "Automatic category classification",
      "Priority 2 in source hierarchy",
      "Normalized to kgCO2e/kg",
    ],
    url: "https://circularecology.com/embodied-carbon-footprint-database.html",
    coverage: "Global (UK-based)",
  },
  {
    name: "EC3 Global Database",
    shortName: "EC3",
    logo: BuildingTransparencyLogo,
    logoBg: "bg-slate-900",
    description:
      "Building Transparency's EC3 tool provides access to 90,000+ verified Environmental Product Declarations (EPDs) from manufacturers worldwide, enabling product-specific carbon data.",
    materialCount: "90,000+",
    priority: 1,
    tier: "Tier 1",
    tierLabel: "EPD-Verified",
    uncertainty: "±5%",
    integrationType: "Live API",
    features: [
      "Real-time EPD search",
      "Product-specific verified data",
      "Manufacturer attribution",
      "Global EPD coverage",
      "GWP A1-A3 lifecycle stages",
    ],
    technicalDetails: [
      "Live API via 'search-ec3-materials' edge function",
      "200 requests/hour rate limit",
      "Stripe-based access control",
      "No local data storage (privacy compliant)",
      "Category-based search with 25+ categories",
    ],
    url: "https://buildingtransparency.org",
    coverage: "Global",
  },
  {
    name: "NABERS Database",
    shortName: "NABERS",
    description:
      "The National Australian Built Environment Rating System provides Australian government-verified emission factors for building operations and materials.",
    materialCount: "3,408",
    priority: 6,
    tier: "Tier 3",
    tierLabel: "Generic Estimate",
    uncertainty: "±30%",
    integrationType: "Static Import",
    features: [
      "Australian government standard",
      "Comprehensive material coverage",
      "NCC compliance aligned",
      "Conservative assumptions",
      "Worst-case supply chain factors",
    ],
    technicalDetails: [
      "Bulk import with validation",
      "Priority 6 in source hierarchy (last resort)",
      "Used when no EPD or LCI data available",
      "Flagged for outlier detection",
    ],
    url: "https://www.nabers.gov.au",
    coverage: "Australia",
  },
  {
    name: "United Facade",
    shortName: "UF",
    logo: UnitedFacadeLogo,
    logoBg: "bg-slate-100 dark:bg-slate-800",
    description:
      "United Facade is a Queensland-based commercial construction company with 17 years of hands-on Tier 1 site experience. The practical knowledge from running real projects directly shaped how CarbonConstruct approaches carbon calculation — focusing on materials and workflows that actually matter to builders.",
    materialCount: "Builder Insights",
    priority: 0,
    tier: "Partner",
    tierLabel: "Industry Partner",
    uncertainty: "N/A",
    integrationType: "Static Import",
    features: [
      "Real project material selections",
      "Estimating-first workflows",
      "Carbon data integrated with quoting",
      "17 years Tier 1 experience",
      "Queensland commercial construction",
    ],
    technicalDetails: [
      "Builder-first approach to carbon calculation",
      "Material selections based on real commercial projects",
      "Workflows designed around actual estimating processes",
      "Practical experience informing platform design",
    ],
    url: "https://unitedfacade.com.au",
    coverage: "Queensland, Australia",
  },
];

const tierBadgeStyles: Record<string, string> = {
  "Tier 1": "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/40",
  "Tier 2": "bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-600/40",
  "Tier 3": "bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/40",
  "Partner": "bg-primary/20 text-primary border-primary/40",
};

const integrationBadgeStyles = {
  "Static Import": "bg-slate-600/20 text-slate-700 dark:text-slate-300 border-slate-600/40",
  "Live API": "bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-600/40",
  "Periodic Sync": "bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border-cyan-600/40",
};

export default function PartnerIntegrations() {
  return (
    <>
      <SEOHead
        title="Data Source Integrations | CarbonConstruct"
        description="Learn how CarbonConstruct integrates industry-leading carbon databases including ICE, EC3, EPiC, and NABERS for accurate embodied carbon calculations."
        canonicalPath="/partners/integrations"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/40">
            Technical Documentation
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Data Source Integrations
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            CarbonConstruct integrates multiple industry-leading carbon databases
            to provide accurate, verifiable embodied carbon calculations for
            Australian construction projects.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Integration Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold">Source Priority System</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Materials are matched using a strict priority hierarchy. EPiC
                  (Priority 1) and ICE (Priority 2) are preferred over NABERS
                  (Priority 6) to ensure accuracy.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500">
                  <RefreshCw className="h-5 w-5" />
                  <h3 className="font-semibold">Unit Normalization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  All emission factors are automatically normalized to kgCO2e/kg
                  for consistent calculations across different source formats.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold">Outlier Detection</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Factors exceeding 2x the category median are flagged as
                  outliers to identify high-uncertainty data points.
                </p>
              </div>
            </div>

            <Separator />

            {/* Data Quality Tiers */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Data Quality Tiers
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Badge className={tierBadgeStyles["Tier 1"]}>Tier 1</Badge>
                  <h4 className="font-medium mt-2">EPD-Verified</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Product-specific Environmental Product Declarations with
                    third-party verification.
                  </p>
                  <p className="text-xs text-emerald-500 mt-2">Uncertainty: ±5%</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Badge className={tierBadgeStyles["Tier 2"]}>Tier 2</Badge>
                  <h4 className="font-medium mt-2">National LCI</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Regional lifecycle inventory data from academic or government
                    sources.
                  </p>
                  <p className="text-xs text-blue-500 mt-2">Uncertainty: ±10-15%</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Badge className={tierBadgeStyles["Tier 3"]}>Tier 3</Badge>
                  <h4 className="font-medium mt-2">Generic Estimate</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Industry averages with conservative assumptions for worst-case
                    scenarios.
                  </p>
                  <p className="text-xs text-amber-500 mt-2">Uncertainty: ±30%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Data Sources */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Integrated Data Sources
          </h2>

          {dataSources.map((source) => (
            <Card key={source.shortName} variant="glass" className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {source.logo ? (
                      <div
                        className={`w-14 h-14 rounded-lg ${source.logoBg} flex items-center justify-center p-2`}
                      >
                        <img
                          src={source.logo}
                          alt={`${source.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {source.shortName.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl">{source.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={tierBadgeStyles[source.tier]}>
                          {source.tier}: {source.tierLabel}
                        </Badge>
                        <Badge className={integrationBadgeStyles[source.integrationType]}>
                          {source.integrationType}
                        </Badge>
                        <Badge variant="outline">Priority {source.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {source.materialCount}
                      </p>
                      <p className="text-muted-foreground">Materials</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{source.uncertainty}</p>
                      <p className="text-muted-foreground text-xs">Uncertainty</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{source.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {source.features.map((feature, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Technical Integration
                    </h4>
                    <ul className="space-y-2">
                      {source.technicalDetails.map((detail, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <code className="text-primary mt-0.5">→</code>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    Coverage: {source.coverage}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Source
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Material Matching Flow */}
        <Card variant="glass" className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Material Matching Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                {
                  step: 1,
                  title: "BOQ Upload",
                  desc: "User uploads Bill of Quantities with material descriptions",
                },
                {
                  step: 2,
                  title: "AI Parsing",
                  desc: "AI extracts material names, quantities, and units",
                },
                {
                  step: 3,
                  title: "Database Search",
                  desc: "Priority-ordered search across all data sources",
                },
                {
                  step: 4,
                  title: "Unit Normalization",
                  desc: "Convert to kgCO2e/kg with steel framing conversions",
                },
                {
                  step: 5,
                  title: "Confidence Rating",
                  desc: "Assign data quality tier and uncertainty percentage",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <span className="font-bold text-primary">{item.step}</span>
                    </div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.desc}
                    </p>
                  </div>
                  {item.step < 5 && (
                    <ArrowRight className="hidden md:block absolute top-4 -right-2 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-xl font-semibold">
            See Our Data in Action
          </h2>
          <p className="text-muted-foreground">
            View live statistics from our materials database or explore the EC3
            integration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link to="/materials/status">
                <TrendingUp className="mr-2 h-4 w-4" />
                Materials Database Status
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/lp/ec3">
                <Search className="mr-2 h-4 w-4" />
                EC3 Integration
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/partners">
                <ArrowRight className="mr-2 h-4 w-4" />
                All Partners
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
