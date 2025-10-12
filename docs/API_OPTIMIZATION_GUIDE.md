# API通信最適化ガイド

## 概要

このプロジェクトでは、過剰なAPI通信を防ぐために以下の最適化を実装しました：

1. **統一データフック** - 重複したデータフェッチングを排除
2. **最適化されたデータベースサービス** - クエリの統合とキャッシュ改善
3. **スマートリアルタイム更新** - バッチ処理による効率的な更新
4. **API最適化ユーティリティ** - リクエストの重複排除とバッチ処理

## 実装された最適化

### 1. 統一データフック (`useUnifiedData`)

**問題**: 複数のフック（`usePageData`, `useOptimizedData`, `useDataStore`）が同じデータを並行して取得

**解決策**: 
- 単一のフックで全データを管理
- 事前取得データの優先使用
- グローバルストアとの連携
- キャッシュ状態の可視化

```typescript
// 使用例
const { words, categories, userProgress, loading, error, refresh } = useUnifiedData({
  category: 'basic',
  userId: user?.id,
  prefetchedData: serverData,
  enableRealtime: true,
  updateInterval: 300000, // 5分間隔
});
```

### 2. 最適化されたデータベースサービス (`OptimizedDatabaseService`)

**問題**: 
- `getWordsByCategory`でカテゴリーID取得と単語取得を分離
- 複数のクエリで同じデータを取得

**解決策**:
- JOINを使用した単一クエリ
- クエリレベルでのキャッシュ
- 統合データ取得の実装

```typescript
// 最適化前（2クエリ）
const categoryData = await supabase.from('categories').select('id').eq('name', category);
const words = await supabase.from('words').select('*').eq('category_id', categoryData.id);

// 最適化後（1クエリ）
const words = await supabase
  .from('words')
  .select(`
    *,
    categories!inner (*)
  `)
  .eq('categories.name', category);
```

### 3. スマートリアルタイム更新 (`useSmartRealtime`)

**問題**: リアルタイム更新が30秒間隔で全データを再取得

**解決策**:
- バッチ処理による更新の統合
- 更新間隔の最適化
- 統計情報の提供

```typescript
// 使用例
const { isConnected, stats } = useSmartRealtimeWords(category, userId);

// 統計情報
console.log(`Total updates: ${stats.totalUpdates}`);
console.log(`Batched updates: ${stats.batchedUpdates}`);
```

### 4. API最適化ユーティリティ (`APIOptimizer`)

**問題**: 同じAPI呼び出しが重複実行される

**解決策**:
- 重複リクエストの排除
- バッチ処理の実装
- キャッシュ管理

```typescript
// 重複排除
const data = await apiOptimizer.deduplicateRequest(
  'words_category_basic',
  () => fetchWordsByCategory('basic'),
  300000 // 5分キャッシュ
);

// バッチ処理
const results = await batchedApiCall(
  'progress/update',
  'user123',
  { wordId: 'word1', isCorrect: true }
);
```

## キャッシュ戦略

### キャッシュ期間の最適化

```typescript
const CACHE_DURATION = {
  WORDS: 15 * 60 * 1000,      // 15分（延長）
  CATEGORIES: 60 * 60 * 1000, // 1時間（延長）
  REVIEW: 10 * 60 * 1000,     // 10分（延長）
  USER_PROGRESS: 5 * 60 * 1000, // 5分（ユーザー進捗は短め）
};
```

### キャッシュ無効化

- ユーザー進捗更新時に関連キャッシュを自動無効化
- パターンマッチングによる選択的無効化
- バッチ処理による効率的な無効化

## パフォーマンス改善

### 期待される改善効果

1. **API呼び出し数の削減**: 60-80%の削減
2. **データベースクエリの最適化**: 50%の削減
3. **リアルタイム更新の効率化**: 70%の削減
4. **キャッシュヒット率**: 80%以上

### 監視指標

```typescript
// 統計情報の取得
const stats = apiOptimizer.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
console.log(`Deduplicated requests: ${stats.deduplicatedRequests}`);
console.log(`Batched requests: ${stats.batchedRequests}`);
```

## 使用方法

### 1. 新しいコンポーネントでの使用

```typescript
import { useUnifiedData } from '@/lib/hooks/use-unified-data';

export function MyComponent({ category, userId }) {
  const { words, loading, error, refresh } = useUnifiedData({
    category,
    userId,
    enableRealtime: true,
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return <WordList words={words} />;
}
```

### 2. 既存コンポーネントの移行

```typescript
// 移行前
const { words } = usePageData({ type: 'quiz', category });
const { categories } = useOptimizedData({ category });

// 移行後
const { words, categories } = useUnifiedData({ category });
```

### 3. リアルタイム更新の最適化

```typescript
// 移行前
const { refresh } = useRealtimeWords(category, userId);

// 移行後
const { refresh, stats } = useSmartRealtimeWords(category, userId);
```

## ベストプラクティス

### 1. データフェッチング

- 事前取得データを優先的に使用
- 必要なデータのみを取得
- キャッシュを活用した効率的な更新

### 2. リアルタイム更新

- バッチ処理を活用
- 更新間隔を適切に設定
- 統計情報を監視

### 3. エラーハンドリング

- キャッシュからのフォールバック
- 適切なエラーメッセージの表示
- リトライ機能の実装

## トラブルシューティング

### よくある問題

1. **キャッシュが古い**
   - キャッシュを手動でクリア
   - 更新間隔を調整

2. **リアルタイム更新が遅い**
   - バッチ間隔を調整
   - 更新対象を限定

3. **メモリ使用量の増加**
   - キャッシュサイズを制限
   - 定期的なクリーンアップ

### デバッグ方法

```typescript
// キャッシュ状態の確認
const { cacheInfo } = useUnifiedData({ category });
console.log('Cache status:', cacheInfo);

// 統計情報の確認
const stats = apiOptimizer.getStats();
console.log('API stats:', stats);
```

## 今後の改善予定

1. **Service Worker**によるオフライン対応
2. **GraphQL**による効率的なデータ取得
3. **WebSocket**によるリアルタイム通信の最適化
4. **IndexedDB**による永続化キャッシュ

## まとめ

この最適化により、API通信の効率が大幅に向上し、ユーザーエクスペリエンスが改善されます。新しいコンポーネントでは最適化されたフックを使用し、既存のコンポーネントは段階的に移行することを推奨します。
