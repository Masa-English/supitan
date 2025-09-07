# データベース管理ガイド

## 概要

このプロジェクトではSupabaseを使用してデータベースを管理しており、マイグレーション機能を活用して安全かつ効率的にスキーマ変更を行います。

## 整理された構成

### ファイル構成

```
supabase/
├── config.toml                              # Supabase設定ファイル
└── migrations/                              # マイグレーションファイル
    ├── 20241227000001_create_user_profiles.sql  # ユーザープロフィール
    └── 20241227000002_complete_schema.sql       # 完全なスキーマ

scripts/
└── migrate.js                               # マイグレーション管理スクリプト

sql/
└── sample-data.sql                          # サンプルデータ（参考用）
```

### 削除されたファイル

以下のファイルは重複していたため削除されました：
- `sql/database-schema.sql` - マイグレーションファイルに統合
- `sql/create-profile-table.sql` - マイグレーションファイルに統合

## データベーススキーマ

### テーブル構成

1. **user_profiles** - ユーザープロフィール情報
2. **words** - 英単語データ
3. **user_progress** - ユーザーの学習進捗
4. **study_sessions** - 学習セッション記録
5. **review_words** - 復習リスト
6. **review_sessions** - 復習セッション記録

### セキュリティ

- 全テーブルでRLS（Row Level Security）を有効化
- ユーザーは自分のデータのみアクセス可能
- wordsテーブルは全ユーザーが閲覧可能

## 管理コマンド

### NPMスクリプト

```bash
npm run db:status     # 状態確認
npm run db:apply      # マイグレーション適用
npm run db:pull       # リモートスキーマ同期
npm run db:generate   # 新しいマイグレーション生成
```

### 直接実行

```bash
node scripts/migrate.js status
node scripts/migrate.js apply
node scripts/migrate.js pull
node scripts/migrate.js generate new_feature
```

## 開発ワークフロー

### 新機能開発時

1. **現状確認**
   ```bash
   npm run db:status
   ```

2. **リモート同期**
   ```bash
   npm run db:pull
   ```

3. **マイグレーション作成**
   ```bash
   npm run db:generate add_new_feature
   ```

4. **SQLファイル編集**
   - `supabase/migrations/` 内のファイルを編集

5. **適用**
   ```bash
   npm run db:apply
   ```

### 初回セットアップ

1. **依存関係インストール**
   ```bash
   npm install
   ```

2. **プロジェクトリンク**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **状態確認**
   ```bash
   npm run db:status
   ```

## トラブルシューティング

### よくある問題

1. **プロジェクトがリンクされていない**
   - エラー: "Cannot find project ref"
   - 解決: `npx supabase link --project-ref YOUR_PROJECT_REF`

2. **データベースパスワードが必要**
   - エラー: "failed SASL auth"
   - 解決: Supabaseダッシュボードでパスワードを確認

3. **設定ファイルエラー**
   - エラー: "invalid keys"
   - 解決: `supabase/config.toml` の設定を確認

### デバッグ方法

```bash
npx supabase --debug <command>
```

## ベストプラクティス

1. **マイグレーションファイル**
   - 一つのマイグレーションで一つの機能
   - わかりやすいファイル名を使用
   - コメントを適切に記述

2. **テスト**
   - ローカル環境で十分テスト
   - 本番適用前にステージング環境で確認

3. **バックアップ**
   - 重要な変更前はバックアップを取得
   - マイグレーション前後の状態を記録

## 参考リンク

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Database Migrations](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 