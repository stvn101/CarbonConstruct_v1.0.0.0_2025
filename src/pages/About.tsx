import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Leaf, Users, Target, Shield, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";

export default function About() {
  return (
    <>
      <SEOHead 
        title="About CarbonConstruct Tech | Carbon Calculation for Construction"
        description="Learn about CarbonConstruct Tech, a company of United Facade Pty Ltd, pioneering carbon calculation and sustainability solutions for the Australian construction industry."
      />
      <div className="container max-w-5xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="h-12 w-12 text-primary" />
            <Leaf className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About CarbonConstruct</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pioneering carbon calculation and sustainability solutions for the Australian construction industry.
          </p>
        </div>

        {/* Company Structure */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Our Company Structure
            </CardTitle>
            <CardDescription>
              Understanding who we are and how we operate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold mb-3">CarbonConstruct Tech</h3>
              <p className="text-muted-foreground mb-4">
                CarbonConstruct Tech is the trading name for our carbon calculation and sustainability technology platform. 
                We provide cutting-edge tools for embodied carbon calculation, EPD (Environmental Product Declaration) management, 
                and whole-of-life carbon assessment for construction projects.
              </p>
              <div className="bg-background p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  <strong>Legal Entity:</strong> CarbonConstruct Tech is a company of <strong>United Facade Pty Ltd</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>ABN:</strong> 57 679 602 498
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Location:</strong> Queensland, Australia
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">United Facade Pty Ltd</h3>
              <p className="text-muted-foreground">
                United Facade Pty Ltd is the parent company of CarbonConstruct Tech. As an Australian proprietary limited company, 
                United Facade brings expertise in the building and construction sector, providing the foundation for CarbonConstruct's 
                deep understanding of industry needs and regulatory requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To empower the Australian construction industry with accurate, accessible, and actionable carbon data, 
                enabling informed decisions that reduce environmental impact while maintaining project viability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A construction industry where every material choice, design decision, and project specification 
                considers embodied carbon, driving Australia toward net-zero buildings and infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Do */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              What We Do
            </CardTitle>
            <CardDescription>
              Comprehensive carbon calculation tools for the construction industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Embodied Carbon Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      Calculate A1-A5 embodied carbon for construction materials using verified EPD data and industry-standard databases.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Whole-of-Life Carbon Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive lifecycle analysis including use phase (B1-B7), end-of-life (C1-C4), and beyond lifecycle benefits (Module D).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">EPD Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Track, verify, and manage Environmental Product Declarations with expiry reminders and supplier workflow tools.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">BOQ Import & Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Import Bills of Quantities directly and automatically match materials to our verified database for rapid assessment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Compliance Reporting</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate reports aligned with NCC 2025, Green Star, NABERS, and international standards like EN 15978.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">6</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">ECO Platform Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      Validate materials against ECO Platform requirements for European market compliance and international projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Data Integrity</h4>
                <p className="text-sm text-muted-foreground">
                  Verified, traceable emission factors from authoritative sources.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Accessibility</h4>
                <p className="text-sm text-muted-foreground">
                  Making carbon calculation accessible to projects of all sizes.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Australian Focus</h4>
                <p className="text-sm text-muted-foreground">
                  Built for Australian regulations, materials, and industry practices.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Impact Driven</h4>
                <p className="text-sm text-muted-foreground">
                  Every calculation contributes to real-world carbon reduction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Legal */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Contact & Legal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Contact Us</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Email:</strong> support@carbonconstruct.com.au</p>
                  <p><strong>Phone:</strong> 0459 148 862</p>
                  <p><strong>Location:</strong> Lawnton, Queensland, Australia</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Legal Entity</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Trading Name:</strong> CarbonConstruct Tech</p>
                  <p><strong>Parent Company:</strong> United Facade Pty Ltd</p>
                  <p><strong>ABN:</strong> 57 679 602 498</p>
                  <p><strong>Jurisdiction:</strong> Queensland, Australia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center bg-primary/5 p-8 rounded-lg border border-primary/20">
          <h2 className="text-2xl font-bold mb-3">Ready to Calculate Your Project's Carbon Impact?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join hundreds of Australian construction professionals using CarbonConstruct to make informed, sustainable decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/demo">
                View Demo
              </Link>
            </Button>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground mb-4">
            For more information about how we handle your data and our terms of service:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
            <Link to="/accessibility" className="text-primary hover:underline">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </>
  );
}
