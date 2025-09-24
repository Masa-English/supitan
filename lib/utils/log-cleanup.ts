import fs from 'fs';
import path from 'path';

// ログクリーンアップ設定
export const LOG_CLEANUP_CONFIG = {
  // ログファイルの保持期間（日数）
  retentionDays: {
    error: 30,      // エラーログは30日間保持
    combined: 14,   // 一般ログは14日間保持
    debug: 7,       // デバッグログは7日間保持
    exceptions: 30, // 例外ログは30日間保持
    rejections: 30, // 拒否ログは30日間保持
    client: 7       // クライアントログは7日間保持
  },
  
  // ログファイルの最大サイズ（MB）
  maxFileSize: 50,
  
  // ログディレクトリの最大サイズ（MB）
  maxDirectorySize: 500,
  
  // クリーンアップ実行間隔（ミリ秒）
  cleanupInterval: 24 * 60 * 60 * 1000, // 24時間
  
  // 緊急クリーンアップの閾値（MB）
  emergencyCleanupThreshold: 1000
} as const;

// ログファイル情報の型定義
interface LogFileInfo {
  name: string;
  path: string;
  size: number;
  created: Date;
  type: keyof typeof LOG_CLEANUP_CONFIG.retentionDays;
}

// ログファイルのクリーンアップクラス
export class LogCleanupManager {
  private logDir: string;
  private isRunning: boolean = false;
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
  }

  // ログディレクトリの存在確認と作成
  private ensureLogDirectory(): void {
    // Vercel環境ではファイルシステムへの書き込みを無効化
    if (process.env.VERCEL === '1') {
      return;
    }
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // ログファイル情報の取得
  private getLogFiles(): LogFileInfo[] {
    // Vercel環境ではファイル操作を無効化
    if (process.env.VERCEL === '1') {
      return [];
    }
    
    this.ensureLogDirectory();
    
    const files: LogFileInfo[] = [];
    
    try {
      const fileList = fs.readdirSync(this.logDir);
      
      for (const fileName of fileList) {
        const filePath = path.join(this.logDir, fileName);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && fileName.endsWith('.log')) {
          const fileInfo: LogFileInfo = {
            name: fileName,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            type: this.getLogType(fileName)
          };
          
          files.push(fileInfo);
        }
      }
    } catch (error) {
      console.error('ログファイル一覧の取得に失敗:', error);
    }
    
    return files;
  }

  // ログファイルのタイプを判定
  private getLogType(fileName: string): keyof typeof LOG_CLEANUP_CONFIG.retentionDays {
    if (fileName.includes('error')) return 'error';
    if (fileName.includes('combined')) return 'combined';
    if (fileName.includes('debug')) return 'debug';
    if (fileName.includes('exceptions')) return 'exceptions';
    if (fileName.includes('rejections')) return 'rejections';
    if (fileName.includes('client')) return 'client';
    return 'combined'; // デフォルト
  }

  // 古いログファイルの削除
  private deleteOldFiles(): { deleted: number; freedSpace: number } {
    // Vercel環境ではファイル操作を無効化
    if (process.env.VERCEL === '1') {
      return { deleted: 0, freedSpace: 0 };
    }
    
    const files = this.getLogFiles();
    const now = new Date();
    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of files) {
      const retentionDays = LOG_CLEANUP_CONFIG.retentionDays[file.type];
      const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
      
      if (file.created < cutoffDate) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          freedSpace += file.size;
          console.log(`削除されたログファイル: ${file.name} (${Math.round(file.size / 1024)}KB)`);
        } catch (error) {
          console.error(`ログファイルの削除に失敗: ${file.name}`, error);
        }
      }
    }

    return { deleted: deletedCount, freedSpace };
  }

  // 大きなログファイルの圧縮
  private compressLargeFiles(): { compressed: number; savedSpace: number } {
    // Vercel環境ではファイル操作を無効化
    if (process.env.VERCEL === '1') {
      return { compressed: 0, savedSpace: 0 };
    }
    
    const files = this.getLogFiles();
    let compressedCount = 0;
    let savedSpace = 0;

    for (const file of files) {
      const sizeInMB = file.size / (1024 * 1024);
      
      if (sizeInMB > LOG_CLEANUP_CONFIG.maxFileSize) {
        try {
          // ファイルを圧縮（gzip形式）
          const compressedPath = `${file.path}.gz`;
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const gzip = require('zlib').createGzip();
          const input = fs.createReadStream(file.path);
          const output = fs.createWriteStream(compressedPath);
          
          input.pipe(gzip).pipe(output);
          
          output.on('finish', () => {
            // 元ファイルを削除
            fs.unlinkSync(file.path);
            compressedCount++;
            savedSpace += file.size - fs.statSync(compressedPath).size;
            console.log(`圧縮されたログファイル: ${file.name} (${Math.round(sizeInMB)}MB → ${Math.round((file.size - savedSpace) / (1024 * 1024))}MB)`);
          });
        } catch (error) {
          console.error(`ログファイルの圧縮に失敗: ${file.name}`, error);
        }
      }
    }

    return { compressed: compressedCount, savedSpace };
  }

  // ログディレクトリのサイズ計算
  private getDirectorySize(): number {
    const files = this.getLogFiles();
    return files.reduce((total, file) => total + file.size, 0);
  }

  // 緊急クリーンアップ（ディレクトリサイズが閾値を超えた場合）
  private emergencyCleanup(): { deleted: number; freedSpace: number } {
    // Vercel環境ではファイル操作を無効化
    if (process.env.VERCEL === '1') {
      return { deleted: 0, freedSpace: 0 };
    }
    
    const files = this.getLogFiles();
    const totalSize = this.getDirectorySize();
    const sizeInMB = totalSize / (1024 * 1024);
    
    if (sizeInMB > LOG_CLEANUP_CONFIG.emergencyCleanupThreshold) {
      console.warn(`緊急クリーンアップを実行: ディレクトリサイズ ${Math.round(sizeInMB)}MB`);
      
      // 古いファイルから順番に削除
      const sortedFiles = files.sort((a, b) => a.created.getTime() - b.created.getTime());
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const file of sortedFiles) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          freedSpace += file.size;
          
          const newSize = (totalSize - freedSpace) / (1024 * 1024);
          if (newSize < LOG_CLEANUP_CONFIG.maxDirectorySize) {
            break;
          }
        } catch (error) {
          console.error(`緊急クリーンアップでファイル削除に失敗: ${file.name}`, error);
        }
      }
      
      return { deleted: deletedCount, freedSpace };
    }
    
    return { deleted: 0, freedSpace: 0 };
  }

  // メインクリーンアップ処理
  public async performCleanup(): Promise<{
    deleted: number;
    compressed: number;
    freedSpace: number;
    savedSpace: number;
    emergency: boolean;
  }> {
    console.log('ログクリーンアップを開始...');
    
    // 緊急クリーンアップの確認
    const emergencyResult = this.emergencyCleanup();
    
    // 通常のクリーンアップ
    const deleteResult = this.deleteOldFiles();
    const compressResult = this.compressLargeFiles();
    
    const result = {
      deleted: deleteResult.deleted + emergencyResult.deleted,
      compressed: compressResult.compressed,
      freedSpace: deleteResult.freedSpace + emergencyResult.freedSpace,
      savedSpace: compressResult.savedSpace,
      emergency: emergencyResult.deleted > 0
    };
    
    console.log('ログクリーンアップ完了:', result);
    return result;
  }

  // 定期クリーンアップの開始
  public startPeriodicCleanup(): void {
    if (this.isRunning) {
      console.warn('定期クリーンアップは既に実行中です');
      return;
    }
    
    this.isRunning = true;
    console.log('定期ログクリーンアップを開始');
    
    // 初回実行
    this.performCleanup();
    
    // 定期実行
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, LOG_CLEANUP_CONFIG.cleanupInterval);
  }

  // 定期クリーンアップの停止
  public stopPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.isRunning = false;
    console.log('定期ログクリーンアップを停止');
  }

  // ログディレクトリの状態取得
  public getLogDirectoryStatus(): {
    totalFiles: number;
    totalSize: number;
    sizeInMB: number;
    files: LogFileInfo[];
  } {
    // Vercel環境では空の結果を返す
    if (process.env.VERCEL === '1') {
      return {
        totalFiles: 0,
        totalSize: 0,
        sizeInMB: 0,
        files: []
      };
    }
    
    const files = this.getLogFiles();
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    
    return {
      totalFiles: files.length,
      totalSize,
      sizeInMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      files
    };
  }
}

// シングルトンインスタンス
export const logCleanupManager = new LogCleanupManager();

// サーバー起動時の自動開始（Vercel環境では無効化）
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  logCleanupManager.startPeriodicCleanup();
}
