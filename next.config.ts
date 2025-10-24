import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 基本設定
  trailingSlash: false,

  // ワークスペースルートの明示的な設定
  outputFileTracingRoot: __dirname,
  
  // 静的生成の設定
  output: "standalone",

  // ログとビルド警告の抑制
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // TypeScript設定（ビルド時の型チェックを無効化）
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint設定（ビルド時のESLintエラーを無視）
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ビルド時の詳細ログを抑制
  productionBrowserSourceMaps: false,

  // 外部パッケージ設定（Next.js 15.5.2の新しい設定）
  serverExternalPackages: ["@supabase/supabase-js"],

  // SSG/ISR最適化
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slot"],
    staleTimes: {
      dynamic: 30, // 30秒
      static: 180, // 3分
    },
  },

  // 画像最適化
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24時間
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // パフォーマンス最適化
  poweredByHeader: false,
  compress: true,

  // Webpack設定でビルド警告を抑制
  webpack: (config) => {
    // ビルド時の警告を抑制
    config.infrastructureLogging = {
      level: 'error',
    };

    // モジュール解決の警告を抑制
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // 不要な警告を抑制（Supabase Edge Runtime警告を含む）
    config.ignoreWarnings = [
      /Module not found/,
      /Critical dependency/,
      /Can't resolve/,
      /Failed to parse source map/,
      // Supabase Edge Runtime警告を抑制
      /A Node\.js API is used \(process\.version at line: \d+\) which is not supported in the Edge Runtime/,
      /Import trace for requested module/,
      // Supabase関連の特定の警告を抑制
      /@supabase\/supabase-js.*process\.version/,
      /@supabase\/ssr.*process\.version/,
    ];

    return config;
  },

  // リダイレクト設定（古いURL構造から新しい構造へ）
  async redirects() {
    return [
      // 古いdashboard URLから正しいApp Router URLへのリダイレクト
      {
        source: "/dashboard/learning",
        destination: "/learning",
        permanent: true,
      },
      {
        source: "/dashboard/learning/:path*",
        destination: "/learning/:path*",
        permanent: true,
      },
      // 古いstart-learningパスから新しいlearningパスへのリダイレクト
      {
        source: "/dashboard/start-learning",
        destination: "/learning",
        permanent: true,
      },
      {
        source: "/dashboard/start-learning/:path*",
        destination: "/learning/:path*",
        permanent: true,
      },
      // 古いcategoryパスから新しいcategoriesパスへのリダイレクト
      {
        source: "/dashboard/category",
        destination: "/learning/categories",
        permanent: true,
      },
      {
        source: "/learning/category",
        destination: "/learning/categories",
        permanent: true,
      },
      // 古いquiz/flashcardパラメータ形式から新しい構造へのリダイレクト
      {
        source: "/learning/:category/quiz",
        destination: "/learning/:category/options?mode=quiz",
        permanent: true,
      },
      {
        source: "/learning/:category/flashcard",
        destination: "/learning/:category/options?mode=flashcard",
        permanent: true,
      },
      // セクション指定がある場合のリダイレクト
      {
        source: "/learning/:category/quiz/:section",
        destination: "/learning/:category/quiz/section/:section",
        permanent: true,
      },
      {
        source: "/learning/:category/flashcard/:section",
        destination: "/learning/:category/flashcard/section/:section",
        permanent: true,
      },
      // 古いパラメータ形式のリダイレクト（クエリパラメータ付き）
      {
        source: "/learning/:category",
        has: [
          {
            type: "query",
            key: "mode",
            value: "quiz",
          },
        ],
        destination: "/learning/:category/options?mode=quiz",
        permanent: false,
      },
      {
        source: "/learning/:category",
        has: [
          {
            type: "query",
            key: "mode",
            value: "flashcard",
          },
        ],
        destination: "/learning/:category/options?mode=flashcard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
