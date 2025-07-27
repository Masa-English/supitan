import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Brain, Target } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-amber-200 dark:border-amber-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
            読み込み中...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            学習データを準備しています。しばらくお待ちください。
          </p>
          
          {/* プログレスバー */}
          <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          
          {/* ガイダンス */}
          <div className="space-y-2 text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>フラッシュカードで効率的に学習</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-3 w-3" />
              <span>クイズで理解度を確認</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Target className="h-3 w-3" />
              <span>間隔反復で確実に定着</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 