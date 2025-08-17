# 🔧 改修作業ガイド

## 概要
このドキュメントは、スピ単アプリケーションの改修作業を効率的に進めるための包括的なガイドです。

## 📋 プロジェクト基本情報

### 技術スタック
- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **スタイリング**: Tailwind CSS, Radix UI
- **状態管理**: Zustand
- **テスト**: Jest, Playwright

### アーキテクチャ原則
- **SSR優先**: 可能な限りServer Componentsを使用
- **ISR活用**: 動的コンテンツの高速表示
- **統一データプロバイダー**: 効率的なデータ管理
- **モバイルファースト**: レスポンシブデザイン

## 🚀 開発環境セットアップ

### 必須環境変数
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 開発コマンド
```bash
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run type-check   # 型チェック
npm run lint         # コード品質チェック
npm test             # テスト実行
```

## 🎯 改修優先度マトリックス

### 高優先度（即座に対応）
1. **環境設定の完了**
   - 環境変数の設定
   - データベース接続確認
   - 開発環境の動作確認

2. **ビルド警告の解消**
   - 認証フローの最適化
   - 動的レンダリング問題の解決

### 中優先度（機能改善）
1. **UI/UX改善**
   - レスポンシブデザイン強化
   - アクセシビリティ向上
   - ローディング状態の改善

2. **パフォーマンス最適化**
   - 読み込み速度改善
   - キャッシュ戦略の最適化

### 低優先度（将来的な拡張）
1. **新機能追加**
   - 学習機能の拡張
   - 分析機能の強化

## 📁 重要ファイル一覧

### 認証・セキュリティ
```
app/auth/
├── actions.ts          # 認証アクション
├── login/page.tsx      # ログインページ
└── sign-up/page.tsx    # サインアップページ

lib/supabase/
├── client.ts           # クライアントサイドSupabase
└── server.ts           # サーバーサイドSupabase
```

### 学習機能コア
```
app/dashboard/category/[category]/
├── flashcard/page.tsx      # フラッシュカード学習
├── quiz/page.tsx           # クイズ学習
└── browse/page.tsx         # 単語一覧

components/learning/
├── flashcard.tsx           # フラッシュカードコンポーネント
├── quiz.tsx                # クイズコンポーネント
└── statistics-dashboard.tsx # 統計表示
```

### データ管理
```
lib/
├── data-provider.ts        # 統一データプロバイダー
├── database.ts             # データベース操作
└── database.types.ts       # 型定義
```

### UI/UX改善対象
```
components/ui/              # 基本UIコンポーネント
components/common/          # 共通コンポーネント
app/globals.css             # グローバルスタイル
```

## 🔍 現在の課題と解決策

### 1. ビルド警告
**問題**: `Dynamic server usage: Route /dashboard couldn't be rendered statically`

**解決策**:
- `app/dashboard/page.tsx`の認証チェックを最適化
- `lib/supabase/server.ts`のクッキー処理を改善

### 2. 認証フロー
**問題**: リダイレクト処理の最適化が必要

**解決策**:
- ミドルウェアでの認証チェック強化
- クライアントサイドでの状態管理改善

## 🎨 UI/UX改善ガイドライン

### デザインシステム
- **カラーパレット**: ブランドカラーの統一
- **タイポグラフィ**: フォントサイズとウェイトの一貫性
- **スペーシング**: 8pxグリッドシステムの活用
- **コンポーネント**: Radix UIベースの統一

### アクセシビリティ
- **キーボードナビゲーション**: 全インタラクティブ要素の対応
- **スクリーンリーダー**: ARIA属性の適切な使用
- **コントラスト**: WCAG準拠の色使い

### レスポンシブデザイン
- **ブレークポイント**: Tailwind CSSの標準ブレークポイント
- **モバイルファースト**: 小画面からの設計
- **タッチフレンドリー**: 44px以上のタップ領域

## 🧪 テスト戦略

### 単体テスト
- **コンポーネントテスト**: React Testing Library
- **ユーティリティテスト**: Jest
- **型テスト**: TypeScript

### E2Eテスト
- **ユーザーフロー**: Playwright
- **認証フロー**: ログイン・サインアップ
- **学習フロー**: フラッシュカード・クイズ

## 📊 パフォーマンス監視

### メトリクス
- **Core Web Vitals**: LCP, FID, CLS
- **バンドルサイズ**: 各ページのJSサイズ
- **読み込み時間**: 初回表示・遷移時間

### 最適化手法
- **ISR**: 動的コンテンツの静的生成
- **コード分割**: 動的インポート
- **画像最適化**: Next.js Image Component

## 🔄 開発ワークフロー

### 1. 機能開発
```bash
# ブランチ作成
git checkout -b feature/機能名

# 開発
npm run dev

# テスト
npm test
npm run type-check
npm run lint

# コミット
git add .
git commit -m "feat: 機能の追加"
```

### 2. 品質チェック
```bash
# ビルド確認
npm run build

# E2Eテスト
npm run test:e2e

# デプロイ前チェック
npm run deploy-check
```

## 📝 ドキュメント更新

### 更新が必要なドキュメント
- `ARCHITECTURE.md`: アーキテクチャ変更時
- `API_SPECIFICATION.md`: API変更時
- `COMPONENT_SPECIFICATION.md`: コンポーネント追加時
- `DATABASE_DESIGN.md`: データベース変更時

### ドキュメント作成ガイドライン
- **明確性**: 技術的詳細とビジネス価値の両方を記載
- **実用性**: 実際の開発で使える情報を提供
- **保守性**: 定期的な更新を前提とした構成

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. ビルドエラー
```bash
# 型エラーの確認
npm run type-check

# キャッシュクリア
rm -rf .next
npm run build
```

#### 2. データベース接続エラー
```bash
# 型定義の同期
npm run sync-types

# 接続確認
npm run db:status
```

#### 3. 認証エラー
- 環境変数の確認
- Supabaseプロジェクトの設定確認
- ブラウザのクッキー設定確認

## 📈 成功指標

### 技術指標
- **ビルド成功率**: 100%
- **テストカバレッジ**: 80%以上
- **パフォーマンス**: Lighthouse 90点以上

### ユーザー指標
- **読み込み時間**: 3秒以内
- **エラー率**: 1%以下
- **ユーザー満足度**: 向上

---

**最終更新**: 2024-12-27
**次回レビュー**: 2025-01-27
