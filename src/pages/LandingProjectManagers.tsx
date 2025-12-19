import { CampaignLandingPage, Benefit } from '@/components/CampaignLandingPage';
import { ClipboardCheck, Clock, FileCheck, Users, BarChart3, Shield } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Project Carbon Tracking",
    description: "Monitor embodied carbon across all project phases from design through construction completion.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Real-Time Progress Updates",
    description: "Track carbon metrics as materials are procured and installed, not just at project end.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Team Coordination",
    description: "Share carbon reports with architects, engineers, and contractors to keep everyone aligned.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "NCC 2024 Compliance",
    description: "Ensure Section J compliance with automatically generated documentation for certification.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Progress Dashboards",
    description: "Visual dashboards showing carbon performance against targets and benchmarks.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Risk Mitigation",
    description: "Identify carbon hotspots early to avoid costly redesigns and project delays.",
  },
];

const painPoints = [
  "Struggling to coordinate carbon requirements across multiple subcontractors and suppliers?",
  "Finding it hard to track embodied carbon as the project progresses and changes occur?",
  "Worried about NCC 2024 compliance affecting your project timeline and budget?",
  "Spending too much time chasing EPD documentation from material suppliers?",
  "Need a single source of truth for carbon metrics that the whole project team can access?",
];

export default function LandingProjectManagers() {
  return (
    <CampaignLandingPage
      audience="project-managers"
      audienceLabel="Project Managers"
      heroTitle="Keep Your Projects on Track—Carbon Included"
      heroSubtitle="Manage embodied carbon alongside cost, time, and quality"
      heroDescription="CarbonConstruct gives project managers the tools to monitor carbon performance in real-time, coordinate with stakeholders, and deliver NCC-compliant projects on schedule."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Finally, a carbon tool that fits into my project workflow. I can see the carbon impact of material substitutions instantly and keep the client informed.",
        author: "Michael Chen",
        role: "Senior Project Manager, Tier 1 Contractor",
      }}
      ctaText="Start Managing Carbon"
      seoTitle="Carbon Management for Project Managers | CarbonConstruct"
      seoDescription="Track embodied carbon across your construction projects. Real-time dashboards, NCC 2024 compliance, and team collaboration tools for Australian project managers."
    />
  );
}
