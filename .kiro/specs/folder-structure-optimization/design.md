# フォルダー構成最適化 - 設計書

## 概要

現在のMasa Flash英単語学習アプリケーションのフォルダー構成を、Next.js 15 App Routerのベストプラクティスに基づいて最適化します。シンプルで保守性が高く、スケーラブルな構造を実現します。

## アーキテクチャ

### 現在の構造分析

#### 問題点の特定

1. **ルーティング構造の複雑さ**
   - `app/dashboard/category/[category]/quiz/` など深いネスト
   - 関連機能が分散している（学習機能が複数箇所に散在）
   - ルートグループが活用されていない

2. **コンポーネント構造の課題**
   - `components/common/` に多様な責務のコンポーネントが混在
   - 機能別の整理が不十分
   - レイアウトコンポーネントが分離されていない

3. **ライブラリ構造の改善点**
   - `lib/` 直下にファイルが散在
   - API関連ファイルが統合されていない
   - ユーティリティ関数の分類が不明確

### 最適化された新構造

```
project-masa-flash-with-quiz/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # 認証関連ルートグループ
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── confirm/
│   │   │   │   └── page.tsx
│   │   │   └── error/
│   │   │       └── page.tsx
│   │   ├── demo-login/
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # 認証レイアウト
│   ├── (dashboard)/                       # ダッシュボード関連ルートグループ
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # メインダッシュボード
│   │   ├── learning/                      # 学習機能統合
│   │   │   ├── [category]/
│   │   │   │   ├── flashcard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── quiz/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── browse/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx               # カテゴリー選択
│   │   │   └── page.tsx                   # 学習モード選択
│   │   ├── review/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── statistics/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # ダッシュボードレイアウト
│   ├── (marketing)/                       # マーケティング関連ルートグループ
│   │   ├── landing/
│   │   │   └── page.tsx
│   │   ├── faq/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # マーケティングレイアウト
│   ├── (admin)/                          # 管理者関連ルートグループ
│   │   ├── admin/
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # 管理者レイアウト
│   ├── api/                              # API Routes
│   │   ├── auth/
│   │   ├── data/
│   │   ├── audio/
│   │   ├── contact/
│   │   ├── health/
│   │   ├── revalidate/
│   │   └── static-data/
│   ├── globals.css
│   ├── layout.tsx                        # ルートレイアウト
│   ├── page.tsx                          # ホームページ
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── robots.ts
├── components/                           # 再利用可能コンポーネント
│   ├── ui/                              # 基本UIコンポーネント（shadcn/ui）
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   └── index.ts
│   │   ├── card/
│   │   │   ├── card.tsx
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── modal.tsx
│   │   │   └── index.ts
│   │   ├── form/
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── checkbox.tsx
│   │   │   └── index.ts
│   │   ├── feedback/
│   │   │   ├── toast.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── index.ts
│   │   ├── navigation/
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   └── index.ts
│   │   └── index.ts                     # 全UIコンポーネントのエクスポート
│   ├── features/                        # 機能別コンポーネント
│   │   ├── auth/                        # 認証機能
│   │   │   ├── login-form.tsx
│   │   │   ├── sign-up-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── profile-form.tsx
│   │   │   ├── logout-button.tsx
│   │   │   ├── auth-wrapper.tsx
│   │   │   ├── with-auth.tsx
│   │   │   └── index.ts
│   │   ├── learning/                    # 学習機能
│   │   │   ├── flashcard/
│   │   │   │   ├── flashcard.tsx
│   │   │   │   ├── flashcard-controls.tsx
│   │   │   │   └── index.ts
│   │   │   ├── quiz/
│   │   │   │   ├── quiz.tsx
│   │   │   │   ├── quiz-question.tsx
│   │   │   │   ├── quiz-results.tsx
│   │   │   │   └── index.ts
│   │   │   ├── review/
│   │   │   │   ├── review-session.tsx
│   │   │   │   ├── review-card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── browse/
│   │   │   │   ├── word-browser.tsx
│   │   │   │   ├── word-card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── shared/
│   │   │   │   ├── progress-tracker.tsx
│   │   │   │   ├── completion-modal.tsx
│   │   │   │   ├── category-selector.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── dashboard/                   # ダッシュボード機能
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── statistics-chart.tsx
│   │   │   └── index.ts
│   │   ├── search/                      # 検索機能
│   │   │   ├── search-bar.tsx
│   │   │   ├── search-results.tsx
│   │   │   ├── search-filters.tsx
│   │   │   └── index.ts
│   │   └── contact/                     # お問い合わせ機能
│   │       ├── contact-form.tsx
│   │       └── index.ts
│   ├── layout/                          # レイアウトコンポーネント
│   │   ├── header/
│   │   │   ├── header.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   ├── user-menu.tsx
│   │   │   └── index.ts
│   │   ├── sidebar/
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-menu.tsx
│   │   │   └── index.ts
│   │   ├── footer/
│   │   │   ├── footer.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── providers/                       # プロバイダーコンポーネント
│   │   ├── theme-provider.tsx
│   │   ├── audio-provider.tsx
│   │   ├── data-provider.tsx
│   │   ├── toast-provider.tsx
│   │   └── index.ts
│   ├── shared/                          # 共通コンポーネント
│   │   ├── audio-controls.tsx
│   │   ├── theme-switcher.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── error-boundary.tsx
│   │   ├── suspense-wrapper.tsx
│   │   ├── navigation-events.tsx
│   │   ├── navigation-overlay.tsx
│   │   ├── tutorial-modal.tsx
│   │   ├── reload-button.tsx
│   │   └── index.ts
│   └── index.ts                         # 全コンポーネントのエクスポート
├── lib/                                 # ライブラリとユーティリティ
│   ├── api/                            # API関連
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   ├── database/
│   │   │   ├── database.ts
│   │   │   ├── types.ts
│   │   │   ├── queries.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── data-provider.ts
│   │   │   ├── word-fetcher.ts
│   │   │   ├── auth-service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── stores/                         # Zustand状態管理
│   │   ├── user-store.ts
│   │   ├── data-store.ts
│   │   ├── ui-store.ts
│   │   ├── settings-store.ts
│   │   ├── audio-store.ts
│   │   ├── navigation-store.ts
│   │   ├── hooks.ts                    # ストア用カスタムフック
│   │   ├── utils.ts                    # ストア用ユーティリティ
│   │   └── index.ts
│   ├── hooks/                          # カスタムフック
│   │   ├── use-auth.ts
│   │   ├── use-learning.ts
│   │   ├── use-page-data.ts
│   │   ├── use-audio.ts
│   │   ├── use-local-storage.ts
│   │   └── index.ts
│   ├── utils/                          # ユーティリティ関数
│   │   ├── cn.ts                       # クラス名結合
│   │   ├── audio.ts                    # 音声関連
│   │   ├── validation.ts               # バリデーション
│   │   ├── formatting.ts               # フォーマット
│   │   ├── error-handling.ts           # エラーハンドリング
│   │   ├── performance.ts              # パフォーマンス監視
│   │   └── index.ts
│   ├── constants/                      # 定数定義
│   │   ├── categories.ts
│   │   ├── routes.ts
│   │   ├── config.ts
│   │   ├── static-data.ts
│   │   └── index.ts
│   ├── types/                          # TypeScript型定義
│   │   ├── api.ts
│   │   ├── components.ts
│   │   ├── stores.ts
│   │   ├── database.ts
│   │   └── index.ts
│   └── index.ts                        # 全ライブラリのエクスポート
├── config/                             # 設定ファイル
│   ├── site.ts                         # サイト設定
│   ├── dashboard.ts                    # ダッシュボード設定
│   ├── auth.ts                         # 認証設定
│   └── index.ts
├── docs/                               # ドキュメント（重要度別整理）
│   ├── README.md                       # プロジェクト概要
│   ├── QUICK_START.md                  # クイックスタート
│   ├── architecture/                   # アーキテクチャ関連
│   │   ├── ARCHITECTURE.md
│   │   ├── COMPONENT_SPECIFICATION.md
│   │   └── STORE_ARCHITECTURE.md
│   ├── development/                    # 開発関連
│   │   ├── DEVELOPMENT_WORKFLOW.md
│   │   ├── REFACTORING_GUIDE.md
│   │   └── QUALITY_CHECK.md
│   ├── deployment/                     # デプロイ関連
│   │   ├── DEPLOYMENT_OPERATIONS.md
│   │   └── GITHUB_ACTIONS_SETUP.md
│   ├── database/                       # データベース関連
│   │   ├── DATABASE_DESIGN.md
│   │   └── DATABASE_MANAGEMENT.md
│   ├── security/                       # セキュリティ関連
│   │   ├── SECURITY_GUIDELINES.md
│   │   └── CWE-report.md
│   └── legacy/                         # 過去のドキュメント
│       ├── FILE_STRUCTURE_REORGANIZATION.md
│       ├── REORGANIZATION_COMPLETION_REPORT.md
│       ├── AUTH_REDIRECT_ENHANCEMENTS.md
│       ├── NAVIGATION_FLOW.md
│       └── CURRENT_STATUS.md
├── scripts/                            # スクリプトファイル（用途別分類）
│   ├── development/                    # 開発用
│   │   ├── quality-check.mjs
│   │   └── deploy-check.mjs
│   ├── database/                       # データベース用
│   │   └── db-check.mjs
│   ├── audio/                          # 音声関連
│   │   ├── check-audio-storage.mjs
│   │   ├── detailed-audio-check.mjs
│   │   ├── fix-audio-files.mjs
│   │   ├── fix-audio-paths.mjs
│   │   ├── test-audio-paths.mjs
│   │   └── update-audio-paths.mjs
│   └── index.ts                        # スクリプト一覧
├── public/                             # 静的ファイル
│   ├── favicon.ico
│   ├── manifest.json
│   └── images/                         # 画像ファイル
├── e2e/                               # E2Eテスト
│   ├── auth-redirect.spec.ts
│   └── screenshots.spec.ts
├── __tests__/                         # 単体テスト
│   ├── components/
│   ├── lib/
│   └── pages/
├── .kiro/                             # Kiro設定
│   └── specs/
└── [設定ファイル群]                    # 既存の設定ファイル
```

