'use client';

// クライアントサイド専用のログレベル
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// クライアントサイド専用のログカテゴリ
export enum LogCategory {
  AUDIO = 'audio',
  UI = 'ui',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  GENERAL = 'general',
  STORE = 'store',
  HOOK = 'hook'
}

// クライアントサイド専用のログ管理クラス
class ClientLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logBuffer: Array<{ timestamp: string; level: LogLevel; category: LogCategory; message: string; meta?: Record<string, unknown> }> = [];
  private maxBufferSize: number = 100;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, category: LogCategory, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message} ${metaStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    if (this.isProduction) return level === LogLevel.ERROR || level === LogLevel.WARN;
    return false;
  }

  private addToBuffer(level: LogLevel, message: string, category: LogCategory, meta?: Record<string, unknown>) {
    this.logBuffer.push({
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      meta
    });

    // バッファサイズ制限
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private log(level: LogLevel, message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, category, meta);

    // バッファに追加
    this.addToBuffer(level, message, category, meta);

    // コンソールに出力
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  // パブリックメソッド
  error(message: string, category: LogCategory = LogCategory.ERROR, meta?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, category, meta);
  }

  warn(message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, category, meta);
  }

  info(message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, category, meta);
  }

  debug(message: string, category: LogCategory = LogCategory.GENERAL, meta?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, category, meta);
  }

  // カテゴリ別メソッド
  audio(message: string, meta?: Record<string, unknown>) {
    this.debug(message, LogCategory.AUDIO, meta);
  }

  ui(message: string, meta?: Record<string, unknown>) {
    this.debug(message, LogCategory.UI, meta);
  }

  performance(message: string, meta?: Record<string, unknown>) {
    this.info(message, LogCategory.PERFORMANCE, meta);
  }

  store(message: string, meta?: Record<string, unknown>) {
    this.debug(message, LogCategory.STORE, meta);
  }

  hook(message: string, meta?: Record<string, unknown>) {
    this.debug(message, LogCategory.HOOK, meta);
  }

  // ログバッファの取得（デバッグ用）
  getLogBuffer() {
    return [...this.logBuffer];
  }

  // ログバッファのクリア
  clearLogBuffer() {
    this.logBuffer = [];
  }

  // ログバッファをサーバーに送信（エラー報告用）
  async sendLogsToServer() {
    if (this.logBuffer.length === 0) return;

    try {
      await fetch('/api/logs/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: this.logBuffer,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      
      this.clearLogBuffer();
    } catch (error) {
      console.error('Failed to send logs to server:', error);
    }
  }
}

// シングルトンインスタンス
const clientLogger = new ClientLogger();

// パフォーマンス測定用ヘルパー
export const clientPerformanceLogger = {
  start: (label: string) => {
    const startTime = Date.now();
    return {
      end: (meta?: Record<string, unknown>) => {
        const duration = Date.now() - startTime;
        clientLogger.performance(`${label} completed`, { duration: `${duration}ms`, ...meta });
        return duration;
      }
    };
  }
};

// エラー境界でのログ送信
export const sendErrorLogs = () => {
  clientLogger.sendLogsToServer();
};

// ページ離脱時のログ送信
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clientLogger.sendLogsToServer();
  });
}

export default clientLogger;