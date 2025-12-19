import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Eye, FlaskConical, Users, ArrowRight, Check, ExternalLink, BarChart3, Send, TrendingUp, MousePointer, Mail } from "lucide-react";
import { 
  getAllEmailTemplates, 
  generateEmailHTML, 
  generateEmailPlainText,
  getABTestVariants,
  type ABTestVariant
} from "@/lib/email-campaign-templates";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CampaignAnalytics {
  audience: string;
  variant: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

export default function AdminEmailCampaigns() {
  const templates = getAllEmailTemplates();
  const [selectedAudience, setSelectedAudience] = useState<string>(templates[0]?.audience || "");
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B">("A");
  const [previewFormat, setPreviewFormat] = useState<"html" | "text">("html");
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"templates" | "analytics">("templates");

  const selectedTemplate = templates.find(t => t.audience === selectedAudience);
  const abVariants = selectedTemplate ? getABTestVariants(selectedTemplate) : null;
  const currentVariant = abVariants?.[selectedVariant === "A" ? 0 : 1];

  // Fetch campaign analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('audience, variant, sent_at, opened_at, clicked_at, converted_at');
      
      if (error) throw error;
      
      // Aggregate analytics by audience and variant
      const aggregated: Record<string, CampaignAnalytics> = {};
      
      (data || []).forEach((row: any) => {
        const key = `${row.audience}-${row.variant}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            audience: row.audience,
            variant: row.variant,
            total_sent: 0,
            total_opened: 0,
            total_clicked: 0,
            total_converted: 0,
            open_rate: 0,
            click_rate: 0,
            conversion_rate: 0,
          };
        }
        aggregated[key].total_sent++;
        if (row.opened_at) aggregated[key].total_opened++;
        if (row.clicked_at) aggregated[key].total_clicked++;
        if (row.converted_at) aggregated[key].total_converted++;
      });
      
      // Calculate rates
      Object.values(aggregated).forEach(stats => {
        if (stats.total_sent > 0) {
          stats.open_rate = (stats.total_opened / stats.total_sent) * 100;
          stats.click_rate = (stats.total_clicked / stats.total_sent) * 100;
          stats.conversion_rate = (stats.total_converted / stats.total_sent) * 100;
        }
      });
      
      return Object.values(aggregated);
    },
  });

  const filteredTemplates = templates.filter(t => 
    t.audienceLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.audience.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} copied to clipboard`);
  };

  const copySubjectLine = () => {
    if (currentVariant) {
      copyToClipboard(currentVariant.subject, "Subject line");
    }
  };

  const copyCTA = () => {
    if (currentVariant) {
      copyToClipboard(currentVariant.ctaText, "CTA text");
    }
  };

  const copyPreheader = () => {
    if (currentVariant) {
      copyToClipboard(currentVariant.preheader, "Preheader");
    }
  };

  const copyFullEmail = () => {
    if (selectedTemplate && currentVariant) {
      const modifiedTemplate = {
        ...selectedTemplate,
        subject: currentVariant.subject,
        ctaText: currentVariant.ctaText,
        preheader: currentVariant.preheader,
      };
      const content = previewFormat === "html" 
        ? generateEmailHTML(modifiedTemplate)
        : generateEmailPlainText(modifiedTemplate);
      copyToClipboard(content, `Full ${previewFormat.toUpperCase()} email`);
    }
  };

  const getVariantColor = (variant: "A" | "B") => {
    return variant === "A" ? "bg-blue-500/10 text-blue-600 border-blue-200" : "bg-purple-500/10 text-purple-600 border-purple-200";
  };

  const getAnalyticsForAudience = (audience: string) => {
    if (!analyticsData) return { A: null, B: null };
    const variantA = analyticsData.find(a => a.audience === audience && a.variant === 'A');
    const variantB = analyticsData.find(a => a.audience === audience && a.variant === 'B');
    return { A: variantA, B: variantB };
  };

  // Calculate totals for analytics overview
  const analyticsTotals = analyticsData?.reduce((acc, curr) => ({
    sent: acc.sent + curr.total_sent,
    opened: acc.opened + curr.total_opened,
    clicked: acc.clicked + curr.total_clicked,
    converted: acc.converted + curr.total_converted,
  }), { sent: 0, opened: 0, clicked: 0, converted: 0 }) || { sent: 0, opened: 0, clicked: 0, converted: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Campaign Manager</h1>
            <p className="text-muted-foreground mt-1">
              Preview, test, and track personalized email campaigns with A/B testing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {templates.length} Segments
            </Badge>
            <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <FlaskConical className="h-3 w-3" />
              A/B Testing
            </Badge>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "templates" | "analytics")}>
          <TabsList>
            <TabsTrigger value="templates" className="gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Send className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analyticsTotals.sent}</div>
                      <div className="text-sm text-muted-foreground">Emails Sent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Eye className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {analyticsTotals.sent > 0 ? ((analyticsTotals.opened / analyticsTotals.sent) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Open Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <MousePointer className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {analyticsTotals.sent > 0 ? ((analyticsTotals.clicked / analyticsTotals.sent) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Click Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {analyticsTotals.sent > 0 ? ((analyticsTotals.converted / analyticsTotals.sent) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* A/B Test Performance by Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  A/B Test Performance by Audience
                </CardTitle>
                <CardDescription>
                  Compare variant performance to identify winning combinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
                ) : !analyticsData || analyticsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No campaign data yet. Send your first campaign to see analytics.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.slice(0, 8).map(template => {
                      const analytics = getAnalyticsForAudience(template.audience);
                      const hasData = analytics.A || analytics.B;
                      
                      return (
                        <div key={template.audience} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">{template.audienceLabel}</div>
                            {!hasData && (
                              <Badge variant="outline" className="text-xs">No data</Badge>
                            )}
                          </div>
                          {hasData && (
                            <div className="grid grid-cols-2 gap-4">
                              {/* Variant A */}
                              <div className={`p-3 rounded-lg ${analytics.A ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-muted/50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">A</Badge>
                                  {analytics.A && analytics.B && analytics.A.click_rate > analytics.B.click_rate && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">Winner</Badge>
                                  )}
                                </div>
                                {analytics.A ? (
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <div className="text-muted-foreground text-xs">Sent</div>
                                      <div className="font-medium">{analytics.A.total_sent}</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">Opens</div>
                                      <div className="font-medium">{analytics.A.open_rate.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">Clicks</div>
                                      <div className="font-medium">{analytics.A.click_rate.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">No data</div>
                                )}
                              </div>
                              
                              {/* Variant B */}
                              <div className={`p-3 rounded-lg ${analytics.B ? 'bg-purple-50 dark:bg-purple-950/20' : 'bg-muted/50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">B</Badge>
                                  {analytics.A && analytics.B && analytics.B.click_rate > analytics.A.click_rate && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">Winner</Badge>
                                  )}
                                </div>
                                {analytics.B ? (
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <div className="text-muted-foreground text-xs">Sent</div>
                                      <div className="font-medium">{analytics.B.total_sent}</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">Opens</div>
                                      <div className="font-medium">{analytics.B.open_rate.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">Clicks</div>
                                      <div className="font-medium">{analytics.B.click_rate.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">No data</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar - Template List */}
              <div className="lg:col-span-3">
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Audience Segments</CardTitle>
                    <Input 
                      placeholder="Search segments..." 
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="mt-2"
                    />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {filteredTemplates.map((template) => (
                        <button
                          key={template.audience}
                          onClick={() => setSelectedAudience(template.audience)}
                          className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-muted/50 ${
                            selectedAudience === template.audience ? "bg-primary/5 border-l-2 border-l-primary" : ""
                          }`}
                        >
                          <div className="font-medium text-sm">{template.audienceLabel}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {template.landingPagePath}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-6">
                {selectedTemplate && abVariants && currentVariant && (
                  <>
                    {/* A/B Test Controls */}
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FlaskConical className="h-5 w-5 text-primary" />
                              A/B Test Variants
                            </CardTitle>
                            <CardDescription>
                              Compare subject lines, preheaders, CTAs, and testimonial placement
                            </CardDescription>
                          </div>
                          <a 
                            href={selectedTemplate.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            View Landing Page <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {abVariants.map((variant: ABTestVariant, index: number) => {
                            const variantLabel = index === 0 ? "A" : "B";
                            const isSelected = selectedVariant === variantLabel;
                            return (
                              <div
                                key={variantLabel}
                                onClick={() => setSelectedVariant(variantLabel as "A" | "B")}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected 
                                    ? `${getVariantColor(variantLabel as "A" | "B")} border-current` 
                                    : "border-border hover:border-muted-foreground/50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Badge className={getVariantColor(variantLabel as "A" | "B")}>
                                    Variant {variantLabel}
                                  </Badge>
                                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Subject Line</div>
                                    <div className="text-sm font-medium">{variant.subject}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Preheader</div>
                                    <div className="text-sm text-muted-foreground">{variant.preheader}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">CTA Button</div>
                                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium">
                                      {variant.ctaText}
                                      <ArrowRight className="h-3 w-3" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Testimonial Position</div>
                                    <Badge variant="outline" className="text-xs">
                                      {variant.testimonialPosition === 'before-cta' ? 'Before CTA' : 
                                       variant.testimonialPosition === 'after-benefits' ? 'After Benefits' : 'Hidden'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Copy Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Quick Copy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={copySubjectLine}>
                            <Copy className="h-3 w-3 mr-1" />
                            Subject Line
                          </Button>
                          <Button variant="outline" size="sm" onClick={copyPreheader}>
                            <Copy className="h-3 w-3 mr-1" />
                            Preheader
                          </Button>
                          <Button variant="outline" size="sm" onClick={copyCTA}>
                            <Copy className="h-3 w-3 mr-1" />
                            CTA Text
                          </Button>
                          <Button variant="outline" size="sm" onClick={copyFullEmail}>
                            <Copy className="h-3 w-3 mr-1" />
                            Full Email ({previewFormat.toUpperCase()})
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard(selectedTemplate.ctaUrl, "Landing page URL")}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Landing URL
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Email Preview */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Email Preview</CardTitle>
                          </div>
                          <Tabs value={previewFormat} onValueChange={(v) => setPreviewFormat(v as "html" | "text")}>
                            <TabsList className="h-8">
                              <TabsTrigger value="html" className="text-xs px-3">HTML</TabsTrigger>
                              <TabsTrigger value="text" className="text-xs px-3">Plain Text</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <CardDescription>
                          Previewing <Badge variant="outline" className={getVariantColor(selectedVariant)}>Variant {selectedVariant}</Badge> for {selectedTemplate.audienceLabel}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg overflow-hidden bg-white">
                          {/* Email Header Simulation */}
                          <div className="bg-muted/50 border-b px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground w-16">From:</span>
                              <span className="font-medium">CarbonConstruct &lt;notifications@carbonconstruct.com.au&gt;</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground w-16">Subject:</span>
                              <span className="font-medium">{currentVariant.subject}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground w-16">Preview:</span>
                              <span className="text-muted-foreground">{currentVariant.preheader}</span>
                            </div>
                          </div>
                          
                          {/* Email Body */}
                          <div className="p-4">
                            {previewFormat === "html" ? (
                              <iframe
                                srcDoc={generateEmailHTML({
                                  ...selectedTemplate,
                                  subject: currentVariant.subject,
                                  ctaText: currentVariant.ctaText,
                                  preheader: currentVariant.preheader,
                                })}
                                className="w-full h-[600px] border-0"
                                title="Email Preview"
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-4 rounded overflow-auto max-h-[600px]">
                                {generateEmailPlainText({
                                  ...selectedTemplate,
                                  subject: currentVariant.subject,
                                  ctaText: currentVariant.ctaText,
                                  preheader: currentVariant.preheader,
                                })}
                              </pre>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Template Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Template Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Audience</div>
                            <div className="font-medium">{selectedTemplate.audienceLabel}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Landing Page</div>
                            <div className="font-medium">{selectedTemplate.landingPagePath}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Headline</div>
                            <div className="font-medium">{selectedTemplate.headline}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Testimonial Position</div>
                            <Badge variant="outline">{currentVariant.testimonialPosition}</Badge>
                          </div>
                        </div>
                        
                        {selectedTemplate.testimonial && (
                          <div className="border-t pt-4">
                            <div className="text-muted-foreground mb-2 text-sm">Testimonial</div>
                            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-sm">
                              "{selectedTemplate.testimonial.quote}"
                              <footer className="text-muted-foreground mt-1 not-italic">
                                — {selectedTemplate.testimonial.author}, {selectedTemplate.testimonial.role}
                              </footer>
                            </blockquote>
                          </div>
                        )}

                        {selectedTemplate.urgencyMessage && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                              ⚡ {selectedTemplate.urgencyMessage}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
