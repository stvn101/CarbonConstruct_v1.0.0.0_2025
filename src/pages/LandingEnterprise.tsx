import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { 
  Shield, 
  Building2, 
  FileCheck, 
  Lock, 
  Server, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Award,
  Globe,
  Database,
  Scale,
  FileText,
  Zap
} from 'lucide-react';

const complianceCredentials = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Australian Privacy Act 1988",
    description: "Full compliance with APP and notifiable data breach requirements"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "GDPR Compliant",
    description: "EU data protection standards for international operations"
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Data Sovereignty",
    description: "All data stored in Sydney (ap-southeast-2) - never leaves Australian jurisdiction"
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "SOC 2 Type II Standards",
    description: "Security controls aligned with AICPA SOC 2 framework"
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Australian Consumer Law",
    description: "Full ACL compliance with explicit refund guarantees (Section 16)"
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "GST Compliant",
    description: "Automated ATO-compliant tax invoicing with ABN verification"
  }
];

const enterpriseFeatures = [
  {
    icon: <Building2 className="h-8 w-8 text-primary" />,
    title: "Multi-Project Portfolio Management",
    description: "Centralised dashboard for tracking carbon across entire asset portfolios. Set organisation-wide targets and monitor progress in real-time.",
    features: ["Unlimited projects", "Role-based access control", "Custom reporting periods", "API access"]
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Team Collaboration",
    description: "Enable your entire sustainability team to work together with granular permissions and audit trails.",
    features: ["SSO integration", "Team workspaces", "Activity logging", "Approval workflows"]
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Executive Reporting",
    description: "Board-ready reports with executive summaries, trend analysis, and benchmark comparisons.",
    features: ["Automated PDF generation", "Custom branding", "Scheduled reports", "ESG metrics"]
  },
  {
    icon: <Server className="h-8 w-8 text-primary" />,
    title: "Enterprise Infrastructure",
    description: "99.9% uptime SLA with dedicated support and priority feature requests.",
    features: ["Dedicated instance", "24/7 support", "Custom integrations", "On-premise option"]
  }
];

const governmentBenefits = [
  "Verify NCC 2024 Section J compliance in DA submissions",
  "Standardised methodology across all council assessments",
  "Audit-ready documentation with full EPD traceability",
  "Track climate action progress against municipal targets",
  "Benchmark public assets for capital works planning",
  "Clear reporting for elected officials and stakeholders"
];

const enterpriseClients = [
  { name: "Major Infrastructure Projects", icon: "🏗️" },
  { name: "State Government Departments", icon: "🏛️" },
  { name: "Local Council Sustainability Teams", icon: "🌿" },
  { name: "Construction Tier 1 Contractors", icon: "🏢" },
  { name: "Property Development Groups", icon: "🏙️" },
  { name: "Engineering Consultancies", icon: "⚙️" }
];

export default function LandingEnterprise() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Enterprise Carbon Management | Australian Government & Corporate | CarbonConstruct"
        description="Enterprise-grade carbon assessment platform for Australian government agencies and corporations. Data sovereignty, NCC 2024 compliance, SOC 2 aligned security."
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-background via-muted/20 to-primary/5 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-background/80 backdrop-blur">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                Australian Data Sovereignty
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-background/80 backdrop-blur">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                SOC 2 Aligned
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-background/80 backdrop-blur">
                <Award className="h-4 w-4 mr-2 text-primary" />
                NCC 2024 Compliant
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Enterprise Carbon Management
              <span className="block text-primary mt-2">Built for Australian Compliance</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The only carbon assessment platform designed from the ground up for Australian government 
              agencies and enterprise clients. Full data sovereignty, transparent methodology, and 
              audit-ready documentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="min-h-[52px] text-lg px-8" asChild>
                <a href="mailto:enterprise@carbonconstruct.com.au?subject=Enterprise%20Demo%20Request">
                  <Zap className="mr-2 h-5 w-5" />
                  Request Enterprise Demo
                </a>
              </Button>
              <Button size="lg" variant="outline" className="min-h-[52px] text-lg px-8" asChild>
                <Link to="/pricing">
                  View Pricing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Statement */}
            <p className="mt-8 text-sm text-muted-foreground">
              <Lock className="inline h-4 w-4 mr-1" />
              All data stored in Sydney, Australia (ap-southeast-2). ABN 67 652 069 139.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Credentials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Compliance & Security</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built to meet the strictest Australian regulatory requirements and international standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceCredentials.map((credential, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {credential.icon}
                    </div>
                    <CardTitle className="text-lg">{credential.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{credential.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Enterprise Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Scale & Governance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise capabilities that meet the demands of large organisations and government agencies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-border/50 hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Government-Specific Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">For Government</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Purpose-Built for Australian Government
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                CarbonConstruct understands the unique requirements of Australian government agencies. 
                From council sustainability officers to state infrastructure departments, we provide 
                the tools you need for defensible, auditable carbon assessment.
              </p>

              <ul className="space-y-4">
                {governmentBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="mt-8 min-h-[48px]" asChild>
                <a href="mailto:government@carbonconstruct.com.au?subject=Government%20Enquiry">
                  <FileText className="mr-2 h-5 w-5" />
                  Government Enquiries
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {enterpriseClients.map((client, index) => (
                <Card key={index} className="text-center p-6 border-border/50">
                  <div className="text-4xl mb-3">{client.icon}</div>
                  <p className="text-sm font-medium">{client.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Sovereignty Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Database className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">100% Australian Data Sovereignty</h3>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    Your data never leaves Australian jurisdiction. All storage, processing, and 
                    backups are performed in Sydney (ap-southeast-2) data centres. This isn't 
                    just a policy — it's architecturally enforced.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Sydney Region Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>No International Transfers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Privacy Act Compliant</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                    <span className="text-5xl">🇦🇺</span>
                  </div>
                  <p className="text-lg font-semibold">Australian Owned & Operated</p>
                  <p className="text-sm text-muted-foreground">ABN 67 652 069 139</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Discuss Enterprise Requirements?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Our enterprise team will work with you to understand your specific compliance needs, 
            integration requirements, and deployment preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="min-h-[52px] text-lg px-8" asChild>
              <a href="mailto:enterprise@carbonconstruct.com.au?subject=Enterprise%20Demo%20Request">
                Schedule Enterprise Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" className="min-h-[52px] text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <a href="tel:0459148862">
                Call 0459 148 862
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
