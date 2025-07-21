'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
          <div className="flex gap-2 justify-center">
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
        </CardContent>
      </Card>
    </div>
  );
} 