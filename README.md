# 🎓 スピ単 - 英単語学習アプリケーション

## 概要

**スピ単**は、Next.js 15とSupabaseを基盤とした高性能な英単語学習アプリケーションです。ISR（Incremental Static Regeneration）、統一データプロバイダー、最適化されたキャッシュ戦略により、**60-75%の読み込み時間短縮**を実現しています。

## 特徴

### 🚀 高速パフォーマンス
- **ISR（Incremental Static Regeneration）**: 動的コンテンツの高速表示
- **統一データプロバイダー**: 効率的なデータ管理
- **最適化されたキャッシュ戦略**: 60-75%の読み込み時間短縮

### 🎯 科学的学習法
- **フラッシュカード学習**: 効率的な単語記憶
- **クイズ形式**: 理解度の確認
- **間隔反復システム**: 科学的な記憶定着
- **音声機能**: 発音学習対応

### 📱 モバイルファースト
- **レスポンシブデザイン**: 全デバイス対応
- **PWA対応**: オフライン学習可能
- **タッチフレンドリー**: スマートフォン最適化

### 🔒 セキュリティ
- **Supabase認証**: 安全なユーザー管理
- **RLS（Row Level Security）**: データ保護
- **HTTPS通信**: 暗号化された通信

## 技術スタック

### フロントエンド
- **Next.js 15**: App Router、Server Components
- **React 18**: Concurrent Features
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **Lucide React**: アイコンライブラリ

### バックエンド
- **Supabase**: データベース、認証、ストレージ
- **PostgreSQL**: リレーショナルデータベース
- **Edge Functions**: サーバーレス関数

### 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **Jest**: テストフレームワーク
- **GitHub Actions**: CI/CD

## セットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント

### インストール

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-username/supitan.git
cd supitan
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp env.example .env.local
```

`.env.local`ファイルを編集して、Supabaseの設定を追加：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **データベースのセットアップ**
```bash
# Supabase CLIのインストール（初回のみ）
npm install -g supabase

# ローカル開発環境の起動
supabase start

# マイグレーションの実行
supabase db push
```

5. **開発サーバーの起動**
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセス可能です。

## プロジェクト構造

```
supitan/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # ダッシュボード
│   ├── landing/           # ランディングページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── auth/             # 認証関連コンポーネント
│   ├── common/           # 共通コンポーネント
│   ├── learning/         # 学習関連コンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ・設定
│   ├── supabase/         # Supabase設定
│   ├── hooks/            # カスタムフック
│   └── utils.ts          # ユーティリティ関数
├── supabase/             # Supabase設定
│   ├── migrations/       # データベースマイグレーション
│   └── config.toml       # Supabase設定
└── docs/                 # ドキュメント
```

## 主要機能

### 学習機能
- **フラッシュカード**: 単語と意味の効率的な学習
- **クイズ**: 4択問題による理解度確認
- **復習システム**: 間隔反復による記憶定着
- **音声機能**: 発音学習

### 管理機能
- **進捗管理**: 学習状況の可視化
- **お気に入り**: 重要単語の管理
- **統計**: 詳細な学習データ
- **検索**: 単語の検索・フィルタリング

### ユーザー機能
- **アカウント管理**: 安全なユーザー認証
- **プロフィール**: 個人設定の管理
- **データ同期**: 複数デバイス対応

## 開発ガイド

### コード品質

**ESLint設定**
```bash
npm run lint
```

**Prettier設定**
```bash
npm run format
```

**型チェック**
```bash
npm run type-check
```

### テスト

**単体テスト**
```bash
npm test
```

**E2Eテスト**
```bash
npm run test:e2e
```

### ビルド

**本番ビルド**
```bash
npm run build
```

**ビルド分析**
```bash
npm run analyze
```

## デプロイメント

### Vercel（推奨）

1. **Vercelプロジェクトの作成**
2. **環境変数の設定**
3. **自動デプロイの設定**

### その他のプラットフォーム

- **Netlify**: 静的サイトホスティング
- **Railway**: フルスタックデプロイメント
- **AWS**: スケーラブルなインフラ

## パフォーマンス最適化

### 実装済み最適化
- **ISR**: 動的コンテンツの高速表示
- **画像最適化**: Next.js Image Component
- **コード分割**: 動的インポート
- **キャッシュ戦略**: 効率的なデータ取得

### 監視・分析
- **Core Web Vitals**: パフォーマンス指標
- **Lighthouse**: 総合的な品質評価
- **Bundle Analyzer**: バンドルサイズ分析

## セキュリティ

### 実装済み対策
- **Supabase RLS**: データベースレベルセキュリティ
- **認証・認可**: 安全なユーザー管理
- **HTTPS**: 暗号化通信
- **CORS設定**: クロスオリジン制御

### ベストプラクティス
- **環境変数管理**: 機密情報の保護
- **入力検証**: XSS・CSRF対策
- **ログ管理**: セキュリティ監査

## 貢献

### 開発フロー
1. **Issue作成**: バグ報告・機能要望
2. **ブランチ作成**: `feature/issue-number`
3. **開発**: コーディング・テスト
4. **PR作成**: レビュー依頼
5. **マージ**: コードレビュー後

### コーディング規約
- **TypeScript**: 型安全性の確保
- **ESLint**: コード品質の統一
- **Prettier**: フォーマットの統一
- **Conventional Commits**: コミットメッセージ規約

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

### ドキュメント
- [アーキテクチャ設計書](docs/ARCHITECTURE.md)
- [API仕様書](docs/API_SPECIFICATION.md)
- [データベース設計書](docs/DATABASE_DESIGN.md)
- [コンポーネント仕様書](docs/COMPONENT_SPECIFICATION.md)

### お問い合わせ
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@supitan.com

## 更新履歴

### v1.0.0 (2024-12-27)
- 🎉 初回リリース
- ✨ フラッシュカード学習機能
- ✨ クイズ学習機能
- ✨ 復習システム
- ✨ ユーザー認証
- ✨ 進捗管理
- ✨ モバイル対応

---

**🎓 スピ単** - *効率的な英語学習のための次世代プラットフォーム*
