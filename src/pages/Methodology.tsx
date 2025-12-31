import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ExternalLink, CheckCircle2, AlertCircle, Database, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";

const Methodology = () => {
  const [lastUpdated] = useState(() => {
    return new Date().toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('methodology-content');
    if (element) {
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `CarbonConstruct-Methodology-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  // Anchor navigation
  const sections = [
    { id: 'standards', label: 'Standards Compliance' },
    { id: 'data-sources', label: 'Data Sources' },
    { id: 'methodology', label: 'Calculation Methodology' },
    { id: 'australian-schemes', label: 'Australian Schemes' },
    { id: 'security', label: 'Data Security' },
    { id: 'limitations', label: 'Limitations' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <SEOHead
        title="Methodology & Compliance Framework | CarbonConstruct"
        description="Technical documentation of CarbonConstruct's calculation methodology, data sources, and standards compliance for embodied carbon assessment."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav className="sticky top-24 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  On This Page
                </p>
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main id="methodology-content" className="flex-1 space-y-12">
              {/* Header */}
              <header className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Methodology & Compliance Framework
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Technical documentation of calculation methodology, data sources, and standards compliance
                    </p>
                  </div>
                  <Button onClick={handleDownloadPDF} variant="outline" className="shrink-0">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              </header>

              {/* Section 1: Standards Compliance */}
              <section id="standards" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Standards Compliance
                </h2>
                
                <Card className="neon-border">
                  <CardContent className="pt-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Standard</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Implementation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">EN 15978:2011</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Full Compliance
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Life-cycle stages A1-D with complete system boundaries
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">EN 15804:2012+A2:2019</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Aligned</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            EPD data structure, JRC-EF-3.1 characterisation factors
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">ISO 14040/14044</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Aligned</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            LCA principles and framework methodology
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">ISO 21931-1</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Aligned</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Sustainability in building construction framework
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">ECO Platform LCA Rules V2.0</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Aligned</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Electricity modelling, biogenic carbon tracking
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <p className="text-muted-foreground">
                  CarbonConstruct implements cradle-to-grave life cycle assessment following EN 15978 methodology 
                  for building assessment. All calculations map to modules A1-A5 (product and construction), 
                  B1-B7 (use stage), C1-C4 (end of life), and D (benefits beyond system boundary).
                </p>
              </section>

              {/* Section 2: Data Sources */}
              <section id="data-sources" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Data Sources & Traceability
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="neon-border">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary font-mono">4,620</p>
                      <p className="text-sm text-muted-foreground">Verified Materials</p>
                    </CardContent>
                  </Card>
                  <Card className="neon-border">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary font-mono">4</p>
                      <p className="text-sm text-muted-foreground">Primary Sources</p>
                    </CardContent>
                  </Card>
                  <Card className="neon-border">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary font-mono">73%</p>
                      <p className="text-sm text-muted-foreground">EPD URL Coverage</p>
                    </CardContent>
                  </Card>
                  <Card className="neon-border">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary font-mono">100%</p>
                      <p className="text-sm text-muted-foreground">Source Attribution</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Material Database Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Materials</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">NABERS 2025 Emission Factors</TableCell>
                          <TableCell className="text-right font-mono">3,408</TableCell>
                          <TableCell className="text-muted-foreground">
                            NSW Government EPD programme data
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ICM Database 2019 (AusLCI)</TableCell>
                          <TableCell className="text-right font-mono">638</TableCell>
                          <TableCell className="text-muted-foreground">
                            Australian Life Cycle Inventory data
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ICE V4.1 - Circular Ecology</TableCell>
                          <TableCell className="text-right font-mono">511</TableCell>
                          <TableCell className="text-muted-foreground">
                            University of Bath embodied carbon database
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">NGER Materials Database v2025.1</TableCell>
                          <TableCell className="text-right font-mono">63</TableCell>
                          <TableCell className="text-muted-foreground">
                            Clean Energy Regulator emission factors
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Data Quality Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">73%</strong> of materials have direct EPD URL links</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">73%</strong> have EPD registration numbers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">67%</strong> have manufacturer information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">100%</strong> have source database attribution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">100%</strong> use JRC-EF-3.1 characterisation factors</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Section 3: Calculation Methodology */}
              <section id="methodology" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Calculation Methodology
                </h2>

                <Card className="neon-border border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Impact Category Calculated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">GWP</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Global Warming Potential</p>
                        <p className="text-sm text-muted-foreground font-mono">kgCO₂e (kilograms of carbon dioxide equivalent)</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      CarbonConstruct focuses exclusively on climate change impact (GWP). Other environmental 
                      impact categories (acidification, eutrophication, ozone depletion, photochemical ozone 
                      creation, abiotic depletion) are not currently calculated.
                    </p>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Life Cycle Stages Covered</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stage</TableHead>
                          <TableHead>Modules</TableHead>
                          <TableHead>Implementation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Product Stage</TableCell>
                          <TableCell className="font-mono">A1-A3</TableCell>
                          <TableCell className="text-muted-foreground">
                            Raw material extraction, transport, manufacturing
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Construction</TableCell>
                          <TableCell className="font-mono">A4-A5</TableCell>
                          <TableCell className="text-muted-foreground">
                            Transport to site, installation processes
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Use Stage</TableCell>
                          <TableCell className="font-mono">B1-B7</TableCell>
                          <TableCell className="text-muted-foreground">
                            Maintenance, repair, replacement, operational energy/water
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">End of Life</TableCell>
                          <TableCell className="font-mono">C1-C4</TableCell>
                          <TableCell className="text-muted-foreground">
                            Deconstruction, transport, waste processing, disposal
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Beyond System</TableCell>
                          <TableCell className="font-mono">D</TableCell>
                          <TableCell className="text-muted-foreground">
                            Reuse, recovery, recycling potential (credits)
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Calculation Principles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Functional Unit</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          1 m² of gross floor area over reference study period
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Reference Study Period</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          60 years (adjustable per project type)
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Allocation Method</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          Cut-off allocation for recycled content
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Data Quality</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          Source-attributed materials with uncertainty tracking
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Regional Specificity</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          Australian state-level electricity grid factors (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
                        </dd>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-medium text-foreground">Electricity Modelling</dt>
                        <dd className="sm:col-span-2 text-muted-foreground">
                          Location-based method (market-based option available)
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </section>

              {/* Section 4: Australian Schemes */}
              <section id="australian-schemes" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Australian Scheme Alignment
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Green Star Australia</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <p>
                        CarbonConstruct provides calculation outputs that support Green Star credit 
                        documentation including Life Cycle Impact Reduction and Upfront Carbon Impact.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle className="text-lg">NABERS</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <p>
                        Energy intensity calculations support NABERS-style benchmarking for building 
                        performance assessment.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle className="text-lg">NCC 2024 Section J</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <p>
                        Embodied carbon calculations can support NCC 2024 Performance Solution 
                        documentation requirements.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle className="text-lg">IS Rating (Infrastructure)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <p>
                        Infrastructure projects can track emissions against Infrastructure 
                        Sustainability Council thresholds.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Disclaimer:</strong> CarbonConstruct is a calculation 
                      tool providing indicative compliance mapping. Formal certification and ratings require 
                      independent third-party verification by accredited assessors.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5: Data Security */}
              <section id="security" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Data Residency & Security
                </h2>

                <Card className="neon-border">
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Australian Data Sovereignty
                        </h3>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>Primary database: Sydney, Australia (ap-southeast-2)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>All user data, projects, and calculations stored in Australia</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>TLS 1.3 encryption in transit</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>AES-256 encryption at rest</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Compliance
                        </h3>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>Privacy Act 1988 (Cth) compliant</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>Australian Privacy Principles (APPs) adhered</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>ACSC Essential Eight security controls implemented</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>Row-Level Security (RLS) on all database tables</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 6: Limitations */}
              <section id="limitations" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Methodology Limitations
                </h2>

                <Card className="neon-border border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      What CarbonConstruct Does Not Do
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Does not calculate environmental impact categories beyond GWP (no AP, EP, ODP, POCP, ADPe, ADPf)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Does not provide formal certification or ratings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Does not integrate with external project management systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Does not provide formal EPD publication or registration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Has not undergone SOC 2, ISO 27001, or third-party LCA audit</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Data Quality Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>Not all materials have specific manufacturer EPDs; some use industry-average data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>EPD programme operator information is not available for all materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>Some materials use international data with documented regional adjustments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>Internal verification only; no independent third-party audit conducted</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Section 7: Contact */}
              <section id="contact" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Technical Queries
                </h2>

                <Card className="neon-border">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      For technical questions about methodology, data sources, or compliance mapping:
                    </p>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="mailto:contact@carbonconstruct.net" 
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          contact@carbonconstruct.net
                        </a>
                      </li>
                      <li>
                        <Link 
                          to="/materials/status" 
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Materials Database Status
                        </Link>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      For formal compliance verification, users should engage accredited assessors 
                      appropriate to their certification requirements.
                    </p>
                  </CardContent>
                </Card>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Methodology;
