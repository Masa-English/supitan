'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);

  useEffect(() => {
    console.error('アプリケーションエラー:', error);
  }, [error]);

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
          {error.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              エラーID: {error.digest}
            </p>
          )}
          <div className="flex gap-2 justify-center">
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
        </CardContent>
      </Card>
    </div>
  );
} 