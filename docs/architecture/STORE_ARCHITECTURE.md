# ストアアーキテクチャ

## 概要

スピ単アプリケーションでは、Zustandを使用した包括的な状態管理システムを採用しています。各ストアは特定の責任領域を持ち、アプリケーション全体の状態を効率的に管理します。

## ストア構成

### 1. ユーザーストア (`useUserStore`)
**責任**: ユーザー認証、プロフィール、学習進捗、統計情報の管理

```typescript
// 使用例
const { user, profile, userProgress, stats, updateWordProgress } = useUserStore();

// 進捗更新
await updateWordProgress(wordId, { 
  mastery_level: 0.8, 
  study_count: 5 
});
```

**主要機能**:
- ユーザー認証状態管理
- プロフィール情報の取得・更新
- 学習進捗の管理
- 統計情報の取得
- お気に入り機能

### 2. データストア (`useDataStore`)
**責任**: 単語、カテゴリー、復習単語、検索・フィルタリングの管理

```typescript
// 使用例
const { words, categories, filteredWords, searchWords, updateFilters } = useDataStore();

// 検索実行
searchWords('hello');

// フィルター更新
updateFilters({ categories: ['basic'], favoritesOnly: true });
```

**主要機能**:
- 単語データの管理
- カテゴリーデータの管理
- 復習単語の管理
- 検索・フィルタリング機能
- キャッシュ管理

### 3. UIストア (`useUIStore`)
**責任**: モーダル、サイドメニュー、通知、ローディング、エラー状態の管理

```typescript
// 使用例
const { openModal, addNotification, setLoading } = useUIStore();

// モーダル表示
openModal('completion');

// 通知表示
addNotification({
  type: 'success',
  title: '学習完了',
  message: '素晴らしい！'
});
```

**主要機能**:
- モーダル管理
- サイドメニュー管理
- 通知・トースト管理
- ローディング状態管理
- エラー状態管理

### 4. 設定ストア (`useSettingsStore`)
**責任**: アプリケーション設定の管理（テーマ、音声、学習、アクセシビリティなど）

```typescript
// 使用例
const { theme, audio, learning, setTheme, updateAudioSettings } = useSettingsStore();

// テーマ変更
setTheme('dark');

// 音声設定更新
updateAudioSettings({ volume: 0.8, autoPlay: true });
```

**主要機能**:
- テーマ設定（ライト/ダーク/システム）
- 音声設定
- 学習設定
- アクセシビリティ設定
- 通知設定
- データ設定
- 設定のエクスポート/インポート

### 5. 音声ストア (`useAudioStore`)
**責任**: 音声ファイルの管理と再生

```typescript
// 使用例
const { playWordAudio, playCorrectSound, setVolume } = useAudioStore();

// 単語音声再生
await playWordAudio(wordId);

// 正解音再生
playCorrectSound();
```

**主要機能**:
- 音声ファイルの初期化
- 単語音声の管理
- 効果音の管理
- 音声キャッシュ
- 音量・ミュート制御

### 6. ナビゲーションストア (`useNavigationStore`)
**責任**: ナビゲーション状態と学習セッションの管理

```typescript
// 使用例
const { isNavigating, start, stop } = useNavigationStore();
const { setLearningSession, getNextSection, hasNextSection } = useLearningSessionStore();

// ナビゲーション開始
start();

// 学習セッション設定
setLearningSession({
  category: 'basic',
  currentSection: '1',
  sections: ['1', '2', '3'],
  learningMode: 'quiz'
});
```

**主要機能**:
- ナビゲーション状態管理
- 学習セッション情報管理
- セクション間移動機能

## カスタムフック

### アプリケーション初期化
```typescript
import { useAppInitialization } from '@/lib/stores/hooks';

function App() {
  useAppInitialization(); // アプリケーション全体の初期化
  // ...
}
```

### 認証状態
```typescript
import { useAuth } from '@/lib/stores/hooks';

function Component() {
  const { user, isAuthenticated, signOut } = useAuth();
  // ...
}
```

### 学習データ
```typescript
import { useLearningData } from '@/lib/stores/hooks';

function Component() {
  const { words, categories, loading, getCategoryWords } = useLearningData('basic');
  // ...
}
```

### 検索・フィルタリング
```typescript
import { useSearch } from '@/lib/stores/hooks';

function SearchComponent() {
  const { searchQuery, filteredWords, searchWords, updateFilters } = useSearch();
  // ...
}
```

