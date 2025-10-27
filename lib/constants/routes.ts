/**
 * アプリケーション内のルート定義
 */

import { getCategoryNameById, getCategorySlugFromId } from './categories';

// 公開ルート（認証不要）
export const PUBLIC_ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms'
} as const;

// 認証関連ルート
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGN_UP: '/auth/sign-up',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  UPDATE_PASSWORD: '/auth/update-password',
  RESET_PASSWORD: '/auth/reset-password', // 後方互換性のため保持
  VERIFY_EMAIL: '/auth/verify-email',
  CONFIRM: '/auth/confirm',
  ERROR: '/auth/error',
  DEMO_LOGIN: '/demo-login'
} as const;

// ダッシュボード関連ルート
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  PROFILE: '/profile',
  STATISTICS: '/statistics',
  SEARCH: '/search',
  SETTINGS: '/settings',
  HELP: '/help'
} as const;

// 学習関連ルート
export const LEARNING_ROUTES = {
  BASE: '/learning',
  CATEGORY: (categoryId: string) => `/learning/${categoryId}`,
  FLASHCARD: (categoryId: string) => `/learning/${categoryId}/flashcard`,
  QUIZ: (categoryId: string) => `/learning/${categoryId}/quiz`,
  BROWSE: (categoryId: string) => `/learning/${categoryId}/browse`,
  REVIEW: '/review'
} as const;

// 短縮IDを使ったURL生成（UUIDの最初の8桁を使用）
export const LEARNING_ROUTES_SHORT = {
  BASE: '/learning',
  CATEGORY: (categoryId: string) => `/learning/${getCategorySlugFromId(categoryId)}`,
  FLASHCARD: (categoryId: string) => `/learning/${getCategorySlugFromId(categoryId)}/flashcard`,
  QUIZ: (categoryId: string) => `/learning/${getCategorySlugFromId(categoryId)}/quiz`,
  BROWSE: (categoryId: string) => `/learning/${getCategorySlugFromId(categoryId)}/browse`,
  REVIEW: '/review'
} as const;

// 管理者関連ルート
export const ADMIN_ROUTES = {
  HOME: '/admin',
  CONTACT: '/admin/contact',
  USERS: '/admin/users',
  ANALYTICS: '/admin/analytics'
} as const;

// API関連ルート
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify'
  },
  DATA: {
    WORDS: '/api/data/words',
    CATEGORIES: '/api/data/categories',
    PROGRESS: '/api/data/progress',
    STATISTICS: '/api/data/statistics'
  },
  AUDIO: {
    PLAY: '/api/audio/play',
    DOWNLOAD: '/api/audio/download'
  },
  CONTACT: '/api/contact',
  HEALTH: '/api/health',
  REVALIDATE: '/api/revalidate',
  STATIC_DATA: '/api/static-data'
} as const;

// ルートパターン（ミドルウェア用）
export const ROUTE_PATTERNS = {
  // 認証が必要なルート
  PROTECTED: [
    '/dashboard',
    '/learning',
    '/review',
    '/profile',
    '/statistics',
    '/search',
    '/settings'
  ],
  
  // 認証済みユーザーがアクセスできないルート
  AUTH_ONLY: [
    '/auth/login',
    '/auth/sign-up',
    '/demo-login'
  ],
  
  // 管理者のみアクセス可能なルート
  ADMIN_ONLY: [
    '/admin'
  ],
  
  // 公開ルート
  PUBLIC: [
    '/',
    '/landing',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
    '/auth'
  ]
} as const;

