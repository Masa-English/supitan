# Next.jsにおけるWinstonログ管理ベストプラクティス

このプロジェクトでは、Next.jsの特性を活かしたWinstonログ管理システムを実装しています。

## アーキテクチャ概要

### サーバーサイド vs クライアントサイドの分離

```
┌─────────────────┐    ┌─────────────────┐
│   サーバーサイド   │    │   クライアントサイド │
│                 │    │                 │
│ server-logger.ts │    │ client-logger.ts │
│ - Winston使用    │    │ - コンソールログ   │
│ - ファイル出力    │    │ - バッファリング   │
│ - 構造化ログ     │    │ - API送信       │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   ログファイル     │    │   /api/logs/client │
│ - 日次ローテーション │    │ - サーバーに送信   │
│ - 圧縮・保持管理   │    │ - 統合ログ管理   │
└─────────────────┘    └─────────────────┘
```

## 実装の特徴

### 1. 環境別の適切な分離

#### サーバーサイド（Node.js環境）
- **開発環境**: コンソールにカラー出力
- **本番環境**: ファイルに構造化ログ出力
- **Winston**: 本格的なログ管理機能

#### クライアントサイド（ブラウザ環境）
- **開発環境**: コンソールに詳細出力
- **本番環境**: エラー・警告のみ出力
- **バッファリング**: メモリ内でログを蓄積
- **API送信**: サーバーにログを送信して統合

### 2. カテゴリ別ログ管理

#### サーバーサイドカテゴリ
```typescript
enum LogCategory {
  AUTH = 'auth',           // 認証関連
  DATABASE = 'database',   // データベース操作
  API = 'api',            // API処理
  PERFORMANCE = 'performance', // パフォーマンス
  ERROR = 'error',        // エラー
  GENERAL = 'general',    // 一般的
  MIDDLEWARE = 'middleware', // ミドルウェア
  BUILD = 'build'         // ビルド関連
}
```

#### クライアントサイドカテゴリ
```typescript
enum LogCategory {
  AUDIO = 'audio',        // 音声関連
  UI = 'ui',             // UI操作
  PERFORMANCE = 'performance', // パフォーマンス
  ERROR = 'error',       // エラー
  GENERAL = 'general',   // 一般的
  STORE = 'store',       // 状態管理
  HOOK = 'hook'          // React Hooks
}
```

## 使用方法

### サーバーサイドでの使用

```typescript
// API Routes, Server Components, Middleware
import serverLog, { LogCategory } from '@/lib/utils/server-logger';

// 基本的な使用
serverLog.info('処理開始');
serverLog.error('エラー発生', LogCategory.ERROR, { userId: '123' });

// カテゴリ別メソッド
serverLog.auth('ユーザー認証成功', { userId: '123' });
serverLog.database('クエリ実行', { query: 'SELECT * FROM users' });
serverLog.api('API呼び出し', { endpoint: '/api/users' });

// パフォーマンス測定
const timer = serverPerformanceLogger.start('データベースクエリ');
// ... 処理 ...
timer.end({ recordCount: 100 });
```

### クライアントサイドでの使用

```typescript
// Client Components, Hooks, Stores
import clientLogger from '@/lib/utils/client-logger';

// 基本的な使用
clientLogger.info('コンポーネント初期化');
clientLogger.error('エラー発生', clientLogger.LogCategory.ERROR, { component: 'AudioPlayer' });

// カテゴリ別メソッド
clientLogger.audio('音声再生開始', { audioId: '123' });
clientLogger.ui('ボタンクリック', { buttonId: 'submit' });
clientLogger.store('状態更新', { store: 'audio', action: 'play' });

// パフォーマンス測定
const timer = clientPerformanceLogger.start('レンダリング');
// ... 処理 ...
timer.end({ componentCount: 5 });
```

## ログファイル管理

### 本番環境でのファイル出力

```
logs/
├── error-2024-01-15.log      # エラーログ（30日間保持）
├── combined-2024-01-15.log   # 全ログ（14日間保持）
├── debug-2024-01-15.log      # デバッグログ（7日間保持）
├── exceptions-2024-01-15.log # 未キャッチ例外（30日間保持）
├── rejections-2024-01-15.log # 未ハンドルPromise拒否（30日間保持）
└── client-2024-01-15.log     # クライアントログ（7日間保持）
```

### ローテーション設定
- **エラーログ**: 50MB、30日間保持、圧縮アーカイブ
- **一般ログ**: 30MB、14日間保持、圧縮アーカイブ
- **デバッグログ**: 20MB、7日間保持、圧縮アーカイブ
- **ローテーション**: 日次
- **自動圧縮**: 有効（gzip形式）

## セキュリティ考慮事項

### 機密情報のフィルタリング
```typescript
// 自動的にフィルタリングされるキー
const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];

// 使用例
clientLogger.info('ログイン試行', { 
  userId: '123',
  password: 'secret123' // → '[FILTERED]' に変換される
});
```

