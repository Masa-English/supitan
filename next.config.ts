import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 実験的機能の最適化
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label'
    ],
  },
  
  // Turbopack設定（stable版）
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24時間
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
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
      // 静的ページのキャッシュ
      {
        source: '/(protected|landing)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=7200',
          },
        ],
      },
    ];
  },

  // 静的生成の最適化
  trailingSlash: false,
  
  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
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
    
    // キャッシュ最適化
    if (config.cache && typeof config.cache === 'object') {
      config.cache.maxMemoryGenerations = 1;
      // 大きな文字列のシリアライゼーション警告を抑制
      config.cache.allowCollectingMemory = false;
    }
    
    // パフォーマンス警告の閾値を調整（バンドルサイズ警告を抑制）
    config.performance = {
      ...config.performance,
      maxAssetSize: 500000, // 500KB
      maxEntrypointSize: 500000, // 500KB
      hints: false, // パフォーマンス警告を無効化
    };
    
    return config;
  },

  // 環境変数の検証
  env: {
    // セキュリティのため、機密性の高い環境変数は含めない
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

  // 出力設定の最適化
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined, // 本番環境での最適化
};

export default nextConfig;
