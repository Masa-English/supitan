import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu'],
  },
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // 静的アセットの長期キャッシュ
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // APIルートの短期キャッシュ
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // 静的生成の最適化
  trailingSlash: false,
  
  // 出力設定 - ISR対応
  // output: 'export', // APIルートがある場合は静的エクスポートは使用しない

  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // TypeScript設定の強化
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint設定の強化
  eslint: {
    ignoreDuringBuilds: false,
  },

  // バンドル分析とwebpack最適化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // キャッシュ最適化でwebpack警告を解消
    if (config.cache && typeof config.cache === 'object') {
      config.cache.maxMemoryGenerations = 1;
    }
    
    // パフォーマンス警告の閾値を調整
    config.performance = {
      ...config.performance,
      maxAssetSize: 250000,
      maxEntrypointSize: 250000,
    };
    
    return config;
  },

  // 環境変数の検証
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ISRの設定
  async rewrites() {
    return [
      // ISR用のリライト設定
      {
        source: '/static-data/:path*',
        destination: '/api/static-data/:path*',
      },
    ];
  },
};

export default nextConfig;
