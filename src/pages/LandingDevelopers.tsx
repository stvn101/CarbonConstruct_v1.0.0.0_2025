import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { Shield, TrendingUp, FileText, Building, Users, BarChart3 } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Regulatory Compliance",
    description: "NCC 2024 Section J requirements are built-in. Know exactly where your projects stand before submission.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "ESG Reporting Ready",
    description: "Generate reports that satisfy investor ESG requirements. Scope 1, 2, and 3 emissions tracked and documented.",
  },
  {
    icon: <Building className="h-6 w-6" />,
    title: "Portfolio-Level Insights",
    description: "Track carbon performance across multiple projects. Identify patterns and set portfolio-wide targets.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Due Diligence Documentation",
    description: "Professional reports for acquisitions and financing. Show carbon credentials to banks and investors.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Team Collaboration",
    description: "Share projects with your construction managers and architects. Everyone works from the same carbon data.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Cost Predictability",
    description: "Understand carbon costs early in feasibility. Avoid surprises when regulations tighten.",
  },
];

const painPoints = [
  "NCC 2024 requirements are creating uncertainty in your project feasibility assessments",
  "Investors are asking for ESG metrics and you're scrambling to provide carbon data",
  "You're unsure how tightening regulations will affect your current and future projects",
  "Sustainability consultants are expensive and you need carbon data more frequently",
  "You need a consistent approach to carbon across your entire portfolio",
];

export default function LandingDevelopers() {
  return (
    <CampaignLandingPage
      audience="developers"
      audienceLabel="Property Developers"
      heroTitle="De-Risk Your Projects With Carbon Intelligence"
      heroSubtitle="Navigate NCC 2024 and ESG requirements with confidence."
      heroDescription="CarbonConstruct gives property developers the carbon visibility they need. Track compliance, generate investor-ready reports, and make informed decisions across your entire portfolio."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Carbon used to be a black box in our feasibility studies. Now we can quantify it and plan accordingly.",
        author: "Property Development",
        role: "Industry Feedback",
      }}
      ctaText="Start Your Free Assessment"
      ctaSecondaryText="View Enterprise Plans"
      seoTitle="Carbon Management for Property Developers | CarbonConstruct"
      seoDescription="Navigate NCC 2024 compliance and ESG reporting. Portfolio-level carbon tracking, investor-ready reports, regulatory compliance. Built for Australian developers."
    />
  );
}
