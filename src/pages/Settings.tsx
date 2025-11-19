import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { UsageDisplay } from "@/components/UsageDisplay";
import { WebhookStatusCard } from "@/components/WebhookStatusCard";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { DataMigration } from "@/components/DataMigration";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { MaterialsImporter } from "@/components/MaterialsImporter";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences and account settings</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
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
            
            <MaterialsImporter />
            
            <DataMigration />
            
            <WebhookStatusCard />
          
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your default project preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Assessment Period</label>
                <select className="w-full p-2 border rounded-md">
                  <option>12 months</option>
                  <option>6 months</option>
                  <option>3 months</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">NCC Compliance Level</label>
                <select className="w-full p-2 border rounded-md">
                  <option>NCC 2022</option>
                  <option>NCC 2019</option>
                  <option>Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Green Star Target</label>
                <select className="w-full p-2 border rounded-md">
                  <option>4 Star</option>
                  <option>5 Star</option>
                  <option>6 Star</option>
                  <option>World Leadership</option>
                </select>
              </div>
            </CardContent>
          </Card>

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
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter organization name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry Sector</label>
                <select className="w-full p-2 border rounded-md">
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
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Email notifications for calculation updates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
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
                <label className="text-sm font-medium">Emission Factor Database</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Australian National Greenhouse Accounts 2024</option>
                  <option>IPCC Guidelines</option>
                  <option>Custom Database</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Electricity Grid</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Australian NEM Average</option>
                  <option>State-specific factors</option>
                  <option>Renewable energy certificates</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LCA Methodology</label>
                <select className="w-full p-2 border rounded-md">
                  <option>ISO 14040/14044 Standards</option>
                  <option>Australian Construction LCA</option>
                  <option>Green Building Council LCA</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Uncertainty Analysis</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Include uncertainty ranges in calculations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Monte Carlo sensitivity analysis</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Settings;