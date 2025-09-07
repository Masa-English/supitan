# フォルダー構成最適化 - 現在の構造バックアップ

## バックアップ作成日時
2025年1月6日

## 現在のGitブランチ
- 作業ブランチ: `feature/folder-structure-optimization`
- 元ブランチ: `fix/20250906`

## 現在のプロジェクト構造

```
project-masa-flash-with-quiz/
├── .cursor/
│   └── rules/
├── .env.example
├── .env.local
├── .env.production
├── .git/
├── .gitignore
├── .kiro/
│   └── specs/
│       └── folder-structure-optimization/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── .next/
├── .prettierignore
├── .prettierrc
├── app/
│   ├── admin/
│   ├── api/
│   ├── auth/
│   ├── contact/
│   ├── dashboard/
│   ├── demo-login/
│   ├── error.tsx
│   ├── faq/
│   ├── globals.css
│   ├── landing/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   └── robots.ts
├── COLOR_THEMES.md
├── components/
│   ├── auth/
│   ├── common/
│   ├── features/
│   └── ui/
├── components.json
├── docs/
│   ├── API_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── AUTH_REDIRECT_ENHANCEMENTS.md
│   ├── COMPONENT_SPECIFICATION.md
│   ├── CURRENT_STATUS.md
│   ├── CWE-report.md
│   ├── DATABASE_DESIGN.md
│   ├── DATABASE_MANAGEMENT.md
│   ├── DEPLOYMENT_OPERATIONS.md
│   ├── DEVELOPMENT_WORKFLOW.md
│   ├── FILE_STRUCTURE_REORGANIZATION.md
│   ├── GITHUB_ACTIONS_SETUP.md
│   ├── NAVIGATION_FLOW.md
│   ├── QUALITY_CHECK.md
│   ├── QUICK_START.md
│   ├── README.md
│   ├── REFACTORING_GUIDE.md
│   ├── REORGANIZATION_COMPLETION_REPORT.md
│   ├── SECURITY_GUIDELINES.md
│   └── STORE_ARCHITECTURE.md
├── e2e/
│   ├── auth-redirect.spec.ts
│   └── screenshots.spec.ts
├── env.example
├── eslint.config.mjs
├── jest.config.js
├── jest.setup.js
├── lib/
│   ├── audio-utils.ts
│   ├── auth/
│   ├── categories.ts
│   ├── contexts/
│   ├── data-provider.ts
│   ├── database.ts
│   ├── database.types.ts
│   ├── error-handling.ts
│   ├── hooks/
│   ├── performance-monitor.ts
│   ├── server-word-fetcher.ts
│   ├── static-data.ts
│   ├── stores/
│   ├── supabase/
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── node_modules/
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── README.md
├── screenshots/
│   ├── 01-landing.png
│   ├── 02-login.png
│   ├── 03-dashboard.png
│   ├── 10-dashboard-home.png
│   ├── 11-start-learning.png
│   ├── 12-profile.png
│   ├── 13-statistics.png
│   └── 14-search.png
├── scripts/
│   ├── check-audio-storage.mjs
│   ├── db-check.mjs
│   ├── deploy-check.mjs
│   ├── detailed-audio-check.mjs
│   ├── fix-audio-files.mjs
│   ├── fix-audio-paths.mjs
│   ├── test-audio-paths.mjs
│   └── update-audio-paths.mjs
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

## 主要な依存関係

### 本番依存関係
- Next.js: 15.5.2 (セキュリティ更新済み)
- React: 19.0.0
- Supabase: latest
- Zustand: 5.0.6
- Radix UI: 各種コンポーネント
- Tailwind CSS: 3.4.1

### 開発依存関係
- TypeScript: 5.x
- ESLint: 9.x
- Jest: 29.7.0
- Playwright: 1.54.2
- Prettier: 3.2.5

## 現在の問題点

### TypeScript設定
- テストファイルでの型エラー（jest-dom関連）
- パスマッピングが現在の構造に最適化されていない

### フォルダー構造の課題
1. **ルーティング構造の複雑さ**
   - `app/dashboard/category/[category]/quiz/` など深いネスト
   - 関連機能が分散している

2. **コンポーネント構造**
   - `components/common/` に多様な責務のコンポーネントが混在
   - 機能別の整理が不十分

3. **ライブラリ構造**
   - `lib/` 直下にファイルが散在
   - API関連ファイルが統合されていない

## 移行準備完了事項

✅ Gitブランチ作成: `feature/folder-structure-optimization`
✅ セキュリティ脆弱性修正: Next.js 15.5.2に更新
✅ 依存関係確認: 主要パッケージ正常動作確認
✅ 現在の構造バックアップ作成

## 次のステップ

タスク2「設定ファイルとユーティリティの統合」に進む準備が整いました。