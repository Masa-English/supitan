// Next.js環境でのログ設定

// 環境変数の設定
export const LOG_CONFIG = {
  // ログレベル設定
  levels: {
    development: 'debug',
    production: 'info',
    test: 'error'
  },
  
  // ファイル設定
  files: {
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD'
  },
  
  // バッファ設定（クライアントサイド）
  buffer: {
    maxSize: 100,
    flushInterval: 30000 // 30秒
  }
} as const;

// 環境判定
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// ログレベル取得
export const getLogLevel = (): string => {
  return LOG_CONFIG.levels[process.env.NODE_ENV as keyof typeof LOG_CONFIG.levels] || 'info';
};

// ログ出力判定
export const shouldLog = (level: string): boolean => {
  const currentLevel = getLogLevel();
  const levels = ['error', 'warn', 'info', 'debug', 'verbose', 'silly'];
  
  const currentIndex = levels.indexOf(currentLevel);
  const messageIndex = levels.indexOf(level);
  
  return messageIndex <= currentIndex;
};

// ログディレクトリパス
export const getLogDirectory = (): string => {
  if (typeof window !== 'undefined') {
    // クライアントサイドでは使用しない
    return '';
  }
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  return path.join(process.cwd(), 'logs');
};

// ログファイル名生成
export const generateLogFileName = (type: string, date?: Date): string => {
  const targetDate = date || new Date();
  const dateStr = targetDate.toISOString().split('T')[0];
  return `${type}-${dateStr}.log`;
};

// ログフォーマット設定
export const LOG_FORMATS = {
  // コンソール用（開発環境）
  console: {
    timestamp: 'HH:mm:ss',
    colorize: true,
    simple: false
  },
  
  // ファイル用（本番環境）
  file: {
    timestamp: 'YYYY-MM-DD HH:mm:ss',
    json: true,
    includeStack: true
  }
} as const;

// ログカテゴリの優先度
export const LOG_CATEGORY_PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
  silly: 5
} as const;

// ログフィルタリング設定
export const LOG_FILTERS = {
  // 機密情報のフィルタリング
  sensitiveKeys: ['password', 'token', 'secret', 'key', 'auth'],
  
  // フィルタリング関数
  filterSensitiveData: (obj: Record<string, unknown>): Record<string, unknown> => {
    const filtered = { ...obj };
    
    for (const key of LOG_FILTERS.sensitiveKeys) {
      if (key in filtered) {
        filtered[key] = '[FILTERED]';
      }
    }
    
    return filtered;
  }
} as const;
