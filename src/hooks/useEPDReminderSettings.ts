/**
 * Hook for managing EPD reminder settings
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EPDReminderSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  reminder_days: number[];
  email_notifications: boolean;
  last_reminder_sent: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpiringMaterial {
  material_name: string;
  epd_number: string | null;
  manufacturer: string | null;
  expiry_date: string;
  days_until_expiry: number;
}

export function useEPDReminderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<EPDReminderSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('epd_reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setSettings(data);
    } catch (error) {
      console.error('Error fetching EPD reminder settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings
  const saveSettings = useCallback(async (newSettings: Partial<EPDReminderSettings>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsData = {
        user_id: user.id,
        enabled: newSettings.enabled ?? true,
        reminder_days: newSettings.reminder_days ?? [30, 60, 90],
        email_notifications: newSettings.email_notifications ?? true,
      };

      const { data, error } = await supabase
        .from('epd_reminder_settings')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "Settings saved",
        description: "Your EPD reminder preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving EPD reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to save reminder settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  // Send reminder email manually
  const sendReminderEmail = useCallback(async (materials: ExpiringMaterial[]) => {
    if (!user || materials.length === 0) return;

    setIsSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('send-epd-reminders', {
        body: {
          user_id: user.id,
          materials,
          manual_trigger: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Reminder sent",
        description: "EPD expiry reminder email has been sent to your inbox.",
      });
    } catch (error) {
      console.error('Error sending EPD reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder email. Please check your email settings.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReminder(false);
    }
  }, [user, toast]);

  return {
    settings,
    isLoading,
    isSaving,
    isSendingReminder,
    saveSettings,
    sendReminderEmail,
    refetch: fetchSettings,
  };
}
