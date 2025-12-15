import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { BarChart3, FileText, Clock, Users, Award, Layers } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Streamline Your Workflow",
    description: "Stop building spreadsheets from scratch. Our 4,000+ verified EPD database is ready to use instantly.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Full EN 15978 Compliance",
    description: "Complete lifecycle assessment from A1-A5 through B1-B7, C1-C4, and Module D. No gaps in your methodology.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Client-Ready Reports",
    description: "Professional PDF reports with full methodology documentation. Ready for Green Star submissions and council reviews.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "10x Faster Assessments",
    description: "What used to take days now takes minutes. Spend more time on strategy, less on data entry.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "White-Label Options",
    description: "Professional tier includes custom branding. Deliver reports under your consultancy's name.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Australian Standards Built-In",
    description: "NCC 2024, Green Star, NABERS, Climate Active, and IS Rating frameworks all integrated.",
  },
];

const painPoints = [
  "You're spending more time on data collection than actual analysis and recommendations",
  "Clients expect faster turnaround but quality LCA takes time",
  "Keeping up with changing regulations (NCC 2024, Green Star updates) is exhausting",
  "Generic tools don't understand Australian compliance requirements",
  "You need a tool that makes you more efficient, not one that creates more work",
];

export default function LandingConsultants() {
  return (
    <CampaignLandingPage
      audience="consultants"
      audienceLabel="Sustainability Consultants"
      heroTitle="Deliver Better Assessments in Less Time"
      heroSubtitle="The Australian LCA tool that works as hard as you do."
      heroDescription="CarbonConstruct is built specifically for sustainability consultants working in Australian construction. Verified EPD data, full EN 15978 compliance, and professional reports — all designed to make your work faster and more accurate."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "This is the tool I wish I had five years ago. It's finally a carbon calculator that understands how consultants actually work.",
        author: "Sustainability Consultant",
        role: "Industry Feedback",
      }}
      ctaText="Start Your Free Trial"
      ctaSecondaryText="View Professional Plan"
      seoTitle="LCA Software for Sustainability Consultants | CarbonConstruct"
      seoDescription="Streamline your lifecycle assessments with verified Australian EPD data. EN 15978 compliant, professional reports, faster turnaround. Built for sustainability consultants."
    />
  );
}
