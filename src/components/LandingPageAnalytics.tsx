import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, TrendingUp, Users, MousePointer, UserPlus, Eye, BarChart3 } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface AudienceStats {
  audience: string;
  pageViews: number;
  ctaClicks: number;
  signups: number;
  conversionRate: number;
  topSource: string;
  topMedium: string;
}

interface SourceBreakdown {
  source: string;
  views: number;
  clicks: number;
  signups: number;
}

const AUDIENCE_LABELS: Record<string, string> = {
  architects: 'Architects',
  builders: 'Builders',
  developers: 'Developers',
  engineers: 'Engineers',
  estimators: 'Estimators',
  government: 'Government',
  investors: 'Investors',
  procurement: 'Procurement',
  consultants: 'Consultants',
  subcontractors: 'Subcontractors',
  'supply-chain': 'Supply Chain',
  'project-managers': 'Project Managers',
  mba: 'MBA Queensland',
  'mba-nsw': 'MBA NSW',
  'mba-vic': 'MBA Victoria',
  'mba-sa': 'MBA South Australia',
  'mba-wa': 'MBA Western Australia',
  'mba-tas': 'MBA Tasmania',
  'mba-nt': 'MBA Northern Territory',
  'mba-act': 'MBA ACT',
};

export function LandingPageAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AudienceStats[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [dateRange, setDateRange] = useState('7');
  const [totals, setTotals] = useState({
    pageViews: 0,
    ctaClicks: 0,
    signups: 0,
    avgConversion: 0,
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      // Fetch all campaign-related events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .in('event_name', ['campaign_page_view', 'campaign_cta_clicked', 'campaign_signup', 'user_sign_up'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Process stats by audience
      const audienceMap = new Map<string, {
        pageViews: number;
        ctaClicks: number;
        signups: number;
        sources: Map<string, number>;
        mediums: Map<string, number>;
      }>();

      const sourceMap = new Map<string, { views: number; clicks: number; signups: number }>();

      events?.forEach(event => {
        const eventData = event.event_data as Record<string, unknown> | null;
        const audience = eventData?.audience as string || 'unknown';
        const source = eventData?.utm_source as string || 'direct';
        const medium = eventData?.utm_medium as string || 'none';

        // Initialize audience stats
        if (!audienceMap.has(audience)) {
          audienceMap.set(audience, {
            pageViews: 0,
            ctaClicks: 0,
            signups: 0,
            sources: new Map(),
            mediums: new Map(),
          });
        }

        const audienceStats = audienceMap.get(audience)!;

        // Initialize source stats
        if (!sourceMap.has(source)) {
          sourceMap.set(source, { views: 0, clicks: 0, signups: 0 });
        }

        const sourceStats = sourceMap.get(source)!;

        // Update counts based on event type
        if (event.event_name === 'campaign_page_view') {
          audienceStats.pageViews++;
          audienceStats.sources.set(source, (audienceStats.sources.get(source) || 0) + 1);
          audienceStats.mediums.set(medium, (audienceStats.mediums.get(medium) || 0) + 1);
          sourceStats.views++;
        } else if (event.event_name === 'campaign_cta_clicked') {
          audienceStats.ctaClicks++;
          sourceStats.clicks++;
        } else if (event.event_name === 'campaign_signup' || event.event_name === 'user_sign_up') {
          // Check if signup came from a campaign
          if (eventData?.utm_source || eventData?.audience) {
            audienceStats.signups++;
            sourceStats.signups++;
          }
        }
      });

      // Convert to array and calculate conversion rates
      const statsArray: AudienceStats[] = Array.from(audienceMap.entries())
        .filter(([audience]) => audience !== 'unknown')
        .map(([audience, data]) => {
          const topSource = Array.from(data.sources.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
          const topMedium = Array.from(data.mediums.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

          return {
            audience,
            pageViews: data.pageViews,
            ctaClicks: data.ctaClicks,
            signups: data.signups,
            conversionRate: data.pageViews > 0 ? (data.signups / data.pageViews) * 100 : 0,
            topSource,
            topMedium,
          };
        })
        .sort((a, b) => b.pageViews - a.pageViews);

      // Convert source breakdown
      const sourceArray: SourceBreakdown[] = Array.from(sourceMap.entries())
        .map(([source, data]) => ({
          source,
          views: data.views,
          clicks: data.clicks,
          signups: data.signups,
        }))
        .sort((a, b) => b.views - a.views);

      // Calculate totals
      const totalPageViews = statsArray.reduce((sum, s) => sum + s.pageViews, 0);
      const totalCtaClicks = statsArray.reduce((sum, s) => sum + s.ctaClicks, 0);
      const totalSignups = statsArray.reduce((sum, s) => sum + s.signups, 0);
      const avgConversion = totalPageViews > 0 ? (totalSignups / totalPageViews) * 100 : 0;

      setStats(statsArray);
      setSourceBreakdown(sourceArray);
      setTotals({
        pageViews: totalPageViews,
        ctaClicks: totalCtaClicks,
        signups: totalSignups,
        avgConversion,
      });
    } catch (error) {
      console.error('Error loading landing page analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const getAudienceLabel = (audience: string) => {
    return AUDIENCE_LABELS[audience] || audience.charAt(0).toUpperCase() + audience.slice(1);
  };

  const maxPageViews = Math.max(...stats.map(s => s.pageViews), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Landing Page Analytics</h2>
          <p className="text-muted-foreground">Track conversion rates by audience segment</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button onClick={loadStats} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{totals.pageViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <MousePointer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CTA Clicks</p>
                <p className="text-2xl font-bold">{totals.ctaClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signups</p>
                <p className="text-2xl font-bold">{totals.signups.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold">{totals.avgConversion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Audience Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance by Audience
            </CardTitle>
            <CardDescription>
              Conversion funnel metrics for each landing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaign data for this period</p>
                <p className="text-sm">Try extending the date range or visit some landing pages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.audience} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getAudienceLabel(stat.audience)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stat.topSource}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span title="Page Views">{stat.pageViews} views</span>
                        <span title="CTA Clicks">{stat.ctaClicks} clicks</span>
                        <span title="Signups" className="text-emerald-600 font-medium">
                          {stat.signups} signups
                        </span>
                        <Badge 
                          variant={stat.conversionRate > 5 ? "default" : "secondary"}
                          className={stat.conversionRate > 5 ? "bg-emerald-600" : ""}
                        >
                          {stat.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(stat.pageViews / maxPageViews) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              Where your visitors come from
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sourceBreakdown.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No source data available
              </div>
            ) : (
              <div className="space-y-3">
                {sourceBreakdown.slice(0, 8).map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm capitalize">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{source.views}</span>
                      <span className="text-emerald-600">{source.signups} signups</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Landing pages with the highest conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {stats
                .filter(s => s.pageViews >= 5)
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 3)
                .map((stat, index) => (
                  <div 
                    key={stat.audience}
                    className="p-4 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-emerald-600">#{index + 1}</span>
                      <span className="font-medium">{getAudienceLabel(stat.audience)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Conversion</span>
                        <p className="font-semibold">{stat.conversionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Signups</span>
                        <p className="font-semibold">{stat.signups}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LandingPageAnalytics;
