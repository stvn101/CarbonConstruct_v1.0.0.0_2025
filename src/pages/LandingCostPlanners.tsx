import { CampaignLandingPage, Benefit } from '@/components/CampaignLandingPage';
import { Calculator, TrendingDown, FileSpreadsheet, Scale, Target, DollarSign } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Calculator className="h-6 w-6" />,
    title: "Cost-Carbon Integration",
    description: "Link embodied carbon to your cost plans so clients see the financial and environmental trade-offs.",
  },
  {
    icon: <TrendingDown className="h-6 w-6" />,
    title: "Value Engineering Analysis",
    description: "Compare material options by both cost and carbon to find the optimal balance for each project.",
  },
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    title: "BOQ Import",
    description: "Upload existing BOQs and get instant carbon calculations against your material take-offs.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Benchmark Comparisons",
    description: "Compare your estimates against industry benchmarks per m² by building type and location.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Budget Targets",
    description: "Set carbon budgets alongside cost budgets and track both through design development.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Lifecycle Costing",
    description: "Factor in whole-of-life carbon costs to support true lifecycle cost analysis.",
  },
];

const painPoints = [
  "Clients asking for carbon estimates but you don't have the data or tools?",
  "Spending hours manually looking up emission factors for material take-offs?",
  "Struggling to show the cost-carbon trade-off when recommending alternatives?",
  "Need to update carbon estimates every time the specification changes?",
  "Finding it hard to benchmark your projects against industry standards?",
];

export default function LandingCostPlanners() {
  return (
    <CampaignLandingPage
      audience="cost-planners"
      audienceLabel="Cost Planners & Quantity Surveyors"
      heroTitle="Carbon Estimates as Accurate as Your Cost Plans"
      heroSubtitle="Add embodied carbon to your quantity surveying toolkit"
      heroDescription="CarbonConstruct integrates with your existing BOQ workflows to deliver carbon estimates with the same rigor you apply to cost planning. Give clients the full picture."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "I can now deliver a carbon report alongside every cost plan. Clients love seeing the trade-offs between material options in both dollars and tonnes CO₂.",
        author: "Sarah Wong",
        role: "Senior Quantity Surveyor, National QS Firm",
      }}
      ctaText="Start Carbon Estimating"
      seoTitle="Carbon Estimation for Cost Planners | CarbonConstruct"
      seoDescription="Add embodied carbon to your quantity surveying services. BOQ import, benchmark comparisons, and cost-carbon analysis for Australian QS professionals."
    />
  );
}
