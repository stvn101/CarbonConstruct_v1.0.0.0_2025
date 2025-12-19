/**
 * Email Campaign Templates for CarbonConstruct
 * Personalized content for each audience segment with links to dedicated landing pages
 * Includes A/B testing variants for subject lines and CTAs
 */

export interface EmailCampaignTemplate {
  audience: string;
  audienceLabel: string;
  landingPagePath: string;
  subject: string;
  preheader: string;
  headline: string;
  openingLine: string;
  painPoints: string[];
  solution: string;
  benefits: string[];
  ctaText: string;
  ctaUrl: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  urgencyMessage?: string;
  psLine?: string;
}

export interface ABTestVariant {
  variant: 'A' | 'B';
  subject: string;
  ctaText: string;
  preheader: string;
  testimonialPosition: 'before-cta' | 'after-benefits' | 'none';
}

/**
 * Extended A/B Test variants for email campaigns
 * Includes subject lines, CTAs, preheaders, and testimonial placement
 * Variant A = Original/Control
 * Variant B = Alternative/Test
 */
export const abTestVariants: Record<string, { A: ABTestVariant; B: ABTestVariant }> = {
  builders: {
    A: { 
      variant: 'A', 
      subject: 'NCC 2024 is here—is your business carbon-ready?', 
      ctaText: 'See How Builders Use It',
      preheader: 'The simple carbon tool built by a builder, for builders',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '🏗️ Win more tenders with carbon compliance', 
      ctaText: 'Start Free Trial',
      preheader: 'Join 500+ builders already using CarbonConstruct',
      testimonialPosition: 'before-cta'
    },
  },
  architects: {
    A: { 
      variant: 'A', 
      subject: 'Design for carbon—without slowing down your creative process', 
      ctaText: 'Design Smarter with Carbon',
      preheader: 'Real-time carbon feedback as you design',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Real-time carbon feedback for design decisions', 
      ctaText: 'Try Free for 14 Days',
      preheader: 'See carbon impacts before you finalise materials',
      testimonialPosition: 'before-cta'
    },
  },
  developers: {
    A: { 
      variant: 'A', 
      subject: 'Turn carbon compliance into competitive advantage', 
      ctaText: 'Get ESG-Ready Reporting',
      preheader: 'ESG-ready carbon reporting for your portfolio',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '📈 ESG investors are asking about embodied carbon', 
      ctaText: 'See Portfolio Dashboard',
      preheader: 'Institutional investors want carbon data—are you ready?',
      testimonialPosition: 'before-cta'
    },
  },
  engineers: {
    A: { 
      variant: 'A', 
      subject: 'Optimize structures for strength AND carbon', 
      ctaText: 'Engineer Lower Carbon',
      preheader: 'Technical carbon analysis for engineering professionals',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Concrete vs steel vs timber: see the carbon difference', 
      ctaText: 'Compare Materials Now',
      preheader: 'ICE Database + Australian EPDs in one place',
      testimonialPosition: 'before-cta'
    },
  },
  'site-supervisors': {
    A: { 
      variant: 'A', 
      subject: 'Carbon compliance without leaving the site', 
      ctaText: 'Simplify Site Compliance',
      preheader: 'Mobile-ready EPD verification for site delivery',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '📱 Check EPD compliance from your phone', 
      ctaText: 'See Mobile Tools',
      preheader: 'Verify material substitutions in seconds on-site',
      testimonialPosition: 'before-cta'
    },
  },
  'cost-planners': {
    A: { 
      variant: 'A', 
      subject: 'Add carbon estimates to your cost plans', 
      ctaText: 'Start Carbon Estimating',
      preheader: 'BOQ import for instant carbon calculations',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'BOQ to carbon report in minutes, not hours', 
      ctaText: 'Upload Your First BOQ',
      preheader: 'Deliver carbon + cost estimates with QS-level rigour',
      testimonialPosition: 'before-cta'
    },
  },
  'environmental-officers': {
    A: { 
      variant: 'A', 
      subject: 'Streamline your Green Star submissions', 
      ctaText: 'Streamline Compliance',
      preheader: 'Verified EPD database with audit-ready documentation',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '⏱️ Cut Green Star submission time by 80%', 
      ctaText: 'See How It Works',
      preheader: 'Full traceability for third-party audits',
      testimonialPosition: 'before-cta'
    },
  },
  'sustainability-managers': {
    A: { 
      variant: 'A', 
      subject: 'Portfolio-wide carbon visibility for ESG reporting', 
      ctaText: 'Drive Portfolio Reduction',
      preheader: 'Track reduction pathways across all projects',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'From carbon data to board-ready KPIs', 
      ctaText: 'View Sample Dashboard',
      preheader: 'Executive-ready reporting for sustainability leaders',
      testimonialPosition: 'before-cta'
    },
  },
  'project-managers': {
    A: { 
      variant: 'A', 
      subject: 'Keep carbon on track alongside cost and time', 
      ctaText: 'Start Managing Carbon',
      preheader: 'Real-time carbon tracking for construction projects',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Carbon is now a project deliverable—are you ready?', 
      ctaText: 'See PM Dashboard',
      preheader: 'Early warning on compliance risks',
      testimonialPosition: 'before-cta'
    },
  },
  subcontractors: {
    A: { 
      variant: 'A', 
      subject: 'Win more work with carbon credentials', 
      ctaText: 'Build Carbon Credentials',
      preheader: 'Simple EPD documentation for trade contractors',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '🏆 Stand out from competitors with EPD reports', 
      ctaText: 'Create Your First Report',
      preheader: 'Professional reports for tender submissions',
      testimonialPosition: 'before-cta'
    },
  },
  estimators: {
    A: { 
      variant: 'A', 
      subject: 'Add carbon to your estimates—fast', 
      ctaText: 'Estimate Faster',
      preheader: 'Instant carbon calculations from your material take-offs',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Carbon estimates that don\'t slow you down', 
      ctaText: 'Try BOQ Import',
      preheader: 'Australian EPD database built in—no manual research',
      testimonialPosition: 'before-cta'
    },
  },
  procurement: {
    A: { 
      variant: 'A', 
      subject: 'Make carbon-smart procurement decisions', 
      ctaText: 'Procure Sustainably',
      preheader: 'Compare suppliers by cost AND carbon performance',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Compare suppliers by price AND carbon', 
      ctaText: 'See Supplier Comparison',
      preheader: 'Sustainable procurement reporting made easy',
      testimonialPosition: 'before-cta'
    },
  },
  'supply-chain': {
    A: { 
      variant: 'A', 
      subject: 'Help your customers meet carbon targets', 
      ctaText: 'Feature Your Products',
      preheader: 'Make your EPDs work harder for your business',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '📊 40% more specifications when you\'re in our database', 
      ctaText: 'List Your EPDs Free',
      preheader: 'Turn your EPD investment into sales results',
      testimonialPosition: 'before-cta'
    },
  },
  consultants: {
    A: { 
      variant: 'A', 
      subject: 'Scale your LCA practice with the right tools', 
      ctaText: 'Scale Your Practice',
      preheader: 'Verified data and white-label reporting for consultants',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Deliver 2x more LCAs without hiring', 
      ctaText: 'See White-Label Options',
      preheader: 'White-label reports in your branding',
      testimonialPosition: 'before-cta'
    },
  },
  government: {
    A: { 
      variant: 'A', 
      subject: 'Lead by example on embodied carbon', 
      ctaText: 'Lead on Climate',
      preheader: 'Procurement tools for public sector carbon targets',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: 'Set evidence-based carbon limits for public tenders', 
      ctaText: 'View Benchmarks',
      preheader: 'Support whole-of-government sustainability targets',
      testimonialPosition: 'before-cta'
    },
  },
  investors: {
    A: { 
      variant: 'A', 
      subject: 'Embodied carbon: the next frontier of ESG risk', 
      ctaText: 'Assess Climate Risk',
      preheader: 'Assess climate risk in your property portfolio',
      testimonialPosition: 'after-benefits'
    },
    B: { 
      variant: 'B', 
      subject: '⚠️ Is embodied carbon a stranded asset risk?', 
      ctaText: 'Run Portfolio Analysis',
      preheader: 'GRESB and TCFD-aligned reporting',
      testimonialPosition: 'before-cta'
    },
  },
};

