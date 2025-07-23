# 🚀 開発ワークフロー - Supabaseマイグレーション管理

このドキュメントでは、[Zennの記事](https://zenn.dev/caen/articles/12980373eacb78)を参考にした、リモートSupabase環境との整合性を重視した開発フローを説明します。

## 📋 基本方針

- **リモート環境をメイン**として使用
- **マイグレーション管理**で整合性を保つ
- **開発ブランチ**と**本番環境**を適切に分離
- **捨てるブランチのマイグレーション**が本番に混ざらないようにする

## 🏗️ 初期セットアップ

### 1. Supabase CLIのインストール

```bash
# npm経由
npm install -g supabase

# Homebrew経由 (macOS)
brew install supabase/tap/supabase

# 確認
supabase --version
```

### 2. プロジェクトの初期化

```bash
# Supabaseプロジェクトを初期化
npm run db:init

# リモートプロジェクトにリンク
npm run db:link YOUR_PROJECT_REF

# 既存のスキーマを同期
npm run db:pull
```

### 3. 環境変数の設定

```bash
# .env.local に追加
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🔄 日常の開発フロー

### パターン1: 新機能開発（推奨）

```bash
# 1. 新しいブランチを作成
git checkout -b feature/user-profiles

# 2. マイグレーションファイルを生成
npm run db:generate create_user_profiles_table

# 3. SQLを編集
# supabase/migrations/[timestamp]_create_user_profiles_table.sql

# 4. ローカル環境でテスト（オプション）
npm run db:migrate:local

# 5. リモート環境に適用
npm run db:migrate

# 6. アプリケーションコードを実装
# components/profile-form.tsx など

# 7. テスト・確認後、プルリクエスト作成
```

### パターン2: 緊急修正

```bash
# 1. 修正ブランチを作成
git checkout -b hotfix/fix-user-table

# 2. マイグレーションファイルを生成
npm run db:generate fix_user_table_constraint

# 3. 修正SQLを記述
# ALTER TABLE users ADD CONSTRAINT ...

# 4. リモート環境に直接適用
npm run db:migrate

# 5. 修正確認後、即座にマージ
```

## 🗂️ マイグレーションファイルの管理

### ファイル構造

```
supabase/
├── config.toml                    # Supabase設定
├── migrations/
│   ├── 20241227000001_create_user_profiles.sql
│   ├── 20241227120000_add_user_settings.sql
│   └── 20241228090000_fix_profile_constraints.sql
└── seed.sql                       # 初期データ（オプション）
```

### マイグレーションファイルの書き方

```sql
-- Migration: Create user_profiles table
-- Created at: 2024-12-27 00:00:01
-- Description: ユーザープロフィール情報を管理するテーブル

-- テーブル作成
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    study_goal INTEGER DEFAULT 10,
    preferred_language TEXT DEFAULT 'ja' CHECK (preferred_language IN ('ja', 'en')),
    timezone TEXT DEFAULT 'Asia/Tokyo',
    notification_settings JSONB DEFAULT '{"daily_reminder": true, "achievement": true, "review_reminder": true}'::jsonb,
    study_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_study_date ON user_profiles(last_study_date);

-- RLS有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE user_profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN user_profiles.display_name IS '表示名';
COMMENT ON COLUMN user_profiles.study_goal IS '1日の学習目標（単語数）';
COMMENT ON COLUMN user_profiles.preferred_language IS '優先言語（ja/en）';
COMMENT ON COLUMN user_profiles.notification_settings IS '通知設定（JSON）';
```

## 🚨 トラブル対応

### ケース1: 不要なマイグレーションを適用してしまった

```bash
# 1. 逆マイグレーションファイルを作成
npm run db:generate rollback_unnecessary_changes

# 2. 逆の操作を記述
# DROP TABLE unnecessary_table;
# ALTER TABLE users DROP COLUMN unnecessary_column;

# 3. 適用
npm run db:migrate

# 4. 不要なマイグレーションファイルをGitから削除
git rm supabase/migrations/[不要なファイル].sql
```

### ケース2: マイグレーションが失敗した

```bash
# 1. 状態確認
npm run db:status

# 2. エラー内容を確認
supabase db push --linked --debug

# 3. 修正マイグレーションを作成
npm run db:generate fix_migration_error

# 4. 修正後再適用
npm run db:migrate
```

### ケース3: ローカルとリモートの同期がずれた

```bash
# 1. リモートから最新スキーマを取得
npm run db:pull

# 2. 差分を確認
git diff supabase/migrations/

# 3. 必要に応じて手動調整
# 4. 再同期
npm run db:migrate
```

## 🎯 ベストプラクティス

### ✅ 推奨事項

1. **マイグレーションファイルに詳細なコメントを記述**
2. **破壊的変更は段階的に実行**（カラム削除前にNULL許可など）
3. **本番適用前にステージング環境でテスト**
4. **バックアップを定期的に取得**
5. **RLSポリシーを必ず設定**

### ❌ 避けるべき事項

1. **直接SQLエディタでスキーマ変更**（マイグレーション履歴が残らない）
2. **マイグレーションファイルの直接編集**（適用済みの場合）
3. **本番環境での実験的変更**
4. **RLSポリシーなしでのテーブル作成**

## 📊 コマンド一覧

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `npm run db:init` | プロジェクト初期化 | 初回セットアップ時 |
| `npm run db:link` | リモートプロジェクトにリンク | `npm run db:link abc123` |
| `npm run db:pull` | リモートスキーマを同期 | 既存プロジェクトの取り込み |
| `npm run db:generate` | マイグレーション生成 | `npm run db:generate add_profiles` |
| `npm run db:migrate` | リモートに適用 | 本番・ステージング適用 |
| `npm run db:migrate:local` | ローカルに適用 | ローカルテスト用 |
| `npm run db:status` | 状態確認 | 現在の同期状況確認 |
| `npm run db:reset` | ローカルリセット | ローカル環境の初期化 |

## 🔗 参考リンク

- [Supabase CLI を使ってデータベース（PostgreSQL）関連を操作するやり方](https://zenn.dev/caen/articles/12980373eacb78)
- [Supabase CLI 公式ドキュメント](https://supabase.com/docs/guides/cli)
- [PostgreSQL マイグレーション ベストプラクティス](https://supabase.com/docs/guides/database/migrations) 