## コンポーネント設計

### 1. ルートグループ戦略

#### (auth) - 認証関連
- **目的**: 認証に関連するすべてのページを統合
- **レイアウト**: 認証専用のシンプルなレイアウト
- **特徴**: SEO最適化、ログイン状態の管理

#### (dashboard) - ダッシュボード関連
- **目的**: 認証後のメイン機能を統合
- **レイアウト**: サイドバー付きダッシュボードレイアウト
- **特徴**: 認証必須、リッチなUI

#### (marketing) - マーケティング関連
- **目的**: 公開ページを統合
- **レイアウト**: マーケティング向けレイアウト
- **特徴**: SEO重視、高速読み込み

#### (admin) - 管理者関連
- **目的**: 管理者機能を分離
- **レイアウト**: 管理者専用レイアウト
- **特徴**: 高度な権限制御

### 2. 学習機能の統合

#### 現在の問題
```
app/dashboard/category/[category]/quiz/
app/dashboard/category/[category]/flashcard/
app/dashboard/review/
app/dashboard/start-learning/
```

#### 最適化後
```
app/(dashboard)/learning/[category]/quiz/
app/(dashboard)/learning/[category]/flashcard/
app/(dashboard)/learning/[category]/browse/
app/(dashboard)/review/
```

**メリット:**
- 学習関連機能の論理的グループ化
- URLの簡潔化
- 共通レイアウトの効率的な活用

