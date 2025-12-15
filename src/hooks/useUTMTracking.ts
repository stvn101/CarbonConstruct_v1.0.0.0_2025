import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_page: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = 'cc_utm_params';

export function getStoredUTMParams(): UTMParams | null {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearUTMParams(): void {
  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

export function useUTMTracking() {
  const location = useLocation();

  // Parse and store UTM params on mount and URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Check if any UTM params exist in current URL
    const hasUTMParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .some(param => searchParams.has(param));
    
    if (hasUTMParams) {
      const utmData: UTMParams = {
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_term: searchParams.get('utm_term'),
        utm_content: searchParams.get('utm_content'),
        landing_page: location.pathname,
        referrer: document.referrer || null,
      };
      
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      } catch {
        // Silently fail if sessionStorage unavailable
      }
    }
  }, [location.search, location.pathname]);

  // Get current UTM params (from session or URL)
  const getUTMParams = useCallback((): UTMParams | null => {
    return getStoredUTMParams();
  }, []);

  // Check if user came from a campaign
  const isFromCampaign = useCallback((): boolean => {
    const params = getStoredUTMParams();
    return params !== null && params.utm_source !== null;
  }, []);

  // Get campaign attribution summary for analytics
  const getCampaignAttribution = useCallback((): Record<string, string> => {
    const params = getStoredUTMParams();
    if (!params) return {};
    
    const attribution: Record<string, string> = {};
    if (params.utm_source) attribution.utm_source = params.utm_source;
    if (params.utm_medium) attribution.utm_medium = params.utm_medium;
    if (params.utm_campaign) attribution.utm_campaign = params.utm_campaign;
    if (params.utm_term) attribution.utm_term = params.utm_term;
    if (params.utm_content) attribution.utm_content = params.utm_content;
    if (params.landing_page) attribution.landing_page = params.landing_page;
    if (params.referrer) attribution.referrer = params.referrer;
    
    return attribution;
  }, []);

  return {
    getUTMParams,
    isFromCampaign,
    getCampaignAttribution,
    clearUTMParams,
  };
}
