import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// カード用スケルトン
export function CardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm border-border rounded-lg p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </div>
  )
}

// 統計カード用スケルトン
export function StatsCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm border-border rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

// カテゴリーカード用スケルトン
export function CategoryCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// 単語カード用スケルトン
export function WordCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm border-border rounded-lg p-6">
      <div className="text-center space-y-3">
        <Skeleton className="h-6 w-20 mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}

// 学習モードカード用スケルトン
export function LearningModeCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 hover:shadow-xl transition-all duration-300 h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-6 w-24 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  )
}

// 進捗バー用スケルトン
export function ProgressBarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  )
}

// セッション履歴用スケルトン
export function SessionHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ページ全体用スケルトン
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダースケルトン */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* 統計カードスケルトン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* コンテンツスケルトン */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton }