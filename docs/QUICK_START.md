# ⚡ クイックスタートガイド

## 🎯 5分で開発環境を立ち上げる

このガイドに従えば、5分以内にスピ単アプリの開発環境を準備できます。

## 📋 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Git

## 🚀 手順

### 1. 環境変数の設定（1分）

```bash
# 環境変数ファイルをコピー
cp env.example .env.local
```

`.env.local`を編集して、Supabaseの設定を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 依存関係のインストール（2分）

```bash
npm install
```

### 3. 開発サーバーの起動（1分）

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセス可能です。

### 4. 動作確認（1分）

- [ ] ランディングページが表示される
- [ ] ログインページにアクセスできる
- [ ] ビルドエラーがない

## 🔧 よくある問題と解決策

### 問題1: 環境変数エラー
```
Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL
```

**解決策**:
```bash
# .env.localファイルが存在するか確認
ls -la .env.local

# 環境変数が正しく設定されているか確認
cat .env.local
```

### 問題2: 依存関係エラー
```
Error: Cannot find module 'xxx'
```

**解決策**:
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題3: ポートが使用中
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決策**:
```bash
# 別のポートで起動
npm run dev -- -p 3001
```

## 📊 開発コマンド一覧

### 基本コマンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
```

### 品質チェック
```bash
npm run type-check   # TypeScript型チェック
npm run lint         # ESLint実行
npm run lint:fix     # ESLint自動修正
npm test             # テスト実行
```

### データベース関連
```bash
npm run sync-types   # 型定義同期
npm run db:status    # データベース状態確認
```

## 🎨 開発のベストプラクティス

### 1. ブランチ戦略
```bash
# 新機能開発
git checkout -b feature/機能名

# バグ修正
git checkout -b fix/バグ名

# ホットフィックス
git checkout -b hotfix/緊急修正名
```

### 2. コミットメッセージ
```bash
# 機能追加
git commit -m "feat: 新機能の追加"

# バグ修正
git commit -m "fix: バグの修正"

# ドキュメント更新
git commit -m "docs: ドキュメント更新"

# リファクタリング
git commit -m "refactor: コードの改善"
```

### 3. コード品質
- コミット前に必ず`npm run lint`を実行
- 型エラーは`npm run type-check`で確認
- テストは`npm test`で実行

## 🔍 デバッグのヒント

### 1. コンソールログ
```typescript
// 開発環境でのみログ出力
if (process.env.NODE_ENV === 'development') {
  console.log('デバッグ情報:', data);
}
```

### 2. 型エラーの確認
```bash
# 型エラーの詳細表示
npx tsc --noEmit --pretty
```

### 3. ビルド分析
```bash
# バンドルサイズの分析
npm run build:analyze
```

## 📱 テスト実行

### 単体テスト
```bash
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き
```

### E2Eテスト
```bash
npm run test:e2e      # E2Eテスト実行
```

## 🚀 デプロイ準備

### 本番ビルド確認
```bash
npm run build         # ビルド実行
npm run start         # 本番サーバー起動
```

### デプロイ前チェック
```bash
npm run deploy-check  # デプロイ前チェック
```

## 📚 参考ドキュメント

- [改修作業ガイド](REFACTORING_GUIDE.md) - 詳細な改修手順
- [プロジェクト現状ステータス](CURRENT_STATUS.md) - 現在の状況
- [アーキテクチャ設計書](ARCHITECTURE.md) - システム設計
- [API仕様書](API_SPECIFICATION.md) - API詳細

## 🆘 サポート

### 問題が解決しない場合
1. [GitHub Issues](https://github.com/your-repo/issues)で検索
2. 新しいIssueを作成
3. 開発チームに相談

### 緊急時
- プロジェクトのREADME.mdを確認
- ドキュメントフォルダを参照
- チームメンバーに連絡

---

**最終更新**: 2024-12-27
**更新者**: AI Assistant