### 3. コンポーネント階層の最適化

#### UI Components（基本要素）
```typescript
// components/ui/button/button.tsx
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Modal } from './modal';
// ... 他のUIコンポーネント
```

#### Feature Components（機能別）
```typescript
// components/features/learning/flashcard/flashcard.tsx
export interface FlashCardProps {
  words: Word[];
  onComplete: () => void;
  onAddToReview: (wordId: string) => void;
  category: string;
}

// components/features/learning/index.ts
export { FlashCard } from './flashcard';
export { Quiz } from './quiz';
export { Review } from './review';
```

#### Layout Components（レイアウト）
```typescript
// components/layout/header/header.tsx
export interface HeaderProps {
  user: User | null;
  showNavigation?: boolean;
  variant?: 'default' | 'minimal' | 'dashboard';
}

// components/layout/index.ts
export { Header } from './header';
export { Sidebar } from './sidebar';
export { Footer } from './footer';
```

## データフロー設計

### 1. API層の統合

#### 現在の構造
```
lib/database.ts
lib/database.types.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/data-provider.ts
```

#### 最適化後
```
lib/api/database/database.ts
lib/api/database/types.ts
lib/api/database/queries.ts
lib/api/supabase/client.ts
lib/api/supabase/server.ts
lib/api/services/data-provider.ts
```

