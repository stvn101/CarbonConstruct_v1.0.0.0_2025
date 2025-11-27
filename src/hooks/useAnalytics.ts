import { useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, unknown>;
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
    eventsQueue.current.push({
      event_name: eventName,
      event_data: eventData,
    });

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
} as const;
