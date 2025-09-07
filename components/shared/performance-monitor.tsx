'use client';

/**
 * Performance Monitor Component
 * Tracks and displays Core Web Vitals metrics
 */

import React from 'react';
import { initWebVitals, type WebVitalsMetric } from '@/lib/utils/web-vitals';

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  onMetric?: (metric: WebVitalsMetric) => void;
}

export function PerformanceMonitor({ 
  showMetrics = false, 
  onMetric 
}: PerformanceMonitorProps) {
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

      // Call custom callback
      if (onMetric) {
        onMetric(metric);
      }
    });
  }, [onMetric]);

  // Don't render anything in production unless explicitly requested
  if (!showMetrics && process.env.NODE_ENV === 'production') {
    return null;
  }

  // Only show in development or when explicitly requested
  if (!showMetrics && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-semibold mb-2">Core Web Vitals</div>
      {metrics.length === 0 ? (
        <div className="text-gray-400">Loading metrics...</div>
      ) : (
        <div className="space-y-1">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span className="text-gray-300">{metric.name}:</span>
              <span className={`font-semibold ${
                metric.rating === 'good' ? 'text-green-400' :
                metric.rating === 'needs-improvement' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {formatMetricValue(metric.name, metric.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatMetricValue(metricName: string, value: number): string {
  switch (metricName) {
    case 'CLS':
      return value.toFixed(3);
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}