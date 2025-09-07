/**
 * サイト全体の設定
 */
export const siteConfig = {
  name: 'Masa Flash',
  description: '効率的な英単語学習アプリケーション',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // メタデータ設定
  metadata: {
    title: {
      default: 'Masa Flash - 英単語学習アプリ',
      template: '%s | Masa Flash'
    },
    description: '効率的な英単語学習アプリケーション。フラッシュカード、クイズ、復習機能で英語力を向上させましょう。',
    keywords: [
      '英語学習',
      '英単語',
      'フラッシュカード',
      'クイズ',
      '語学学習',
      'English',
      'vocabulary'
    ],
    authors: [
      {
        name: 'Masa Flash Team',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }
    ],
    creator: 'Masa Flash Team',
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      title: 'Masa Flash - 英単語学習アプリ',
      description: '効率的な英単語学習アプリケーション。フラッシュカード、クイズ、復習機能で英語力を向上させましょう。',
      siteName: 'Masa Flash'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Masa Flash - 英単語学習アプリ',
      description: '効率的な英単語学習アプリケーション。フラッシュカード、クイズ、復習機能で英語力を向上させましょう。',
      creator: '@masaflash'
    },
    robots: {
      index: process.env.NODE_ENV === 'production',
      follow: process.env.NODE_ENV === 'production',
      googleBot: {
        index: process.env.NODE_ENV === 'production',
        follow: process.env.NODE_ENV === 'production',
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  },

  // 連絡先情報
  contact: {
    email: 'contact@masaflash.com',
    supportEmail: 'support@masaflash.com'
  },

  // ソーシャルリンク
  links: {
    github: 'https://github.com/masaflash',
    twitter: 'https://twitter.com/masaflash',
    docs: '/docs'
  },

  // 機能フラグ
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableServiceWorker: process.env.NODE_ENV === 'production',
    enableOfflineMode: false,
    enablePushNotifications: false,
    enableDarkMode: true,
    enableMultiLanguage: false
  },

  // パフォーマンス設定
  performance: {
    enableImageOptimization: true,
    enableFontOptimization: true,
    enableBundleAnalyzer: process.env.ANALYZE === 'true',
    maxBundleSize: 500000, // 500KB
    maxAssetSize: 500000   // 500KB
  },

  // セキュリティ設定
  security: {
    enableCSP: true,
    enableHSTS: process.env.NODE_ENV === 'production',
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true
  }
} as const;

export type SiteConfig = typeof siteConfig;