const BASE_URL = 'https://carbonconstruct.com.au';

export const emailCampaignTemplates: EmailCampaignTemplate[] = [
  // Builders
  {
    audience: 'builders',
    audienceLabel: 'Builders',
    landingPagePath: '/lp/builders',
    subject: 'NCC 2024 is here—is your business carbon-ready?',
    preheader: 'The simple carbon tool built by a builder, for builders',
    headline: 'Carbon Compliance Without the Complexity',
    openingLine: 'Fellow builder, NCC 2024 has made embodied carbon reporting mandatory. But compliance doesn\'t have to mean consultants and spreadsheets.',
    painPoints: [
      'Worried about losing tenders because you can\'t demonstrate carbon credentials?',
      'Frustrated by complex sustainability tools that don\'t fit construction workflows?',
      'Concerned about the cost of hiring carbon consultants for every project?',
    ],
    solution: 'CarbonConstruct was built by a builder who faced these same challenges. It\'s the straightforward carbon calculator that speaks your language.',
    benefits: [
      'Win more tenders with professional carbon reports',
      'NCC 2024 Section J compliance built in',
      'No sustainability degree required—if you can read a BOQ, you can use this',
    ],
    ctaText: 'See How Builders Use It',
    ctaUrl: `${BASE_URL}/lp/builders`,
    testimonial: {
      quote: 'Finally, a carbon tool that doesn\'t assume I have a PhD in sustainability.',
      author: 'Mark Thompson',
      role: 'Director, Regional Building Company',
    },
    urgencyMessage: 'NCC 2024 compliance is now mandatory for Class 2+ buildings.',
    psLine: 'P.S. MBA members get 15% off annual plans. Ask about our member discount.',
  },

  // Architects
  {
    audience: 'architects',
    audienceLabel: 'Architects',
    landingPagePath: '/lp/architects',
    subject: 'Design for carbon—without slowing down your creative process',
    preheader: 'Real-time carbon feedback as you design',
    headline: 'Make Carbon Part of Your Design Language',
    openingLine: 'Great architecture now includes a new dimension: embodied carbon. But carbon analysis shouldn\'t interrupt your design flow.',
    painPoints: [
      'Finding carbon analysis slows down the iterative design process?',
      'Frustrated that material decisions made late in the project have carbon implications?',
      'Need to demonstrate carbon performance to clients but lack the right tools?',
    ],
    solution: 'CarbonConstruct integrates carbon feedback into your design workflow, so you can explore material options and see carbon impacts in real time.',
    benefits: [
      'Real-time carbon feedback on material selections',
      'Compare design options by carbon performance instantly',
      'Client-ready reports that communicate your sustainable design decisions',
    ],
    ctaText: 'Design Smarter with Carbon',
    ctaUrl: `${BASE_URL}/lp/architects`,
    testimonial: {
      quote: 'I can now show clients the carbon impact of facade options in our design meetings. It\'s changed how we communicate sustainability.',
      author: 'Sarah Chen',
      role: 'Principal, Award-winning Architecture Practice',
    },
    psLine: 'P.S. Perfect for early-stage design competitions where sustainability is weighted.',
  },

  // Developers
  {
    audience: 'developers',
    audienceLabel: 'Property Developers',
    landingPagePath: '/lp/developers',
    subject: 'Turn carbon compliance into competitive advantage',
    preheader: 'ESG-ready carbon reporting for your portfolio',
    headline: 'Carbon Performance That Investors Notice',
    openingLine: 'Institutional investors and financiers are increasingly scrutinizing embodied carbon. Your development projects need to demonstrate sustainability credentials.',
    painPoints: [
      'ESG requirements making it harder to secure project finance?',
      'Buyers and tenants asking about the carbon footprint of your buildings?',
      'Need to report embodied carbon across your portfolio but lack consistent data?',
    ],
    solution: 'CarbonConstruct provides portfolio-wide carbon visibility and investor-grade reporting that satisfies ESG requirements and differentiates your projects.',
    benefits: [
      'ESG-compliant carbon reporting for investor presentations',
      'Portfolio-wide visibility across all development projects',
      'Premium positioning for carbon-conscious buyers and tenants',
    ],
    ctaText: 'Get ESG-Ready Reporting',
    ctaUrl: `${BASE_URL}/lp/developers`,
    testimonial: {
      quote: 'Our institutional investors now ask for carbon reports alongside financial models. CarbonConstruct delivers both in the same meeting.',
      author: 'James Morton',
      role: 'Development Director, Listed Property Group',
    },
    urgencyMessage: 'GRESB and PRI are increasingly including embodied carbon in their assessments.',
  },

  // Engineers
  {
    audience: 'engineers',
    audienceLabel: 'Structural & Civil Engineers',
    landingPagePath: '/lp/engineers',
    subject: 'Optimize structures for strength AND carbon',
    preheader: 'Technical carbon analysis for engineering professionals',
    headline: 'Engineering Decisions with Carbon Intelligence',
    openingLine: 'Structural and civil engineers have more influence over embodied carbon than almost any other discipline. Your material and system choices define the carbon footprint.',
    painPoints: [
      'Clients asking for carbon optimization but you don\'t have time for manual calculations?',
      'Need to compare concrete vs steel vs timber with accurate, current emission factors?',
      'Finding it hard to quantify the carbon benefit of design efficiency improvements?',
    ],
    solution: 'CarbonConstruct provides the technical depth engineers need—accurate emission factors, lifecycle stage breakdowns, and scenario comparison tools.',
    benefits: [
      'Compare structural systems by carbon performance',
      'ICE Database and Australian EPDs for accurate calculations',
      'Quantify the carbon value of engineering optimization',
    ],
    ctaText: 'Engineer Lower Carbon',
    ctaUrl: `${BASE_URL}/lp/engineers`,
    testimonial: {
      quote: 'I can now demonstrate to clients that our efficient slab design saves 40 tonnes of CO₂. That\'s a powerful value-add.',
      author: 'Dr. Michael Torres',
      role: 'Technical Director, Engineering Consultancy',
    },
  },

  // Site Supervisors
  {
    audience: 'site-supervisors',
    audienceLabel: 'Site Supervisors',
    landingPagePath: '/lp/site-supervisors',
    subject: 'Carbon compliance without leaving the site',
    preheader: 'Mobile-ready EPD verification for site delivery',
    headline: 'Verify Carbon Compliance On-Site',
    openingLine: 'When materials arrive and the spec has changed, you need to know if it affects carbon compliance. Now you can check from your phone.',
    painPoints: [
      'Tired of calling the office to check if a material substitution is compliant?',
      'Need to document delivered materials but EPD certificates are buried in emails?',
      'Finding carbon requirements add complexity to already demanding site management?',
    ],
    solution: 'CarbonConstruct mobile tools let you verify EPD compliance, document deliveries, and catch substitution issues—all from site.',
    benefits: [
      'Mobile-friendly material verification',
      'Instant substitution impact alerts',
      'Automatic delivery documentation',
    ],
    ctaText: 'Simplify Site Compliance',
    ctaUrl: `${BASE_URL}/lp/site-supervisors`,
    testimonial: {
      quote: 'When steel arrives and the spec has changed, I can check the carbon impact in seconds on my phone.',
      author: 'Steve Martinez',
      role: 'Site Supervisor, Commercial Construction',
    },
  },

  // Cost Planners / QS
  {
    audience: 'cost-planners',
    audienceLabel: 'Quantity Surveyors',
    landingPagePath: '/lp/cost-planners',
    subject: 'Add carbon estimates to your cost plans',
    preheader: 'BOQ import for instant carbon calculations',
    headline: 'Carbon Estimates with QS-Level Rigour',
    openingLine: 'Your clients are asking for carbon estimates alongside cost plans. Now you can deliver both with the same accuracy and professionalism.',
    painPoints: [
      'Clients expecting carbon estimates but you don\'t have the tools or data?',
      'Spending hours manually looking up emission factors for material take-offs?',
      'Struggling to show cost-carbon trade-offs when recommending alternatives?',
    ],
    solution: 'CarbonConstruct integrates with your BOQ workflow—upload your take-offs and get instant carbon calculations with industry benchmarks.',
    benefits: [
      'BOQ import for instant carbon calculations',
      'Cost-carbon trade-off analysis',
      'Industry benchmarks per m² by building type',
    ],
    ctaText: 'Start Carbon Estimating',
    ctaUrl: `${BASE_URL}/lp/cost-planners`,
    testimonial: {
      quote: 'I can now deliver a carbon report alongside every cost plan. Clients love seeing the trade-offs in both dollars and tonnes.',
      author: 'Sarah Wong',
      role: 'Senior Quantity Surveyor',
    },
    psLine: 'P.S. Perfect for tender submissions requiring carbon credentials.',
  },

  // Environmental Officers
  {
    audience: 'environmental-officers',
    audienceLabel: 'Environmental Officers',
    landingPagePath: '/lp/environmental-officers',
    subject: 'Streamline your Green Star submissions',
    preheader: 'Verified EPD database with audit-ready documentation',
    headline: 'Carbon Reporting You Can Stand Behind',
    openingLine: 'Environmental officers need accurate, verified data they can defend in audits. CarbonConstruct provides exactly that.',
    painPoints: [
      'Green Star submissions taking weeks of manual data collection?',
      'Worried about the quality and currency of your emission factor data?',
      'Need to demonstrate progress against corporate net-zero targets?',
    ],
    solution: 'CarbonConstruct\'s verified EPD database and audit-ready reports streamline environmental compliance across your project portfolio.',
    benefits: [
      'Green Star-ready export formats',
      'Verified Australian EPD database with expiry tracking',
      'Full traceability for third-party audits',
    ],
    ctaText: 'Streamline Compliance',
    ctaUrl: `${BASE_URL}/lp/environmental-officers`,
    testimonial: {
      quote: 'Our Green Star submissions used to take weeks. Now I can generate compliant reports in hours with full traceability.',
      author: 'Jennifer Liu',
      role: 'Environmental Manager',
    },
  },

  // Sustainability Managers
  {
    audience: 'sustainability-managers',
    audienceLabel: 'Sustainability Managers',
    landingPagePath: '/lp/sustainability-managers',
    subject: 'Portfolio-wide carbon visibility for ESG reporting',
    preheader: 'Track reduction pathways across all projects',
    headline: 'From Carbon Data to Carbon Action',
    openingLine: 'Sustainability managers need more than data—you need insights that drive reduction and evidence that demonstrates progress.',
    painPoints: [
      'Consolidating carbon data from multiple projects and consultants?',
      'Need to demonstrate year-on-year reduction against corporate targets?',
      'Finding it hard to translate embodied carbon into board-level KPIs?',
    ],
    solution: 'CarbonConstruct provides portfolio-wide visibility, reduction pathway modelling, and executive-ready reporting for sustainability leaders.',
    benefits: [
      'Portfolio-wide carbon dashboards',
      'Reduction pathway scenarios',
      'ESG-aligned KPI reporting',
    ],
    ctaText: 'Drive Portfolio Reduction',
    ctaUrl: `${BASE_URL}/lp/sustainability-managers`,
    testimonial: {
      quote: 'I can finally show the board our embodied carbon trajectory with data they trust.',
      author: 'Amanda Richards',
      role: 'Head of Sustainability, Property Group',
    },
  },

  // Project Managers
  {
    audience: 'project-managers',
    audienceLabel: 'Project Managers',
    landingPagePath: '/lp/project-managers',
    subject: 'Keep carbon on track alongside cost and time',
    preheader: 'Real-time carbon tracking for construction projects',
    headline: 'Carbon is Now a Project Deliverable',
    openingLine: 'NCC 2024 has made carbon compliance a project requirement. As a PM, you need tools that track carbon alongside your other KPIs.',
    painPoints: [
      'Carbon requirements adding complexity to project coordination?',
      'Need to track carbon performance but the data lives in spreadsheets?',
      'Worried about compliance affecting your project timeline?',
    ],
    solution: 'CarbonConstruct gives project managers real-time carbon dashboards, stakeholder reports, and early warning on compliance risks.',
    benefits: [
      'Real-time carbon progress tracking',
      'Stakeholder reports for architects, clients, and contractors',
      'Early warning on compliance risks',
    ],
    ctaText: 'Start Managing Carbon',
    ctaUrl: `${BASE_URL}/lp/project-managers`,
    testimonial: {
      quote: 'I can see the carbon impact of material substitutions instantly and keep the client informed.',
      author: 'Michael Chen',
      role: 'Senior Project Manager',
    },
  },

  // Subcontractors
  {
    audience: 'subcontractors',
    audienceLabel: 'Subcontractors',
    landingPagePath: '/lp/subcontractors',
    subject: 'Win more work with carbon credentials',
    preheader: 'Simple EPD documentation for trade contractors',
    headline: 'Carbon Compliance Gives You an Edge',
    openingLine: 'Head contractors are increasingly requiring carbon documentation from trades. Get ahead of your competition with professional EPD reports.',
    painPoints: [
      'Head contractors asking for EPD documentation you don\'t have?',
      'Losing tenders to competitors with better sustainability credentials?',
      'Finding carbon requirements confusing and time-consuming?',
    ],
    solution: 'CarbonConstruct makes it simple for trade contractors to document the carbon footprint of their materials and win more work.',
    benefits: [
      'Simple EPD documentation for your materials',
      'Professional reports for tender submissions',
      'Stand out from competitors',
    ],
    ctaText: 'Build Carbon Credentials',
    ctaUrl: `${BASE_URL}/lp/subcontractors`,
    testimonial: {
      quote: 'We won a major hospital contract because we could demonstrate the carbon footprint of our steel package.',
      author: 'Tony Nguyen',
      role: 'Director, Steel Fabrication',
    },
  },

  // Estimators
  {
    audience: 'estimators',
    audienceLabel: 'Construction Estimators',
    landingPagePath: '/lp/estimators',
    subject: 'Add carbon to your estimates—fast',
    preheader: 'Instant carbon calculations from your material take-offs',
    headline: 'Estimate Carbon Like You Estimate Cost',
    openingLine: 'More tenders are requiring carbon estimates alongside pricing. CarbonConstruct helps estimators deliver both without doubling the workload.',
    painPoints: [
      'Tenders requiring carbon estimates but no time to learn new software?',
      'Need accurate emission factors without manual research?',
      'Finding carbon calculations slow down your estimating workflow?',
    ],
    solution: 'CarbonConstruct is built for estimators—upload your material take-offs and get carbon calculations in minutes, not hours.',
    benefits: [
      'BOQ import for instant calculations',
      'Australian EPD database built in',
      'Export carbon reports with your tender submission',
    ],
    ctaText: 'Estimate Faster',
    ctaUrl: `${BASE_URL}/lp/estimators`,
    testimonial: {
      quote: 'I can add carbon estimates to our tenders in under an hour. It\'s become a standard part of our workflow.',
      author: 'Lisa Park',
      role: 'Senior Estimator, Tier 2 Builder',
    },
  },

  // Procurement
  {
    audience: 'procurement',
    audienceLabel: 'Procurement Managers',
    landingPagePath: '/lp/procurement',
    subject: 'Make carbon-smart procurement decisions',
    preheader: 'Compare suppliers by cost AND carbon performance',
    headline: 'Procurement That Delivers on Sustainability',
    openingLine: 'Your material choices define the carbon footprint of construction. Now you can compare suppliers on sustainability as well as price.',
    painPoints: [
      'Sustainability goals requiring carbon criteria in procurement?',
      'Finding it hard to compare supplier EPDs across different products?',
      'Need to report on sustainable procurement but lack the data?',
    ],
    solution: 'CarbonConstruct helps procurement teams compare materials by carbon as well as cost, and track sustainable procurement across the portfolio.',
    benefits: [
      'Compare suppliers by carbon performance',
      'Verified EPD database for consistent comparisons',
      'Sustainable procurement reporting',
    ],
    ctaText: 'Procure Sustainably',
    ctaUrl: `${BASE_URL}/lp/procurement`,
    testimonial: {
      quote: 'We can now show clients that we source from verified low-carbon suppliers. It\'s a genuine differentiator.',
      author: 'David Chen',
      role: 'Procurement Manager, National Builder',
    },
  },

  // Supply Chain / Suppliers
  {
    audience: 'supply-chain',
    audienceLabel: 'Material Suppliers',
    landingPagePath: '/lp/supply-chain',
    subject: 'Help your customers meet carbon targets',
    preheader: 'Make your EPDs work harder for your business',
    headline: 'Turn Your EPDs into Sales Tools',
    openingLine: 'Builders and contractors are choosing suppliers based on carbon performance. If you have EPDs, CarbonConstruct helps your customers use them.',
    painPoints: [
      'Invested in EPDs but customers don\'t know how to use them?',
      'Losing sales to competitors with better carbon communication?',
      'Need to demonstrate your environmental credentials to specifiers?',
    ],
    solution: 'CarbonConstruct features your products in our verified database, making it easy for customers to specify low-carbon materials.',
    benefits: [
      'Featured in Australia\'s largest construction EPD database',
      'Customers can compare your products easily',
      'Your EPD investment delivers sales results',
    ],
    ctaText: 'Feature Your Products',
    ctaUrl: `${BASE_URL}/lp/supply-chain`,
    testimonial: {
      quote: 'Since our products were featured in CarbonConstruct, specifications mentioning our EPD numbers have increased by 40%.',
      author: 'Rachel Adams',
      role: 'Sustainability Director, Building Products Manufacturer',
    },
  },

  // Consultants
  {
    audience: 'consultants',
    audienceLabel: 'Sustainability Consultants',
    landingPagePath: '/lp/consultants',
    subject: 'Scale your LCA practice with the right tools',
    preheader: 'Verified data and white-label reporting for consultants',
    headline: 'Deliver More LCAs Without More Staff',
    openingLine: 'Demand for embodied carbon assessments is growing faster than most consultancies can hire. CarbonConstruct helps you scale.',
    painPoints: [
      'Spending too much time on data collection and manual calculations?',
      'Need to deliver more LCAs but can\'t find qualified staff?',
      'Clients expecting faster turnaround at lower cost?',
    ],
    solution: 'CarbonConstruct\'s verified database and calculation engine lets consultants deliver more LCAs with less manual work—all white-labelled to your brand.',
    benefits: [
      'Verified EPD database saves data collection time',
      'White-label reports in your branding',
      'Scale your practice without proportional staff increases',
    ],
    ctaText: 'Scale Your Practice',
    ctaUrl: `${BASE_URL}/lp/consultants`,
    testimonial: {
      quote: 'We\'ve doubled our LCA output without adding headcount. CarbonConstruct handles the calculations so we can focus on strategy.',
      author: 'Dr. Kate Wilson',
      role: 'Principal, Sustainability Consultancy',
    },
  },

  // Government
  {
    audience: 'government',
    audienceLabel: 'Government & Public Sector',
    landingPagePath: '/lp/government',
    subject: 'Lead by example on embodied carbon',
    preheader: 'Procurement tools for public sector carbon targets',
    headline: 'Public Procurement That Delivers on Climate',
    openingLine: 'Government has committed to net-zero. Your infrastructure and building procurement can lead the way on embodied carbon reduction.',
    painPoints: [
      'Climate targets requiring carbon criteria in procurement but lacking tools?',
      'Need to report embodied carbon across public building portfolios?',
      'Finding it hard to set evidence-based carbon limits for tenders?',
    ],
    solution: 'CarbonConstruct helps public sector teams set carbon benchmarks, evaluate tenders, and report on portfolio-wide performance.',
    benefits: [
      'Evidence-based carbon limits for tenders',
      'Portfolio-wide carbon reporting',
      'Support for whole-of-government sustainability targets',
    ],
    ctaText: 'Lead on Climate',
    ctaUrl: `${BASE_URL}/lp/government`,
    testimonial: {
      quote: 'We can now set and enforce carbon limits in our building tenders with confidence in the benchmarks.',
      author: 'Michelle Santos',
      role: 'Director of Procurement, State Government',
    },
  },

  // Investors
  {
    audience: 'investors',
    audienceLabel: 'Property Investors',
    landingPagePath: '/lp/investors',
    subject: 'Embodied carbon: the next frontier of ESG risk',
    preheader: 'Assess climate risk in your property portfolio',
    headline: 'Climate Risk You Can\'t Afford to Ignore',
    openingLine: 'Operational carbon is well understood. Embodied carbon represents the next wave of climate-related financial risk for property investors.',
    painPoints: [
      'GRESB and TCFD requiring embodied carbon disclosure?',
      'Portfolio assets becoming stranded due to carbon performance?',
      'Need to understand embodied carbon exposure across diverse holdings?',
    ],
    solution: 'CarbonConstruct provides portfolio-level embodied carbon analytics that satisfy investor reporting requirements and identify climate risk.',
    benefits: [
      'Portfolio-wide embodied carbon assessment',
      'GRESB and TCFD-aligned reporting',
      'Identify stranded asset risk early',
    ],
    ctaText: 'Assess Climate Risk',
    ctaUrl: `${BASE_URL}/lp/investors`,
    testimonial: {
      quote: 'Our fund can now report embodied carbon alongside operational carbon. Investors expect this level of transparency.',
      author: 'Andrew Palmer',
      role: 'Head of ESG, Property Fund',
    },
  },
];

