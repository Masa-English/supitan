/**
 * ダッシュボード関連の設定
 */
export const dashboardConfig = {
  // ナビゲーション設定
  navigation: {
    main: [
      {
        title: 'ホーム',
        href: '/dashboard',
        icon: 'home',
        description: 'ダッシュボードのメインページ'
      },
      {
        title: '学習',
        href: '/learning',
        icon: 'book',
        description: '英単語学習を開始',
        children: [
          {
            title: 'フラッシュカード',
            href: '/learning/flashcard',
            icon: 'card',
            description: 'フラッシュカードで学習'
          },
          {
            title: 'クイズ',
            href: '/learning/quiz',
            icon: 'quiz',
            description: 'クイズで理解度チェック'
          },
          {
            title: '単語一覧',
            href: '/learning/browse',
            icon: 'list',
            description: '単語を一覧で確認'
          }
        ]
      },
      {
        title: '復習',
        href: '/review',
        icon: 'refresh',
        description: '間違えた単語を復習'
      },
      {
        title: '検索',
        href: '/search',
        icon: 'search',
        description: '単語を検索'
      },
      {
        title: '統計',
        href: '/statistics',
        icon: 'chart',
        description: '学習進捗を確認'
      },
      {
        title: 'プロフィール',
        href: '/profile',
        icon: 'user',
        description: 'プロフィール設定'
      }
    ],
    
    // フッターナビゲーション
    footer: [
      {
        title: 'ヘルプ',
        href: '/help',
        icon: 'help'
      },
      {
        title: 'お問い合わせ',
        href: '/contact',
        icon: 'mail'
      },
      {
        title: '設定',
        href: '/settings',
        icon: 'settings'
      }
    ]
  },

  // レイアウト設定
  layout: {
    sidebar: {
      width: 280,
      collapsedWidth: 80,
      defaultCollapsed: false,
      enableCollapse: true,
      enableResize: false
    },
    header: {
      height: 64,
      showBreadcrumb: true,
      showUserMenu: true,
      showNotifications: true,
      showSearch: true
    },
    content: {
      maxWidth: 1200,
      padding: 24,
      enableScrollToTop: true
    }
  },

  // 学習設定
  learning: {
    // フラッシュカード設定
    flashcard: {
      defaultSessionSize: 20,
      maxSessionSize: 50,
      minSessionSize: 5,
      autoPlayAudio: true,
      showHints: true,
      enableKeyboardShortcuts: true,
      keyboardShortcuts: {
        next: 'ArrowRight',
        previous: 'ArrowLeft',
        flip: 'Space',
        audio: 'A',
        hint: 'H'
      }
    },
    
    // クイズ設定
    quiz: {
      defaultQuestionCount: 10,
      maxQuestionCount: 30,
      minQuestionCount: 5,
      timeLimit: 30, // 秒
      enableTimeLimit: false,
      showCorrectAnswer: true,
      enableRetry: true,
      passingScore: 70 // パーセント
    },
    
    // 復習設定
    review: {
      maxReviewItems: 100,
      enableSpacedRepetition: true,
      reviewIntervals: [1, 3, 7, 14, 30], // 日数
      prioritizeRecentMistakes: true
    }
  },

  // UI設定
  ui: {
    // テーマ設定
    theme: {
      defaultTheme: 'light',
      enableSystemTheme: true,
      enableThemeToggle: true
    },
    
    // アニメーション設定
    animations: {
      enableTransitions: true,
      enableHoverEffects: true,
      transitionDuration: 200, // ミリ秒
      enableReducedMotion: true // ユーザー設定に従う
    },
    
    // フィードバック設定
    feedback: {
      enableToasts: true,
      toastDuration: 3000, // ミリ秒
      enableSounds: false,
      enableVibration: false,
      enableConfetti: true
    }
  },

  // データ設定
  data: {
    // キャッシュ設定
    cache: {
      enableClientCache: true,
      cacheExpiry: 300000, // 5分（ミリ秒）
      maxCacheSize: 100 // アイテム数
    },
    
    // 同期設定
    sync: {
      enableAutoSync: true,
      syncInterval: 60000, // 1分（ミリ秒）
      enableOfflineMode: false,
      maxRetries: 3
    },
    
    // プリロード設定
    preload: {
      enableCategoryPreload: true,
      enableAudioPreload: false,
      preloadLimit: 50 // アイテム数
    }
  },

  // アクセシビリティ設定
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    enableHighContrast: false,
    enableLargeText: false,
    focusIndicatorStyle: 'ring' // 'ring' | 'outline' | 'shadow'
  },

  // 分析設定
  analytics: {
    enableUserAnalytics: process.env.NODE_ENV === 'production',
    enablePerformanceTracking: process.env.NODE_ENV === 'production',
    enableErrorTracking: true,
    trackingEvents: {
      pageView: true,
      buttonClick: true,
      formSubmit: true,
      learningSession: true,
      quizCompletion: true
    }
  }
} as const;

export type DashboardConfig = typeof dashboardConfig;