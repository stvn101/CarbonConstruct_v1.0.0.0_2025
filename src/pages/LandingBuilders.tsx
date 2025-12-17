import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { WhitepaperSummary } from '@/components/WhitepaperSummary';
import { Clock, FileText, Truck, Shield, Smartphone, TrendingUp } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Minutes, Not Days",
    description: "Generate compliant carbon reports in minutes. No more spreadsheet gymnastics or waiting on consultants.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "NCC 2024 Ready",
    description: "Built-in compliance checks for Section J requirements. Know exactly where you stand before council review.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Supply Chain Tracking",
    description: "Track Scope 3 emissions from your suppliers. Real transport distances, real emission factors.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Professional Reports",
    description: "Client-ready PDF reports with full methodology documentation. Impress stakeholders with transparency.",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Works On-Site",
    description: "Mobile-friendly design means you can update calculations from the job site. No laptop required.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Built by a Builder",
    description: "17 years of construction experience. We understand material flows, supplier pressure, and site realities.",
  },
];

const painPoints = [
  "Spending hours in spreadsheets trying to calculate embodied carbon for tenders",
  "Getting conflicting emission factors from different sources and not knowing which to trust",
  "Struggling to meet NCC 2024 requirements without expensive consultants",
  "Missing out on Green Star credits because the reporting is too complex",
  "Clients asking for carbon data and you don't have a quick way to provide it",
];

export default function LandingBuilders() {
  return (
    <CampaignLandingPage
      audience="builders"
      audienceLabel="Builders & Site Managers"
      heroTitle="Stop Guessing Your Project's Carbon Footprint"
      heroSubtitle="Get accurate, compliant carbon reporting in minutes — not days."
      heroDescription="CarbonConstruct gives you 4,000+ verified Australian EPD materials, NCC 2024 compliance checking, and professional reports. Built by a builder with 17 years on Australian construction sites."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Finally, a carbon tool that speaks builder. No consultant-speak, just practical calculations I can trust.",
        author: "Steven",
        role: "Founder, 17 Years Construction Experience",
      }}
      ctaText="Start Free Today"
      ctaSecondaryText="View Pricing"
      seoTitle="Carbon Calculator for Builders | CarbonConstruct"
      seoDescription="The carbon calculator built for Australian builders. 4,000+ EPD materials, NCC 2024 compliance, professional reports. Free forever plan available."
      customSections={<WhitepaperSummary className="bg-muted/30" />}
    />
  );
}
