import { NextRequest, NextResponse } from 'next/server';
import { logCleanupManager } from '@/lib/utils/log-cleanup';
import serverLog, { LogCategory } from '@/lib/utils/server-logger';

// ログクリーンアップの実行
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { force = false, emergency = false } = body;

    serverLog.info('ログクリーンアップAPI呼び出し', LogCategory.API, {
      force,
      emergency,
      timestamp: new Date().toISOString()
    });

    // 緊急クリーンアップの場合
    if (emergency) {
      const result = await logCleanupManager.performCleanup();
      serverLog.warn('緊急ログクリーンアップ実行', LogCategory.API, result);
      
      return NextResponse.json({
        success: true,
        type: 'emergency',
        result
      });
    }

    // 通常のクリーンアップ
    const result = await logCleanupManager.performCleanup();
    
    return NextResponse.json({
      success: true,
      type: 'normal',
      result
    });

  } catch (error) {
    serverLog.error('ログクリーンアップAPIエラー', LogCategory.ERROR, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'ログクリーンアップの実行に失敗しました' 
      },
      { status: 500 }
    );
  }
}

// ログディレクトリの状態取得
export async function GET() {
  try {
    const status = logCleanupManager.getLogDirectoryStatus();
    
    serverLog.info('ログディレクトリ状態取得', LogCategory.API, {
      totalFiles: status.totalFiles,
      totalSize: status.sizeInMB
    });

    return NextResponse.json({
      success: true,
      status: {
        totalFiles: status.totalFiles,
        totalSize: status.sizeInMB,
        files: status.files.map(file => ({
          name: file.name,
          size: Math.round(file.size / 1024), // KB単位
          created: file.created.toISOString(),
          type: file.type
        }))
      }
    });

  } catch (error) {
    serverLog.error('ログディレクトリ状態取得エラー', LogCategory.ERROR, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'ログディレクトリの状態取得に失敗しました' 
      },
      { status: 500 }
    );
  }
}

// 定期クリーンアップの制御
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body; // 'start' or 'stop'

    if (action === 'start') {
      logCleanupManager.startPeriodicCleanup();
      serverLog.info('定期ログクリーンアップ開始', LogCategory.API);
      
      return NextResponse.json({
        success: true,
        message: '定期ログクリーンアップを開始しました'
      });
    }
    
    if (action === 'stop') {
      logCleanupManager.stopPeriodicCleanup();
      serverLog.info('定期ログクリーンアップ停止', LogCategory.API);
      
      return NextResponse.json({
        success: true,
        message: '定期ログクリーンアップを停止しました'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '無効なアクションです。start または stop を指定してください' 
      },
      { status: 400 }
    );

  } catch (error) {
    serverLog.error('定期クリーンアップ制御エラー', LogCategory.ERROR, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { 
        success: false, 
        error: '定期クリーンアップの制御に失敗しました' 
      },
      { status: 500 }
    );
  }
}
