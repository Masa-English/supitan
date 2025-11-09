# 🎓 スピ単 - 英単語学習アプリケーション

## 📋 目次

- [概要](#概要)
- [プロジェクト情報](#プロジェクト情報)
- [特徴](#特徴)
- [技術スタック](#技術スタック)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [プロジェクト構造](#プロジェクト構造)
- [主要機能](#主要機能)
- [データベース設計](#データベース設計)
- [認証・セキュリティ](#認証セキュリティ)
- [状態管理](#状態管理)
- [API設計](#api設計)
- [ルーティング構造](#ルーティング構造)
- [学習フロー](#学習フロー)
- [セットアップ](#セットアップ)
- [開発ガイド](#開発ガイド)
- [デプロイメント](#デプロイメント)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [参考ドキュメント](#参考ドキュメント)
- [著作権・ライセンス](#著作権ライセンス)

---

## 概要

**スピ単**は、Next.js 15とSupabaseを基盤とした高性能な英単語学習アプリケーションです。ISR（Incremental Static Regeneration）、統一データプロバイダー、最適化されたキャッシュ戦略により、**60-75%の読み込み時間短縮**を実現しています。

## プロジェクト情報

- **プロジェクト名**: スピ単（Masa Flash）
- **バージョン**: 1.0.0
- **フレームワーク**: Next.js 15.5.2
- **言語**: TypeScript 5.x
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel（推奨）

## 特徴

### 🚀 高速パフォーマンス
- **ISR（Incremental Static Regeneration）**: 動的コンテンツの高速表示
- **統一データプロバイダー**: 効率的なデータ管理
- **最適化されたキャッシュ戦略**: 60-75%の読み込み時間短縮
- **多層キャッシュ**: ブラウザ、CDN、ISR、データベースの4層キャッシュ

### 🎯 科学的学習法
- **フラッシュカード学習**: 効率的な単語記憶
- **クイズ形式**: 4択問題による理解度確認
- **間隔反復システム**: SM-2アルゴリズムベースの科学的な記憶定着
- **音声機能**: 発音学習対応、音声ファイルのキャッシュ管理

### 📱 モバイルファースト
- **レスポンシブデザイン**: 全デバイス対応
- **PWA対応**: オフライン学習可能（将来拡張）
- **タッチフレンドリー**: スマートフォン最適化
- **キーボードショートカット**: PCでの効率的な操作

### 🔒 セキュリティ
- **Supabase認証**: 安全なユーザー管理、JWTベースのセッション
- **RLS（Row Level Security）**: データベースレベルでのデータ保護
- **HTTPS通信**: 暗号化された通信
- **多層防御**: Middleware → Page → Database RLS

## 技術スタック

### フロントエンド
- **Next.js 15.5.2**: App Router、Server Components、ISR
- **React 19.0.0**: Concurrent Features、Server/Client Components
- **TypeScript 5.x**: 型安全性、厳格な型チェック
- **Tailwind CSS 3.4.1**: ユーティリティファーストCSS
- **Radix UI**: アクセシブルなUIコンポーネント
- **Lucide React**: アイコンライブラリ
- **Zustand 5.0.6**: 軽量な状態管理
- **next-themes**: テーマ管理（ライト/ダーク/システム）

### バックエンド・インフラ
- **Supabase**: データベース、認証、ストレージ
- **PostgreSQL**: リレーショナルデータベース
- **Vercel Edge**: CDN、エッジ関数、自動デプロイ

### 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **Jest**: 単体テストフレームワーク
- **Playwright**: E2Eテスト
- **Winston**: 構造化ログ管理
- **GitHub Actions**: CI/CD

## システムアーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────┐
│           クライアント層                  │
│  Browser → React SPA → PWA              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Next.js App Router              │
│  Server Components | Client Components │
│  API Routes | Middleware                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           ミドルウェア層                 │
│  Auth Check | Route Protect | Cache    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            データ層                      │
│  Unified Data Provider → Supabase      │
│  Cache Layer (4層)                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Supabase サービス                │
│  PostgreSQL | Auth | Storage (Audio)   │
└─────────────────────────────────────────┘
```

### レイヤー別責務

#### 1. プレゼンテーション層
- **Server Components**: データ取得、初期レンダリング、SEO最適化
- **Client Components**: ユーザーインタラクション、状態管理、リアルタイム更新
- **Pages**: ルーティング、レイアウト管理

#### 2. ビジネスロジック層
- **Data Provider**: データアクセスの抽象化、キャッシュ管理
- **Hooks**: 再利用可能なロジック（`useLearning`, `useAuth`など）
- **Utils**: 共通ユーティリティ関数

#### 3. データアクセス層
- **Supabase Client**: データベース操作、認証、ストレージ
- **Cache Management**: 多層キャッシュ戦略
- **Type Definitions**: データ型定義、型安全性の確保

## プロジェクト構造

```
project-masa-flash-with-quiz/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # 管理画面ルートグループ
│   │   └── admin/
│   ├── (auth)/                   # 認証関連ルートグループ
│   │   ├── auth/                  # 認証ページ（ログイン、サインアップなど）
│   │   ├── demo-login/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/              # ダッシュボードルートグループ
│   │   ├── dashboard/            # ダッシュボードホーム
│   │   ├── learning/             # 学習機能
│   │   │   ├── [category_id]/    # カテゴリー別学習
│   │   │   │   ├── flashcard/     # フラッシュカード
│   │   │   │   ├── quiz/          # クイズ
│   │   │   │   ├── browse/        # 単語一覧
│   │   │   │   ├── options/       # 学習オプション選択
│   │   │   │   └── review/        # 復習
│   │   │   └── categories/        # カテゴリー一覧
│   │   ├── review/                # 復習ページ
│   │   ├── search/                # 検索ページ
│   │   ├── statistics/            # 統計ページ
│   │   ├── profile/               # プロフィール
│   │   ├── settings/              # 設定ページ
│   │   ├── history/               # 学習履歴
│   │   └── layout.tsx
│   ├── (marketing)/               # マーケティングページ
│   │   ├── landing/
│   │   ├── contact/
│   │   └── faq/
│   ├── api/                       # API Routes
│   │   ├── data/                  # データ取得API
│   │   ├── auth/                  # 認証API
│   │   ├── audio/                 # 音声API
│   │   ├── admin/                 # 管理API
│   │   └── health/                # ヘルスチェック
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # ルートページ
│   ├── globals.css                # グローバルスタイル
│   └── loading.tsx                # ローディングUI
│
├── components/                    # Reactコンポーネント
│   ├── ui/                        # 基本UIコンポーネント（Radix UI）
│   ├── features/                  # 機能別コンポーネント
│   │   ├── auth/                  # 認証関連
│   │   ├── learning/             # 学習関連
│   │   │   ├── flashcard/         # フラッシュカード
│   │   │   ├── quiz/              # クイズ
│   │   │   └── review/            # 復習
│   │   └── dashboard/            # ダッシュボード
│   ├── layout/                    # レイアウトコンポーネント
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── footer/
│   ├── shared/                    # 共有コンポーネント
│   └── providers/                 # プロバイダーコンポーネント
│
├── lib/                           # ライブラリ・ユーティリティ
│   ├── api/                       # API関連
│   │   ├── supabase/              # Supabaseクライアント
│   │   ├── services/              # APIサービス
│   │   │   ├── data-provider.ts   # 統一データプロバイダー
│   │   │   └── auth-service.ts    # 認証サービス
│   │   └── database/              # データベースサービス
│   ├── stores/                    # Zustandストア
│   │   ├── user-store.ts          # ユーザーストア
│   │   ├── data-store.ts          # データストア（基本実装）
│   │   ├── data-store-unified.ts  # データストア（統一実装）
│   │   ├── ui-store.ts            # UIストア（基本実装）
│   │   ├── ui-store-unified.ts    # UIストア（統一実装）
│   │   ├── audio-store.ts         # 音声ストア
│   │   ├── settings-store.ts      # 設定ストア
│   │   ├── navigation-store.ts    # ナビゲーションストア
│   │   └── index.ts               # ストアエクスポート
│   ├── hooks/                     # カスタムフック
│   │   ├── use-learning.ts        # 学習フック
│   │   ├── use-auth.ts            # 認証フック
│   │   └── ...
│   ├── utils/                     # ユーティリティ関数
│   ├── types/                     # 型定義
│   ├── constants/                 # 定数
│   └── contexts/                  # React Context
│
├── config/                        # 設定ファイル
│   ├── site.ts                    # サイト設定
│   ├── dashboard.ts               # ダッシュボード設定
│   ├── auth.ts                    # 認証設定
│   ├── tailwind.config.ts         # Tailwind設定
│   └── components.json            # shadcn/ui設定
│
├── docs/                          # ドキュメント
│   ├── architecture/              # アーキテクチャ設計書
│   ├── database/                  # データベース設計書
│   ├── authentication/            # 認証関連ドキュメント
│   ├── deployment/                 # デプロイメントガイド
│   └── development/               # 開発ガイド
│
├── scripts/                       # スクリプト
│   ├── audio/                     # 音声関連スクリプト
│   ├── database/                  # データベーススクリプト
│   └── development/               # 開発用スクリプト
│
├── public/                        # 静的ファイル
│   ├── favicon.ico
│   ├── manifest.json              # PWAマニフェスト
│   └── sw.js                      # Service Worker
│
├── middleware.ts                  # Next.jsミドルウェア
├── next.config.ts                 # Next.js設定
├── tsconfig.json                  # TypeScript設定
└── package.json                   # 依存関係
```

## 主要機能

### 学習機能

#### フラッシュカード学習
- 単語と意味の効率的な学習
- カードフリップ機能（単語 ↔ 意味）
- 例文表示（3つの例文）
- 音声再生機能（単語・例文）
- 進捗トラッキング
- 間違えた問題の再出題モード

#### クイズ学習
- 4択問題による理解度確認
- リアルタイムフィードバック
- 正解率の記録
- 間違えた問題の再出題
- 音声フィードバック（正解音/不正解音）

#### 復習システム
- 間隔反復アルゴリズム（SM-2ベース）
- 復習タイミングの自動計算
- 習熟度レベル管理（0.0-1.0）
- 復習リストの自動生成
- 次回復習日の表示

### 管理機能

#### 進捗管理
- 学習状況の可視化
- カテゴリー別進捗
- 習熟度グラフ
- 学習履歴
- 学習セッション記録

#### お気に入り機能
- 重要単語の管理
- お気に入りリスト
- クイックアクセス
- フィルタリング対応

#### 統計機能
- 詳細な学習データ
- 正解率の推移
- 学習時間の記録
- カテゴリー別統計
- 日次・週次・月次レポート

#### 検索機能
- 単語の検索・フィルタリング
- カテゴリー別フィルタ
- 習熟度別フィルタ
- お気に入りフィルタ
- 全文検索対応

### ユーザー機能

#### アカウント管理
- 安全なユーザー認証（Supabase Auth）
- メール認証
- パスワードリセット
- プロフィール管理

#### 設定機能
- テーマ設定（ライト/ダーク/システム）
- 音声設定（音量、自動再生）
- 学習設定（デフォルトセッションサイズなど）
- アクセシビリティ設定

## データベース設計

### 主要テーブル

#### 1. `words` - 単語マスターデータ
- 単語情報（英単語、日本語訳、例文3つ）
- 音声ファイルパス
- カテゴリー分類
- 難易度レベル
- 全文検索インデックス

#### 2. `user_progress` - 学習進捗
- ユーザー別の単語進捗
- 習熟度レベル（0.0-1.0）
- 学習回数、正解数、不正解数
- 次回復習日時
- お気に入りフラグ
- SM-2アルゴリズムパラメータ（ease_factor, review_interval_days）

#### 3. `study_sessions` - 学習セッション履歴
- セッションタイプ（flashcard/quiz/review）
- カテゴリー
- 総問題数、正解数、不正解数
- 正解率（自動計算）
- 学習時間
- セッションデータ（JSONB）

#### 4. `quiz_results` - クイズ結果詳細
- セッションID、単語ID
- 問題タイプ、ユーザー回答、正解
- 回答時間
- 難易度評価

#### 5. `categories` - カテゴリマスター
- カテゴリー名、表示名、説明
- 単語数（自動更新）
- カラーテーマ、ソート順
- アクティブフラグ

### Row Level Security (RLS)

すべてのテーブルでRLSを有効化：
- `words`, `categories`: 全ユーザーが閲覧可能、管理者のみ更新可能
- `user_progress`, `study_sessions`, `quiz_results`: ユーザーは自分のデータのみアクセス可能

## 認証・セキュリティ

### 認証フロー

```
1. ユーザーがログインページにアクセス
   ↓
2. メールアドレスとパスワードを入力
   ↓
3. Supabase Authで認証
   ↓
4. JWTトークン発行
   ↓
5. Cookieにセッション保存
   ↓
6. Middlewareで認証状態チェック
   ↓
7. 保護されたページにアクセス許可
```

### セキュリティ対策

#### 多層防御
- **レイヤー1**: Middlewareでの認証チェック
- **レイヤー2**: Pageレベルでの認証確認
- **レイヤー3**: Database RLSによるデータ保護

#### その他の対策
- HTTPS通信の強制
- セッション管理（30日有効、リフレッシュトークン7日）
- パスワード要件（8文字以上、大文字・小文字・数字必須）
- メール認証必須
- 入力値のサニタイズ
- CSRF保護

## 状態管理

### Zustandストア構成

#### 1. `useUserStore` - ユーザーストア
```typescript
- user: ユーザー情報
- profile: プロフィール情報
- userProgress: 学習進捗
- stats: 統計情報
- updateWordProgress(): 進捗更新
- toggleFavorite(): お気に入り切り替え
```

#### 2. `useDataStore` - データストア
```typescript
- words: 単語データ
- categories: カテゴリーデータ
- reviewWords: 復習単語
- filteredWords: フィルタ済み単語
- searchQuery: 検索クエリ
- searchFilters: フィルター設定
- loadWords(): 単語データ読み込み
- loadCategories(): カテゴリーデータ読み込み
- loadReviewWords(): 復習単語読み込み
- getWordsByCategory(): カテゴリー別取得（キャッシュ付き）
- searchWords(): 検索実行
- updateFilters(): フィルター更新
- applyFilters(): フィルタリング適用
- clearFilters(): フィルタークリア
- refreshCache(): キャッシュリフレッシュ
```

#### 3. `useNavigationStore` - ナビゲーションストア
```typescript
- isNavigating: ナビゲーション状態
- start(): ナビゲーション開始
- stop(): ナビゲーション停止
```

#### 4. `useLearningSessionStore` - 学習セッションストア
```typescript
- category: 現在のカテゴリー
- currentSection: 現在のセクション
- sections: セクション一覧
- learningMode: 学習モード（flashcard/quiz）
- hasNextSection: 次のセクション存在チェック
- setLearningSession(): セッション設定
- getNextSection(): 次のセクション取得
- clearSession(): セッションクリア
- updateCurrentSection(): セクション更新
```

#### 5. `useUIStore` - UIストア
```typescript
- modals: モーダル状態
- notifications: 通知リスト
- loading: ローディング状態
- errors: エラーリスト
- openModal(): モーダル表示
- addNotification(): 通知追加
```

#### 6. `useAudioStore` - 音声ストア
```typescript
- audioCache: 音声キャッシュ
- volume: 音量設定
- playWordAudio(): 単語音声再生
- playCorrectSound(): 正解音再生
- playIncorrectSound(): 不正解音再生
```

#### 7. `useSettingsStore` - 設定ストア
```typescript
- theme: テーマ設定
- audio: 音声設定
- learning: 学習設定
- accessibility: アクセシビリティ設定
- setTheme(): テーマ変更
- updateAudioSettings(): 音声設定更新
```

## API設計

### 主要APIエンドポイント

#### データ取得API
```
GET /api/data/[type]
- type: 'category' | 'quiz' | 'flashcard' | 'review'
- パラメータ: category (クエリパラメータ)
- 認証: 必須（セッション確認）
- レスポンス: { words: Word[], userProgress?: UserProgress[], categories?: CategoryWithStats[] }
- キャッシュ: 5分（revalidate: 300）
```

#### カテゴリーAPI
```
GET /api/data/categories
- レスポンス: カテゴリー一覧

GET /api/sections/[category]
- レスポンス: セクション情報
```

#### 音声API
```
GET /api/audio/[wordId]
- レスポンス: 音声ファイルURL

POST /api/audio/batch
- リクエスト: wordIds配列
- レスポンス: 音声URLマップ
```

#### 認証API
```
POST /api/auth/logout
- ログアウト処理
```

### キャッシュ戦略

- **静的データ**: 24時間キャッシュ（カテゴリー、単語マスター）
- **ユーザーデータ**: 5分キャッシュ（進捗、お気に入り）
- **セッションデータ**: キャッシュなし（リアルタイム性重視）

## ルーティング構造

### ルートグループ

#### `(auth)` - 認証関連
```
/auth/login              # ログインページ
/auth/sign-up            # サインアップページ
/auth/forgot-password    # パスワードリセット
/auth/confirm            # メール確認
/auth/update-password    # パスワード更新
```

#### `(dashboard)` - ダッシュボード
```
/dashboard                      # ダッシュボードホーム
/learning                       # 学習ページ
/learning/categories            # カテゴリー一覧
/learning/[category_id]/options # 学習オプション選択
/learning/[category_id]/flashcard           # フラッシュカード
/learning/[category_id]/flashcard/section/[sec]  # セクション指定フラッシュカード
/learning/[category_id]/quiz                  # クイズ
/learning/[category_id]/quiz/section/[sec]     # セクション指定クイズ
/learning/[category_id]/browse                 # 単語一覧
/review                         # 復習ページ
/review/all                     # 全復習対象
/review/urgent                  # 緊急復習対象
/review/list                    # 復習リスト
/search                         # 検索ページ
/statistics                     # 統計ページ
/profile                        # プロフィール
/settings                       # 設定ページ
/history                        # 学習履歴
```

#### `(marketing)` - マーケティング
```
/landing                 # ランディングページ
/contact                 # お問い合わせ
/faq                     # FAQ
```

#### `(admin)` - 管理画面
```
/admin                   # 管理画面ホーム
```

### リダイレクト設定

- カテゴリー名 → IDへのリダイレクト
- 古いURL構造 → 新しい構造へのリダイレクト
- 認証済みユーザー → ダッシュボード
- 未認証ユーザー → ログインページ

## 学習フロー

### フラッシュカード学習フロー

```
1. カテゴリー選択
   ↓
2. 学習オプション選択（セクション/ランダム/全件）
   ↓
3. フラッシュカード表示
   ↓
4. カードフリップ（単語 → 意味）
   ↓
5. 例文表示（オプション）
   ↓
6. 音声再生（オプション）
   ↓
7. 次のカードへ
   ↓
8. 学習完了
   ↓
9. 進捗保存（user_progress更新）
   ↓
10. 間違えた問題がある場合、再出題モード
   ↓
11. 完了モーダル表示
```

### クイズ学習フロー

```
1. カテゴリー選択
   ↓
2. 学習オプション選択
   ↓
3. クイズ問題生成（4択）
   ↓
4. 問題表示
   ↓
5. 回答選択
   ↓
6. フィードバック表示（正解/不正解）
   ↓
7. 音声フィードバック（正解音/不正解音）
   ↓
8. 次の問題へ
   ↓
9. 全問題完了
   ↓
10. 結果表示（正解率、間違えた問題）
   ↓
11. 進捗保存（user_progress, study_sessions, quiz_results更新）
   ↓
12. 復習リスト追加（間違えた問題）
```

### 復習フロー

```
1. 復習対象単語の取得（next_review_at <= NOW()）
   ↓
2. 習熟度順にソート
   ↓
3. フラッシュカードまたはクイズで復習
   ↓
4. 回答結果に基づいて習熟度更新
   ↓
5. SM-2アルゴリズムで次回復習日時を計算
   ↓
6. 進捗保存（user_progress更新）
```

## セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント

### インストール手順

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd project-masa-flash-with-quiz
```

#### 2. 依存関係のインストール

```bash
npm install
```

#### 3. 環境変数の設定

`.env.local`ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# その他
NODE_ENV=development
```

#### 4. データベースのセットアップ

```bash
# Supabase CLIのインストール（初回のみ）
npm install -g supabase

# リモートデータベースにリンク
npm run db:link

# 型定義の同期
npm run sync-types

# スキーマの同期（必要に応じて）
npm run sync-schema
```

#### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセス可能です。

## 開発ガイド

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# 型チェック
npm run type-check

# Lint実行
npm run lint
npm run lint:fix

# フォーマット
npm run format

# テスト実行
npm test
npm run test:watch
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

### コード品質

#### ESLint設定
- Next.js推奨設定を使用
- TypeScriptルール有効化
- アクセシビリティルール有効化

#### Prettier設定
- 自動フォーマット
- コミット前フック推奨

#### TypeScript設定
- strictモード有効化
- パスエイリアス設定（`@/*`）

### 開発ワークフロー

1. **ブランチ作成**
   ```bash
   git checkout -b feature/機能名
   ```

2. **開発**
   - 機能実装
   - テスト作成
   - ドキュメント更新

3. **品質チェック**
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

4. **コミット**
   ```bash
   git commit -m "feat: 新機能の追加"
   ```

5. **プッシュ・PR作成**
   ```bash
   git push origin feature/機能名
   ```

### コンポーネント開発ガイドライン

#### Server Component vs Client Component

- **Server Component**: データ取得、初期レンダリング
- **Client Component**: インタラクション、状態管理

```typescript
// Server Component（デフォルト）
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

## デプロイメント

### Vercelデプロイ（推奨）

#### 1. Vercelプロジェクト作成

1. Vercelにログイン
2. 新しいプロジェクトを作成
3. GitHubリポジトリを接続

#### 2. 環境変数の設定

Vercelダッシュボードで環境変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SITE_URL
```

#### 3. デプロイ

```bash
# Vercel CLIを使用
npm run deploy

# またはGitHubにプッシュ（自動デプロイ）
git push origin main
```

### デプロイ前チェック

```bash
npm run deploy-check
```

チェック項目：
- 型エラー
- Lintエラー
- ビルドエラー
- 環境変数確認

## トラブルシューティング・確認ツール

### Vercelログの確認

Vercelのデプロイログや関数ログを確認できます。

```bash
# 基本的なログ確認（最新50件）
npm run vercel:logs

# 特定の関数のログを確認
npm run vercel:logs -- --function=api/audio

# 取得件数を指定
npm run vercel:logs -- --limit=100
```

**注意**: Vercel CLIがインストールされている必要があります。
インストール方法: `npm install -g vercel`

**代替方法**: Vercelダッシュボードからも確認可能
- https://vercel.com/dashboard
- プロジェクト → Deployments → デプロイメントを選択 → Functionsタブ

### Supabase状態の確認

データベースとStorageの状態を確認できます。

```bash
# 基本的な状態確認（データベース + Storage）
npm run supabase:status

# Storageのみ確認
npm run supabase:status -- --audio-only

# 特定の単語を確認
npm run supabase:status -- --word=come_up
```

**確認内容**:
- データベース接続確認
- Storage接続確認
- 単語数、音声ファイル設定済み単語数
- Storage内のファイル統計
- データベースとStorageの整合性確認

### 音声ファイルの確認

```bash
# Storage内の音声ファイル確認
npm run audio:check

# データベースとStorageの整合性確認
node scripts/check-database-storage-consistency.mjs
```

## パフォーマンス最適化

### 実装済み最適化

#### 1. ISR（Incremental Static Regeneration）
- 動的コンテンツの高速表示
- 再検証間隔: 30秒（動的）、3分（静的）

#### 2. 画像最適化
- Next.js Image Component使用
- WebP/AVIF形式対応
- 遅延読み込み

#### 3. コード分割
- 動的インポート
- ルートベース分割
- コンポーネント遅延読み込み

#### 4. キャッシュ戦略
- **ブラウザキャッシュ**: 5分
- **CDNキャッシュ**: 15分
- **ISRキャッシュ**: 1時間
- **データベースキャッシュ**: 24時間

### パフォーマンス監視

```bash
# バンドル分析
npm run perf:bundle

# パフォーマンスチェック
npm run perf:check
```

## 実装に関する注意事項

### ストア実装の重複

プロジェクトには2つのストア実装が存在します：

1. **基本実装** (`data-store.ts`, `ui-store.ts`)
   - `lib/stores/index.ts`からエクスポート
   - シンプルな実装
   - `data-store.ts`のフィルタリング機能は一部未実装（UserProgressフィルターは呼び出し側で処理が必要）

2. **統一実装** (`data-store-unified.ts`, `ui-store-unified.ts`)
   - `lib/stores/index-unified.ts`からエクスポート
   - より完全な実装（UserProgressフィルター含む）
   - `app-store-provider.tsx`で使用

**推奨**: 新規開発時は統一実装（`-unified.ts`）の使用を推奨します。

### データプロバイダーの実装

- **使用中**: `lib/api/services/data-provider.ts`（`UnifiedDataProvider`クラス）
- **未使用**: `lib/api/services/unified-data-provider.ts`（古い実装の可能性）

### API実装の詳細

- `/api/data/[type]`は`category`, `quiz`, `flashcard`, `review`の4つのタイプをサポート
- 認証は必須（セッション確認）
- キャッシュは5分（`revalidate: 300`）

## 参考ドキュメント

### アーキテクチャ・設計
- [アーキテクチャ設計書](docs/architecture/ARCHITECTURE.md)
- [データベース設計書](docs/database/DATABASE_DESIGN.md)
- [コンポーネント仕様書](docs/architecture/COMPONENT_SPECIFICATION.md)
- [ストアアーキテクチャ](docs/architecture/STORE_ARCHITECTURE.md)

### API・開発
- [API仕様書](docs/architecture/API_SPECIFICATION.md)
- [開発ワークフロー](docs/development/DEVELOPMENT_WORKFLOW.md)
- [クイックスタートガイド](docs/QUICK_START.md)

### 認証・セキュリティ
- [認証フロー](docs/authentication/PASSWORD_RESET_FLOW.md)
- [セキュリティガイドライン](docs/security/SECURITY_GUIDELINES.md)

### デプロイメント
- [デプロイメント運用](docs/deployment/DEPLOYMENT_OPERATIONS.md)
- [GitHub Actions設定](docs/deployment/GITHUB_ACTIONS_SETUP.md)

### トラブルシューティング
- [音声ファイル名不一致問題](docs/troubleshooting/AUDIO_FILE_NAME_MISMATCH.md)

## 著作権・ライセンス

**⚠️ 重要: このプロジェクトはMasaEnglishの著作物です**

- 本プロジェクトのすべてのコード、ドキュメント、設計資料はMasaEnglishの知的財産です
- **外部への漏洩は厳禁**です
- 無断での複製、配布、公開は禁止されています
- 本プロジェクトの使用は、MasaEnglishの許可を得た関係者のみに限定されます

### 利用規約
- 本プロジェクトは内部開発・運用目的でのみ使用可能です
- 第三者への開示、共有、配布は一切禁止されています
- ソースコードの外部リポジトリへの公開は禁止されています

---

**🎓 スピ単** - *効率的な英語学習のための次世代プラットフォーム*

最終更新: 2024-12-27
