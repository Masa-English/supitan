import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Search
} from 'lucide-react';

// メインアクションカードのスケルトン
function MainActionCardSkeleton({ 
  icon: Icon 
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-muted-foreground" />
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* メインアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MainActionCardSkeleton icon={Play} />
          <MainActionCardSkeleton icon={RotateCcw} />
          <MainActionCardSkeleton icon={Search} />
        </div>

        {/* 空の状態 */}
        <div className="text-center py-12">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto mb-6" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}
