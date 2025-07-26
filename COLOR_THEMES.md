# カラーテーマ比較

このプロジェクトでは、Atlassian Design Systemを参考にした5つのカラーテーマを実装しています。各テーマは別々のブランチで管理されており、簡単に切り替えて比較できます。

## 実装済みテーマ

### 1. **Warm Orange Theme** (mainブランチ・推奨)
**ブランチ**: `main`

- **プライマリ**: Orange (#FF8B00)
- **セカンダリ**: Light Orange (#FFF7ED)
- **アクセント**: Light Orange (#FFF4E6)
- **背景**: Off White (#FDFBF7)
- **特徴**: 温かみのある柔らかいオレンジ系配色。親しみやすく、学習アプリケーションに最適

### 2. **Modern Purple Theme**
**ブランチ**: `color-themes/modern-purple`

- **プライマリ**: Purple (#6554C0)
- **セカンダリ**: Slate Gray (#DFE1E6)
- **アクセント**: Orange (#FF8B00)
- **背景**: Off White (#FAFBFC)
- **特徴**: モダンで洗練された配色。クリエイティブなアプリケーションに適している

### 3. **Nature Green Theme**
**ブランチ**: `color-themes/nature-green`

- **プライマリ**: Green (#36B37E)
- **セカンダリ**: Forest Green (#E3FCEF)
- **アクセント**: Teal (#00B8D9)
- **背景**: Mint (#E3FCEF)
- **特徴**: 自然で落ち着いた配色。学習アプリケーションに最適

### 4. **Atlassian Blue Theme**
**ブランチ**: `color-themes/atlassian-blue`

- **プライマリ**: Atlassian Blue (#0052CC)
- **セカンダリ**: Neutral Gray (#DFE1E6)
- **アクセント**: Green (#36B37E)
- **背景**: Light Gray (#F4F5F7)
- **特徴**: プロフェッショナルで信頼性の高い配色。企業向けアプリケーションに最適

### 5. **Professional Gray Theme**
**ブランチ**: `color-themes/professional-gray`

- **プライマリ**: Charcoal (#172B4D)
- **セカンダリ**: Medium Gray (#DFE1E6)
- **アクセント**: Blue (#0052CC)
- **背景**: Light Gray (#F4F5F7)
- **特徴**: シンプルで洗練された配色。ビジネス向けアプリケーションに最適

## テーマの切り替え方法

### 1. ブランチの切り替え
```bash
# Warm Orange Theme (mainブランチ)に切り替え
git checkout main

# Modern Purple Themeに切り替え
git checkout color-themes/modern-purple

# Nature Green Themeに切り替え
git checkout color-themes/nature-green

# Atlassian Blue Themeに切り替え
git checkout color-themes/atlassian-blue

# Professional Gray Themeに切り替え
git checkout color-themes/professional-gray
```

### 2. 開発サーバーの起動
```bash
npm run dev
```

### 3. サイト全体の確認
以下のページで色の変更を確認できます：

- **ランディングページ**: `http://localhost:3000/landing`
- **ダッシュボード**: `http://localhost:3000/protected`
- **認証ページ**: `http://localhost:3000/auth/login`
- **プロフィール**: `http://localhost:3000/protected/profile`

## 色の組み合わせの特徴

### アクセシビリティ
すべてのテーマはWCAG 2.1 AA準拠のコントラスト比を考慮して設計されています。

### ダークテーマ対応
各テーマはライトテーマとダークテーマの両方に対応しています。

### 一貫性
Atlassian Design Systemの色パレットを使用し、一貫性のあるデザインシステムを実現しています。

### サイト全体の統一
すべてのコンポーネントがCSS変数を使用しており、テーマを切り替えるとサイト全体の色が統一されて変更されます。

## 推奨使用場面

- **Warm Orange (main)**: 学習アプリケーション、親しみやすい、温かい印象
- **Modern Purple**: クリエイティブ、モダンな印象
- **Nature Green**: 学習、教育、自然な印象
- **Atlassian Blue**: 企業向け、プロフェッショナルな印象
- **Professional Gray**: ビジネス、シンプルな印象

## カスタマイズ

各テーマの色は `app/globals.css` のCSS変数で定義されています。色を変更する場合は、対応するブランチで以下の変数を編集してください：

- `--primary`: プライマリカラー
- `--secondary`: セカンダリカラー
- `--accent`: アクセントカラー
- `--background`: 背景色
- `--foreground`: 前景色（テキスト）

## 修正されたコンポーネント

以下のコンポーネントがCSS変数ベースに更新され、テーマに応じて色が変更されます：

- `app/landing/page.tsx` - ランディングページ
- `components/layouts/landing-layout.tsx` - ランディングレイアウト
- `app/protected/page.tsx` - プロテクテッドページ
- `components/common/header.tsx` - ヘッダーコンポーネント
- `components/learning/statistics-dashboard.tsx` - 統計ダッシュボード

## ブランチ一覧

```bash
git branch -a | grep color-themes
```

- `main` (Warm Orange Theme)
- `color-themes/modern-purple`
- `color-themes/nature-green`
- `color-themes/atlassian-blue`
- `color-themes/professional-gray`

## 確認方法

1. ブランチを切り替える
2. `npm run dev` で開発サーバーを起動
3. `http://localhost:3000/landing` にアクセス
4. サイト全体の色がテーマに応じて変更されていることを確認
5. ダークテーマの切り替えも確認 