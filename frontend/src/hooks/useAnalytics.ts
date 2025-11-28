/**
 * Google Analytics 4 Hook
 *
 * Provides utility functions for tracking events in Google Analytics.
 * Only tracks events in production (localhost is excluded).
 *
 * Industry-standard pattern matching react-ga4 and similar libraries.
 *
 * @author Harma Davtian
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if we're in production (not localhost)
 */
const isProduction = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname !== "localhost" && hostname !== "127.0.0.1";
};

/**
 * Track a Google Analytics event
 *
 * @param eventName - GA4 event name (e.g., 'rag_query', 'premium_unlock', 'search')
 * @param eventParams - Optional parameters for the event
 *
 * @example
 * trackEvent('rag_query', { query_length: 50, response_time_ms: 1200, user_tier: 'free' });
 * trackEvent('premium_unlock', { success: true });
 * trackEvent('search', { search_term: 'Mickey Mouse', results_count: 42 });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  // Skip in dev mode or if GA not loaded
  if (
    !isProduction() ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    console.log("[Analytics] Skipped (dev mode):", eventName, eventParams);
    return;
  }

  window.gtag("event", eventName, eventParams);
};

/**
 * Hook for using analytics in components
 */
export const useAnalytics = () => {
  return {
    trackEvent,
    isProduction: isProduction(),
  };
};
