# ログ管理ガイド

このプロジェクトでは、Winstonを使用した一元化されたログ管理システムを採用しています。

## 概要

- **開発環境**: コンソールにログを出力
- **本番環境**: ファイルにログを出力（日次ローテーション）
- **カテゴリ別管理**: ログをカテゴリごとに分類
- **パフォーマンス測定**: 実行時間の測定機能

## 使用方法

### サーバーサイド（Node.js環境）

```typescript
import log from '@/lib/utils/logger';

// 基本的な使用方法
log.info('情報メッセージ');
log.error('エラーメッセージ');
log.warn('警告メッセージ');
log.debug('デバッグメッセージ');

// カテゴリ別ログ
log.audio('音声関連のログ');
log.auth('認証関連のログ');
log.database('データベース関連のログ');
log.api('API関連のログ');
log.performance('パフォーマンス関連のログ');

// メタデータ付きログ
log.error('エラーが発生しました', log.LogCategory.ERROR, { 
  userId: '123', 
  action: 'login' 
});
```

### クライアントサイド（ブラウザ環境）

```typescript
import clientLogger from '@/lib/utils/client-logger';

// 基本的な使用方法
clientLogger.info('情報メッセージ');
clientLogger.error('エラーメッセージ');
clientLogger.warn('警告メッセージ');
clientLogger.debug('デバッグメッセージ');

// カテゴリ別ログ
clientLogger.audio('音声関連のログ');
clientLogger.ui('UI関連のログ');
clientLogger.performance('パフォーマンス関連のログ');
```

### パフォーマンス測定

```typescript
import { performanceLogger } from '@/lib/utils/logger';

// パフォーマンス測定
const timer = performanceLogger.start('データベースクエリ');
// ... 処理 ...
const duration = timer.end({ query: 'SELECT * FROM users' });
```

## ログレベル

### サーバーサイド
- `error`: エラーログ
- `warn`: 警告ログ
- `info`: 情報ログ
- `http`: HTTPリクエストログ
- `verbose`: 詳細ログ
- `debug`: デバッグログ
- `silly`: 最も詳細なログ

### クライアントサイド
- `error`: エラーログ
- `warn`: 警告ログ
- `info`: 情報ログ
- `debug`: デバッグログ

## ログカテゴリ

### サーバーサイド
- `AUDIO`: 音声関連
- `AUTH`: 認証関連
- `DATABASE`: データベース関連
- `API`: API関連
- `UI`: UI関連
- `PERFORMANCE`: パフォーマンス関連
- `ERROR`: エラー関連
- `GENERAL`: 一般的なログ

### クライアントサイド
- `AUDIO`: 音声関連
- `UI`: UI関連
- `PERFORMANCE`: パフォーマンス関連
- `ERROR`: エラー関連
- `GENERAL`: 一般的なログ

## 環境別の動作

### 開発環境 (`NODE_ENV=development`)
- コンソールにログを出力
- すべてのログレベルが表示される
- カラー表示で見やすく表示

### 本番環境 (`NODE_ENV=production`)
- ファイルにログを出力
- ログファイルは日次でローテーション
- エラーと警告のみコンソールに出力
- ログファイルは `logs/` ディレクトリに保存

## ログファイル

本番環境では以下のログファイルが生成されます：

- `logs/error-YYYY-MM-DD.log`: エラーログ
- `logs/combined-YYYY-MM-DD.log`: すべてのログ（info以上）
- `logs/debug-YYYY-MM-DD.log`: デバッグログ
- `logs/exceptions-YYYY-MM-DD.log`: 未キャッチ例外
- `logs/rejections-YYYY-MM-DD.log`: 未ハンドルPromise拒否

## ログファイルの管理

- 最大ファイルサイズ: 20MB
- 保持期間: 14日間
- 自動ローテーション: 日次

## ベストプラクティス

1. **適切なログレベルを使用**
   - `error`: システムエラーや例外
   - `warn`: 警告や注意が必要な状況
   - `info`: 重要な処理の開始・終了
   - `debug`: デバッグ情報

2. **カテゴリを適切に使用**
   - 関連する機能ごとにカテゴリを分ける
   - ログの検索・フィルタリングが容易になる

3. **メタデータを含める**
   - ユーザーID、リクエストID、処理時間など
   - 問題の特定と解決が容易になる

4. **機密情報を含めない**
   - パスワード、トークン、個人情報など
   - ログファイルに機密情報が残らないよう注意

## トラブルシューティング

### ログが出力されない場合
1. `NODE_ENV` の設定を確認
2. ログレベルが適切か確認
3. ログディレクトリの権限を確認

### ログファイルが大きくなりすぎる場合
1. ログレベルを調整
2. 不要なログを削除
3. ローテーション設定を調整

## 移行ガイド

既存の `console.log` から新しいログシステムへの移行：

```typescript
// 従来の方法
console.log('メッセージ');
console.error('エラー:', error);

// 新しい方法
log.info('メッセージ');
log.error('エラー', log.LogCategory.ERROR, { error: error.message });
```

## 設定のカスタマイズ

ログ設定を変更する場合は、`lib/utils/logger.ts` を編集してください：

- ログレベル
- ファイルサイズ制限
- 保持期間
- フォーマット
- 出力先
