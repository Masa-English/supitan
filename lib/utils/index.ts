/**
 * ユーティリティ関数の統合エクスポート
 */

// クラス名結合
export { cn } from './cn';

// 音声関連
export {
  type AudioFileInfo,
  type BatchAudioResponse,
  fetchBatchAudioFiles,
  fetchWordAudio,
  fetchAudioFromStorage,
  buildExampleAudioPath,
  buildExampleAudioPathFromWord,
  generateAudioUrl,
  checkAudioFileExists,
  getAudioFileMetadata,
  getAudioFileInfo,
  getWordAudioInfo
} from './audio';

// バリデーション
export {
  isValidEmail,
  type PasswordValidationResult,
  validatePassword,
  isValidUrl,
  containsJapanese,
  containsEnglish,
  validateLength,
  isRequired,
  validateRange,
  validateFileSize,
  validateFileType,
  type ValidationRule,
  type ValidationResult,
  validateForm,
  sanitizeHtml,
  sanitizeInput
} from './validation';

// フォーマット
export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatMilliseconds,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  camelToKebab,
  kebabToCamel,
  formatUrl,
  extractDomain,
  formatScore,
  formatAccuracy,
  formatStudyTime,
  formatCurrency,
  formatList,
  generatePlaceholder,
  formatErrorMessage,
  formatProgress
} from './formatting';

// エラーハンドリング
export {
  AppError,
  ERROR_CODES,
  createError,
  handleError,
  isAppError,
  USER_FRIENDLY_MESSAGES,
  getUserFriendlyMessage
} from './error-handling';

// パフォーマンス
export {
  type PerformanceMetric,
  type WebVitalMetric,
  performanceMonitor,
  measurePerformance,
  recordMetric
} from './performance';

// キャッシュ
export {
  CacheManager,
  LRUCache,
  StorageCache,
  memoryCache,
  lruCache,
  storageCache,
  generateCacheKey,
  withCache
} from './cache';

// 非同期処理
export {
  debounce,
  throttle,
  delay,
  withTimeout,
  retry,
  promiseLimit,
  batch,
  AsyncQueue,
  EventEmitter,
  createAbortController,
  type PromiseState,
  trackPromise,
  trackAllPromises
} from './async';

// ストレージ
export {
  secureStorageSet,
  secureStorageGet,
  secureStorageRemove,
  LocalStorageHelper,
  SessionStorageHelper,
  IndexedDBHelper,
  localStorage,
  sessionStorage,
  indexedDB,
  isStorageAvailable
} from './storage';

// 開発環境
export {
  hasEnvVars,
  isDevelopment,
  isProduction,
  isTest,
  devLog,
  logMemoryUsage,
  measureAsyncPerformance,
  debugInfo,
  logError,
  devOnly,
  prodOnly,
  isFeatureEnabled,
  isDevToolsOpen,
  getBrowserInfo,
  getPerformanceInfo,
  devWarning,
  devSuccess,
  devTodo,
  devFixme
} from './development';

// URL関連
export {
  getRedirectUrl,
  parseUrlParams,
  buildUrlParams,
  joinUrl,
  toAbsoluteUrl,
  isExternalUrl,
  sanitizeUrl,
  encodeUrlComponent,
  decodeUrlComponent,
  getFilenameFromUrl,
  getFileExtensionFromUrl,
  getUrlHash,
  setUrlHash,
  pushState,
  replaceState,
  updateUrlParams,
  getCurrentUrlParams,
  generateBreadcrumbsFromUrl
} from './url';

// パフォーマンス最適化のための遅延読み込み
export function lazyLoad<T>(importFn: () => Promise<T>): () => Promise<T> {
  let cached: T | null = null;
  
  return async () => {
    if (cached) return cached;
    cached = await importFn();
    return cached;
  };
}

// 型ガード
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// 深いオブジェクトのクローン
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

// オブジェクトの比較
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

// ランダム文字列生成
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// UUID生成（簡易版）
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}