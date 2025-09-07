/**
 * 開発環境関連のユーティリティ
 */

// 環境変数チェック
export function hasEnvVars(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// 開発環境かどうかの判定
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// 開発環境でのみコンソールログを出力する
export const devLog = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  table: (data: unknown) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

// メモリ使用量の監視（開発環境のみ）
export function logMemoryUsage(label: string = 'Memory Usage'): void {
  if (isDevelopment && typeof window !== 'undefined') {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        devLog.log(`🧠 ${label}:`, {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
        });
      }
    }
  }
}

// パフォーマンス測定（開発環境のみ）
export function measurePerformance<T>(
  label: string,
  fn: () => T
): T {
  if (!isDevelopment) {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  devLog.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

// 非同期パフォーマンス測定（開発環境のみ）
export async function measureAsyncPerformance<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isDevelopment) {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  devLog.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

// デバッグ情報の表示
export function debugInfo(label: string, data: unknown): void {
  if (isDevelopment) {
    devLog.group(`🐛 Debug: ${label}`);
    devLog.log('Data:', data);
    devLog.log('Type:', typeof data);
    devLog.log('Timestamp:', new Date().toISOString());
    devLog.groupEnd();
  }
}

// エラーの詳細ログ（開発環境のみ）
export function logError(error: unknown, context: string = 'Unknown'): void {
  if (isDevelopment) {
    devLog.group(`🚨 Error in ${context}`);
    devLog.error('Error:', error);
    
    if (error instanceof Error) {
      devLog.error('Message:', error.message);
      devLog.error('Stack:', error.stack);
      devLog.error('Name:', error.name);
    }
    
    devLog.error('Timestamp:', new Date().toISOString());
    devLog.groupEnd();
  }
}

// 開発環境でのみ実行する関数
export function devOnly(fn: () => void): void {
  if (isDevelopment) {
    fn();
  }
}

// 本番環境でのみ実行する関数
export function prodOnly(fn: () => void): void {
  if (isProduction) {
    fn();
  }
}

// 機能フラグのチェック
export function isFeatureEnabled(feature: string): boolean {
  const envKey = `ENABLE_${feature.toUpperCase()}`;
  return process.env[envKey] === 'true';
}

// 開発ツールの検出
export function isDevToolsOpen(): boolean {
  if (typeof window === 'undefined') return false;
  
  const threshold = 160;
  return (
    window.outerHeight - window.innerHeight > threshold ||
    window.outerWidth - window.innerWidth > threshold
  );
}

// ブラウザ情報の取得（開発環境のみ）
export function getBrowserInfo(): Record<string, unknown> | null {
  if (!isDevelopment || typeof window === 'undefined') return null;
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth
    },
    location: {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    }
  };
}

// パフォーマンス情報の取得（開発環境のみ）
export function getPerformanceInfo(): Record<string, unknown> | null {
  if (!isDevelopment || typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: navigation.responseEnd - navigation.fetchStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart
  };
}

// 開発環境での警告表示
export function devWarning(message: string, data?: unknown): void {
  if (isDevelopment) {
    devLog.warn(`⚠️ ${message}`, data);
  }
}

// 開発環境での成功メッセージ表示
export function devSuccess(message: string, data?: unknown): void {
  if (isDevelopment) {
    devLog.log(`✅ ${message}`, data);
  }
}

// 開発環境でのTODOコメント
export function devTodo(message: string): void {
  if (isDevelopment) {
    devLog.warn(`📝 TODO: ${message}`);
  }
}

// 開発環境でのFIXMEコメント
export function devFixme(message: string): void {
  if (isDevelopment) {
    devLog.error(`🔧 FIXME: ${message}`);
  }
}