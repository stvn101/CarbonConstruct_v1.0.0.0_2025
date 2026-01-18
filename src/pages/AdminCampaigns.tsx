import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { Copy, ExternalLink, Users, Building, Briefcase, Truck, Leaf, Calculator, Landmark, TrendingUp, Award, HardHat, ClipboardList, FolderKanban, Globe2, Database } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { LandingPageAnalytics } from '@/components/LandingPageAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CampaignPage {
  path: string;
  name: string;
  audience: string;
  icon: React.ReactNode;
  description: string;
}

const campaignPages: CampaignPage[] = [
  // MBA State-Based Pages
  {
    path: '/lp/mba',
    name: 'MBA Queensland',
    audience: 'MBA QLD Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA Queensland members - 20% discount with MBA20QLD',
  },
  {
    path: '/lp/mba-nsw',
    name: 'MBA NSW',
    audience: 'MBA NSW Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA NSW members - 20% discount with MBA20NSW',
  },
  {
    path: '/lp/mba-vic',
    name: 'MBA Victoria',
    audience: 'MBA VIC Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA Victoria members - 20% discount with MBA20VIC',
  },
  {
    path: '/lp/mba-sa',
    name: 'MBA South Australia',
    audience: 'MBA SA Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA SA members - 20% discount with MBA20SA (Grid: 0.42)',
  },
  {
    path: '/lp/mba-wa',
    name: 'MBA Western Australia',
    audience: 'MBA WA Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA WA members - 20% discount with MBA20WA (Grid: 0.64)',
  },
  {
    path: '/lp/mba-tas',
    name: 'MBA Tasmania',
    audience: 'MBA TAS Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA Tasmania members - 20% discount with MBA20TAS (Grid: 0.14)',
  },
  {
    path: '/lp/mba-nt',
    name: 'MBA Northern Territory',
    audience: 'MBA NT Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA NT members - 20% discount with MBA20NT (Grid: 0.54)',
  },
  {
    path: '/lp/mba-act',
    name: 'MBA ACT',
    audience: 'MBA ACT Members',
    icon: <Award className="h-5 w-5" />,
    description: 'MBA ACT members - 20% discount with MBA20ACT (Grid: 0.76)',
  },
  // General Audience Pages
  {
    path: '/lp/investors',
    name: 'Investors',
    audience: 'Investors & Partners',
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Investment opportunity - market position & competitive advantages',
  },
  {
    path: '/lp/builders',
    name: 'Builders',
    audience: 'Builders & Site Managers',
    icon: <Building className="h-5 w-5" />,
    description: 'Construction professionals managing project carbon',
  },
  {
    path: '/lp/architects',
    name: 'Architects',
    audience: 'Architects & Designers',
    icon: <Users className="h-5 w-5" />,
    description: 'Design professionals integrating carbon early',
  },
  {
    path: '/lp/developers',
    name: 'Developers',
    audience: 'Property Developers',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Portfolio carbon management and ESG reporting',
  },
  {
    path: '/lp/suppliers',
    name: 'Suppliers',
    audience: 'Material Suppliers',
    icon: <Truck className="h-5 w-5" />,
    description: 'EPD visibility and market differentiation',
  },
  {
    path: '/lp/consultants',
    name: 'Consultants',
    audience: 'Sustainability Consultants',
    icon: <Leaf className="h-5 w-5" />,
    description: 'Streamlined LCA workflow and reporting',
  },
  {
    path: '/lp/engineers',
    name: 'Engineers',
    audience: 'Structural Engineers',
    icon: <Calculator className="h-5 w-5" />,
    description: 'Accurate material data for structural decisions',
  },
  {
    path: '/lp/government',
    name: 'Government',
    audience: 'Council & Government Officers',
    icon: <Landmark className="h-5 w-5" />,
    description: 'Compliance verification and public asset tracking',
  },
  {
    path: '/lp/procurement',
    name: 'Procurement',
    audience: 'Procurement Managers & QS',
    icon: <Truck className="h-5 w-5" />,
    description: 'Verify supplier EPDs, compare materials, prove compliance',
  },
  {
    path: '/lp/supply-chain',
    name: 'Supply Chain',
    audience: 'Material Suppliers',
    icon: <Truck className="h-5 w-5" />,
    description: 'Showcase EPD materials to builders and architects',
  },
  {
    path: '/lp/estimators',
    name: 'Estimators',
    audience: 'Quantity Surveyors & Estimators',
    icon: <ClipboardList className="h-5 w-5" />,
    description: 'BOQ carbon analysis and material cost-carbon trade-offs',
  },
  {
    path: '/lp/subcontractors',
    name: 'Subcontractors',
    audience: 'Trade Contractors',
    icon: <HardHat className="h-5 w-5" />,
    description: 'Navigate carbon accountability - "The Silent Transfer" whitepaper',
  },
  {
    path: '/lp/project-managers',
    name: 'Project Managers',
    audience: 'Construction PMs',
    icon: <FolderKanban className="h-5 w-5" />,
    description: 'Track carbon alongside cost, time, and quality metrics',
  },
  {
    path: '/lp/sustainability-managers',
    name: 'Sustainability Managers',
    audience: 'ESG & Sustainability Leaders',
    icon: <Globe2 className="h-5 w-5" />,
    description: 'Portfolio-wide carbon tracking and ESG reporting',
  },
  // Feature Landing Pages
  {
    path: '/lp/ec3-integration',
    name: 'EC3 Integration',
    audience: 'LCA Practitioners & Carbon Specialists',
    icon: <Database className="h-5 w-5" />,
    description: 'Access 90,000+ EPDs from BuildingTransparency.org',
  },
];

