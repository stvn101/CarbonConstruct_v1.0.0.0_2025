import CampaignLandingPage, { Benefit } from '@/components/CampaignLandingPage';
import { WhitepaperSummary } from '@/components/WhitepaperSummary';
import { Eye, Award, TrendingUp, FileText, Users, Leaf } from 'lucide-react';

const benefits: Benefit[] = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Visibility to Builders",
    description: "Your EPD materials appear in our database. When builders search for products, they find yours.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "EPD Recognition",
    description: "We prioritize products with verified EPDs. Your investment in certification gets the recognition it deserves.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Market Differentiation",
    description: "Low-carbon products stand out in comparisons. Help builders choose you over higher-carbon alternatives.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Data Accuracy",
    description: "Your product data is presented accurately. No more builders using outdated or incorrect emission factors.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Direct Connection",
    description: "Builders can trace materials back to your manufacturing plants. Build relationships through transparency.",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Sustainability Leadership",
    description: "Show your commitment to decarbonisation. Help the construction industry meet its climate targets.",
  },
];

const painPoints = [
  "You've invested in EPDs but builders don't know how to use the data",
  "Your low-carbon products aren't getting the market recognition they deserve",
  "Builders are using generic emission factors instead of your verified EPD data",
  "You want to help customers meet their carbon targets but lack the tools",
  "Competitors are making sustainability claims and you need to differentiate",
];

export default function LandingSupplyChain() {
  return (
    <CampaignLandingPage
      audience="suppliers"
      audienceLabel="Material Suppliers"
      heroTitle="Help Your Customers Choose You"
      heroSubtitle="Make your EPD investment work harder."
      heroDescription="CarbonConstruct connects your verified EPD data with the builders and architects who need it. When professionals search for low-carbon materials, they find your products — complete with accurate, traceable emission factors."
      benefits={benefits}
      painPoints={painPoints}
      testimonial={{
        quote: "Our EPDs finally have visibility. Builders are specifying our products because they can see the carbon advantage.",
        author: "Material Supplier",
        role: "EPD Australasia Member",
      }}
      ctaText="Get Your Products Listed"
      ctaSecondaryText="Contact Sales"
      seoTitle="EPD Visibility for Material Suppliers | CarbonConstruct"
      seoDescription="Connect your EPD data with Australian builders and architects. Market differentiation for low-carbon products. Help customers meet their carbon targets."
      customSections={<WhitepaperSummary className="bg-muted/30" />}
    />
  );
}
