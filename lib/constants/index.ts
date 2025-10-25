/**
 * 定数の統合エクスポート
 */

// カテゴリー関連
export {
  CATEGORIES,
  type CategoryConfig,
  type CategoryStats,
  getCategoryConfig,
  getCategoryConfigByName,
  getAllCategories,
  getCategoryIds,
  getCategoryNames,
  getActiveCategories,
  getCategoryIdByName,
  getCategoryNameById,
  getCategoryEnglishName,
  getCategoryPos,
  getCategoryColor,
  getCategoryIcon,
  getCategoryDescription,
  isValidCategory,
  normalizeCategoryName,
  createCategoryStats,
  createAllCategoryStats,
  formatCategoryName,
  formatCategoryDetails
} from './categories';

// ルート関連
export {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  LEARNING_ROUTES,
  ADMIN_ROUTES,
  API_ROUTES,
  ROUTE_PATTERNS,
  MAIN_NAVIGATION,
  FOOTER_NAVIGATION,
  BREADCRUMB_ROUTES,
  type RouteInfo,
  type PublicRoute,
  type AuthRoute,
  type DashboardRoute,
  type AdminRoute,
  type ApiRoute,
  type AppRoute,
  isProtectedRoute,
  isAuthOnlyRoute,
  isAdminRoute,
  isPublicRoute,
  getRouteInfo,
  generateBreadcrumbs
} from './routes';

// 静的データ関連
export {
  CACHE_CONFIG,
  type StaticData,
  getStaticData,
  getStaticDataForCategory,
  revalidateStaticData
} from './static-data';

// アプリケーション定数
export const APP_CONSTANTS = {
  // アプリケーション情報
  APP_NAME: 'Masa Flash',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: '効率的な英単語学習アプリケーション',
  
  // 学習設定
  LEARNING: {
    DEFAULT_SESSION_SIZE: 20,
    MAX_SESSION_SIZE: 50,
    MIN_SESSION_SIZE: 5,
    DEFAULT_QUIZ_SIZE: 10,
    MAX_QUIZ_SIZE: 30,
    MIN_QUIZ_SIZE: 5,
    QUIZ_TIME_LIMIT: 30, // 秒
    PASSING_SCORE: 70, // パーセント
    REVIEW_INTERVALS: [1, 3, 7, 14, 30] // 日数
  },
  
  // UI設定
  UI: {
    TOAST_DURATION: 3000, // ミリ秒
    TRANSITION_DURATION: 200, // ミリ秒
    DEBOUNCE_DELAY: 300, // ミリ秒
    SIDEBAR_WIDTH: 280,
    SIDEBAR_COLLAPSED_WIDTH: 80,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48
  },
  
  // データ設定
  DATA: {
    CACHE_EXPIRY: 300000, // 5分（ミリ秒）
    MAX_CACHE_SIZE: 100, // アイテム数
    SYNC_INTERVAL: 60000, // 1分（ミリ秒）
    MAX_RETRIES: 3,
    PRELOAD_LIMIT: 50 // アイテム数
  },
  
  // セキュリティ設定
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15分（ミリ秒）
    SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30日（ミリ秒）
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128
  },
  
  // ファイル設定
  FILES: {
    MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_BUNDLE_SIZE: 500000, // 500KB
    MAX_ASSET_SIZE: 500000 // 500KB
  },
  
  // API設定
  API: {
    TIMEOUT: 10000, // 10秒（ミリ秒）
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1秒（ミリ秒）
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15分（ミリ秒）
    RATE_LIMIT_MAX_REQUESTS: 100
  },
  
  // 音声設定
  AUDIO: {
    ENABLE_AUTO_PLAY: true,
    DEFAULT_VOLUME: 0.8,
    PRELOAD_AUDIO: false,
    SUPPORTED_FORMATS: ['mp3', 'wav', 'ogg']
  },
  
  // 分析設定
  ANALYTICS: {
    ENABLE_TRACKING: process.env.NODE_ENV === 'production',
    TRACK_PAGE_VIEWS: true,
    TRACK_BUTTON_CLICKS: true,
    TRACK_FORM_SUBMISSIONS: true,
    TRACK_LEARNING_SESSIONS: true,
    TRACK_QUIZ_COMPLETIONS: true
  }
} as const;

// 環境変数の型安全なアクセス
export const ENV = {
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.ENABLE_DEBUG === 'true'
} as const;

// 型定義
export type AppConstants = typeof APP_CONSTANTS;
export type Environment = typeof ENV;