// ナビゲーション用のルート情報
export interface RouteInfo {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

// メインナビゲーション
export const MAIN_NAVIGATION: RouteInfo[] = [
  {
    path: DASHBOARD_ROUTES.HOME,
    title: 'ホーム',
    description: 'ダッシュボードのメインページ',
    icon: 'home',
    requiresAuth: true
  },
  {
    path: LEARNING_ROUTES.BASE,
    title: '学習',
    description: '英単語学習を開始',
    icon: 'book',
    requiresAuth: true
  },
  {
    path: LEARNING_ROUTES.REVIEW,
    title: '復習',
    description: '間違えた単語を復習',
    icon: 'refresh',
    requiresAuth: true
  },
  {
    path: DASHBOARD_ROUTES.SEARCH,
    title: '検索',
    description: '単語を検索',
    icon: 'search',
    requiresAuth: true
  },
  {
    path: DASHBOARD_ROUTES.STATISTICS,
    title: '統計',
    description: '学習進捗を確認',
    icon: 'chart',
    requiresAuth: true
  },
  {
    path: DASHBOARD_ROUTES.PROFILE,
    title: 'プロフィール',
    description: 'プロフィール設定',
    icon: 'user',
    requiresAuth: true
  }
];

// フッターナビゲーション
export const FOOTER_NAVIGATION: RouteInfo[] = [
  {
    path: DASHBOARD_ROUTES.HELP,
    title: 'ヘルプ',
    icon: 'help',
    requiresAuth: true
  },
  {
    path: PUBLIC_ROUTES.CONTACT,
    title: 'お問い合わせ',
    icon: 'mail'
  },
  {
    path: DASHBOARD_ROUTES.SETTINGS,
    title: '設定',
    icon: 'settings',
    requiresAuth: true
  }
];

// パンくずリスト用のルート階層
export const BREADCRUMB_ROUTES: Record<string, RouteInfo[]> = {
  '/dashboard': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' }
  ],
  '/learning': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
    { path: LEARNING_ROUTES.BASE, title: '学習' }
  ],
  '/profile': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
    { path: DASHBOARD_ROUTES.PROFILE, title: 'プロフィール' }
  ],
  '/statistics': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
    { path: DASHBOARD_ROUTES.STATISTICS, title: '統計' }
  ],
  '/search': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
    { path: DASHBOARD_ROUTES.SEARCH, title: '検索' }
  ],
  '/review': [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
    { path: LEARNING_ROUTES.REVIEW, title: '復習' }
  ]
};

// ルートヘルパー関数
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.PROTECTED.some(pattern => 
    pathname.startsWith(pattern)
  );
}

export function isAuthOnlyRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.AUTH_ONLY.some(pattern => 
    pathname.startsWith(pattern)
  );
}

export function isAdminRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.ADMIN_ONLY.some(pattern => 
    pathname.startsWith(pattern)
  );
}

export function isPublicRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.PUBLIC.some(pattern => 
    pathname === pattern || pathname.startsWith(pattern + '/')
  );
}

// ルート情報を取得
export function getRouteInfo(pathname: string): RouteInfo | undefined {
  return MAIN_NAVIGATION.find(route => route.path === pathname);
}

// パンくずリストを生成
export function generateBreadcrumbs(pathname: string): RouteInfo[] {
  // 動的ルートの処理
  if (pathname.startsWith('/learning/')) {
    const segments = pathname.split('/');
    const breadcrumbs: RouteInfo[] = [
      { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' },
      { path: LEARNING_ROUTES.BASE, title: '学習' }
    ];

    if (segments[2]) {
      const categoryId = segments[2];
      // カテゴリーIDから日本語名を取得（後で実装）
      const categoryName = await getCategoryNameById(categoryId) || categoryId;
      breadcrumbs.push({
        path: LEARNING_ROUTES.CATEGORY(categoryId),
        title: categoryName
      });

      if (segments[3]) {
        const mode = segments[3];
        const modeTitle = mode === 'flashcard' ? 'フラッシュカード' :
                         mode === 'quiz' ? 'クイズ' :
                         mode === 'browse' ? '単語一覧' : mode;
        breadcrumbs.push({
          path: pathname,
          title: modeTitle
        });
      }
    }

    return breadcrumbs;
  }

  // 静的ルートの処理
  return BREADCRUMB_ROUTES[pathname] || [
    { path: DASHBOARD_ROUTES.HOME, title: 'ホーム' }
  ];
}

// 全ルートの型定義
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type DashboardRoute = typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES];
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES];
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];

// 全ルートの統合型
export type AppRoute = PublicRoute | AuthRoute | DashboardRoute | AdminRoute;