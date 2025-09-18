'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';

/**
 * ルーター遷移やフォーム送信などの開始/完了をフックして、
 * グローバルなナビゲーションオーバーレイを制御するクライアント専用コンポーネント。
 */
export function NavigationEvents() {
  const pathname = usePathname();
  const router = useRouter();
  const start = useNavigationStore((s) => s.start);
  const stop = useNavigationStore((s) => s.stop);

  useEffect(() => {
    // ルートが変わったということは、遷移が完了したとみなせる
    console.log('🛤️  [NavigationEvents] パス変更検出', {
      newPathname: pathname,
      timestamp: new Date().toISOString()
    });
    stop();
    console.log('⏹️  [NavigationEvents] ナビゲーション停止');
  }, [pathname, stop]);

  useEffect(() => {
    // push/replace をラップしてオーバーレイを表示
    const originalPush: typeof router.push = router.push.bind(router);
    const originalReplace: typeof router.replace = router.replace.bind(router);

    (router as unknown as { push: typeof router.push }).push = (...args: Parameters<typeof router.push>) => {
      console.log('🚀 [NavigationEvents] router.push() 呼び出し', {
        destination: args[0],
        timestamp: new Date().toISOString()
      });
      start();
      return originalPush(...args);
    };
    (router as unknown as { replace: typeof router.replace }).replace = (
      ...args: Parameters<typeof router.replace>
    ) => {
      console.log('🔄 [NavigationEvents] router.replace() 呼び出し', {
        destination: args[0],
        timestamp: new Date().toISOString()
      });
      start();
      return originalReplace(...args);
    };

    return () => {
      (router as unknown as { push: typeof router.push }).push = originalPush;
      (router as unknown as { replace: typeof router.replace }).replace = originalReplace;
    };
  }, [router, start]);

  useEffect(() => {
    // Link クリックでの遷移開始を検知（フォーム送信は除外: XHRの可能性が高く、オーバーレイが残る恐れがあるため）
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // 左クリックのみ
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // 修飾キーは除外

      let target = event.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (target instanceof HTMLAnchorElement) {
          const href = target.getAttribute('href');
          if (!href) break;
          // 同一オリジンかつアプリ内ルートのみ
          const isInternal = href.startsWith('/') && !href.startsWith('//');
          const isDownload = target.hasAttribute('download');
          const isExternal = target.target === '_blank';
          if (isInternal && !isDownload && !isExternal) {
            start();
          }
          break;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener('click', onDocumentClick);
    return () => {
      document.removeEventListener('click', onDocumentClick);
    };
  }, [start]);

  return null;
}