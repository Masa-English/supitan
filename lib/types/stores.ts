// Store-related types
import type { User, UserProfile, UserProgress, Word, Category } from './database';
import type { AppStats } from './api';

// User store types
export interface UserState {
  // 認証状態
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // プロフィール情報
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // 学習進捗
  userProgress: Record<string, UserProgress>;
  progressLoading: boolean;
  progressError: string | null;
  
  // 統計情報
  stats: AppStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
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

// Data store types
export interface DataState {
  // 単語データ
  words: Record<string, Word[]>;
  wordsLoading: boolean;
  wordsError: string | null;
  
  // カテゴリデータ
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // キャッシュ管理
  lastFetched: Record<string, number>;
  cacheExpiry: number;
  
  // アクション
  fetchWords: (category: string, forceRefresh?: boolean) => Promise<void>;
  fetchCategories: (forceRefresh?: boolean) => Promise<void>;
  getWordsByCategory: (category: string) => Word[];
  clearCache: () => void;
  refreshData: () => Promise<void>;
}

// UI store types
export interface UIState {
  // テーマ
  theme: 'light' | 'dark' | 'system';
  
  // モーダル状態
  modals: Record<string, boolean>;
  
  // サイドバー状態
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // ローディング状態
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // トースト
  toasts: ToastState[];
  
  // アクション
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleModal: (modalId: string, isOpen?: boolean) => void;
  toggleSidebar: (isOpen?: boolean) => void;
  toggleSidebarCollapse: (isCollapsed?: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  addToast: (toast: Omit<ToastState, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

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

// Settings store types
export interface SettingsState {
  // 学習設定
  studySettings: StudySettings;
  
  // 音声設定
  audioSettings: AudioSettings;
  
  // 通知設定
  notificationSettings: NotificationSettings;
  
  // 表示設定
  displaySettings: DisplaySettings;
  
  // アクション
  updateStudySettings: (settings: Partial<StudySettings>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  resetSettings: () => void;
  loadSettings: () => void;
  saveSettings: () => void;
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

// Audio store types
export interface AudioState {
  // 現在の音声
  currentAudio: HTMLAudioElement | null;
  currentUrl: string | null;
  
  // 再生状態
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 音量とスピード
  volume: number;
  playbackSpeed: number;
  
  // プリロード
  preloadedAudio: Record<string, HTMLAudioElement>;
  
  // アクション
  playAudio: (url: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  preloadAudio: (urls: string[]) => Promise<void>;
  clearPreloaded: () => void;
}

// Navigation store types
export interface NavigationState {
  // 現在のページ情報
  currentPath: string;
  previousPath: string | null;
  
  // ナビゲーション履歴
  history: string[];
  
  // ページ状態
  isNavigating: boolean;
  
  // ブレッドクラム
  breadcrumbs: BreadcrumbItem[];
  
  // アクション
  setCurrentPath: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  clearHistory: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setNavigating: (isNavigating: boolean) => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// Store utility types
export interface StoreSlice<T> {
  (...args: unknown[]): T;
}

export interface StoreActions {
  reset: () => void;
  hydrate: (state: Record<string, unknown>) => void;
}

export type StoreState<T> = T & StoreActions;