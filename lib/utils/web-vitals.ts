/**
 * Web Vitals Monitoring Utilities
 * Tracks Core Web Vitals metrics for performance optimization
 */

import React from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

/**
 * Initialize Web Vitals monitoring
 * Call this in your app to start tracking performance metrics
 */
export function initWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  const reportMetric = (metric: WebVitalsMetric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with your analytics service here
      // Example: gtag('event', metric.name, { value: metric.value });
    }

    // Custom callback
    if (onMetric) {
      onMetric(metric);
    }
  };

  // Track all Core Web Vitals
  onCLS(reportMetric);
  onINP(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
}

/**
 * Get performance thresholds for each metric
 */
export const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Determine performance rating based on metric value
 */
export function getPerformanceRating(
  metricName: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metricName];
  
  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.poor) {
    return 'needs-improvement';
  } 
    return 'poor';
  
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metricName: string, value: number): string {
  switch (metricName) {
    case 'CLS':
      return value.toFixed(3);
    case 'INP':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

/**
 * Performance monitoring hook for React components
 */
export function useWebVitals() {
  const [metrics, setMetrics] = React.useState<WebVitalsMetric[]>([]);

  React.useEffect(() => {
    initWebVitals((metric) => {
      setMetrics(prev => {
        const existing = prev.find(m => m.name === metric.name);
        if (existing) {
          return prev.map(m => m.name === metric.name ? metric : m);
        }
        return [...prev, metric];
      });
    });
  }, []);

  return metrics;
}