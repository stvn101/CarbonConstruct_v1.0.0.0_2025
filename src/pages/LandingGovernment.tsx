import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { Shield, FileText, BarChart3, Users, Scale, Building } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "NCC 2024 Verification",
    description: "Quickly verify Section J compliance in DA submissions. Built-in benchmarks for all building classes.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Consistent Assessment",
    description: "Standardised methodology across all submissions. No more comparing apples to oranges in carbon reports.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Audit-Ready Documentation",
    description: "Full EPD traceability and methodology transparency. Every calculation can be verified back to source.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Portfolio Benchmarking",
    description: "Track carbon performance across council assets. Set baselines and measure progress toward net zero targets.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Stakeholder Reporting",
    description: "Clear, professional reports for elected officials and community. Demonstrate climate action progress.",
  },
  {
    icon: <Building className="h-6 w-6" />,
    title: "Public Asset Planning",
    description: "Assess embodied carbon for new council buildings, infrastructure, and capital works programs.",
  },
];

const painPoints = [
  "Developers submit carbon reports in different formats with inconsistent methodologies",
  "You need to verify NCC 2024 compliance but lack specialised carbon assessment tools",
  "Climate action plans require carbon tracking but you don't have baseline data for council assets",
  "Elected officials are asking for carbon metrics and you need reliable, defensible numbers",
  "Existing tools are designed for private sector and don't understand public sector reporting needs",
];

export default function LandingGovernment() {
  return (
    <CampaignLandingPage
      audience="government"
      audienceLabel="Government & Council Officers"
      heroTitle="Verify Carbon Claims With Confidence"
      heroSubtitle="Standardised assessment for consistent, defensible decisions."
      heroDescription="CarbonConstruct helps council planners and government sustainability officers verify carbon compliance, benchmark public assets, and report on climate action progress — all using verified Australian data and transparent methodology."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "We needed a way to consistently evaluate the carbon claims in DA submissions. This gives us the transparency we were missing.",
        author: "Local Government",
        role: "Sustainability Officer",
      }}
      ctaText="Request a Demo"
      ctaSecondaryText="View Enterprise Plans"
      seoTitle="Carbon Assessment for Government & Councils | CarbonConstruct"
      seoDescription="Verify NCC 2024 compliance, benchmark council assets, track climate action progress. Standardised carbon assessment for Australian local government."
    />
  );
}
