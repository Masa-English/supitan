import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { logCleanupManager } from './log-cleanup';

// サーバーサイド専用のログレベル
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// サーバーサイド専用のログカテゴリ
export enum LogCategory {
  AUTH = 'auth',
  DATABASE = 'database',
  API = 'api',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  GENERAL = 'general',
  MIDDLEWARE = 'middleware',
  BUILD = 'build'
}

// ログディレクトリの作成
const ensureLogDirectory = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

// カスタムフォーマット
const createCustomFormat = (isConsole: boolean = false) => {
  if (isConsole) {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}] [${category || 'GENERAL'}] ${message} ${metaStr}`;
      })
    );
  }

  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `[${timestamp}] [${level.toUpperCase()}] [${category || 'GENERAL'}] ${message} ${metaStr}`;
    })
  );
};

// ファイルトランスポートの作成
const createFileTransport = (filename: string, level: string) => {
  // ログタイプ別の設定
  const getTransportConfig = (filename: string, level: string) => {
    const baseConfig = {
      filename: `logs/${filename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level,
      format: createCustomFormat(false)
    };

    switch (filename) {
      case 'error':
      case 'exceptions':
      case 'rejections':
        return {
          ...baseConfig,
          maxSize: '50m',
          maxFiles: '30d', // エラーログは30日間保持
          zippedArchive: true // 圧縮アーカイブ
        };
      case 'combined':
        return {
          ...baseConfig,
          maxSize: '30m',
          maxFiles: '14d', // 一般ログは14日間保持
          zippedArchive: true
        };
      case 'debug':
        return {
          ...baseConfig,
          maxSize: '20m',
          maxFiles: '7d', // デバッグログは7日間保持
          zippedArchive: true
        };
      default:
        return {
          ...baseConfig,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true
        };
    }
  };

  return new DailyRotateFile(getTransportConfig(filename, level));
};

// Winstonロガーの作成（サーバーサイド専用）
const createServerLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';

  // Vercel環境ではファイル出力を無効化
  if (isVercel) {
    return winston.createLogger({
      level: 'info',
      format: createCustomFormat(false),
      transports: [
        new winston.transports.Console({
          level: 'info',
          format: createCustomFormat(true)
        })
      ],
      // ファイル出力を無効化
      exceptionHandlers: [],
      rejectionHandlers: []
    });
  }

  // ログディレクトリの確保（Vercel以外の環境のみ）
  ensureLogDirectory();

  const transports: winston.transport[] = [];

  // 開発環境: コンソール出力
  if (isDevelopment) {
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: createCustomFormat(true)
      })
    );
  }

  // 本番環境: ファイル出力（Vercel以外）
  if (isProduction && !isVercel) {
    transports.push(
      createFileTransport('error', 'error'),
      createFileTransport('combined', 'info'),
      createFileTransport('debug', 'debug')
    );
  }

  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: createCustomFormat(false),
    transports,
    // 未キャッチ例外の処理
    exceptionHandlers: isProduction && !isVercel ? [
      createFileTransport('exceptions', 'error')
    ] : [],
    // 未ハンドルPromise拒否の処理
    rejectionHandlers: isProduction && !isVercel ? [
      createFileTransport('rejections', 'error')
    ] : []
  });
};

// ロガーインスタンス
const logger = createServerLogger();

// 本番環境での自動クリーンアップ開始（Vercel環境では無効化）
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  logCleanupManager.startPeriodicCleanup();
}

// サーバーサイド専用ログメソッド
export const serverLog = {
  // エラーログ
  error: (message: string, category: LogCategory = LogCategory.ERROR, meta?: Record<string, unknown>) => {
    logger.error(message, { category, ...meta });
  },

  // 警告ログ
  warn: (message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) => {
    logger.warn(message, { category, ...meta });
  },

  // 情報ログ
  info: (message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) => {
    logger.info(message, { category, ...meta });
  },

  // デバッグログ
  debug: (message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) => {
    logger.debug(message, { category, ...meta });
  },

  // カテゴリ別メソッド
  auth: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, { category: LogCategory.AUTH, ...meta });
  },

  database: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, { category: LogCategory.DATABASE, ...meta });
  },

  api: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, { category: LogCategory.API, ...meta });
  },

  performance: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, { category: LogCategory.PERFORMANCE, ...meta });
  },

  middleware: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, { category: LogCategory.MIDDLEWARE, ...meta });
  },

  build: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, { category: LogCategory.BUILD, ...meta });
  }
};

// パフォーマンス測定用ヘルパー
export const serverPerformanceLogger = {
  start: (label: string) => {
    const startTime = Date.now();
    return {
      end: (meta?: Record<string, unknown>) => {
        const duration = Date.now() - startTime;
        serverLog.performance(`${label} completed`, { duration: `${duration}ms`, ...meta });
        return duration;
      }
    };
  }
};

export default serverLog;
