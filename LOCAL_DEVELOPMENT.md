# ローカル開発環境セットアップガイド

このガイドでは、Supabaseを使用したローカル開発環境の設定方法を説明します。

## 前提条件

1. **Docker Desktop** がインストールされていること
   - [Docker Desktop](https://docs.docker.com/desktop) からダウンロード・インストール
   - インストール後、Docker Desktopを起動してください

2. **Supabase CLI** がインストールされていること（既にインストール済み）

## セットアップ手順

### 1. 初期セットアップの確認

```bash
npm run local-setup
```

このコマンドで必要な環境が整っているかチェックできます。

### 2. リモートスキーマとデータの完全同期

リモートのSupabaseデータベースと完全に同じ状態にするには、以下の手順を実行します：

#### スキーマの同期
```bash
# リモートのスキーマを取得
supabase db pull

# ローカルデータベースにスキーマを適用
supabase db reset
```

#### データの同期
```bash
# リモートのデータを取得
supabase db dump --data-only --use-copy -f remote_data.sql

# ローカルデータベースにデータを復元
Get-Content -Path remote_data.sql -Encoding UTF8 | docker exec -i supabase_db_project-masa-flash-with-quiz psql -U postgres -d postgres
```

**注意**: 文字エンコーディングの問題で一部データが正しく表示されない場合がありますが、アプリケーションからは正常にアクセスできます。

### 3. ローカルSupabaseの起動

```bash
npm run db:start
```

初回起動時は Docker イメージのダウンロードに時間がかかります。
起動完了後、以下のサービスが利用可能になります：

- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Inbucket (メールテスト)**: http://127.0.0.1:54324

### 4. アプリケーションの起動

```bash
npm run dev:local
```

このコマンドで：
- ローカル開発用の環境変数（`.env.local.development`）が適用されます
- Next.jsアプリケーションが http://localhost:3000 で起動します

## 利用可能なコマンド

### データベース関連
- `npm run db:start` - ローカルSupabaseを起動
- `npm run db:stop` - ローカルSupabaseを停止
- `npm run db:status` - サービスの状態確認
- `npm run db:reset` - データベースをリセット
- `npm run sync-schema` - リモートスキーマを同期

### Supabase CLI コマンド
- `supabase db pull` - リモートスキーマを取得
- `supabase db dump --data-only --use-copy` - リモートデータをダンプ
- `supabase db diff` - ローカルとリモートの差分確認
- `supabase migration list` - マイグレーション履歴確認

### 開発環境
- `npm run dev:local` - ローカル環境でアプリ起動
- `npm run dev:prod` - 本番環境設定でアプリ起動
- `npm run dev` - 通常の開発モード

## 環境変数ファイル

- `.env.local.development` - ローカル開発用設定
- `.env.local` - 現在の環境設定（自動生成）
- `.env.production` - 本番環境設定

## ローカル開発のワークフロー

1. **毎日の開発開始時**:
   ```bash
   # Docker Desktopが起動していることを確認
   npm run db:start
   npm run dev:local
   ```

2. **スキーマ変更時**:
   ```bash
   # リモートでスキーマを変更した後
   supabase db pull
   supabase db reset
   ```

3. **リモートデータと完全同期したい時**:
   ```bash
   # スキーマとデータを完全同期
   supabase db pull
   supabase db reset
   supabase db dump --data-only --use-copy -f remote_data.sql
   Get-Content -Path remote_data.sql -Encoding UTF8 | docker exec -i supabase_db_project-masa-flash-with-quiz psql -U postgres -d postgres
   ```

4. **開発終了時**:
   ```bash
   npm run db:stop
   ```

## トラブルシューティング

### Docker関連のエラー
- Docker Desktopが起動していることを確認
- Docker Desktopを再起動してみる

### ポート競合エラー
- 他のアプリケーションが同じポートを使用していないか確認
- `supabase/config.toml` でポート番号を変更可能

### データベース接続エラー
- `npm run db:status` でサービス状態を確認
- `npm run db:stop && npm run db:start` で再起動

## 便利な機能

### Supabase Studio
http://127.0.0.1:54323 でローカルのSupabase Studioにアクセスできます。
- データベースの内容確認・編集
- SQLクエリの実行
- ストレージの管理

### メールテスト（Inbucket）
http://127.0.0.1:54324 でローカルで送信されたメールを確認できます。
- ユーザー登録確認メール
- パスワードリセットメール
- その他の通知メール

## 同期状況の確認

現在のデータ同期状況を確認するには、以下のコマンドを実行してください：

```bash
# データベース接続確認
docker exec supabase_db_project-masa-flash-with-quiz psql -U postgres -d postgres -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 
  'words' as table_name, COUNT(*) as count FROM public.words
UNION ALL
SELECT 
  'categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 
  'admins' as table_name, COUNT(*) as count FROM public.admins
ORDER BY table_name;
"
```

期待される結果：
- users: 6件
- words: 27件  
- categories: 8件
- admins: 4件

## データ同期の詳細

### 現在同期されているデータ
- **ユーザーデータ**: 6件のユーザーアカウント
- **単語データ**: 27件の英単語（句動詞中心）
- **カテゴリデータ**: 8件のカテゴリ（動詞、句動詞、形容詞など）
- **管理者データ**: 4件の管理者アカウント
- **学習履歴**: 78件の学習セッション、10件の復習単語
- **ストレージ**: 音声ファイル情報（137件）

### 文字エンコーディングについて
PowerShellとPostgreSQLクライアント間のエンコーディングの問題により、コンソールでは日本語が文字化けして表示される場合がありますが、実際のアプリケーションからは正常にアクセスできます。

## 注意事項

- ローカル環境のデータは `supabase db reset` で初期化されます
- 本番環境とローカル環境は完全に分離されています
- ローカルでの変更は本番環境に影響しません
- データ同期は一方向（リモート→ローカル）のみです