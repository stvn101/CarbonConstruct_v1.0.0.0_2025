/**
 * Hook for tracking EPD expiry dates and generating renewal reminders
 * Monitors project materials for expiring or expired EPD certifications
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  name: string;
  expiryDate?: string;
  epdNumber?: string;
  manufacturer?: string;
}

interface ExpiryWarning {
  id: string;
  materialName: string;
  epdNumber?: string;
  manufacturer?: string;
  expiryDate: string;
  daysUntil: number;
  status: 'expired' | 'critical' | 'warning' | 'upcoming';
}

interface UseEPDRenewalRemindersProps {
  materials: Material[];
  showNotifications?: boolean;
}

export function useEPDRenewalReminders({ 
  materials, 
  showNotifications = true 
}: UseEPDRenewalRemindersProps) {
  const { toast } = useToast();
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissedEPDWarnings');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [hasShownInitialWarning, setHasShownInitialWarning] = useState(false);

  // Calculate days until expiry
  const getDaysUntilExpiry = useCallback((expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  // Get status based on days until expiry
  const getExpiryStatus = useCallback((daysUntil: number): 'expired' | 'critical' | 'warning' | 'upcoming' => {
    if (daysUntil < 0) return 'expired';
    if (daysUntil <= 30) return 'critical';
    if (daysUntil <= 90) return 'warning';
    return 'upcoming';
  }, []);

  // Calculate all expiry warnings
  const expiryWarnings = useMemo((): ExpiryWarning[] => {
    const warnings: ExpiryWarning[] = [];

    materials.forEach(material => {
      if (!material.expiryDate) return;

      const daysUntil = getDaysUntilExpiry(material.expiryDate);
      const status = getExpiryStatus(daysUntil);

      // Only include materials that are expired, critical (30 days), warning (90 days), or upcoming (180 days)
      if (daysUntil <= 180) {
        warnings.push({
          id: material.id,
          materialName: material.name,
          epdNumber: material.epdNumber,
          manufacturer: material.manufacturer,
          expiryDate: material.expiryDate,
          daysUntil,
          status
        });
      }
    });

    // Sort by urgency (expired first, then by days until expiry)
    return warnings.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [materials, getDaysUntilExpiry, getExpiryStatus]);

  // Filter by status
  const expiredMaterials = useMemo(() => 
    expiryWarnings.filter(w => w.status === 'expired'),
    [expiryWarnings]
  );

  const criticalMaterials = useMemo(() => 
    expiryWarnings.filter(w => w.status === 'critical'),
    [expiryWarnings]
  );

  const warningMaterials = useMemo(() => 
    expiryWarnings.filter(w => w.status === 'warning'),
    [expiryWarnings]
  );

  const upcomingMaterials = useMemo(() => 
    expiryWarnings.filter(w => w.status === 'upcoming'),
    [expiryWarnings]
  );

  // Active (non-dismissed) warnings
  const activeWarnings = useMemo(() => 
    expiryWarnings.filter(w => !dismissedWarnings.has(w.id)),
    [expiryWarnings, dismissedWarnings]
  );

  // Dismiss a warning
  const dismissWarning = useCallback((materialId: string) => {
    setDismissedWarnings(prev => {
      const next = new Set(prev);
      next.add(materialId);
      localStorage.setItem('dismissedEPDWarnings', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Clear all dismissed warnings
  const clearDismissedWarnings = useCallback(() => {
    setDismissedWarnings(new Set());
    localStorage.removeItem('dismissedEPDWarnings');
  }, []);

  // Show initial notification if there are critical issues
  useEffect(() => {
    if (!showNotifications || hasShownInitialWarning) return;
    if (materials.length === 0) return;

    const expired = expiredMaterials.length;
    const critical = criticalMaterials.length;

    if (expired > 0 || critical > 0) {
      setHasShownInitialWarning(true);
      
      if (expired > 0) {
        toast({
          title: "EPD Certifications Expired",
          description: `${expired} material${expired > 1 ? 's' : ''} in your project ${expired > 1 ? 'have' : 'has'} expired EPD certifications. Consider updating to current EPDs for compliance.`,
          variant: "destructive",
        });
      } else if (critical > 0) {
        toast({
          title: "EPD Renewals Due Soon",
          description: `${critical} material${critical > 1 ? 's' : ''} will expire within 30 days. Plan EPD renewals to maintain compliance.`,
        });
      }
    }
  }, [materials.length, expiredMaterials.length, criticalMaterials.length, showNotifications, hasShownInitialWarning, toast]);

  // Summary stats
  const summary = useMemo(() => ({
    total: expiryWarnings.length,
    expired: expiredMaterials.length,
    critical: criticalMaterials.length,
    warning: warningMaterials.length,
    upcoming: upcomingMaterials.length,
    hasIssues: expiredMaterials.length > 0 || criticalMaterials.length > 0,
    hasWarnings: warningMaterials.length > 0,
  }), [expiryWarnings.length, expiredMaterials.length, criticalMaterials.length, warningMaterials.length, upcomingMaterials.length]);

  return {
    // All warnings
    expiryWarnings,
    activeWarnings,
    
    // By status
    expiredMaterials,
    criticalMaterials,
    warningMaterials,
    upcomingMaterials,
    
    // Summary
    summary,
    
    // Actions
    dismissWarning,
    clearDismissedWarnings,
    
    // Helpers
    getDaysUntilExpiry,
    getExpiryStatus,
  };
}
