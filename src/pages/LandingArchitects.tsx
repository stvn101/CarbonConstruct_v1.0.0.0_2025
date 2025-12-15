import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { Palette, FileText, Award, Layers, BarChart3, Leaf } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Design With Carbon in Mind",
    description: "Compare materials early in the design phase. Make informed choices before specifications are locked in.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Green Star Aligned",
    description: "Track your design against Green Star credit requirements. Know exactly how many credits you're targeting.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Full Lifecycle Assessment",
    description: "EN 15978 compliant calculations covering A1-A5, B1-B7, C1-C4, and Module D. Complete whole-of-life analysis.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Client-Ready Reports",
    description: "Professional PDF reports that explain methodology clearly. Perfect for client presentations and DA submissions.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Material Comparison",
    description: "Side-by-side comparison of alternatives. Show clients the carbon impact of different design choices.",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Australian EPD Database",
    description: "4,000+ verified EPD materials from Australian suppliers. Regional variants for accurate local calculations.",
  },
];

const painPoints = [
  "Clients are asking for carbon analysis but you don't have time to become an LCA expert",
  "Sustainability consultants are expensive and slow down the design process",
  "You want to specify low-carbon materials but don't know which ones actually perform better",
  "Green Star requirements are complex and hard to track during design development",
  "You need professional reports that clients and councils will accept",
];

export default function LandingArchitects() {
  return (
    <CampaignLandingPage
      audience="architects"
      audienceLabel="Architects & Designers"
      heroTitle="Design With Carbon Intelligence From Day One"
      heroSubtitle="Make informed material choices early, when they matter most."
      heroDescription="CarbonConstruct helps architects integrate carbon thinking into the design process. Compare materials, track Green Star credits, and generate professional reports — all without becoming an LCA specialist."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "We used to wait for sustainability consultants. Now we can iterate on material choices in real-time during design meetings.",
        author: "Architecture Practice",
        role: "Early Adopter",
      }}
      ctaText="Start Designing Smarter"
      ctaSecondaryText="See Features"
      seoTitle="Carbon Calculator for Architects | CarbonConstruct"
      seoDescription="Integrate carbon assessment into your design process. Compare materials, track Green Star credits, generate professional reports. Built for Australian architects."
    />
  );
}