/**
 * Get A/B test variants for a given template
 */
export function getABTestVariants(template: EmailCampaignTemplate): ABTestVariant[] {
  const variants = abTestVariants[template.audience];
  if (variants) {
    return [variants.A, variants.B];
  }
  // Fallback: return the original subject and CTA as variant A
  return [
    { variant: 'A', subject: template.subject, ctaText: template.ctaText, preheader: template.preheader, testimonialPosition: 'after-benefits' },
    { variant: 'B', subject: template.subject, ctaText: template.ctaText, preheader: template.preheader, testimonialPosition: 'before-cta' },
  ];
}

/**
 * Get email template by audience identifier
 */
export function getEmailTemplate(audience: string): EmailCampaignTemplate | undefined {
  return emailCampaignTemplates.find(t => t.audience === audience);
}

/**
 * Get all email templates
 */
export function getAllEmailTemplates(): EmailCampaignTemplate[] {
  return emailCampaignTemplates;
}

/**
 * Generate HTML email content from a template
 */
export function generateEmailHTML(template: EmailCampaignTemplate): string {
  const painPointsHTML = template.painPoints
    .map(p => `<li style="margin-bottom: 8px; color: #666;">${p}</li>`)
    .join('');
    
  const benefitsHTML = template.benefits
    .map(b => `<li style="margin-bottom: 8px; color: #333;">✓ ${b}</li>`)
    .join('');

  const testimonialHTML = template.testimonial
    ? `
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #22c55e; margin: 24px 0;">
        <p style="font-style: italic; color: #333; margin: 0 0 12px 0;">"${template.testimonial.quote}"</p>
        <p style="color: #666; margin: 0; font-size: 14px;">— ${template.testimonial.author}, ${template.testimonial.role}</p>
      </div>
    `
    : '';

  const urgencyHTML = template.urgencyMessage
    ? `<p style="background: #fef3c7; padding: 12px; border-radius: 4px; color: #92400e; font-weight: 500;">⚡ ${template.urgencyMessage}</p>`
    : '';

  const psHTML = template.psLine
    ? `<p style="color: #666; font-size: 14px; margin-top: 24px;">${template.psLine}</p>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="${BASE_URL}/logo-96.webp" alt="CarbonConstruct" style="height: 48px; width: auto;" />
  </div>

  <!-- Headline -->
  <h1 style="color: #111; font-size: 24px; font-weight: 700; margin-bottom: 16px;">
    ${template.headline}
  </h1>

  <!-- Opening -->
  <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
    ${template.openingLine}
  </p>

  <!-- Pain Points -->
  <div style="margin-bottom: 24px;">
    <p style="font-weight: 600; color: #333; margin-bottom: 12px;">Sound familiar?</p>
    <ul style="padding-left: 20px; margin: 0;">
      ${painPointsHTML}
    </ul>
  </div>

  <!-- Solution -->
  <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
    ${template.solution}
  </p>

  <!-- Benefits -->
  <div style="margin-bottom: 24px;">
    <p style="font-weight: 600; color: #333; margin-bottom: 12px;">With CarbonConstruct, you get:</p>
    <ul style="padding-left: 20px; margin: 0; list-style: none;">
      ${benefitsHTML}
    </ul>
  </div>

  ${testimonialHTML}

  ${urgencyHTML}

  <!-- CTA Button -->
  <div style="text-align: center; margin: 32px 0;">
    <a href="${template.ctaUrl}?utm_source=email&utm_medium=campaign&utm_campaign=${template.audience}" 
       style="background: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      ${template.ctaText}
    </a>
  </div>

  ${psHTML}

  <!-- Footer -->
  <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">CarbonConstruct | Australian Construction Carbon Calculator</p>
    <p style="margin: 0;">
      <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a> · 
      <a href="${BASE_URL}/terms" style="color: #666;">Terms</a> · 
      <a href="${BASE_URL}/help" style="color: #666;">Contact</a>
    </p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Generate plain text email content from a template
 */
export function generateEmailPlainText(template: EmailCampaignTemplate): string {
  const painPoints = template.painPoints.map(p => `• ${p}`).join('\n');
  const benefits = template.benefits.map(b => `✓ ${b}`).join('\n');
  
  let text = `
${template.headline}

${template.openingLine}

Sound familiar?
${painPoints}

${template.solution}

With CarbonConstruct, you get:
${benefits}
`;

  if (template.testimonial) {
    text += `
"${template.testimonial.quote}"
— ${template.testimonial.author}, ${template.testimonial.role}
`;
  }

  if (template.urgencyMessage) {
    text += `\n⚡ ${template.urgencyMessage}\n`;
  }

  text += `
${template.ctaText}: ${template.ctaUrl}?utm_source=email&utm_medium=campaign&utm_campaign=${template.audience}
`;

  if (template.psLine) {
    text += `\n${template.psLine}\n`;
  }

  text += `
---
CarbonConstruct | Australian Construction Carbon Calculator
Privacy: ${BASE_URL}/privacy | Terms: ${BASE_URL}/terms
`;

  return text.trim();
}