const utmSources = ['facebook', 'linkedin', 'google', 'instagram', 'twitter', 'email', 'direct', 'referral'];
const utmMediums = ['paid', 'organic', 'cpc', 'social', 'email', 'newsletter', 'banner', 'display'];

export default function AdminCampaigns() {
  const [baseUrl, setBaseUrl] = useState('https://carbonconstruct.com.au');
  const [utmSource, setUtmSource] = useState('linkedin');
  const [utmMedium, setUtmMedium] = useState('paid');
  const [utmCampaign, setUtmCampaign] = useState('q1_2025');

  const generateUrl = (path: string) => {
    const params = new URLSearchParams({
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: `${path.replace('/lp/', '')}_${utmCampaign}`,
    });
    return `${baseUrl}${path}?${params.toString()}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} URL to clipboard`);
  };

  const copyAllUrls = () => {
    const allUrls = campaignPages
      .map(page => `${page.name}: ${generateUrl(page.path)}`)
      .join('\n\n');
    navigator.clipboard.writeText(allUrls);
    toast.success('Copied all campaign URLs to clipboard');
  };

  return (
    <>
      <SEOHead 
        title="Campaign URL Generator | Admin"
        description="Generate UTM-tagged URLs for marketing campaigns"
        noIndex={true}
      />
      
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Campaign Management</h1>
            <p className="text-muted-foreground">
              Generate UTM-tagged URLs and track landing page performance.
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="urls">URL Generator</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <LandingPageAnalytics />
            </TabsContent>

            <TabsContent value="urls">

        {/* UTM Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>UTM Parameters</CardTitle>
            <CardDescription>Configure the UTM parameters for your campaign URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://carbonconstruct.com.au"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmSource">Source</Label>
                <Select value={utmSource} onValueChange={setUtmSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {utmSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmMedium">Medium</Label>
                <Select value={utmMedium} onValueChange={setUtmMedium}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {utmMediums.map(medium => (
                      <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmCampaign">Campaign Suffix</Label>
                <Input
                  id="utmCampaign"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="q1_2025"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copy All Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={copyAllUrls} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy All URLs
          </Button>
        </div>

        {/* Campaign Pages Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {campaignPages.map((page) => {
            const fullUrl = generateUrl(page.path);
            return (
              <Card key={page.path} className="hover:border-emerald-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      {page.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{page.name}</h3>
                        <div className="flex items-center gap-1">
                          <Link to={page.path} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(fullUrl, page.name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                      <div className="bg-muted/50 rounded p-2">
                        <code className="text-xs break-all text-foreground/80">{fullUrl}</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">UTM Parameter Guide</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Source:</strong> Where the traffic comes from (facebook, linkedin, google, email)</li>
                <li><strong>Medium:</strong> Marketing medium (paid, organic, cpc, social, email)</li>
                <li><strong>Campaign:</strong> Auto-generated as [audience]_[suffix] for easy filtering</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Example Campaigns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>LinkedIn Ads: source=linkedin, medium=paid</li>
                <li>Email Newsletter: source=email, medium=newsletter</li>
                <li>Google Ads: source=google, medium=cpc</li>
                <li>Organic Social: source=facebook, medium=organic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Tracking</h4>
              <p className="text-sm text-muted-foreground">
                All UTM parameters are automatically captured and stored with analytics events. 
                Signups from campaign pages include full attribution data for ROI analysis.
              </p>
            </div>
          </CardContent>
        </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
