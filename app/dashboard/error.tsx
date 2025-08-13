'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // エラーをログに記録
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            ダッシュボードの読み込み中にエラーが発生しました。
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                エラー詳細（開発環境のみ）
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              ダッシュボード
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
