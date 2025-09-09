'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PreloadResourcesProps {
  routes?: string[];
}

export function PreloadResources({ routes = [] }: PreloadResourcesProps) {
  const router = useRouter();

  useEffect(() => {
    // 重要なルートをプリフェッチ
    const defaultRoutes = [
      '/dashboard',
      '/learning/categories',
      '/learning',
      '/review',
      '/search',
    ];

    const allRoutes = [...defaultRoutes, ...routes];

    // プリフェッチを実行
    allRoutes.forEach((route) => {
      router.prefetch(route);
    });

    // 重要なリソースをプリロード
    const preloadLinks = [
      { rel: 'preload', href: '/api/static-data', as: 'fetch', crossOrigin: 'anonymous' },
    ];

    preloadLinks.forEach(({ rel, href, as, crossOrigin }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.as = as;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    });

    // DNS プリフェッチ
    const dnsPreconnects = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ].filter(Boolean);

    dnsPreconnects.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url!;
      document.head.appendChild(link);
    });

  }, [router, routes]);

  return null;
}