### 2. 状態管理の統合

#### Zustandストアの整理
```typescript
// lib/stores/index.ts
export { useUserStore } from './user-store';
export { useDataStore } from './data-store';
export { useUIStore } from './ui-store';
export { useSettingsStore } from './settings-store';
export { useAudioStore } from './audio-store';
export { useNavigationStore } from './navigation-store';

// 統合フック
export { useStores } from './hooks';
```

### 3. カスタムフックの整理

```typescript
// lib/hooks/index.ts
export { useAuth } from './use-auth';
export { useLearning } from './use-learning';
export { usePageData } from './use-page-data';
export { useAudio } from './use-audio';
export { useLocalStorage } from './use-local-storage';
```

## パフォーマンス最適化

### 1. バンドル分割戦略

#### 動的インポート
```typescript
// app/(dashboard)/learning/[category]/quiz/page.tsx
import { lazy, Suspense } from 'react';

const Quiz = lazy(() => import('@/components/features/learning/quiz'));

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <Quiz />
    </Suspense>
  );
}
```

#### ルートレベル分割
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      '@/components/features',
      '@/lib/stores'
    ]
  }
};
```

### 2. キャッシュ戦略

#### ISR設定
```typescript
// app/(dashboard)/learning/[category]/page.tsx
export const revalidate = 3600; // 1時間

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(category => ({
    category: category.slug
  }));
}
```

### 3. 画像最適化

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};
```

## SEO最適化

### 1. メタデータ戦略

#### 動的メタデータ
```typescript
// app/(dashboard)/learning/[category]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory(params.category);
  
  return {
    title: `${category.name} - 英単語学習`,
    description: `${category.name}カテゴリーの英単語を効率的に学習しましょう`,
    keywords: [category.name, '英語学習', '単語学習'],
    openGraph: {
      title: `${category.name} - 英単語学習`,
      description: `${category.name}カテゴリーの英単語を効率的に学習しましょう`,
      images: [`/og-images/${category.slug}.png`]
    }
  };
}
```

### 2. 構造化データ

```typescript
// components/layout/header/header.tsx
export function Header() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Masa Flash',
    description: '効率的な英単語学習アプリケーション',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser'
  };

  return (
    <header>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヘッダーコンテンツ */}
    </header>
  );
}
```

## セキュリティ設計

### 1. 認証・認可の階層化

```typescript
// app/(dashboard)/layout.tsx
import { createServerClient } from '@/lib/api/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  );
}
```

### 2. 環境変数の管理

```typescript
// config/index.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  },
  app: {
    name: 'Masa Flash',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  }
} as const;
```

## テスト戦略

### 1. テスト構造

```
__tests__/
├── components/
│   ├── ui/
│   ├── features/
│   └── layout/
├── lib/
│   ├── api/
│   ├── stores/
│   └── hooks/
└── pages/
    ├── auth/
    ├── dashboard/
    └── marketing/
```

### 2. テスト設定

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  }
};
```

## 移行戦略

### Phase 1: ルートグループの導入
1. `(auth)`, `(dashboard)`, `(marketing)`, `(admin)` ディレクトリ作成
2. 既存ページの移動
3. レイアウトファイルの作成

### Phase 2: コンポーネント再編成
1. `components/ui/` の整理
2. `components/features/` の作成
3. `components/layout/` の分離

### Phase 3: ライブラリ統合
1. `lib/api/` の作成
2. `lib/stores/` の整理
3. `lib/hooks/` の統合

### Phase 4: 設定とドキュメント
1. `config/` ディレクトリの作成
2. `docs/` の再編成
3. `scripts/` の分類

この設計により、Next.js 15のベストプラクティスに基づいた、シンプルで保守性の高いフォルダー構成が実現されます。