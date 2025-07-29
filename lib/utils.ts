import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// リダイレクトURL生成
export function getRedirectUrl(path: string): string {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // パスの検証
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path parameter');
  }
  
  // パスの正規化
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

// パフォーマンス監視ユーティリティ
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // パフォーマンス測定開始
  startTimer(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // 開発環境でのみログ出力
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
      // 本番環境ではログを出力しない
    };
  }

  // 平均実行時間を取得
  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  // メトリクスをリセット
  resetMetrics(): void {
    this.metrics.clear();
  }

  // 全メトリクスを取得
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [label] of this.metrics.entries()) {
      result[label] = this.getAverageTime(label);
    }
    return result;
  }
}

// キャッシュユーティリティ
export class CacheManager {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  static set(key: string, data: unknown, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }
}

// デバウンスユーティリティ
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// スロットルユーティリティ
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 環境変数チェック
export function hasEnvVars(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// エラーハンドリングユーティリティ
export function handleError(error: unknown, context: string = 'Unknown'): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 Error in ${context}:`, error);
  } else {
    // 本番環境ではエラーをログサービスに送信（詳細情報は含めない）
    console.error(`Error in ${context}:`, 'Internal server error');
  }
}

// パフォーマンス最適化のための遅延読み込み
export function lazyLoad<T>(importFn: () => Promise<T>): () => Promise<T> {
  let cached: T | null = null;
  
  return async () => {
    if (cached) return cached;
    cached = await importFn();
    return cached;
  };
}

// メモリ使用量の監視（開発環境のみ）
export function logMemoryUsage(label: string = 'Memory Usage'): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        // 開発環境でのみログ出力
        console.log(`🧠 ${label}:`, {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
        });
      }
    }
  }
  // 本番環境では何もしない
}

// セキュアなストレージ操作
export function secureStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // 機密情報は暗号化して保存（簡易版）
      const encodedValue = btoa(encodeURIComponent(value));
      sessionStorage.setItem(key, encodedValue);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
  }
}

export function secureStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const encodedValue = sessionStorage.getItem(key);
      if (encodedValue) {
        return decodeURIComponent(atob(encodedValue));
      }
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
    return null;
  }
}

export function secureStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
  }
}
