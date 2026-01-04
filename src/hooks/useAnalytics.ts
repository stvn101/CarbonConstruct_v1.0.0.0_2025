import { useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getStoredUTMParams } from '@/hooks/useUTMTracking';

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, unknown>;
}

// Google Analytics helper - sends events to GA4
function sendToGA(eventName: string, eventData?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof (window as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, eventData ?? {});
  }
}

const EVENTS_BATCH_SIZE = 20;
const EVENTS_FLUSH_INTERVAL = 10000; // 10 seconds

// Generate anonymous session ID (no cookies)
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export function useAnalytics() {
  const location = useLocation();
  const eventsQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(getSessionId());
  const lastPageView = useRef<string>('');

  const flushEvents = useCallback(async () => {
    if (eventsQueue.current.length === 0) return;

    const eventsToSend = eventsQueue.current.splice(0, EVENTS_BATCH_SIZE);
    
    try {
      await supabase.functions.invoke('log-analytics', {
        body: {
          events: eventsToSend.map(e => ({
            ...e,
            page_url: window.location.href,
            session_id: sessionId.current,
          })),
          session_id: sessionId.current,
        },
      });
    } catch {
      // Silently fail
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;
    
    flushTimeoutRef.current = setTimeout(() => {
      flushEvents();
      flushTimeoutRef.current = null;
    }, EVENTS_FLUSH_INTERVAL);
  }, [flushEvents]);

  const trackEvent = useCallback((eventName: string, eventData?: Record<string, unknown>) => {
    // Get UTM params if available and merge with event data
    const utmParams = getStoredUTMParams();
    const enrichedEventData = {
      ...eventData,
      ...(utmParams?.utm_source && { utm_source: utmParams.utm_source }),
      ...(utmParams?.utm_medium && { utm_medium: utmParams.utm_medium }),
      ...(utmParams?.utm_campaign && { utm_campaign: utmParams.utm_campaign }),
      ...(utmParams?.utm_term && { utm_term: utmParams.utm_term }),
      ...(utmParams?.utm_content && { utm_content: utmParams.utm_content }),
    };

    // Send to internal analytics (Supabase)
    eventsQueue.current.push({
      event_name: eventName,
      event_data: enrichedEventData,
    });

    // Also send to Google Analytics
    sendToGA(eventName, enrichedEventData);

    if (eventsQueue.current.length >= EVENTS_BATCH_SIZE) {
      flushEvents();
    } else {
      scheduleFlush();
    }
  }, [flushEvents, scheduleFlush]);

  // Track page views automatically
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (currentPath !== lastPageView.current) {
      lastPageView.current = currentPath;
      
      // Send page view to GA4
      const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === 'function') {
        gtag('config', 'G-LW6J3XSWX2', {
          page_path: location.pathname,
          page_location: window.location.href,
        });
      }
      
      trackEvent('page_view', {
        path: location.pathname,
        search: location.search,
        referrer: document.referrer,
      });
    }
  }, [location, trackEvent]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushEvents();
    };
  }, [flushEvents]);

  return { trackEvent };
}

// Predefined event tracking helpers
export const AnalyticsEvents = {
  // User actions
  SIGN_UP: 'user_sign_up',
  SIGN_IN: 'user_sign_in',
  SIGN_OUT: 'user_sign_out',
  
  // Project actions
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  
  // Calculator actions
  CALCULATION_STARTED: 'calculation_started',
  CALCULATION_COMPLETED: 'calculation_completed',
  MATERIAL_ADDED: 'material_added',
  
  // Report actions
  REPORT_GENERATED: 'report_generated',
  REPORT_DOWNLOADED: 'report_downloaded',
  
  // Feature usage
  FEATURE_USED: 'feature_used',
  AI_CHAT_USED: 'ai_chat_used',
  BOQ_IMPORTED: 'boq_imported',
  
  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  UPGRADE_CLICKED: 'upgrade_clicked',
  
  // Campaign tracking
  CAMPAIGN_PAGE_VIEW: 'campaign_page_view',
  CAMPAIGN_CTA_CLICKED: 'campaign_cta_clicked',
  CAMPAIGN_SIGNUP: 'campaign_signup',
} as const;
