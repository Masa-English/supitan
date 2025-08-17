'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    console.error('アプリケーションエラー:', error);
  }, [error]);

  const clearCache = async () => {
    setIsClearing(true);
    try {
      // Service Workerのキャッシュをクリア
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // ブラウザのキャッシュをクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // localStorageとsessionStorageをクリア
      localStorage.clear();
      sessionStorage.clear();

      // ページを再読み込み
      window.location.reload();
    } catch (error) {
      console.error('キャッシュクリアエラー:', error);
      // エラーが発生してもページを再読み込み
      window.location.reload();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-red-200 dark:border-red-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl text-red-800 dark:text-red-200">
            エラーが発生しました
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            申し訳ございませんが、予期しないエラーが発生しました。
          </p>
          <p className="text-xs text-red-500 dark:text-red-300">
            エラーが解決しない場合は、キャッシュをクリアしてください。
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              エラーID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // 既にルートページにいる場合は遷移しない
                if (window.location.pathname !== '/') {
                  startNavigating();
                  router.push('/');
                }
              }}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              ホームに戻る
            </Button>
          </div>
          <div className="flex justify-center pt-2 border-t border-red-200 dark:border-red-700">
            <Button
              variant="outline"
              onClick={clearCache}
              disabled={isClearing}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
              {isClearing ? 'キャッシュクリア中...' : 'キャッシュクリア'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 