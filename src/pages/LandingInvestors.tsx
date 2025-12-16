import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { TrendingUp, Shield, Database, Scale, Zap, Target, Award, Users } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Regulatory Tailwind",
    description: "NCC 2024 mandates embodied carbon reporting. Every Australian construction project now needs what we provide.",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "4,000+ Material Data Moat",
    description: "Verified Australian EPD database competitors can't easily replicate. NABERS-validated, regionally specific emission factors.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "EN 15804+A2 Certified",
    description: "Full ECO Platform compliance. The only Australian tool meeting international LCA standards — a requirement for government contracts.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "SaaS Recurring Revenue",
    description: "Subscription model with freemium growth engine. 95%+ gross margins. Land-and-expand within construction organizations.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "First-Mover Advantage",
    description: "No Australian-specific competitor. Generic carbon tools lack construction expertise, local materials, and compliance frameworks.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Industry Insider",
    description: "Founded by 17-year construction veteran. Deep supply chain relationships and understanding of builder pain points competitors miss.",
  },
];

const painPoints = [
  "Generic carbon tools don't understand Australian construction materials or compliance requirements",
  "International EPD databases miss regional manufacturing variants critical for accurate reporting",
  "Consultants charge $15-50K per project for carbon assessments — CarbonConstruct automates this",
  "No existing platform bridges the gap between LCA standards and construction site reality",
  "Builders struggle with NCC 2024 compliance — 100% of new projects need this solution",
];

const competitiveAdvantages = [
  {
    category: "What We Have",
    items: [
      "4,000+ verified Australian EPD materials — competitors have generic international data",
      "Full EN 15804+A2 lifecycle assessment (A1-D modules) — others stop at upfront carbon",
      "NCC 2024, Green Star, NABERS, Climate Active compliance built-in — competitors need add-ons",
      "Australian state-level grid factors and transport distances — not averaged national data",
      "ECO Platform programme operator certification capability — industry gold standard",
    ]
  },
  {
    category: "What We Do",
    items: [
      "Generate compliant carbon reports in minutes, not weeks — 100x faster than consultants",
      "Track Scope 1, 2, and 3 emissions across entire supply chain — full GHG protocol coverage",
      "Validate materials against NABERS EPD standards automatically — real-time compliance",
      "Enable quote-to-carbon workflow from actual BOQ imports — competitors need manual entry",
      "Provide audit-ready EN 15978 whole-building LCA reports — one-click professional output",
    ]
  }
];

export default function LandingInvestors() {
  return (
    <CampaignLandingPage
      audience="investors"
      audienceLabel="Investors & Partners"
      heroTitle="The Carbon Compliance Platform for Australian Construction"
      heroSubtitle="First-mover advantage in a $200B+ market facing mandatory carbon reporting."
      heroDescription="CarbonConstruct is the only Australian-built platform combining verified EPD materials, international LCA standards, and construction industry expertise. With NCC 2024 requiring embodied carbon reporting, every new project needs what we provide."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "After 17 years on construction sites, I built what the industry actually needs — not what consultants think it needs.",
        author: "Steven",
        role: "Founder & Construction Industry Veteran",
      }}
      ctaText="Schedule a Demo"
      ctaSecondaryText="View Full Platform"
      seoTitle="Invest in CarbonConstruct | Construction Carbon Compliance Platform"
      seoDescription="Investment opportunity in Australian construction carbon compliance. 4,000+ EPD materials, EN 15804 certification, NCC 2024 regulatory tailwind. SaaS recurring revenue model."
      customSections={
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Competitive Differentiation</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              What sets CarbonConstruct apart from generic carbon tools and expensive consultants
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {competitiveAdvantages.map((section) => (
                <div key={section.category} className="bg-background rounded-xl p-6 border shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    {section.category === "What We Have" ? (
                      <Award className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Zap className="h-5 w-5 text-amber-500" />
                    )}
                    {section.category}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Market Opportunity */}
            <div className="mt-12 bg-background rounded-xl p-8 border shadow-sm max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-center">Market Opportunity</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-500">$200B+</div>
                  <div className="text-sm text-muted-foreground">Australian construction market (annual)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-500">100%</div>
                  <div className="text-sm text-muted-foreground">NCC 2024 compliance requirement</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-500">$15-50K</div>
                  <div className="text-sm text-muted-foreground">Current consultant cost per project</div>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-6 text-sm">
                Every commercial construction project in Australia now requires carbon reporting. 
                The market is moving from optional sustainability to mandatory compliance.
              </p>
            </div>
          </div>
        </section>
      }
    />
  );
}
