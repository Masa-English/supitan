import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Layers, BookOpen, Brain } from 'lucide-react';

// オプションページ用のスケルトン
export default function OptionsPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー部分のスケルトン */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center text-muted-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-32 mb-4" />
          </div>

          {/* バッジ部分のスケルトン */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            <div className="flex items-center gap-1 px-2 py-1 rounded border">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-1 px-2 py-1 rounded border">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Step 1: セクション選択カードのスケルトン */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                {/* セクションボタン群のスケルトン */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
                <Skeleton className="h-3 w-48" />
              </CardContent>
            </Card>

            {/* Step 2: ランダム学習カードのスケルトン */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-64 mb-2" />
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div>
                      <Skeleton className="h-4 w-8 mb-2" />
                      <Skeleton className="h-10 w-full sm:w-40" />
                    </div>
                    <Skeleton className="h-10 w-full sm:w-20" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
