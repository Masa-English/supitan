'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ランディング到達時点で主要遷移先を積極プリフェッチ
 * - /auth/login は必ず次操作候補
 * - ログイン済みの可能性がある環境では /dashboard も温める
 * - マウスオーバーの瞬間を待たず、初回マウントで実行
 */
export default function PrefetchClient(): null {
  const router = useRouter();

  useEffect(() => {
    // クリック候補の主要ページ
    router.prefetch('/auth/login');
    router.prefetch('/contact');
    // Cookie 判定ができないクライアント初期段階でも、/dashboard を温めるコストは小
    router.prefetch('/dashboard');
  }, [router]);

  return null;
}


