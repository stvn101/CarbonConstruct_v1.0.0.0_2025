import { CampaignLandingPage, Benefit } from '@/components/CampaignLandingPage';
import { Leaf, FileCheck, TrendingUp, Shield, Database, Award } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Embodied Carbon Reporting",
    description: "Generate detailed whole-of-life carbon assessments compliant with EN 15978 and Australian standards.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Green Star Integration",
    description: "Export data directly formatted for Green Star Buildings and Green Star Homes submissions.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Reduction Pathways",
    description: "Identify carbon hotspots and model reduction scenarios to meet corporate sustainability targets.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "NCC Section J Compliance",
    description: "Ensure all projects meet NCC 2024 requirements with automated compliance checking.",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Verified EPD Database",
    description: "Access 3,000+ Australian EPDs with automated expiry tracking and data quality ratings.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Audit-Ready Documentation",
    description: "All calculations are transparent and traceable for third-party verification and audits.",
  },
];

const painPoints = [
  "Struggling to get accurate embodied carbon data from project teams?",
  "Spending weeks compiling data for Green Star submissions manually?",
  "Need to demonstrate progress against corporate net-zero commitments?",
  "Worried about the quality and currency of the emission factors you're using?",
  "Finding it hard to translate NCC 2024 requirements into actionable guidance?",
];

export default function LandingEnvironmentalOfficers() {
  return (
    <CampaignLandingPage
      audience="environmental-officers"
      audienceLabel="Environmental Officers"
      heroTitle="The Carbon Data You Need—Verified and Audit-Ready"
      heroSubtitle="Streamline environmental reporting across your project portfolio"
      heroDescription="CarbonConstruct gives environmental officers the tools to collect, verify, and report embodied carbon data with confidence. Meet regulatory requirements and corporate sustainability targets."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Our Green Star submissions used to take weeks of manual data collection. Now I can generate compliant reports in hours with full traceability.",
        author: "Jennifer Liu",
        role: "Environmental Manager, Property Developer",
      }}
      ctaText="Streamline Environmental Reporting"
      seoTitle="Embodied Carbon Reporting for Environmental Officers | CarbonConstruct"
      seoDescription="Verified EPD database, Green Star integration, and audit-ready documentation for environmental officers managing construction sustainability."
    />
  );
}
