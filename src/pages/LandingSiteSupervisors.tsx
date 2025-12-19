import { CampaignLandingPage, Benefit } from '@/components/CampaignLandingPage';
import { HardHat, FileCheck, AlertTriangle, Truck, ClipboardList, Timer } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <HardHat className="h-6 w-6" />,
    title: "On-Site Material Verification",
    description: "Quickly verify EPD compliance when materials arrive on site using mobile-friendly reports.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Instant Documentation",
    description: "Generate carbon certificates for site deliveries to satisfy client and council requirements.",
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Substitution Alerts",
    description: "Know immediately when a material substitution will affect project carbon compliance.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Delivery Tracking",
    description: "Log material deliveries and automatically track transport emissions (A4 stage).",
  },
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: "Simple Checklists",
    description: "Carbon compliance checklists integrated into your daily site management routine.",
  },
  {
    icon: <Timer className="h-6 w-6" />,
    title: "No Admin Overhead",
    description: "Carbon data syncs automatically—no extra paperwork or manual data entry required.",
  },
];

const painPoints = [
  "Tired of hunting down EPD certificates when materials arrive on site?",
  "Worried a material substitution will blow the project's carbon budget?",
  "Need to prove to the PM that delivered materials match the specification?",
  "Finding carbon requirements add another layer of complexity to site management?",
  "Struggling to keep track of what's compliant when multiple trades are working?",
];

export default function LandingSiteSupervisors() {
  return (
    <CampaignLandingPage
      audience="site-supervisors"
      audienceLabel="Site Supervisors"
      heroTitle="Carbon Compliance—Without Leaving Site"
      heroSubtitle="Verify materials, track deliveries, and stay compliant on the ground"
      heroDescription="CarbonConstruct gives site supervisors mobile-ready tools to verify material compliance, document deliveries, and catch substitution issues before they become problems."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "When steel arrives and the spec has changed, I can check the carbon impact in seconds on my phone. No more calling the office or waiting for someone to look it up.",
        author: "Steve Martinez",
        role: "Site Supervisor, Commercial Construction",
      }}
      ctaText="Simplify Site Compliance"
      seoTitle="Carbon Compliance for Site Supervisors | CarbonConstruct"
      seoDescription="Mobile-ready carbon verification tools for Australian site supervisors. Track deliveries, verify EPDs, and catch substitution issues on-site."
    />
  );
}
