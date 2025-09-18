/**
 * 統一されたストア型定義
 * 全ストアの型を一元管理し、一貫性を保つ
 */

import type { User, UserProfile, UserProgress, Word, Category, ReviewWord } from './database';
import type { AppStats } from './api';

// ============================================================================
// 基本的なストア型
// ============================================================================

/** 非同期状態管理の基本型 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** ストアアクションの基本型 */
export interface BaseStoreActions {
  reset: () => void;
  hydrate?: (state: Record<string, unknown>) => void;
}

/** キャッシュ管理の基本型 */
export interface CacheState<T> {
  data: Record<string, T>;
  lastUpdated: Record<string, number>;
  expiry: number;
}

// ============================================================================
// ユーザーストア型
// ============================================================================

export interface UserStoreState extends BaseStoreActions {
  // 認証状態
  auth: AsyncState<User>;
  
  // プロフィール情報
  profile: AsyncState<UserProfile>;
  
  // 学習進捗（word_id -> UserProgress）
  progress: AsyncState<Record<string, UserProgress>>;
  
  // 統計情報
  stats: AsyncState<AppStats>;
  
  // アクション
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateWordProgress: (wordId: string, progress: Partial<UserProgress>) => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  clearUserData: () => void;
}

// ============================================================================
// データストア型
// ============================================================================

export interface DataStoreState extends BaseStoreActions {
  // 単語データ（category -> Word[]）
  words: AsyncState<Record<string, Word[]>>;
  
  // カテゴリーデータ
  categories: AsyncState<Category[]>;
  
  // 復習単語
  reviewWords: AsyncState<ReviewWord[]>;
  
  // 検索・フィルタリング
  search: {
    query: string;
    filters: SearchFilters;
    results: Word[];
  };
  
  // キャッシュ管理
  cache: CacheState<Word[]>;
  
  // アクション
  fetchWords: (category: string, forceRefresh?: boolean) => Promise<void>;
  fetchCategories: (forceRefresh?: boolean) => Promise<void>;
  fetchReviewWords: (userId: string, forceRefresh?: boolean) => Promise<void>;
  getWordsByCategory: (category: string) => Word[];
  searchWords: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  applyFilters: () => void;
  clearSearch: () => void;
  clearCache: () => void;
  refreshData: () => Promise<void>;
}

export interface SearchFilters {
  categories: string[];
  favoritesOnly: boolean;
  masteredOnly: boolean;
  unstudiedOnly: boolean;
}

// ============================================================================
// UIストア型
// ============================================================================

export interface UIStoreState extends BaseStoreActions {
  // テーマ
  theme: ThemeMode;
  
  // モーダル状態
  modals: Record<string, boolean>;
  
  // サイドバー状態
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  
  // ローディング状態
  loading: {
    global: boolean;
    states: Record<string, boolean>;
  };
  
  // トースト通知
  toasts: ToastState[];
  
