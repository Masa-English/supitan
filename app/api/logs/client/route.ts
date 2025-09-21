import { NextRequest, NextResponse } from 'next/server';
import serverLog, { LogCategory } from '@/lib/utils/server-logger';

interface ClientLogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  meta?: Record<string, unknown>;
}

interface ClientLogRequest {
  logs: ClientLogEntry[];
  userAgent: string;
  url: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClientLogRequest = await request.json();
    const { logs, userAgent, url, timestamp } = body;

    // クライアントログをサーバーログに記録
    serverLog.info('Client logs received', LogCategory.API, {
      logCount: logs.length,
      userAgent,
      url,
      timestamp
    });

    // 各ログエントリを処理
    for (const logEntry of logs) {
      const { level, category, message, meta } = logEntry;
      
      // ログレベルに応じて適切なメソッドを呼び出し
      switch (level) {
        case 'error':
          serverLog.error(`[CLIENT] ${message}`, LogCategory.ERROR, {
            category,
            userAgent,
            url,
            ...meta
          });
          break;
        case 'warn':
          serverLog.warn(`[CLIENT] ${message}`, LogCategory.GENERAL, {
            category,
            userAgent,
            url,
            ...meta
          });
          break;
        case 'info':
          serverLog.info(`[CLIENT] ${message}`, LogCategory.GENERAL, {
            category,
            userAgent,
            url,
            ...meta
          });
          break;
        case 'debug':
          serverLog.debug(`[CLIENT] ${message}`, LogCategory.GENERAL, {
            category,
            userAgent,
            url,
            ...meta
          });
          break;
        default:
          serverLog.info(`[CLIENT] ${message}`, LogCategory.GENERAL, {
            category,
            userAgent,
            url,
            ...meta
          });
      }
    }

    return NextResponse.json({ success: true, processed: logs.length });
  } catch (error) {
    serverLog.error('Failed to process client logs', LogCategory.ERROR, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to process logs' },
      { status: 500 }
    );
  }
}
