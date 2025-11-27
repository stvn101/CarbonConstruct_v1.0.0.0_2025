import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Save, Check, Lock } from "lucide-react";
import { UsageDisplay } from "@/components/UsageDisplay";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserSettings {
  defaultAssessmentPeriod: string;
  nccComplianceLevel: string;
  greenStarTarget: string;
  organizationName: string;
  industrySector: string;
  emailNotifications: boolean;
  monthlySummary: boolean;
  emissionFactorDatabase: string;
  defaultElectricityGrid: string;
  lcaMethodology: string;
  includeUncertainty: boolean;
  monteCarloAnalysis: boolean;
}

const defaultSettings: UserSettings = {
  defaultAssessmentPeriod: "12 months",
  nccComplianceLevel: "NCC 2022",
  greenStarTarget: "4 Star",
  organizationName: "",
  industrySector: "Construction",
  emailNotifications: true,
  monthlySummary: true,
  emissionFactorDatabase: "Australian National Greenhouse Accounts 2024",
  defaultElectricityGrid: "Australian NEM Average",
  lcaMethodology: "ISO 14040/14044 Standards",
  includeUncertainty: false,
  monteCarloAnalysis: false,
};

const SETTINGS_KEY = "carbonconstruct_user_settings";

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setHasChanges(false);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your application preferences and account settings</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {hasChanges ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          <UsageDisplay />
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your subscription, payment methods, and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <ManageSubscriptionButton />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your default project preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Assessment Period</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.defaultAssessmentPeriod}
                  onChange={(e) => updateSetting("defaultAssessmentPeriod", e.target.value)}
                >
                  <option>12 months</option>
                  <option>6 months</option>
                  <option>3 months</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  NCC Compliance Level
                  <InfoTooltip content="National Construction Code energy efficiency requirements. NCC 2022 includes updated Section J requirements for building envelope and services." />
                </label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.nccComplianceLevel}
                  onChange={(e) => updateSetting("nccComplianceLevel", e.target.value)}
                >
                  <option>NCC 2022</option>
                  <option>NCC 2019</option>
                  <option>Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Green Star Target
                  <InfoTooltip content="GBCA rating system. 4-Star is best practice, 5-Star is Australian excellence, 6-Star is world leadership." />
                </label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.greenStarTarget}
                  onChange={(e) => updateSetting("greenStarTarget", e.target.value)}
                >
                  <option>4 Star</option>
                  <option>5 Star</option>
                  <option>6 Star</option>
                  <option>World Leadership</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md bg-background" 
                  placeholder="Enter organization name"
                  value={settings.organizationName}
                  onChange={(e) => updateSetting("organizationName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry Sector</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.industrySector}
                  onChange={(e) => updateSetting("industrySector", e.target.value)}
                >
                  <option>Construction</option>
                  <option>Manufacturing</option>
                  <option>Commercial Buildings</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting("emailNotifications", e.target.checked)}
                    />
                    <span className="text-sm">Email notifications for calculation updates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.monthlySummary}
                      onChange={(e) => updateSetting("monthlySummary", e.target.checked)}
                    />
                    <span className="text-sm">Monthly emissions summary reports</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculation Preferences</CardTitle>
              <CardDescription>Set default emission factors and calculation methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Emission Factor Database
                  <InfoTooltip content="Source of emission factors. Australian NGA 2024 is the government standard for GHG reporting." />
                </label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.emissionFactorDatabase}
                  onChange={(e) => updateSetting("emissionFactorDatabase", e.target.value)}
                >
                  <option>Australian National Greenhouse Accounts 2024</option>
                  <option>IPCC Guidelines</option>
                  <option>Custom Database</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Electricity Grid</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.defaultElectricityGrid}
                  onChange={(e) => updateSetting("defaultElectricityGrid", e.target.value)}
                >
                  <option>Australian NEM Average</option>
                  <option>State-specific factors</option>
                  <option>Renewable energy certificates</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  LCA Methodology
                  <InfoTooltip content="Life Cycle Assessment framework for embodied carbon calculations. ISO 14040/14044 is the international standard." />
                </label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.lcaMethodology}
                  onChange={(e) => updateSetting("lcaMethodology", e.target.value)}
                >
                  <option>ISO 14040/14044 Standards</option>
                  <option>Australian Construction LCA</option>
                  <option>Green Building Council LCA</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Uncertainty Analysis
                  <InfoTooltip content="Statistical methods to quantify confidence in emission calculations. Recommended for compliance reporting." />
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={settings.includeUncertainty}
                      onChange={(e) => updateSetting("includeUncertainty", e.target.checked)}
                    />
                    <span className="text-sm">Include uncertainty ranges in calculations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={settings.monteCarloAnalysis}
                      onChange={(e) => updateSetting("monteCarloAnalysis", e.target.checked)}
                    />
                    <span className="text-sm">Monte Carlo sensitivity analysis</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
