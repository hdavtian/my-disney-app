/**
 * Performance Monitor for Disney App
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte

  // Custom metrics
  domContentLoaded?: number;
  loadComplete?: number;
  bundleSize?: string;
  cacheHitRate?: number;

  // App-specific metrics
  charactersLoadTime?: number;
  moviesLoadTime?: number;
  carouselLoadTime?: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {};
  private static observers: PerformanceObserver[] = [];

  /**
   * Initialize performance monitoring
   */
  static init(): void {
    if (typeof window === "undefined") return;

    try {
      // Monitor Core Web Vitals
      PerformanceMonitor.observeWebVitals();

      // Monitor navigation timing
      PerformanceMonitor.observeNavigation();

      // Log initialization
      if (import.meta.env.DEV) {
        console.log("🎯 Performance monitoring initialized");
      }
    } catch (error) {
      console.warn("Performance monitoring initialization failed:", error);
    }
  }

  /**
   * Track Core Web Vitals
   */
  private static observeWebVitals(): void {
    // First Contentful Paint (FCP)
    if ("PerformanceObserver" in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              PerformanceMonitor.metrics.fcp = entry.startTime;
              PerformanceMonitor.logMetric("FCP", entry.startTime, "ms");
            }
          }
        });
        fcpObserver.observe({ entryTypes: ["paint"] });
        PerformanceMonitor.observers.push(fcpObserver);
      } catch (error) {
        // Silently handle unsupported browsers
      }

      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            PerformanceMonitor.metrics.lcp = lastEntry.startTime;
            PerformanceMonitor.logMetric("LCP", lastEntry.startTime, "ms");
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        PerformanceMonitor.observers.push(lcpObserver);
      } catch (error) {
        // Silently handle unsupported browsers
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            PerformanceMonitor.metrics.fid =
              (entry as any).processingStart - entry.startTime;
            PerformanceMonitor.logMetric(
              "FID",
              PerformanceMonitor.metrics.fid,
              "ms"
            );
          }
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
        PerformanceMonitor.observers.push(fidObserver);
      } catch (error) {
        // Silently handle unsupported browsers
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          PerformanceMonitor.metrics.cls = clsValue;
          PerformanceMonitor.logMetric("CLS", clsValue, "");
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
        PerformanceMonitor.observers.push(clsObserver);
      } catch (error) {
        // Silently handle unsupported browsers
      }
    }
  }

  /**
   * Monitor navigation timing
   */
  private static observeNavigation(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          // Time to First Byte
          PerformanceMonitor.metrics.ttfb =
            navigation.responseStart - navigation.fetchStart;

          // DOM Content Loaded
          PerformanceMonitor.metrics.domContentLoaded =
            navigation.domContentLoadedEventEnd - navigation.fetchStart;

          // Load Complete
          PerformanceMonitor.metrics.loadComplete =
            navigation.loadEventEnd - navigation.fetchStart;

          // Log navigation metrics
          if (import.meta.env.DEV) {
            console.log("📊 Navigation Metrics:", {
              TTFB: `${PerformanceMonitor.metrics.ttfb?.toFixed(1)}ms`,
              "DOM Content Loaded": `${PerformanceMonitor.metrics.domContentLoaded?.toFixed(
                1
              )}ms`,
              "Load Complete": `${PerformanceMonitor.metrics.loadComplete?.toFixed(
                1
              )}ms`,
            });
          }
        }
      }, 0);
    });
  }

  /**
   * Track custom application metrics
   */
  static trackCustomMetric(
    name: keyof PerformanceMetrics,
    value: number
  ): void {
    (PerformanceMonitor.metrics as any)[name] = value;
    PerformanceMonitor.logMetric(name as string, value, "ms");
  }

  /**
   * Track API response times
   */
  static trackApiCall(
    endpoint: string,
    startTime: number,
    fromCache: boolean = false
  ): void {
    const duration = performance.now() - startTime;
    const source = fromCache ? "cache" : "API";

    if (import.meta.env.DEV) {
      console.log(`🌐 ${endpoint} (${source}): ${duration.toFixed(1)}ms`);
    }

    // Track specific API calls
    if (endpoint.includes("characters")) {
      PerformanceMonitor.trackCustomMetric("charactersLoadTime", duration);
    } else if (endpoint.includes("movies")) {
      PerformanceMonitor.trackCustomMetric("moviesLoadTime", duration);
    } else if (endpoint.includes("carousels")) {
      PerformanceMonitor.trackCustomMetric("carouselLoadTime", duration);
    }
  }

  /**
   * Calculate cache hit rate
   */
  static updateCacheHitRate(totalRequests: number, cacheHits: number): void {
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    PerformanceMonitor.metrics.cacheHitRate = hitRate;

    if (import.meta.env.DEV) {
      console.log(
        `💾 Cache Hit Rate: ${hitRate.toFixed(
          1
        )}% (${cacheHits}/${totalRequests})`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetrics {
    return { ...PerformanceMonitor.metrics };
  }

  /**
   * Generate performance report
   */
  static generateReport(): string {
    const metrics = PerformanceMonitor.getMetrics();

    return `
🎯 Disney App Performance Report
================================
Core Web Vitals:
- First Contentful Paint: ${metrics.fcp?.toFixed(1) || "N/A"}ms
- Largest Contentful Paint: ${metrics.lcp?.toFixed(1) || "N/A"}ms  
- First Input Delay: ${metrics.fid?.toFixed(1) || "N/A"}ms
- Cumulative Layout Shift: ${metrics.cls?.toFixed(3) || "N/A"}

Navigation:
- Time to First Byte: ${metrics.ttfb?.toFixed(1) || "N/A"}ms
- DOM Content Loaded: ${metrics.domContentLoaded?.toFixed(1) || "N/A"}ms
- Load Complete: ${metrics.loadComplete?.toFixed(1) || "N/A"}ms

App Performance:
- Characters Load Time: ${metrics.charactersLoadTime?.toFixed(1) || "N/A"}ms
- Movies Load Time: ${metrics.moviesLoadTime?.toFixed(1) || "N/A"}ms
- Carousel Load Time: ${metrics.carouselLoadTime?.toFixed(1) || "N/A"}ms
- Cache Hit Rate: ${metrics.cacheHitRate?.toFixed(1) || "N/A"}%

Bundle Size: ${metrics.bundleSize || "N/A"}
    `.trim();
  }

  /**
   * Log performance metric
   */
  private static logMetric(name: string, value: number, unit: string): void {
    if (!import.meta.env.DEV) return;

    // Color-code metrics based on performance thresholds
    const getColor = (metricName: string, val: number): string => {
      switch (metricName.toLowerCase()) {
        case "fcp":
          return val < 1800 ? "🟢" : val < 3000 ? "🟡" : "🔴";
        case "lcp":
          return val < 2500 ? "🟢" : val < 4000 ? "🟡" : "🔴";
        case "fid":
          return val < 100 ? "🟢" : val < 300 ? "🟡" : "🔴";
        case "cls":
          return val < 0.1 ? "🟢" : val < 0.25 ? "🟡" : "🔴";
        default:
          return "📊";
      }
    };

    const color = getColor(name, value);
    console.log(`${color} ${name}: ${value.toFixed(1)}${unit}`);
  }

  /**
   * Cleanup performance observers
   */
  static cleanup(): void {
    PerformanceMonitor.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        // Silently handle cleanup errors
      }
    });
    PerformanceMonitor.observers = [];
  }
}

export default PerformanceMonitor;
