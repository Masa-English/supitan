import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock,
  BarChart3,
  Construction,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

// 統計カードコンポーネント
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  disabled = false
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color?: string;
  disabled?: boolean;
}) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  };

  return (
    <Card className={`bg-card border-border hover:shadow-lg transition-all duration-300 ${disabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 開発中バナー */}
        <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                開発中のお知らせ
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                統計機能は現在開発中です。表示されているデータはサンプルデータです。
              </p>
            </div>
          </div>
        </div>

        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            学習統計
          </h1>
          <p className="text-muted-foreground">
            あなたの学習進捗と成果を確認しましょう
          </p>
        </div>

        <Suspense fallback={
          <div className="space-y-8">
            {/* 統計カードのスケルトン */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }>
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="総単語数"
              value="0"
              subtitle="サンプルデータ"
              icon={BookOpen}
              color="primary"
              disabled={true}
            />
            <StatCard
              title="学習済み"
              value="0"
              subtitle="サンプルデータ"
              icon={Target}
              color="blue"
              disabled={true}
            />
            <StatCard
              title="習得済み"
              value="0"
              subtitle="サンプルデータ"
              icon={Trophy}
              color="green"
              disabled={true}
            />
            <StatCard
              title="学習時間"
              value="0分"
              subtitle="サンプルデータ"
              icon={Clock}
              color="amber"
              disabled={true}
            />
          </div>

          {/* 進捗チャート（開発中） */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                学習進捗
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">進捗チャート</p>
                  <p className="text-sm text-muted-foreground">開発中</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 開発中メッセージ */}
          <div className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  統計機能開発中
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  統計機能は現在開発中です。上記のデータは実際の学習データではなく、サンプルデータです。
                  実際の統計データの表示は、機能完成後に利用可能になります。
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                    開発中
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    サンプルデータ
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </main>
    </div>
  );
} 