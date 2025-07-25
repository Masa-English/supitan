// パフォーマンス監視システム
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  private constructor() {
    this.initializeWebVitals();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // メトリクス記録
  record(
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // オブザーバーに通知
    this.observers.forEach(observer => observer(metric));

    // 開発環境でのみログ出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${value}${unit}`, metadata);
    }
  }

  // タイマー開始
  startTimer(name: string, metadata?: Record<string, unknown>): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.record(name, duration, 'ms', metadata);
    };
  }

  // 平均値を取得
  getAverage(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // 最新値を取得
  getLatest(name: string): PerformanceMetric | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    
    return metrics[metrics.length - 1];
  }

  // メトリクスをリセット
  reset(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  // オブザーバー登録
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  // Web Vitals監視初期化
  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals監視
    this.observeWebVitals();
    
    // カスタムメトリクス監視
    this.observeCustomMetrics();
  }

  private observeWebVitals(): void {
    // LCP監視
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as PerformanceEntry & { element?: Element; url?: string };
            this.record('LCP', entry.startTime, 'ms', {
              element: lcpEntry.element?.tagName,
              url: lcpEntry.url
            });
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch {
        console.warn('LCP monitoring not supported');
      }
    }

    // FID監視
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEntry & { processingStart: number; target?: Element };
            this.record('FID', fidEntry.processingStart - entry.startTime, 'ms', {
              name: entry.name,
              target: fidEntry.target?.tagName
            });
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch {
        console.warn('FID monitoring not supported');
      }
    }

    // CLS監視
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
            const layoutShiftEntry = entry as PerformanceEntry & { value: number };
            clsValue += layoutShiftEntry.value;
            this.record('CLS', clsValue, '', {
              sessionEntryCount: list.getEntries().length
            });
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch {
        console.warn('CLS monitoring not supported');
      }
    }
  }

  private observeCustomMetrics(): void {
    // ページ読み込み時間監視
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.record('PageLoadTime', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
          this.record('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
          this.record('FirstPaint', navigation.responseEnd - navigation.fetchStart, 'ms');
        }
      });
    }
  }

  // メトリクスエクスポート
  exportMetrics(): Record<string, PerformanceMetric[]> {
    const result: Record<string, PerformanceMetric[]> = {};
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = [...metrics];
    }
    return result;
  }

  // メトリクスサマリー
  getSummary(): Record<string, { average: number; count: number; latest: number }> {
    const summary: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const average = this.getAverage(name);
      const latest = metrics[metrics.length - 1]?.value || 0;
      
      summary[name] = {
        average,
        count: metrics.length,
        latest
      };
    }
    
    return summary;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// 便利な関数
export const measurePerformance = performanceMonitor.startTimer.bind(performanceMonitor);
export const recordMetric = performanceMonitor.record.bind(performanceMonitor); 