### アプリケーション設定
```typescript
import { useAppSettings } from '@/lib/stores/hooks';

function SettingsComponent() {
  const { theme, audio, isDarkMode, setTheme } = useAppSettings();
  // ...
}
```

### 音声制御
```typescript
import { useAudio } from '@/lib/stores/hooks';

function AudioComponent() {
  const { playWithSettings, playCorrectWithSettings, setVolume } = useAudio();
  // ...
}
```

### UI制御
```typescript
import { useAppUI } from '@/lib/stores/hooks';

function Component() {
  const { openModal, showSuccessNotification, setLoading } = useAppUI();
  // ...
}
```

### 学習セッション
```typescript
import { useLearningSession } from '@/lib/stores/hooks';

function LearningComponent() {
  const { isInSession, getSessionInfo, getNextSection } = useLearningSession();
  // ...
}
```

## ストア間の連携

### 設定と音声の連携
```typescript
// 設定ストアで音声設定を変更すると、音声ストアに自動反映
const { updateAudioSettings } = useSettingsStore();
const { setVolume } = useAudioStore();

// 設定更新時に音声ストアも更新
updateAudioSettings({ volume: 0.8 });
```

### ユーザーとデータの連携
```typescript
// ユーザーがログインすると、自動的に復習単語を読み込み
const { user } = useUserStore();
const { loadReviewWords } = useDataStore();

useEffect(() => {
  if (user) {
    loadReviewWords(user.id);
  }
}, [user]);
```

### UIとデータの連携
```typescript
// データ読み込み中はローディング状態を表示
const { wordsLoading } = useDataStore();
const { setLoading } = useUIStore();

useEffect(() => {
  setLoading('page', wordsLoading);
}, [wordsLoading]);
```

## パフォーマンス最適化

### 1. 選択的サブスクリプション
```typescript
// 必要な部分のみをサブスクライブ
const user = useUserStore(state => state.user);
const volume = useAudioStore(state => state.volume);
```

### 2. キャッシュ管理
```typescript
// データストアでカテゴリー別単語をキャッシュ
const { getWordsByCategory } = useDataStore();
const words = await getWordsByCategory('basic'); // 5分間キャッシュ
```

### 3. 遅延初期化
```typescript
// 音声ストアは必要時に初期化
const { initializeAudio } = useAudioStore();
useEffect(() => {
  initializeAudio();
}, []);
```

## エラーハンドリング

### グローバルエラー管理
```typescript
const { addError, errors } = useUIStore();

// エラーを追加
addError({
  message: 'データの取得に失敗しました',
  code: 'FETCH_ERROR'
});

// エラーを表示
{errors.map(error => (
  <ErrorNotification key={error.id} error={error} />
))}
```

### ストア固有のエラー処理
```typescript
const { error: userError, loading: userLoading } = useUserStore();
const { error: dataError, loading: dataLoading } = useDataStore();

// エラー状態に応じたUI表示
if (userError) {
  return <AuthError error={userError} />;
}
```

## 永続化

### 設定の永続化
```typescript
// 設定ストアは自動的にlocalStorageに保存
const { theme, updateAudioSettings } = useSettingsStore();

// 設定変更は自動的に永続化される
updateAudioSettings({ volume: 0.8 });
```

### セッション管理
```typescript
// 学習セッションはメモリ内で管理（ページリロード時にクリア）
const { setLearningSession, clearSession } = useLearningSessionStore();

// ページ離脱時にクリア
useEffect(() => {
  return () => clearSession();
}, []);
```

## 開発者向けTips

### 1. ストアのデバッグ
```typescript
// 開発環境でストアの状態を確認
if (process.env.NODE_ENV === 'development') {
  console.log('User Store:', useUserStore.getState());
  console.log('Data Store:', useDataStore.getState());
}
```

### 2. ストアのテスト
```typescript
// テスト用のモックストア
const mockUserStore = create<UserState>(() => ({
  user: mockUser,
  loading: false,
  // ...
}));
```

### 3. ストアの拡張
```typescript
// 新しいストアを追加する場合
export const useNewStore = create<NewState>((set, get) => ({
  // 状態とアクション
}));
```

このアーキテクチャにより、アプリケーションの状態管理が整理され、保守性と拡張性が大幅に向上しました。
