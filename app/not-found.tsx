'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const refreshPage = () => {
    setIsRefreshing(true);
    // ハードリフレッシュ（キャッシュを無視）
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-amber-200 dark:border-amber-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">404</span>
          </div>
          <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
            ページが見つかりません
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
          <p className="text-xs text-amber-500 dark:text-amber-300">
            ページが正しく表示されない場合は、キャッシュをクリアするか再読み込みしてください。
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2 border-t border-amber-200 dark:border-amber-700">
            <Button
              variant="outline"
              onClick={refreshPage}
              disabled={isRefreshing}
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? '再読み込み中...' : '再読み込み'}
            </Button>
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