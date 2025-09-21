import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences and account settings</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your default project preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Project-specific settings will be available here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account settings will be available here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculation Preferences</CardTitle>
              <CardDescription>Set default emission factors and calculation methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Calculation preferences will be available here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;