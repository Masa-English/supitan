/**
 * フォーマット関連のユーティリティ
 */

// 日付フォーマット
export function formatDate(date: Date | string, locale: string = 'ja-JP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

export function formatDateTime(date: Date | string, locale: string = 'ja-JP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

export function formatRelativeTime(date: Date | string, locale: string = 'ja-JP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'たった今';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }
  
  return formatDate(dateObj, locale);
}

// 数値フォーマット
export function formatNumber(num: number, locale: string = 'ja-JP'): string {
  return num.toLocaleString(locale);
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// 時間フォーマット
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatMilliseconds(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
}

// テキストフォーマット
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

export function camelToKebab(text: string): string {
  return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamel(text: string): string {
  return text.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

// URL・パスフォーマット
export function formatUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// 学習関連フォーマット
export function formatScore(score: number, total: number): string {
  const percentage = Math.round((score / total) * 100);
  return `${score}/${total} (${percentage}%)`;
}

export function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return '0%';
  const accuracy = (correct / total) * 100;
  return `${accuracy.toFixed(1)}%`;
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }
  
  return `${hours}時間${remainingMinutes}分`;
}

// 通貨フォーマット
export function formatCurrency(amount: number, currency: string = 'JPY', locale: string = 'ja-JP'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

// 配列フォーマット
export function formatList(items: string[], locale: string = 'ja-JP'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  
  if (locale === 'ja-JP') {
    return items.join('、');
  }
  
  if (items.length === 2) {
    return items.join(' and ');
  }
  
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

// プレースホルダー生成
export function generatePlaceholder(type: 'email' | 'password' | 'name' | 'search' | 'url'): string {
  const placeholders = {
    email: 'example@email.com',
    password: '••••••••',
    name: '山田太郎',
    search: '検索キーワードを入力...',
    url: 'https://example.com'
  };
  
  return placeholders[type] || '';
}

// エラーメッセージフォーマット
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '予期しないエラーが発生しました';
}

// 進捗フォーマット
export function formatProgress(current: number, total: number): {
  percentage: number;
  text: string;
  isComplete: boolean;
} {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total;
  
  return {
    percentage,
    text: `${current}/${total}`,
    isComplete
  };
}