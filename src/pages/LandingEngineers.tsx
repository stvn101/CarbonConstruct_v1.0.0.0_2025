import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { Calculator, FileText, Layers, Shield, BarChart3, Zap } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Calculator className="h-6 w-6" />,
    title: "Engineering-Grade Accuracy",
    description: "4,000+ verified EPD materials with full lifecycle stage factors. No generic assumptions or outdated data.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Structural Material Focus",
    description: "Comprehensive data for concrete, steel, timber, and composite materials. Regional variants from Australian manufacturers.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "NCC 2024 Compliance",
    description: "Built-in Section J compliance checking. Know exactly where your structural design stands before submission.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Documentation You Can Trust",
    description: "Full EPD traceability for every material. Audit-ready documentation for certifiers and councils.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Material Comparison Tools",
    description: "Compare structural alternatives side-by-side. Show clients the carbon impact of different engineering solutions.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Iteration",
    description: "Update quantities and see carbon impact instantly. Perfect for value engineering and design optimization.",
  },
];

const painPoints = [
  "Clients are asking for embodied carbon analysis but you're not sure where to start",
  "You need accurate emission factors for structural materials, not generic averages",
  "NCC 2024 requirements are adding carbon to your scope and you need reliable tools",
  "Current tools don't distinguish between different steel grades, concrete mixes, or regional variants",
  "You want to offer value engineering on carbon, not just cost and weight",
];

export default function LandingEngineers() {
  return (
    <CampaignLandingPage
      audience="engineers"
      audienceLabel="Structural Engineers"
      heroTitle="Engineer Lower Carbon Structures"
      heroSubtitle="Accurate embodied carbon data for structural decision-making."
      heroDescription="CarbonConstruct gives structural engineers the precision they need. Verified EPD data for concrete, steel, timber, and composites — with regional variants from Australian manufacturers and full lifecycle stage factors."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Finally, a carbon tool that understands the difference between 32MPa and 50MPa concrete. The accuracy matters.",
        author: "Structural Engineer",
        role: "Early Adopter",
      }}
      ctaText="Start Free Today"
      ctaSecondaryText="See Material Database"
      seoTitle="Embodied Carbon Calculator for Structural Engineers | CarbonConstruct"
      seoDescription="Accurate EPD data for structural materials. Compare concrete, steel, timber alternatives. NCC 2024 compliant. Built for Australian structural engineers."
    />
  );
}
