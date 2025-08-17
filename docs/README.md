# 📚 ドキュメント一覧

このフォルダには、スピ単アプリケーションの開発・運用に必要なドキュメントが含まれています。

## 🚀 はじめての方へ

### 1. [クイックスタートガイド](QUICK_START.md) ⚡
**5分で開発環境を立ち上げる**
- 環境変数の設定
- 依存関係のインストール
- 開発サーバーの起動
- よくある問題と解決策

### 2. [改修作業ガイド](REFACTORING_GUIDE.md) 🔧
**改修作業の包括的なガイド**
- プロジェクト基本情報
- 改修優先度マトリックス
- 重要ファイル一覧
- UI/UX改善ガイドライン
- 開発ワークフロー

### 3. [プロジェクト現状ステータス](CURRENT_STATUS.md) 📊
**現在のプロジェクト状況**
- 完了済み項目
- 現在の課題
- パフォーマンス指標
- データベース状況
- 次のステップ

## 📋 技術ドキュメント

### アーキテクチャ・設計
- [アーキテクチャ設計書](ARCHITECTURE.md) 🏗️
  - システム構成
  - データフロー
  - 技術的判断の根拠

- [データベース設計書](DATABASE_DESIGN.md) 🗄️
  - テーブル設計
  - インデックス戦略
  - パフォーマンス最適化

- [コンポーネント仕様書](COMPONENT_SPECIFICATION.md) 🧩
  - コンポーネント設計
  - 再利用性
  - アクセシビリティ

### API・開発
- [API仕様書](API_SPECIFICATION.md) 🔌
  - エンドポイント一覧
  - リクエスト・レスポンス形式
  - 認証・認可

- [開発ワークフロー](DEVELOPMENT_WORKFLOW.md) 🔄
  - 開発プロセス
  - コードレビュー
  - テスト戦略

## 🚀 運用・デプロイ

### デプロイメント
- [デプロイメント運用](DEPLOYMENT_OPERATIONS.md) 🚀
  - デプロイ環境
  - CI/CD設定
  - 監視・ログ

### 品質管理
- [品質チェック](QUALITY_CHECK.md) ✅
  - コード品質
  - パフォーマンス
  - セキュリティ

- [セキュリティガイドライン](SECURITY_GUIDELINES.md) 🔒
  - セキュリティ対策
  - ベストプラクティス
  - 脆弱性対応

## 📊 分析・レポート

### パフォーマンス
- [CWE-report.md](CWE-report.md) 📈
  - パフォーマンス分析
  - 改善提案

### ナビゲーション
- [ナビゲーションフロー](NAVIGATION_FLOW.md) 🧭
  - ユーザーフロー
  - 画面遷移
  - UX設計

## 🛠️ ツール・設定

### GitHub Actions
- [GitHub Actions設定](GITHUB_ACTIONS_SETUP.md) ⚙️
  - CI/CD設定
  - 自動化
  - デプロイフロー

### データベース管理
- [データベース管理](DATABASE_MANAGEMENT.md) 💾
  - マイグレーション
  - バックアップ
  - 復旧手順

## 📝 ドキュメント更新ガイドライン

### 更新タイミング
- **機能追加時**: 関連する仕様書を更新
- **バグ修正時**: 該当するガイドラインを更新
- **定期的**: 月1回の全体レビュー

### 更新ルール
1. **明確性**: 技術的詳細とビジネス価値の両方を記載
2. **実用性**: 実際の開発で使える情報を提供
3. **保守性**: 定期的な更新を前提とした構成
4. **一貫性**: 用語・表記の統一

### 更新手順
```bash
# 1. ブランチ作成
git checkout -b docs/更新内容

# 2. ドキュメント更新
# 該当ファイルを編集

# 3. レビュー依頼
git add .
git commit -m "docs: ドキュメント更新"
git push origin docs/更新内容
```

## 🔍 ドキュメント検索

### 技術スタック別
- **Next.js**: [アーキテクチャ設計書](ARCHITECTURE.md), [開発ワークフロー](DEVELOPMENT_WORKFLOW.md)
- **Supabase**: [データベース設計書](DATABASE_DESIGN.md), [API仕様書](API_SPECIFICATION.md)
- **UI/UX**: [コンポーネント仕様書](COMPONENT_SPECIFICATION.md), [ナビゲーションフロー](NAVIGATION_FLOW.md)

### 目的別
- **開発開始**: [クイックスタートガイド](QUICK_START.md)
- **改修作業**: [改修作業ガイド](REFACTORING_GUIDE.md)
- **デプロイ**: [デプロイメント運用](DEPLOYMENT_OPERATIONS.md)
- **品質管理**: [品質チェック](QUALITY_CHECK.md)

## 📞 サポート

### ドキュメントに関する質問
- [GitHub Issues](https://github.com/your-repo/issues)で検索
- 新しいIssueを作成（`docs`ラベル付き）

### 緊急時
- プロジェクトの[README.md](../README.md)を確認
- 開発チームに直接連絡

---

**最終更新**: 2024-12-27
**更新者**: AI Assistant
**次回レビュー**: 2025-01-27
