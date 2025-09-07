/**
 * 認証関連の設定
 */
export const authConfig = {
  // 認証プロバイダー設定
  providers: {
    email: {
      enabled: true,
      requireEmailVerification: true,
      allowSignUp: true,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      }
    },
    
    // 将来的なソーシャル認証用
    google: {
      enabled: false,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    
    github: {
      enabled: false,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  },

  // セッション設定
  session: {
    strategy: 'jwt', // 'jwt' | 'database'
    maxAge: 30 * 24 * 60 * 60, // 30日（秒）
    updateAge: 24 * 60 * 60, // 24時間（秒）
    generateSessionToken: true,
    enableRefreshToken: true,
    refreshTokenExpiry: 7 * 24 * 60 * 60 // 7日（秒）
  },

  // JWT設定
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    algorithm: 'HS256',
    issuer: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    audience: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    expiresIn: '30d',
    refreshExpiresIn: '7d'
  },

  // ページ設定
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/sign-up',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/dashboard', // 新規ユーザーのリダイレクト先
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/profile'
  },

  // リダイレクト設定
  redirects: {
    // ログイン後のリダイレクト先
    afterSignIn: '/dashboard',
    
    // ログアウト後のリダイレクト先
    afterSignOut: '/',
    
    // エラー時のリダイレクト先
    onError: '/auth/error',
    
    // 未認証時のリダイレクト先
    onUnauthorized: '/auth/login',
    
    // 権限不足時のリダイレクト先
    onForbidden: '/dashboard',
    
    // アカウント確認後のリダイレクト先
    afterVerification: '/dashboard'
  },

  // セキュリティ設定
  security: {
    // CSRF保護
    enableCSRF: true,
    
    // レート制限
    rateLimit: {
      enabled: true,
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15分
      blockDuration: 15 * 60 * 1000 // 15分
    },
    
    // パスワードポリシー
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      preventCommonPasswords: true,
      preventUserInfoInPassword: true
    },
    
    // アカウントロック
    accountLock: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDuration: 30 * 60 * 1000, // 30分
      enableProgressiveLock: true
    },
    
    // セッションセキュリティ
    sessionSecurity: {
      enableSecureCookies: process.env.NODE_ENV === 'production',
      enableSameSite: true,
      sameSitePolicy: 'lax', // 'strict' | 'lax' | 'none'
      enableHttpOnly: true,
      enableSessionRotation: true
    }
  },

  // メール設定
  email: {
    // 送信者情報
    from: {
      name: 'Masa Flash',
      email: process.env.EMAIL_FROM || 'noreply@masaflash.com'
    },
    
    // メールテンプレート
    templates: {
      verifyEmail: {
        subject: 'メールアドレスの確認',
        template: 'verify-email'
      },
      resetPassword: {
        subject: 'パスワードリセット',
        template: 'reset-password'
      },
      welcomeEmail: {
        subject: 'Masa Flashへようこそ',
        template: 'welcome'
      },
      passwordChanged: {
        subject: 'パスワードが変更されました',
        template: 'password-changed'
      }
    },
    
    // メール送信設定
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // ユーザープロフィール設定
  profile: {
    // 必須フィールド
    requiredFields: ['email'],
    
    // オプションフィールド
    optionalFields: ['name', 'avatar', 'bio', 'location', 'website'],
    
    // プロフィール画像
    avatar: {
      enableUpload: true,
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      enableGravatar: true,
      defaultAvatar: 'identicon' // 'identicon' | 'monsterid' | 'wavatar'
    },
    
    // プライバシー設定
    privacy: {
      enablePublicProfile: false,
      enableProfileSearch: false,
      defaultVisibility: 'private' // 'public' | 'private' | 'friends'
    }
  },

  // 開発・デバッグ設定
  development: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableTestAccounts: process.env.NODE_ENV === 'development',
    enableMockAuth: process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_AUTH === 'true',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    
    // テストアカウント
    testAccounts: [
      {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
        role: 'user'
      },
      {
        email: 'admin@example.com',
        password: 'AdminPassword123',
        name: 'Admin User',
        role: 'admin'
      }
    ]
  },

  // 機能フラグ
  features: {
    enableTwoFactorAuth: false,
    enableSocialLogin: false,
    enablePasswordlessLogin: false,
    enableBiometricAuth: false,
    enableDeviceTracking: false,
    enableLoginHistory: true,
    enableAccountDeletion: true,
    enableDataExport: true
  }
} as const;

export type AuthConfig = typeof authConfig;