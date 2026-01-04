import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cc_cookie_consent";

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

export function CookieSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      // First check localStorage
      const localConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const analyticsEnabled = localConsent === "accepted";

      // If user is logged in, try to get server-side preferences
      if (user) {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("analytics_enabled, marketing_enabled")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setPreferences({
            analytics: data.analytics_enabled ?? false,
            marketing: data.marketing_enabled ?? false,
          });
        } else {
          // Use localStorage fallback
          setPreferences({
            analytics: analyticsEnabled,
            marketing: false,
          });
        }
      } else {
        setPreferences({
          analytics: analyticsEnabled,
          marketing: false,
        });
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update localStorage
      const consentValue = preferences.analytics ? "accepted" : "declined";
      localStorage.setItem(COOKIE_CONSENT_KEY, consentValue);

      // Update Google Analytics consent
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: preferences.analytics ? "granted" : "denied",
          ad_storage: preferences.marketing ? "granted" : "denied",
        });
      }

      // If user is logged in, save to database
      if (user) {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            cookie_consent: consentValue,
            analytics_enabled: preferences.analytics,
            marketing_enabled: preferences.marketing,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });

        if (error) {
          console.error("Failed to save preferences:", error);
          toast.error("Failed to save preferences to server");
          return;
        }
      }

      toast.success("Cookie preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAll = async () => {
    setPreferences({ analytics: true, marketing: true });
    // Trigger save after state update
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  const handleDeclineAll = async () => {
    setPreferences({ analytics: false, marketing: false });
    // Trigger save after state update
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          Cookie Preferences
        </CardTitle>
        <CardDescription>
          Manage how we use cookies and similar technologies.{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            Learn more
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential cookies - always enabled */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Essential Cookies</Label>
            <p className="text-sm text-muted-foreground">
              Required for the website to function. Cannot be disabled.
            </p>
          </div>
          <Switch checked disabled aria-label="Essential cookies always enabled" />
        </div>

        {/* Analytics cookies */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics-toggle" className="text-base">Analytics Cookies</Label>
            <p className="text-sm text-muted-foreground">
              Help us understand how you use CarbonConstruct to improve the experience.
            </p>
          </div>
          <Switch
            id="analytics-toggle"
            checked={preferences.analytics}
            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
            aria-label="Toggle analytics cookies"
          />
        </div>

        {/* Marketing cookies */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-toggle" className="text-base">Marketing Cookies</Label>
            <p className="text-sm text-muted-foreground">
              Used to deliver relevant advertisements and measure campaign effectiveness.
            </p>
          </div>
          <Switch
            id="marketing-toggle"
            checked={preferences.marketing}
            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
            aria-label="Toggle marketing cookies"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDeclineAll}
            disabled={isSaving}
            className="flex-1"
          >
            Decline All
          </Button>
          <Button
            variant="outline"
            onClick={handleAcceptAll}
            disabled={isSaving}
            className="flex-1"
          >
            Accept All
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