  // アクション
  setTheme: (theme: ThemeMode) => void;
  toggleModal: (modalId: string, isOpen?: boolean) => void;
  toggleSidebar: (isOpen?: boolean) => void;
  toggleSidebarCollapse: (isCollapsed?: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  addToast: (toast: Omit<ToastState, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// 設定ストア型
// ============================================================================

export interface SettingsStoreState extends BaseStoreActions {
  // 学習設定
  study: StudySettings;
  
  // 音声設定
  audio: AudioSettings;
  
  // 通知設定
  notification: NotificationSettings;
  
  // 表示設定
  display: DisplaySettings;
  
  // アクション
  updateStudySettings: (settings: Partial<StudySettings>) => Promise<void>;
  updateAudioSettings: (settings: Partial<AudioSettings>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export interface StudySettings {
  wordsPerSession: number;
  showJapanese: boolean;
  showPhonetic: boolean;
  showExamples: boolean;
  autoPlayAudio: boolean;
  shuffleWords: boolean;
  reviewMode: 'spaced' | 'immediate' | 'manual';
  difficultyAdjustment: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  playbackSpeed: number;
  autoPlay: boolean;
  preloadAudio: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  studyReminders: boolean;
  reviewReminders: boolean;
  achievementNotifications: boolean;
  emailNotifications: boolean;
  reminderTime: string;
}

export interface DisplaySettings {
  language: 'ja' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
}

// ============================================================================
// 音声ストア型
// ============================================================================

export interface AudioStoreState extends BaseStoreActions {
  // 現在の音声
  current: {
    audio: HTMLAudioElement | null;
    url: string | null;
    word: Word | null;
  };
  
  // 再生状態
  playback: {
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
    volume: number;
    playbackSpeed: number;
    isMuted: boolean;
  };
  
  // プリロード
  preloaded: Record<string, HTMLAudioElement>;
  
  // アクション
  playWordAudio: (word: Word) => Promise<void>;
  playAudio: (url: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleMute: () => void;
  preloadAudio: (urls: string[]) => Promise<void>;
  clearPreloaded: () => void;
}

// ============================================================================
// ナビゲーションストア型
// ============================================================================

export interface NavigationStoreState extends BaseStoreActions {
  // 現在のページ情報
  current: {
    path: string;
    title: string;
    params: Record<string, string>;
  };
  
  // ナビゲーション履歴
  history: {
    previous: string | null;
    stack: string[];
  };
  
  // ページ状態
  state: {
    isNavigating: boolean;
    isLoading: boolean;
  };
  
  // ブレッドクラム
  breadcrumbs: BreadcrumbItem[];
  
  // アクション
  setCurrentPath: (path: string, title?: string, params?: Record<string, string>) => void;
  goBack: () => void;
  goForward: () => void;
  clearHistory: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setNavigating: (isNavigating: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// 学習セッションストア型
// ============================================================================

export interface LearningSessionStoreState extends BaseStoreActions {
  // セッション情報
  session: {
    id: string | null;
    mode: 'flashcard' | 'quiz' | null;
    category: string | null;
    words: Word[];
    startedAt: Date | null;
    endedAt: Date | null;
  };
  
  // 進捗状態
  progress: {
    currentIndex: number;
    totalWords: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
  };
  
  // セッション結果
  results: {
    answers: SessionAnswer[];
    score: number;
    accuracy: number;
    timeSpent: number;
  };
  
  // アクション
  startSession: (mode: 'flashcard' | 'quiz', category: string, words: Word[]) => void;
  endSession: () => void;
  nextWord: () => void;
  previousWord: () => void;
  recordAnswer: (answer: SessionAnswer) => void;
  resetSession: () => void;
}

export interface SessionAnswer {
  wordId: string;
  isCorrect: boolean;
  userAnswer?: string;
  correctAnswer: string;
  timeSpent: number;
  timestamp: Date;
}

// ============================================================================
// 統計ストア型
// ============================================================================

export interface StatsStoreState extends BaseStoreActions {
  // 学習統計
  learning: AsyncState<LearningStats>;
  
  // 単語習得統計
  mastery: AsyncState<MasteryStats>;
  
  // 時系列統計
  timeline: AsyncState<TimelineStats>;
  
  // アクション
  refreshLearningStats: (userId: string) => Promise<void>;
  refreshMasteryStats: (userId: string) => Promise<void>;
  refreshTimelineStats: (userId: string, period: TimePeriod) => Promise<void>;
  refreshAllStats: (userId: string) => Promise<void>;
}

export interface LearningStats {
  totalWordsStudied: number;
  totalSessions: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  streak: number;
  lastStudyDate: Date | null;
}

export interface MasteryStats {
  masteredWords: number;
  learningWords: number;
  newWords: number;
  reviewWords: number;
  favoriteWords: number;
  masteryByCategory: Record<string, number>;
}

export interface TimelineStats {
  period: TimePeriod;
  data: TimelineDataPoint[];
}

export interface TimelineDataPoint {
  date: string;
  wordsStudied: number;
  accuracy: number;
  timeSpent: number;
}

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

// ============================================================================
// ストアユーティリティ型
// ============================================================================

/** ストアスライスの基本型 */
export interface StoreSlice<T> {
  (...args: unknown[]): T;
}

/** ストア永続化の設定 */
export interface PersistConfig<T> {
  name: string;
  storage?: Storage;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: () => ((state?: T) => void) | void;
}

/** ストアのデバッグ情報 */
export interface StoreDebugInfo {
  name: string;
  version: string;
  lastUpdated: Date;
  actions: string[];
}

// ============================================================================
// エクスポート用の統合型
// ============================================================================

/** 全ストアの統合型 */
export interface AppStoreState {
  user: UserStoreState;
  data: DataStoreState;
  ui: UIStoreState;
  settings: SettingsStoreState;
  audio: AudioStoreState;
  navigation: NavigationStoreState;
  learningSession: LearningSessionStoreState;
  stats: StatsStoreState;
}

/** ストアセレクターの型 */
export type StoreSelector<T, R> = (state: T) => R;

/** ストアアクションの型 */
export type StoreAction<T extends (...args: unknown[]) => unknown> = T;
