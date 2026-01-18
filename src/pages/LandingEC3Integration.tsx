import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { Globe, Database, Shield, Zap, Award, FileCheck } from 'lucide-react';
import { EC3Attribution } from '@/components/calculator/EC3Attribution';

const benefits: Benefit[] = [
  {
    icon: <Globe className="h-6 w-6" />,
    title: "90,000+ Global EPDs",
    description: "Search the world's largest environmental product database. Access verified EPDs from manufacturers worldwide.",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Real-Time Data",
    description: "Always current. EPDs are fetched directly from BuildingTransparency.org — no stale local copies.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified & Compliant",
    description: "All materials meet ISO 14025 and EN 15804 standards. Third-party verified environmental declarations.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Search",
    description: "Type and find. Concrete, steel, timber, glass — search across 19 material categories in seconds.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Australian + Global",
    description: "Combine our 4,000+ Australian EPDs with 90,000+ global materials for comprehensive coverage.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Automatic Attribution",
    description: "Full CC BY 4.0 compliance. Source links and attribution are included in all exports and reports.",
  },
];

const painPoints = [
  "You need EPDs for international materials but can't find verified Australian sources",
  "Manufacturer EPDs are scattered across dozens of program operator websites",
  "Keeping track of which EPDs have expired is a manual nightmare",
  "You're not sure if the carbon factors you're using are current or verified",
  "International projects require global material data, not just Australian",
];

/**
 * EC3 Integration Landing Page
 * 
 * Attribution Requirements (CC BY 4.0):
 * - EC3 and BuildingTransparency.org must be credited when data is displayed
 * - This page promotes the integration while maintaining required attribution
 * 
 * @see https://buildingtransparency.org/ec3-resources/buildingtransparency-apis-terms-service/
 */
export default function LandingEC3Integration() {
  return (
    <CampaignLandingPage
      audience="ec3-integration"
      audienceLabel="Carbon Professionals"
      heroTitle="Access 90,000+ Verified EPDs Instantly"
      heroSubtitle="The world's largest environmental product database, integrated directly into your workflow."
      heroDescription="CarbonConstruct now integrates with EC3® — the Embodied Carbon in Construction Calculator by BuildingTransparency.org. Search, compare, and use verified environmental product declarations from manufacturers worldwide."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Having access to the EC3 database directly in our carbon calculator changed everything. We can now source EPDs for any material, anywhere in the world.",
        author: "Carbon Assessment Team",
        role: "Industry Feedback",
      }}
      ctaText="Try EC3 Integration Free"
      ctaSecondaryText="View Pro Plans"
      seoTitle="EC3 EPD Database Integration | 90,000+ Verified Materials | CarbonConstruct"
      seoDescription="Access 90,000+ verified EPDs from BuildingTransparency.org EC3 database. Search global environmental product declarations for embodied carbon calculations. ISO 14025 compliant."
      customSections={
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* EC3 Feature Highlight */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-background rounded-xl p-8 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">EC3® Global Database</h3>
                    <p className="text-sm text-muted-foreground">Powered by BuildingTransparency.org</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-500">90,000+</div>
                    <div className="text-sm text-muted-foreground">Verified EPDs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-500">19</div>
                    <div className="text-sm text-muted-foreground">Material Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-500">Global</div>
                    <div className="text-sm text-muted-foreground">Coverage</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>All EPDs are third-party verified per ISO 14025 and EN 15804 standards</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Data fetched in real-time — never stored locally to ensure freshness</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Direct links to source EPDs included in all reports and exports</span>
                  </div>
                </div>
                
                {/* Required Attribution */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <EC3Attribution variant="footer" />
                </div>
              </div>
              
              {/* How It Works */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-center mb-8">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                    <h4 className="font-semibold mb-2">Toggle to EC3 Global</h4>
                    <p className="text-sm text-muted-foreground">Switch from Local Database to EC3 Global in the Calculator</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                    <h4 className="font-semibold mb-2">Search Materials</h4>
                    <p className="text-sm text-muted-foreground">Type to search 90,000+ EPDs by name, category, or manufacturer</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                    <h4 className="font-semibold mb-2">Add to Calculation</h4>
                    <p className="text-sm text-muted-foreground">Select materials to add with full traceability and source links</p>
                  </div>
                </div>
              </div>
              
              {/* Categories */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-center mb-6">Material Categories</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'Concrete', 'Steel', 'Timber', 'Glass', 'Aluminum',
                    'Insulation', 'Masonry', 'Gypsum', 'Roofing', 'Flooring',
                    'Cladding', 'Plastics', 'Composites', 'Aggregates', 'Cement',
                    'Doors', 'Windows', 'Mechanical', 'Electrical'
                  ].map((cat) => (
                    <span 
                      key={cat} 
                      className="px-3 py-1 bg-background border border-border/50 rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    />
  );
}
