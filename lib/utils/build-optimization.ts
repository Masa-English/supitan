/**
 * ビルド時の最適化ユーティリティ
 */

// 静的データの事前生成
export async function generateStaticData() {
  // 開発環境でのみ実行
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // カテゴリーデータの事前生成
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/static-data`);
    if (response.ok) {
      const data = await response.json();
      console.log('Static data pre-generated:', data);
    }
  } catch (error) {
    console.warn('Failed to pre-generate static data:', error);
  }
}

// 重要なルートのプリフェッチ
export const CRITICAL_ROUTES = [
  '/',
  '/dashboard',
  '/learning/categories',
  '/login',
] as const;

// 静的アセットの最適化
export const STATIC_ASSETS_CONFIG = {
  images: {
    formats: ['image/webp', 'image/avif'],
    quality: 85,
    sizes: [640, 750, 828, 1080, 1200, 1920],
  },
  fonts: {
    preload: ['Geist-Regular.woff2', 'Geist-Medium.woff2', 'Geist-Bold.woff2'],
  },
} as const;

// キャッシュ戦略
export const CACHE_STRATEGIES = {
  static: 'public, max-age=31536000, immutable',
  api: 'public, max-age=3600, stale-while-revalidate=7200',
  page: 'public, max-age=1800, stale-while-revalidate=3600',
} as const;