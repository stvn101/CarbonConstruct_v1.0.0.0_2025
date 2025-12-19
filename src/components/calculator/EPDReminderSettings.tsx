/**
 * EPD Reminder Settings Component
 * Allows users to configure email notifications for EPD expiry reminders
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Mail, Clock, Send, Loader2, CheckCircle2, TestTube2, AlertCircle } from 'lucide-react';
import { useEPDReminderSettings } from '@/hooks/useEPDReminderSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExpiringMaterial {
  material_name: string;
  epd_number: string | null;
  manufacturer: string | null;
  expiry_date: string;
  days_until_expiry: number;
}

interface EPDReminderSettingsProps {
  expiringMaterials?: ExpiringMaterial[];
}

const REMINDER_DAY_OPTIONS = [
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
];

export function EPDReminderSettings({ expiringMaterials = [] }: EPDReminderSettingsProps) {
  const { toast } = useToast();
  const { 
    settings, 
    isLoading, 
    isSaving, 
    isSendingReminder,
    saveSettings, 
    sendReminderEmail 
  } = useEPDReminderSettings();

  const [enabled, setEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([30, 60, 90]);
  const [isTestingCron, setIsTestingCron] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state with loaded settings
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setEmailNotifications(settings.email_notifications);
      setReminderDays(settings.reminder_days);
    }
  }, [settings]);

  const handleToggleReminderDay = (day: number) => {
    setReminderDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSave = () => {
    saveSettings({
      enabled,
      email_notifications: emailNotifications,
      reminder_days: reminderDays,
    });
  };

  const hasChanges = settings && (
    enabled !== settings.enabled ||
    emailNotifications !== settings.email_notifications ||
    JSON.stringify(reminderDays) !== JSON.stringify(settings.reminder_days)
  );

  const handleSendTestReminder = () => {
    if (expiringMaterials.length > 0) {
      sendReminderEmail(expiringMaterials);
    }
  };

  const handleTestDailyCron = async () => {
    setIsTestingCron(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-epd-expiry', {
        body: { test: true },
      });

      if (error) throw error;

      setTestResult({
        success: true,
        message: `Daily check completed: ${data.emailsSent || 0} emails would be sent to ${data.usersChecked || 0} users.`,
      });
      toast({
        title: "Test completed",
        description: `Daily EPD check ran successfully.`,
      });
    } catch (error: any) {
      console.error('Error testing cron:', error);
      setTestResult({
        success: false,
        message: error.message || 'Failed to run daily check test',
      });
      toast({
        title: "Test failed",
        description: error.message || "Failed to run daily check.",
        variant: "destructive",
      });
    } finally {
      setIsTestingCron(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          EPD Reminder Settings
        </CardTitle>
        <CardDescription>
          Configure email notifications to alert you when EPD certifications are approaching expiry
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-reminders" className="text-base">Enable EPD Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Track and notify when materials need EPD renewals
            </p>
          </div>
          <Switch
            id="enable-reminders"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <>
            {/* Email Notifications */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts when EPDs are expiring
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {/* Reminder Intervals */}
            <div className="pt-4 border-t">
              <Label className="text-base flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                Reminder Intervals
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select when you want to be notified before EPDs expire
              </p>
              <div className="flex flex-wrap gap-3">
                {REMINDER_DAY_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`reminder-${option.value}`}
                      checked={reminderDays.includes(option.value)}
                      onCheckedChange={() => handleToggleReminderDay(option.value)}
                    />
                    <Label 
                      htmlFor={`reminder-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Reminder Info */}
            {settings?.last_reminder_sent && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Last reminder sent: {format(new Date(settings.last_reminder_sent), 'PPp')}
                </div>
              </div>
            )}

            {/* Test Daily Cron */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <TestTube2 className="h-4 w-4" />
                    Test Daily Check
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Trigger the daily EPD expiry check manually for testing
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestDailyCron}
                  disabled={isTestingCron}
                >
                  {isTestingCron ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4 mr-2" />
                  )}
                  Run Test
                </Button>
              </div>
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {expiringMaterials.length > 0 && emailNotifications && (
                  <Button
                    variant="outline"
                    onClick={handleSendTestReminder}
                    disabled={isSendingReminder}
                  >
                    {isSendingReminder ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Reminder Now
                    {expiringMaterials.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {expiringMaterials.length}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Settings
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
