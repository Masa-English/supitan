# GitHub Actions 設定ガイド

このドキュメントでは、Vercelにデプロイする前の品質チェックとしてGitHub Actionsを設定する方法を説明します。

## 概要

GitHub Actionsワークフローは以下の4つのジョブを実行します：

1. **quality-check**: 包括的な品質チェック
2. **security-check**: セキュリティ監査
3. **build-test**: ビルドとテスト
4. **database-check**: データベース設定チェック

## 必要なGitHub Secrets

GitHub Actionsが正常に動作するために、以下のSecretsを設定する必要があります：

### 必須のSecrets

1. **NEXT_PUBLIC_SUPABASE_URL**
   - SupabaseプロジェクトのURL
   - 例: `https://your-project.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabaseプロジェクトの匿名キー
   - Supabaseダッシュボードの「Settings」→「API」から取得

### オプションのSecrets

3. **SUPABASE_ACCESS_TOKEN** (データベース操作に使用)
   - Supabase CLI用のアクセストークン
   - https://supabase.com/dashboard/account/tokens から取得

## GitHub Secretsの設定方法

1. GitHubリポジトリのページに移動
2. 「Settings」タブをクリック
3. 左サイドバーから「Secrets and variables」→「Actions」を選択
4. 「New repository secret」ボタンをクリック
5. 上記のSecretsを追加

## ワークフローの実行

ワークフローは以下のタイミングで自動実行されます：

- `main`ブランチへのプッシュ
- `develop`ブランチへのプッシュ
- `main`または`develop`ブランチへのプルリクエスト

## トラブルシューティング

### よくある問題

1. **build-testジョブの失敗**
   - `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されているか確認
   - 環境変数が正しい形式か確認

2. **database-checkジョブの失敗**
   - `supabase/config.toml`ファイルが存在するか確認
   - `supabase/migrations/`ディレクトリにSQLファイルが存在するか確認

3. **quality-checkジョブの失敗**
   - ローカルで`npm run quality-check`を実行して詳細を確認
   - 依存関係の更新が必要な場合がある

### ローカルでのテスト

デプロイ前にローカルでテストを実行することを推奨します：

```bash
# 品質チェック
npm run quality-check

# 個別テスト
npm run lint
npm run type-check
npm run test
npm run build
```

## ワークフローファイルの場所

- `.github/workflows/quality-check.yml`

## 品質チェックスクリプト

- `scripts/quality-check.mjs`

このスクリプトは以下の項目をチェックします：

- 依存関係のセキュリティ監査
- ESLintによるコード品質チェック
- TypeScript型チェック
- Next.jsビルドテスト
- 設定ファイルの存在確認
- データベース設定の確認
- セキュリティチェック

## 注意事項

- ワークフローは約1-2分で完了します
- 失敗した場合は、GitHub Actionsのログを確認して詳細なエラー情報を確認してください
- 初回実行時は依存関係のインストールに時間がかかる場合があります 