import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  TrendingUp, 
  Users, 
  UserPlus, 
  Eye, 
  BarChart3,
  ArrowRight,
  Filter,
  Download,
  Zap
} from 'lucide-react';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface UTMCampaign {
  campaign: string;
  source: string;
  medium: string;
  views: number;
  clicks: number;
  signups: number;
  leads: number;
  conversionRate: number;
}

interface LeadAttribution {
  source: string;
  leads: number;
  percentage: number;
  avgTimeToConvert: string;
}

interface DailyMetric {
  date: string;
  views: number;
  signups: number;
}

export function MarketingAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [utmCampaigns, setUtmCampaigns] = useState<UTMCampaign[]>([]);
  const [leadAttribution, setLeadAttribution] = useState<LeadAttribution[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [totals, setTotals] = useState({
    totalViews: 0,
    totalSignups: 0,
    totalLeads: 0,
    overallConversion: 0,
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      // Fetch all analytics events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process funnel data
      const funnelCounts = {
        pageView: 0,
        ctaClick: 0,
        signup: 0,
        lead: 0,
      };

      // UTM campaign tracking
      const campaignMap = new Map<string, {
        source: string;
        medium: string;
        views: number;
        clicks: number;
        signups: number;
        leads: number;
      }>();

      // Lead attribution tracking
      const sourceLeadMap = new Map<string, { leads: number; totalTime: number }>();

      // Daily metrics tracking
      const dailyMap = new Map<string, { views: number; signups: number }>();

      events?.forEach(event => {
        const eventData = event.event_data as Record<string, unknown> | null;
        const utmCampaign = (eventData?.utm_campaign as string) || 'direct';
        const utmSource = (eventData?.utm_source as string) || 'direct';
        const utmMedium = (eventData?.utm_medium as string) || 'none';
        const dateKey = format(new Date(event.created_at), 'yyyy-MM-dd');

        // Initialize daily tracking
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { views: 0, signups: 0 });
        }

        // Initialize campaign tracking
        const campaignKey = `${utmCampaign}|${utmSource}|${utmMedium}`;
        if (!campaignMap.has(campaignKey)) {
          campaignMap.set(campaignKey, {
            source: utmSource,
            medium: utmMedium,
            views: 0,
            clicks: 0,
            signups: 0,
            leads: 0,
          });
        }

        const campaignData = campaignMap.get(campaignKey)!;
        const dailyData = dailyMap.get(dateKey)!;

        // Count by event type
        switch (event.event_name) {
          case 'campaign_page_view':
          case 'page_view':
            funnelCounts.pageView++;
            campaignData.views++;
            dailyData.views++;
            break;
          case 'campaign_cta_clicked':
          case 'cta_clicked':
            funnelCounts.ctaClick++;
            campaignData.clicks++;
            break;
          case 'campaign_signup':
          case 'user_sign_up':
            funnelCounts.signup++;
            campaignData.signups++;
            dailyData.signups++;
            break;
          case 'whitepaper_download':
          case 'whitepaper_popup_download':
          case 'lead_captured':
            funnelCounts.lead++;
            campaignData.leads++;
            
            // Track source attribution
            if (!sourceLeadMap.has(utmSource)) {
              sourceLeadMap.set(utmSource, { leads: 0, totalTime: 0 });
            }
            sourceLeadMap.get(utmSource)!.leads++;
            break;
        }
      });

      // Build funnel stages
      const funnel: FunnelStage[] = [
        {
          name: 'Page Views',
          count: funnelCounts.pageView,
          percentage: 100,
          dropoff: 0,
        },
        {
          name: 'CTA Clicks',
          count: funnelCounts.ctaClick,
          percentage: funnelCounts.pageView > 0 ? (funnelCounts.ctaClick / funnelCounts.pageView) * 100 : 0,
          dropoff: funnelCounts.pageView > 0 ? ((funnelCounts.pageView - funnelCounts.ctaClick) / funnelCounts.pageView) * 100 : 0,
        },
        {
          name: 'Signups',
          count: funnelCounts.signup,
          percentage: funnelCounts.pageView > 0 ? (funnelCounts.signup / funnelCounts.pageView) * 100 : 0,
          dropoff: funnelCounts.ctaClick > 0 ? ((funnelCounts.ctaClick - funnelCounts.signup) / funnelCounts.ctaClick) * 100 : 0,
        },
        {
          name: 'Leads (Downloads)',
          count: funnelCounts.lead,
          percentage: funnelCounts.pageView > 0 ? (funnelCounts.lead / funnelCounts.pageView) * 100 : 0,
          dropoff: funnelCounts.signup > 0 ? ((funnelCounts.signup - funnelCounts.lead) / funnelCounts.signup) * 100 : 0,
        },
      ];

      // Build UTM campaigns array
      const campaigns: UTMCampaign[] = Array.from(campaignMap.entries())
        .map(([key, data]) => {
          const [campaign] = key.split('|');
          return {
            campaign,
            source: data.source,
            medium: data.medium,
            views: data.views,
            clicks: data.clicks,
            signups: data.signups,
            leads: data.leads,
            conversionRate: data.views > 0 ? (data.signups / data.views) * 100 : 0,
          };
        })
        .filter(c => c.views > 0)
        .sort((a, b) => b.views - a.views);

      // Build lead attribution
      const totalLeads = Array.from(sourceLeadMap.values()).reduce((sum, s) => sum + s.leads, 0);
      const attribution: LeadAttribution[] = Array.from(sourceLeadMap.entries())
        .map(([source, data]) => ({
          source,
          leads: data.leads,
          percentage: totalLeads > 0 ? (data.leads / totalLeads) * 100 : 0,
          avgTimeToConvert: 'N/A', // Would need session tracking for this
        }))
        .sort((a, b) => b.leads - a.leads);

      // Build daily metrics
      const daily: DailyMetric[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          views: data.views,
          signups: data.signups,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setFunnelData(funnel);
      setUtmCampaigns(campaigns);
      setLeadAttribution(attribution);
      setDailyMetrics(daily);
      setTotals({
        totalViews: funnelCounts.pageView,
        totalSignups: funnelCounts.signup,
        totalLeads: funnelCounts.lead,
        overallConversion: funnelCounts.pageView > 0 ? (funnelCounts.signup / funnelCounts.pageView) * 100 : 0,
      });
    } catch (error) {
      console.error('Error loading marketing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const exportData = () => {
    const data = {
      dateRange: `Last ${dateRange} days`,
      exportedAt: new Date().toISOString(),
      funnel: funnelData,
      campaigns: utmCampaigns,
      attribution: leadAttribution,
      totals,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Marketing Analytics</h2>
          <p className="text-muted-foreground">Conversion funnels, UTM performance, and lead attribution</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadAnalytics} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Page Views</p>
                <p className="text-xl font-bold">{totals.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Signups</p>
                <p className="text-xl font-bold">{totals.totalSignups.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="text-xl font-bold">{totals.totalLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-xl font-bold">{totals.overallConversion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            Track visitors through each stage of the marketing funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">{stage.count.toLocaleString()}</span>
                      <Badge variant={stage.percentage > 50 ? "default" : "secondary"}>
                        {stage.percentage.toFixed(1)}%
                      </Badge>
                      {index > 0 && stage.dropoff > 0 && (
                        <span className="text-xs text-destructive">
                          -{stage.dropoff.toFixed(0)}% dropoff
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={stage.percentage} 
                    className="h-3"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* UTM Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              UTM Campaign Performance
            </CardTitle>
            <CardDescription>
              Traffic and conversions by campaign source
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : utmCampaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaign data for this period</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {utmCampaigns.slice(0, 10).map((campaign, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate max-w-[150px]" title={campaign.campaign}>
                          {campaign.campaign}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {campaign.source}
                        </Badge>
                      </div>
                      <Badge className={campaign.conversionRate > 5 ? "bg-emerald-600" : ""}>
                        {campaign.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-foreground font-medium">{campaign.views}</span>
                        Views
                      </div>
                      <div>
                        <span className="block text-foreground font-medium">{campaign.clicks}</span>
                        Clicks
                      </div>
                      <div>
                        <span className="block text-emerald-500 font-medium">{campaign.signups}</span>
                        Signups
                      </div>
                      <div>
                        <span className="block text-purple-500 font-medium">{campaign.leads}</span>
                        Leads
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Attribution
            </CardTitle>
            <CardDescription>
              Which sources generate the most leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : leadAttribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No lead data for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leadAttribution.map((source) => (
                  <div key={source.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{source.source}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{source.leads} leads</span>
                        <Badge variant="secondary">{source.percentage.toFixed(0)}%</Badge>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Mini Chart */}
      {dailyMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Trend</CardTitle>
            <CardDescription>Views and signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-1">
              {dailyMetrics.slice(-30).map((day) => {
                const maxViews = Math.max(...dailyMetrics.map(d => d.views), 1);
                const heightPercent = (day.views / maxViews) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-primary/20 rounded-t relative group cursor-pointer hover:bg-primary/30 transition-colors"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    title={`${day.date}: ${day.views} views, ${day.signups} signups`}
                  >
                    {day.signups > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t"
                        style={{ height: `${(day.signups / day.views) * 100}%` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{dailyMetrics[0]?.date}</span>
              <span>{dailyMetrics[dailyMetrics.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MarketingAnalyticsDashboard;
