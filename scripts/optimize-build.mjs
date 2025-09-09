#!/usr/bin/env node

/**
 * ビルド最適化スクリプト
 * SSG/ISRの事前生成とパフォーマンス最適化を実行
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log('🚀 ビルド最適化を開始します...');

// 1. 静的データの事前生成
console.log('📊 静的データを事前生成中...');
try {
  // 静的データAPIを呼び出して事前生成
  const response = await fetch(`${SITE_URL}/api/static-data`);
  if (response.ok) {
    const data = await response.json();
    console.log(`✅ 静的データを生成しました (${data.categories?.length || 0} カテゴリー)`);
  }
} catch (error) {
  console.warn('⚠️ 静的データの事前生成に失敗:', error.message);
}

// 2. 重要なルートのプリフェッチ設定
console.log('🔗 重要なルートのプリフェッチ設定を生成中...');
const criticalRoutes = [
  '/',
  '/dashboard',
  '/learning/categories',
  '/login',
];

const preloadConfig = {
  routes: criticalRoutes,
  timestamp: new Date().toISOString(),
};

writeFileSync(
  join(process.cwd(), 'public', 'preload-config.json'),
  JSON.stringify(preloadConfig, null, 2)
);
console.log('✅ プリフェッチ設定を生成しました');

// 3. Service Worker の生成（PWA対応）
console.log('⚙️ Service Worker を生成中...');
const swContent = `
// Service Worker for スピ単
const CACHE_NAME = 'spitan-v1-${Date.now()}';
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/learning/categories',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});
`;

writeFileSync(join(process.cwd(), 'public', 'sw.js'), swContent);
console.log('✅ Service Worker を生成しました');

// 4. マニフェストファイルの最適化
console.log('📱 PWA マニフェストを最適化中...');
const manifest = {
  name: 'スピ単 - 効率的な英語学習アプリ',
  short_name: 'スピ単',
  description: 'フラッシュカード、クイズ、復習システムで効率的に英語を学習',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#d97706',
  icons: [
    {
      src: '/favicon.ico',
      sizes: '48x48',
      type: 'image/x-icon'
    }
  ],
  categories: ['education', 'productivity'],
  lang: 'ja',
  orientation: 'portrait-primary'
};

writeFileSync(
  join(process.cwd(), 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ PWA マニフェストを最適化しました');

// 5. robots.txt の生成
console.log('🤖 robots.txt を生成中...');
const robotsTxt = `User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(process.cwd(), 'public', 'robots.txt'), robotsTxt);
console.log('✅ robots.txt を生成しました');

// 6. パフォーマンス設定の確認
console.log('⚡ パフォーマンス設定を確認中...');
const nextConfigPath = join(process.cwd(), 'next.config.ts');
if (existsSync(nextConfigPath)) {
  const config = readFileSync(nextConfigPath, 'utf-8');
  if (config.includes('experimental')) {
    console.log('✅ 実験的機能が有効化されています');
  }
  if (config.includes('optimizePackageImports')) {
    console.log('✅ パッケージインポート最適化が有効化されています');
  }
}

console.log('🎉 ビルド最適化が完了しました！');
console.log('');
console.log('最適化された機能:');
console.log('- 静的データの事前生成');
console.log('- 重要なルートのプリフェッチ');
console.log('- Service Worker (PWA対応)');
console.log('- PWA マニフェスト');
console.log('- SEO最適化 (robots.txt)');
console.log('');