### ログレベルの適切な設定
- **開発環境**: `debug` - すべてのログを表示
- **本番環境**: `info` - 重要なログのみ表示
- **テスト環境**: `error` - エラーのみ表示

## パフォーマンス最適化

### クライアントサイドのバッファリング
```typescript
// メモリ内でログを蓄積
const logBuffer = [];
const maxBufferSize = 100;

// 定期的にサーバーに送信
setInterval(() => {
  clientLogger.sendLogsToServer();
}, 30000); // 30秒間隔
```

### 非同期ログ送信
```typescript
// ページ離脱時にもログを送信
window.addEventListener('beforeunload', () => {
  clientLogger.sendLogsToServer();
});
```

## ログファイルの自動クリーンアップ

### 定期クリーンアップ機能
- **自動実行**: 本番環境で24時間間隔で自動実行
- **古いファイル削除**: 保持期間を超えたログファイルを自動削除
- **大容量ファイル圧縮**: 50MBを超えるファイルを自動圧縮
- **緊急クリーンアップ**: ディレクトリサイズが1GBを超えた場合の緊急処理

### クリーンアップ設定
```typescript
const LOG_CLEANUP_CONFIG = {
  retentionDays: {
    error: 30,      // エラーログは30日間保持
    combined: 14,   // 一般ログは14日間保持
    debug: 7,       // デバッグログは7日間保持
    exceptions: 30, // 例外ログは30日間保持
    rejections: 30, // 拒否ログは30日間保持
    client: 7       // クライアントログは7日間保持
  },
  maxFileSize: 50,           // 最大ファイルサイズ（MB）
  maxDirectorySize: 500,     // 最大ディレクトリサイズ（MB）
  emergencyCleanupThreshold: 1000 // 緊急クリーンアップ閾値（MB）
};
```

### クリーンアップAPI
```typescript
// 手動クリーンアップ実行
POST /api/logs/cleanup
{
  "force": true,      // 強制実行
  "emergency": false  // 緊急クリーンアップ
}

// ログディレクトリ状態取得
GET /api/logs/cleanup

// 定期クリーンアップ制御
PUT /api/logs/cleanup
{
  "action": "start" // または "stop"
}
```

## トラブルシューティング

### ログが出力されない場合
1. **環境変数の確認**: `NODE_ENV`が正しく設定されているか
2. **ログレベルの確認**: 現在のログレベルが適切か
3. **ファイル権限の確認**: ログディレクトリの書き込み権限

### ログファイルが大きくなりすぎる場合
1. **自動クリーンアップの確認**: 定期クリーンアップが動作しているか
2. **ログレベルの調整**: 不要なログを削除
3. **ローテーション設定の調整**: 保持期間やファイルサイズを変更
4. **手動クリーンアップ**: APIエンドポイントを使用して手動実行
5. **緊急クリーンアップ**: ディレクトリサイズが閾値を超えた場合の自動処理

## 監視とアラート

### ログ監視の設定
```typescript
// エラーログの監視
serverLog.error('Critical error occurred', LogCategory.ERROR, {
  severity: 'critical',
  alert: true
});
```

### メトリクス収集
```typescript
// パフォーマンスメトリクス
const timer = serverPerformanceLogger.start('API処理');
// ... 処理 ...
const duration = timer.end({ endpoint: '/api/users' });

// 閾値を超えた場合のアラート
if (duration > 5000) {
  serverLog.warn('Slow API response', LogCategory.PERFORMANCE, {
    duration,
    threshold: 5000
  });
}
```

## ベストプラクティス

### 1. 適切なログレベルの使用
- `error`: システムエラーや例外
- `warn`: 警告や注意が必要な状況
- `info`: 重要な処理の開始・終了
- `debug`: デバッグ情報

### 2. 構造化ログの活用
```typescript
// 良い例
serverLog.info('User login', LogCategory.AUTH, {
  userId: '123',
  method: 'email',
  success: true,
  duration: 150
});

// 悪い例
serverLog.info('User 123 logged in via email successfully in 150ms');
```

### 3. カテゴリの適切な使用
- 関連する機能ごとにカテゴリを分ける
- ログの検索・フィルタリングが容易になる
- 監視・アラートの設定が簡単になる

### 4. パフォーマンスへの配慮
- 本番環境では不要なログを出力しない
- クライアントサイドではバッファリングを活用
- 非同期でのログ送信を心がける

## 移行ガイド

### 既存のconsole.logからの移行
```typescript
// 従来の方法
console.log('メッセージ');
console.error('エラー:', error);

// 新しい方法（サーバーサイド）
serverLog.info('メッセージ');
serverLog.error('エラー', LogCategory.ERROR, { error: error.message });

// 新しい方法（クライアントサイド）
clientLogger.info('メッセージ');
clientLogger.error('エラー', clientLogger.LogCategory.ERROR, { error: error.message });
```

この実装により、Next.jsの特性を活かした効率的で管理しやすいログシステムを構築できます。
