import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Printer, CheckCircle2, AlertCircle, Database, Shield, MapPin, FileText, Mail, Clock, Target, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";


const Methodology = () => {
  const [lastUpdated] = useState("1 January 2025");

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const { jsPDF } = await import('jspdf');
    
    // Create cover page
    const coverDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = coverDoc.internal.pageSize.getWidth();
    const pageHeight = coverDoc.internal.pageSize.getHeight();
    
    // Cover page styling
    coverDoc.setFillColor(10, 10, 10);
    coverDoc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Title
    coverDoc.setTextColor(34, 197, 94); // Primary green
    coverDoc.setFontSize(32);
    coverDoc.setFont('helvetica', 'bold');
    coverDoc.text('CarbonConstruct', pageWidth / 2, 60, { align: 'center' });
    
    coverDoc.setTextColor(255, 255, 255);
    coverDoc.setFontSize(24);
    coverDoc.text('Methodology &', pageWidth / 2, 90, { align: 'center' });
    coverDoc.text('Compliance Framework', pageWidth / 2, 102, { align: 'center' });
    
    // Version and date
    coverDoc.setFontSize(14);
    coverDoc.setFont('helvetica', 'normal');
    coverDoc.setTextColor(180, 180, 180);
    coverDoc.text(`Version 1.0`, pageWidth / 2, 130, { align: 'center' });
    coverDoc.text(`Published: ${lastUpdated}`, pageWidth / 2, 140, { align: 'center' });
    
    // Badges
    coverDoc.setFontSize(11);
    coverDoc.setTextColor(34, 197, 94);
    const badges = ['EN 15978:2011 Compliant', 'Green Star Ready', 'NCC 2024 Aligned', '4,620 Verified Materials'];
    badges.forEach((badge, i) => {
      coverDoc.text(`✓ ${badge}`, pageWidth / 2, 170 + (i * 10), { align: 'center' });
    });
    
    // Footer
    coverDoc.setFontSize(10);
    coverDoc.setTextColor(120, 120, 120);
    coverDoc.text('United Facade Pty Ltd | ABN 67 652 069 139', pageWidth / 2, pageHeight - 40, { align: 'center' });
    coverDoc.text('carbonconstruct.com.au/methodology', pageWidth / 2, pageHeight - 30, { align: 'center' });
    
    // Table of Contents page
    coverDoc.addPage();
    coverDoc.setFillColor(255, 255, 255);
    coverDoc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    coverDoc.setTextColor(0, 0, 0);
    coverDoc.setFontSize(24);
    coverDoc.setFont('helvetica', 'bold');
    coverDoc.text('Table of Contents', 20, 30);
    
    coverDoc.setFontSize(12);
    coverDoc.setFont('helvetica', 'normal');
    
    const tocItems = [
      { title: '1. Standards Compliance', page: 3 },
      { title: '2. Data Sources & Traceability', page: 4 },
      { title: '3. Calculation Methodology', page: 5 },
      { title: '4. Calculation Transparency & Traceability', page: 6 },
      { title: '5. Australian Scheme Alignment', page: 7 },
      { title: '6. Data Residency & Security', page: 8 },
      { title: '7. Methodology Limitations', page: 9 },
      { title: '8. Independent Verification Pathway', page: 10 },
      { title: '9. Documentation & Technical Support', page: 11 },
    ];
    
    tocItems.forEach((item, i) => {
      const y = 50 + (i * 12);
      coverDoc.setTextColor(0, 0, 0);
      coverDoc.text(item.title, 20, y);
      
      // Dotted line
      const titleWidth = coverDoc.getTextWidth(item.title);
      const pageNumWidth = coverDoc.getTextWidth(item.page.toString());
      const dotsStart = 20 + titleWidth + 5;
      const dotsEnd = pageWidth - 25 - pageNumWidth;
      
      coverDoc.setTextColor(180, 180, 180);
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        coverDoc.text('.', dotX, y);
        dotX += 3;
      }
      
      coverDoc.setTextColor(0, 0, 0);
      coverDoc.text(item.page.toString(), pageWidth - 20, y, { align: 'right' });
    });
    
    // Footer on TOC page
    coverDoc.setFontSize(9);
    coverDoc.setTextColor(120, 120, 120);
    coverDoc.text('CarbonConstruct Methodology & Compliance Framework', 20, pageHeight - 15);
    coverDoc.text('Page 2', pageWidth - 20, pageHeight - 15, { align: 'right' });
    
    // Save cover pages
    const coverBlob = coverDoc.output('blob');
    
    // Generate main content PDF
    const element = document.getElementById('methodology-content');
    if (element) {
      const opt = {
        margin: [20, 15, 25, 15] as [number, number, number, number],
        filename: `CarbonConstruct-Methodology-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Generate content PDF
      const contentPdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
      
      // Add page numbers and footer to content pages
      const totalPages = contentPdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        contentPdf.setPage(i);
        contentPdf.setFontSize(9);
        contentPdf.setTextColor(120, 120, 120);
        contentPdf.text('CarbonConstruct Methodology & Compliance Framework', 15, pageHeight - 10);
        contentPdf.text(`Page ${i + 2}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        contentPdf.text('carbonconstruct.com.au/methodology', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      // Merge PDFs using jsPDF
      const { PDFDocument } = await import('pdf-lib');
      
      const coverArrayBuffer = await coverBlob.arrayBuffer();
      const contentArrayBuffer = await contentPdf.output('arraybuffer');
      
      const mergedPdf = await PDFDocument.create();
      const coverPdfDoc = await PDFDocument.load(coverArrayBuffer);
      const contentPdfDoc = await PDFDocument.load(contentArrayBuffer);
      
      const coverPages = await mergedPdf.copyPages(coverPdfDoc, coverPdfDoc.getPageIndices());
      coverPages.forEach((page: Awaited<ReturnType<typeof mergedPdf.copyPages>>[number]) => mergedPdf.addPage(page));
      
      const contentPages = await mergedPdf.copyPages(contentPdfDoc, contentPdfDoc.getPageIndices());
      contentPages.forEach((page: Awaited<ReturnType<typeof mergedPdf.copyPages>>[number]) => mergedPdf.addPage(page));
      
      // Add clickable link annotations to TOC page
      const tocPage = mergedPdf.getPage(1); // Index 1 = TOC page (after cover)
      const { height: tocHeight, width: tocWidth } = tocPage.getSize();
      
      // Add internal links for each TOC item
      tocItems.forEach((item, i) => {
        // Convert mm to points (1mm = 2.835pt) and flip Y coordinate (PDF uses bottom-left origin)
        const yPosition = tocHeight - ((50 + (i * 12)) * 2.835);
        const targetPageIndex = item.page - 1; // 0-indexed for the merged PDF
        
        // Create link annotation rectangle (x1, y1, x2, y2 in points)
        const linkAnnotation = mergedPdf.context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [56.7, yPosition - 8, tocWidth - 56.7, yPosition + 12], // 20mm margins = 56.7pt
          Border: [0, 0, 0], // No visible border
          Dest: [mergedPdf.getPage(targetPageIndex).ref, 'XYZ', null, null, null],
        });
        
        // Get existing annotations or create new array
        const existingAnnots = tocPage.node.lookup('Annots' as any);
        if (existingAnnots) {
          (existingAnnots as any).push(linkAnnotation);
        } else {
          tocPage.node.set('Annots' as any, mergedPdf.context.obj([linkAnnotation]));
        }
      });
      
      const mergedPdfBytes = await mergedPdf.save();
      
      // Download merged PDF - convert Uint8Array to ArrayBuffer properly
      const arrayBuffer = mergedPdfBytes.buffer.slice(
        mergedPdfBytes.byteOffset,
        mergedPdfBytes.byteOffset + mergedPdfBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CarbonConstruct-Methodology-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Anchor navigation - updated per spec
  const sections = [
    { id: 'standards', label: 'Standards Compliance' },
    { id: 'data-sources', label: 'Data Sources & Traceability' },
    { id: 'methodology', label: 'Calculation Methodology' },
    { id: 'transparency', label: 'Calculation Transparency' },
    { id: 'australian-schemes', label: 'Australian Scheme Alignment' },
    { id: 'security', label: 'Data Residency & Security' },
    { id: 'limitations', label: 'Methodology Limitations' },
    { id: 'verification', label: 'Verification Pathway' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <SEOHead
        title="Methodology & Compliance Framework"
        description="Technical documentation of CarbonConstruct's EN 15978-compliant carbon calculation methodology, Australian-verified materials database, and Green Star alignment for commercial construction projects."
        canonicalPath="/methodology"
        ogType="article"
        techArticle={{
          name: "CarbonConstruct Methodology & Compliance Framework",
          datePublished: "2025-01-01",
          dateModified: "2025-01-01",
          author: "United Facade Pty Ltd",
          publisher: "CarbonConstruct Tech",
          about: "Life cycle assessment methodology for Australian construction",
          keywords: "EN 15978, embodied carbon, LCA, Green Star, NABERS, NCC Section J, EPD, carbon calculator, construction"
        }}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <nav className="sticky top-24 space-y-4">
                {/* Quick Facts Box */}
                <Card className="neon-border bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-primary">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>EN 15978:2011 Full Compliance</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>73% Direct EPD URL Coverage</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>100% Source Attribution</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Sydney Data Residency</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                      <span>GBCA Review Pending Q1 2025</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-1">
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
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main id="methodology-content" className="flex-1 space-y-12">
              {/* Header with badges */}
              <header className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                      Australian NCC Compliant
                    </Badge>
                    <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Green Star Ready
                    </Badge>
                    <Badge variant="secondary">
                      4,620 Verified Materials
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Methodology & Compliance Framework
                      </h1>
                      <p className="text-muted-foreground mt-2">
                        Technical documentation of calculation methodology, data sources, and standards compliance
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => window.print()} 
                        variant="outline" 
                        className="shrink-0 no-print"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button 
                        onClick={handleDownloadPDF} 
                        variant="outline" 
                        className="shrink-0 no-print"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Section 1: Standards Compliance */}
              <section id="standards" className="scroll-mt-24 space-y-4 pdf-section-start">
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
                  CarbonConstruct implements EN 15978 methodology for whole building life cycle assessment with 
                  coverage of modules A1-D following published European standards. While formal third-party 
                  verification against these standards has not yet been completed, the calculation engine has 
                  been validated against benchmark projects including commercial developments in Southeast Queensland.
                </p>

                <Card className="neon-border border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Independent Verification Pathway
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• GBCA technical review (Q1 2025)</p>
                    <p>• Pilot project validation with GBCA-accredited assessors (Q1 2025)</p>
                    <p>• BRE Global EN 15978 software validation (2025, subject to partnership confirmation)</p>
                  </CardContent>
                </Card>
              </section>

              {/* Section 2: Data Sources */}
              <section id="data-sources" className="scroll-mt-24 space-y-4 pdf-section-start">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Data Sources & Traceability
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                  <Card className="neon-border">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary font-mono">AU</p>
                      <p className="text-sm text-muted-foreground">Priority Data</p>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-muted-foreground">
                  CarbonConstruct prioritizes Australian-specific environmental data through partnerships with 
                  NABERS, ICM Database (AusLCI), ICE Database (Circular Ecology), and NGER emission factors. 
                  Roadmap includes EC3 database integration (20,000+ international materials) in Q1 2025, 
                  maintaining Australian data priority with expanded international coverage for global projects.
                </p>

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

                {/* Industry Comparison - New per spec */}
                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Industry Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Current database size (4,620 materials) focuses on Australian construction market with 
                      verified EPD traceability. This compares to:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• OneClickLCA: ~2,000-4,000 materials globally</li>
                      <li>• eTool: ~3,000 materials with Australian focus</li>
                      <li>• Embodied Carbon Calculator (Free): ~1,500 materials</li>
                    </ul>
                    
                    <div className="mt-4 space-y-2">
                      <p className="font-medium text-foreground">CarbonConstruct differentiates through:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li><strong className="text-foreground">Traceability:</strong> 73% direct EPD URLs vs industry average &lt;30%</li>
                        <li><strong className="text-foreground">Source transparency:</strong> 100% materials show programme operator origin</li>
                        <li><strong className="text-foreground">Regional accuracy:</strong> Australian electricity factors by state (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)</li>
                        <li><strong className="text-foreground">Verification:</strong> Built by 17-year construction practitioner with real project validation</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                {/* Planned Database Expansion - New per spec */}
                <Card className="neon-border border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Planned Database Expansion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <p className="font-semibold text-foreground">Q1 2025: EC3 Integration</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Add 20,000+ verified international EPDs</li>
                        <li>• Maintain Australian data priority hierarchy</li>
                        <li>• Enable global project compatibility</li>
                        <li>• Target total: 25,000+ materials by March 2025</li>
                      </ul>
                    </div>
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
              <section id="methodology" className="scroll-mt-24 space-y-4 pdf-section-start">
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

              {/* Section 4: Calculation Transparency - NEW per spec */}
              <section id="transparency" className="scroll-mt-24 space-y-4 pdf-section-start">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Calculation Transparency & Traceability
                </h2>

                <p className="text-muted-foreground">
                  CarbonConstruct provides complete calculation transparency:
                </p>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Material-Level Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      Every project calculation traces to individual material contributions with:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Source EPD documentation (programme operator, publication date, PCR reference)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Quantity calculations with assumptions documented</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Impact values by life cycle stage (A1-A3, A4-A5, B1-B7, C1-C4, D)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Alternative material comparison with carbon reduction potential</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">All outputs include:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Full bill of materials with EPD citations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Calculation assumptions (transport distances, service life, waste factors)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Data quality indicators (manufacturer-specific vs generic)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Compliance mapping (Green Star credits, NCC Section J performance solutions)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      Calculation outputs designed for independent verification:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Third-party assessor review format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>GBCA technical manual alignment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Detailed reporting suitable for tender submissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Methodology statement available for download</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Section 5: Australian Schemes */}
              <section id="australian-schemes" className="scroll-mt-24 space-y-4 pdf-section-start">
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

              {/* Section 6: Data Security */}
              <section id="security" className="scroll-mt-24 space-y-4 pdf-section-start">
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

              {/* Section 7: Limitations */}
              <section id="limitations" className="scroll-mt-24 space-y-4 pdf-section-start">
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

              {/* Section 8: Independent Verification Pathway - NEW per spec */}
              <section id="verification" className="scroll-mt-24 space-y-4 pdf-section-start">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Independent Verification Pathway
                </h2>

                <p className="text-muted-foreground">
                  CarbonConstruct is pursuing formal validation through:
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="neon-border border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Immediate (Q1 2025)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• GBCA technical review for Green Star credit mapping</p>
                      <p>• Pilot project validation with GBCA-accredited assessors on real commercial developments</p>
                      <p>• Benchmark testing against certified tools (OneClickLCA, eTool)</p>
                    </CardContent>
                  </Card>

                  <Card className="neon-border border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Near-term (2025)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• BRE Global EN 15978 software validation (subject to partnership confirmation)</p>
                      <p>• EPD Australasia programme membership for EPD publication capability</p>
                      <p>• ISO 14064-3 verification experience for NGER/Scope 3 applications</p>
                    </CardContent>
                  </Card>

                  <Card className="neon-border border-emerald-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• <strong className="text-foreground">Jan-Mar 2025:</strong> GBCA submission and pilot validation</p>
                      <p>• <strong className="text-foreground">Apr-Jun 2025:</strong> BRE Global validation process</p>
                      <p>• <strong className="text-foreground">Q3 2025:</strong> Published validation status and scheme approvals</p>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  This pathway mirrors how established tools gained market credibility while maintaining 
                  transparency about current verification status.
                </p>
              </section>

              {/* Section 9: Contact - Updated per spec */}
              <section id="contact" className="scroll-mt-24 space-y-4 pdf-section-start">
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                  Documentation & Technical Support
                </h2>

                <Card className="neon-border">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground">
                      For methodology questions, compliance verification, or partnership inquiries:
                    </p>
                    <ul className="space-y-3">
                      <li>
                        <a 
                          href="mailto:contact@carbonconstruct.net" 
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          contact@carbonconstruct.net
                        </a>
                      </li>
                      <li>
                        <Link 
                          to="/materials/status" 
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Database className="h-4 w-4" />
                          Materials Database Status - Real-time database statistics
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleDownloadPDF}
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Methodology PDF - Complete technical documentation
                        </button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Sample Outputs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      Project-specific calculation examples available for evaluation by:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• GBCA-accredited assessors</li>
                      <li>• Sustainability consultants</li>
                      <li>• Tier 1 contractor sustainability teams</li>
                      <li>• Regulatory compliance officers</li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Built by builders, for builders.</strong>{" "}
                    CarbonConstruct combines 17 years of commercial construction experience with carbon 
                    compliance requirements. Methodology questions answered by practitioners who understand 
                    both the technical requirements and on-site realities.
                  </p>
                </div>
              </section>

              {/* Footer - Updated per spec */}
              <footer className="border-t border-border pt-6 mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Last Updated: {lastUpdated}</p>
                    <p className="text-xs mt-1">
                      Database statistics updated daily. Methodology framework reviewed quarterly.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs">carbonconstruct.com.au/methodology</p>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Methodology;
