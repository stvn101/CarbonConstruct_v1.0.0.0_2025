import { CampaignLandingPage, Benefit } from '@/components/CampaignLandingPage';
import { Leaf, FileSpreadsheet, Award, Globe, TrendingDown, Building2 } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    title: "ESG Reporting Ready",
    description: "Generate carbon data in formats ready for sustainability reports, investor disclosures, and board presentations.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Green Star & NABERS Aligned",
    description: "Calculate credits accurately with built-in alignment to Green Star and NABERS rating requirements.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Portfolio-Wide Tracking",
    description: "Monitor embodied carbon across your entire property portfolio with consolidated dashboards.",
  },
  {
    icon: <TrendingDown className="h-6 w-6" />,
    title: "Reduction Pathways",
    description: "Model carbon reduction scenarios and track progress against your net-zero commitments.",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Asset-Level Benchmarking",
    description: "Compare building performance against industry benchmarks and your own historical data.",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "EN 15978 Compliant",
    description: "Full lifecycle assessment methodology aligned with international standards for credible reporting.",
  },
];

const painPoints = [
  "Struggling to consolidate carbon data from multiple projects for corporate reporting?",
  "Finding it difficult to verify supplier EPD claims and ensure data quality?",
  "Need to demonstrate progress against science-based targets but lack granular data?",
  "Spending weeks preparing carbon figures for board presentations and investor queries?",
  "Want to identify the highest-impact reduction opportunities across your portfolio?",
];

export default function LandingSustainabilityManagers() {
  return (
    <CampaignLandingPage
      audience="sustainability-managers"
      audienceLabel="Sustainability Managers"
      heroTitle="Turn Carbon Data Into Climate Action"
      heroSubtitle="From project assessments to portfolio-wide ESG reporting"
      heroDescription="CarbonConstruct helps sustainability managers gather verified carbon data, track reduction progress, and deliver credible reports that satisfy investors, regulators, and stakeholders."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "This tool transformed our sustainability reporting. We went from manual spreadsheets to automated, auditable carbon tracking across 40+ assets.",
        author: "Sarah Williams",
        role: "Head of Sustainability, Property Developer",
      }}
      ctaText="Streamline Your Reporting"
      seoTitle="Carbon Reporting for Sustainability Managers | CarbonConstruct"
      seoDescription="Portfolio-wide embodied carbon tracking for sustainability managers. ESG reporting, Green Star alignment, and reduction pathway modelling for Australian property."
    />
  );
}
