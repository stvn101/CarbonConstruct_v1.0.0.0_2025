import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "cc_cookie_consent";
const COOKIE_PREFERENCES_KEY = "cc_cookie_preferences";
const CONSENT_VERSION = "1.0"; // Increment when consent requirements change

type ConsentStatus = "accepted" | "declined" | "customized" | null;

interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  timestamp: new Date().toISOString(),
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    // Check if consent exists and is current version
    if (consent && savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs) as CookiePreferences;
        // Show banner again if consent version has changed
        if (parsedPrefs.version !== CONSENT_VERSION) {
          const timer = setTimeout(() => setShowBanner(true), 1000);
          return () => clearTimeout(timer);
        }
        setPreferences(parsedPrefs);
        applyPreferences(parsedPrefs);
      } catch {
        const timer = setTimeout(() => setShowBanner(true), 1000);
        return () => clearTimeout(timer);
      }
    } else if (!consent) {
      // Small delay to not show immediately on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: prefs.marketing ? "granted" : "denied",
      });
    }
  };

  const savePreferences = (newPrefs: CookiePreferences, status: ConsentStatus) => {
    const prefsWithMeta = {
      ...newPrefs,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, status || "customized");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefsWithMeta));
    setPreferences(prefsWithMeta);
    applyPreferences(prefsWithMeta);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    savePreferences(allAccepted, "accepted");
  };

  const handleDeclineAll = () => {
    const allDeclined: CookiePreferences = {
      essential: true, // Essential is always true
      analytics: false,
      marketing: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    savePreferences(allDeclined, "declined");
  };

  const handleSavePreferences = () => {
    savePreferences(preferences, "customized");
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return; // Cannot disable essential
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-description"
    >
      <Card className="max-w-4xl mx-auto p-4 md:p-6 bg-card/95 backdrop-blur-sm border shadow-elevated">
        <div className="space-y-4">
          {/* Main Banner Content */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  We use cookies to improve your experience
                </p>
                <p id="cookie-description" className="text-xs text-muted-foreground">
                  We use essential cookies for site functionality and optional cookies for analytics and marketing. 
                  You can customize your preferences or accept/decline all non-essential cookies.{" "}
                  <Link to="/cookies" className="text-primary hover:underline">
                    View our cookie policy
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex-1 md:flex-none"
                aria-expanded={showPreferences}
                aria-controls="cookie-preferences"
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage
                {showPreferences ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeclineAll}
                className="flex-1 md:flex-none"
              >
                Decline All
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="flex-1 md:flex-none"
              >
                Accept All
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeclineAll}
                className="h-8 w-8 shrink-0 md:hidden"
                aria-label="Close cookie banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && (
            <div 
              id="cookie-preferences"
              className="border-t pt-4 mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
            >
              <h3 className="text-sm font-semibold text-foreground">Cookie Preferences</h3>
              
              {/* Essential Cookies */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Essential Cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Required for the website to function. Cannot be disabled.
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled
                  aria-label="Essential cookies (always on)"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics-cookies" className="text-sm font-medium">Analytics Cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how you use CarbonConstruct to improve the experience.
                  </p>
                </div>
                <Switch
                  id="analytics-cookies"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handlePreferenceChange("analytics", checked)}
                  aria-label="Analytics cookies"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-cookies" className="text-sm font-medium">Marketing Cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Used to show you relevant content and measure advertising effectiveness.
                  </p>
                </div>
                <Switch
                  id="marketing-cookies"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handlePreferenceChange("marketing", checked)}
                  aria-label="Marketing cookies"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Utility to check consent status
export function getCookieConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent as ConsentStatus;
}

// Utility to get cookie preferences
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!prefs) return null;
  try {
    return JSON.parse(prefs) as CookiePreferences;
  } catch {
    return null;
  }
}

// Utility to check if analytics is allowed
export function isAnalyticsAllowed(): boolean {
  const prefs = getCookiePreferences();
  return prefs?.analytics ?? false;
}

// Utility to check if marketing is allowed
export function isMarketingAllowed(): boolean {
  const prefs = getCookiePreferences();
  return prefs?.marketing ?? false;
}

// Utility to reset consent (for testing or user request)
export function resetCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_PREFERENCES_KEY);
}
