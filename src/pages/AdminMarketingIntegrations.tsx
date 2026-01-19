import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { AdminSidebar } from '@/components/AdminSidebar';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Cookie,
  BarChart3,
  Target,
  Code,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCookiePreferences, resetCookieConsent } from '@/components/CookieConsent';

interface TrackingScript {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'pending' | 'error';
  consentRequired: 'essential' | 'analytics' | 'marketing';
  enabled: boolean;
  lastChecked?: string;
  containerId?: string;
  documentation?: string;
}

const GTM_CONTAINER_ID = 'GTM-XXXXXXX'; // Replace with actual GTM ID

export default function AdminMarketingIntegrations() {
  const [scripts, setScripts] = useState<TrackingScript[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [consentStats, setConsentStats] = useState({
    analytics: false,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    checkTrackingStatus();
    loadConsentStats();
  }, []);

  const loadConsentStats = () => {
    const prefs = getCookiePreferences();
    if (prefs) {
      setConsentStats({
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        timestamp: prefs.timestamp,
      });
    }
  };

  const checkTrackingStatus = () => {
    setIsRefreshing(true);
    
    const prefs = getCookiePreferences();
    const win = window as any;
    
    const trackingScripts: TrackingScript[] = [
      {
        id: 'gtm',
        name: 'Google Tag Manager',
        description: 'Central tag management system for all marketing and analytics tags',
        icon: <Settings className="h-5 w-5" />,
        status: win.google_tag_manager ? 'active' : 'inactive',
        consentRequired: 'essential',
        enabled: true,
        containerId: GTM_CONTAINER_ID,
        documentation: 'https://tagmanager.google.com/',
        lastChecked: new Date().toISOString(),
      },
      {
        id: 'ga4',
        name: 'Google Analytics 4',
        description: 'Website analytics and user behavior tracking',
        icon: <BarChart3 className="h-5 w-5" />,
        status: win.gaLoaded && win.gtag ? 'active' : (prefs?.analytics ? 'pending' : 'inactive'),
        consentRequired: 'analytics',
        enabled: prefs?.analytics ?? false,
        containerId: 'G-LW6J3XSWX2',
        documentation: 'https://analytics.google.com/',
        lastChecked: new Date().toISOString(),
      },
      {
        id: 'apollo',
        name: 'Apollo.io',
        description: 'B2B lead tracking and prospecting integration',
        icon: <Target className="h-5 w-5" />,
        status: win.apolloLoaded ? 'active' : (prefs?.marketing ? 'pending' : 'inactive'),
        consentRequired: 'marketing',
        enabled: prefs?.marketing ?? false,
        containerId: '696d96f0b5e49900193ebcf6',
        documentation: 'https://apollo.io/integrations',
        lastChecked: new Date().toISOString(),
      },
    ];
    
    setScripts(trackingScripts);
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: TrackingScript['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
    }
  };

  const getConsentBadge = (consent: TrackingScript['consentRequired']) => {
    switch (consent) {
      case 'essential':
        return <Badge variant="outline" className="text-xs">Essential</Badge>;
      case 'analytics':
        return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">Analytics</Badge>;
      case 'marketing':
        return <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">Marketing</Badge>;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleResetConsent = () => {
    resetCookieConsent();
    toast.success('Cookie consent reset - refresh to see the banner');
    loadConsentStats();
    checkTrackingStatus();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SEOHead 
        title="Marketing Integrations | Admin"
        description="Manage marketing tracking scripts and integrations"
        noIndex={true}
      />
      
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Marketing Integrations</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage tracking scripts and marketing integrations
              </p>
            </div>
            <Button 
              onClick={checkTrackingStatus} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          <Tabs defaultValue="status" className="space-y-6">
            <TabsList>
              <TabsTrigger value="status">
                <Activity className="h-4 w-4 mr-2" />
                Status
              </TabsTrigger>
              <TabsTrigger value="consent">
                <Cookie className="h-4 w-4 mr-2" />
                Consent
              </TabsTrigger>
              <TabsTrigger value="implementation">
                <Code className="h-4 w-4 mr-2" />
                Implementation
              </TabsTrigger>
            </TabsList>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Scripts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                      {scripts.filter(s => s.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">of {scripts.length} total</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Analytics Consent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${consentStats.analytics ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {consentStats.analytics ? 'Granted' : 'Denied'}
                    </div>
                    <p className="text-xs text-muted-foreground">Current session</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Marketing Consent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${consentStats.marketing ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {consentStats.marketing ? 'Granted' : 'Denied'}
                    </div>
                    <p className="text-xs text-muted-foreground">Current session</p>
                  </CardContent>
                </Card>
              </div>

              {/* Script Status Cards */}
              <div className="grid gap-4">
                {scripts.map((script) => (
                  <Card key={script.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            {script.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{script.name}</h3>
                              {getStatusBadge(script.status)}
                              {getConsentBadge(script.consentRequired)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{script.description}</p>
                            {script.containerId && (
                              <div className="flex items-center gap-2 mt-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded">{script.containerId}</code>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard(script.containerId!, 'Container ID')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {script.documentation && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={script.documentation} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Docs
                              </a>
                            </Button>
                          )}
                          {script.lastChecked && (
                            <span className="text-xs text-muted-foreground">
                              Last checked: {new Date(script.lastChecked).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Consent Tab */}
            <TabsContent value="consent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cookie Consent Management</CardTitle>
                  <CardDescription>
                    Current consent status for the admin session. Users control their own consent via the cookie banner.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Essential Cookies</Label>
                        <p className="text-sm text-muted-foreground">Required for site functionality</p>
                      </div>
                      <Switch checked disabled aria-label="Essential cookies always enabled" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Analytics Cookies</Label>
                        <p className="text-sm text-muted-foreground">GA4 tracking enabled</p>
                      </div>
                      <Switch checked={consentStats.analytics} disabled aria-label="Analytics consent status" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Marketing Cookies</Label>
                        <p className="text-sm text-muted-foreground">Apollo.io tracking enabled</p>
                      </div>
                      <Switch checked={consentStats.marketing} disabled aria-label="Marketing consent status" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Consent Timestamp</Label>
                        <p className="text-sm text-muted-foreground">
                          {consentStats.timestamp 
                            ? new Date(consentStats.timestamp).toLocaleString() 
                            : 'No consent recorded'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleResetConsent}>
                        Reset Consent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Implementation Tab */}
            <TabsContent value="implementation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Tag Manager Setup</CardTitle>
                  <CardDescription>
                    GTM container configuration for centralized tag management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>GTM Container ID</Label>
                    <div className="flex gap-2">
                      <Input value={GTM_CONTAINER_ID} readOnly className="font-mono" />
                      <Button variant="outline" onClick={() => copyToClipboard(GTM_CONTAINER_ID, 'GTM Container ID')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Update the GTM_CONTAINER_ID constant in this file with your actual container ID
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Implementation Checklist</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        GTM script added to index.html
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        CSP headers updated for GTM domains
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Consent mode v2 implemented
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        GA4 integrated with consent checks
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Apollo.io tracking with marketing consent
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Script Loading Strategy</CardTitle>
                  <CardDescription>
                    How tracking scripts are loaded to optimize performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Deferred Loading</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        All tracking scripts are deferred until after user interaction or 3 seconds, 
                        whichever comes first. This protects Core Web Vitals (LCP, FID).
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Consent Gating</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analytics and marketing scripts only load after explicit user consent 
                        is granted via the cookie banner (GDPR/Australian Privacy Act compliant).
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">CSP Protection</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Content Security Policy headers whitelist only approved script sources: 
                        GTM, GA4, Apollo.io, and Stripe for payments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
