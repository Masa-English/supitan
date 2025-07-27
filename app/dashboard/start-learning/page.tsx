import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthWrapper } from '@/components/auth';
import { Header } from '@/components/common';
import { CategoryCardSkeleton } from '@/components/ui/skeleton';
import { BookOpen, Brain, ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

// 学習モードの定義
const learningModes = [
  {
    id: 'flashcard',
    name: 'フラッシュカード',
    description: '単語を見て意味を覚える',
    icon: BookOpen,
    color: 'primary',
    recommended: true
  },
  {
    id: 'quiz',
    name: 'クイズ',
    description: '選択肢から正解を選ぶ',
    icon: Brain,
    color: 'secondary'
  }
];

// 非同期でカテゴリーデータを取得するコンポーネント
async function CategoriesSection() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          カテゴリーを選択
        </h2>
        <p className="text-muted-foreground">
          学習したい単語の種類を選んでください
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staticData.categories.map((category) => (
          <Link 
            key={category.name}
            href={`/dashboard/category/${encodeURIComponent(category.name)}`}
          >
            <Card 
              className="group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-primary/20 touch-friendly"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {category.englishName}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                    {category.pos}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {category.count}個の単語
                  </p>
                  <div className="w-2 h-2 bg-primary/30 rounded-full group-hover:bg-primary transition-colors"></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 学習モード選択セクション
function LearningModeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          学習モードを選択
        </h2>
        <p className="text-muted-foreground">
          学習方法を選んでください
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningModes.map((mode) => {
          const IconComponent = mode.icon;
          const colorClass = mode.color === 'primary' ? 'primary' : 'secondary';
          
          return (
            <Card 
              key={mode.id}
              className={`group bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-${colorClass}/20 touch-friendly`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-${colorClass}/15 rounded-xl group-hover:bg-${colorClass}/25 transition-colors`}>
                      <IconComponent className={`h-6 w-6 text-${colorClass}`} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-lg font-semibold text-foreground">
                        {mode.name}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                  {mode.recommended && (
                    <Badge variant="secondary" className={`bg-${colorClass}/20 text-${colorClass} border-${colorClass}/30`}>
                      推奨
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-2 px-3 py-1.5 bg-${colorClass}/10 rounded-full`}>
                      <IconComponent className={`h-3.5 w-3.5 text-${colorClass}`} />
                      {mode.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold text-${colorClass}`}>
                      <Play className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// カテゴリーセクションのスケルトン
function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function StartLearningPage() {
  return (
    <AuthWrapper>
      {/* ヘッダー */}
      <Header 
        title="学習開始"
        showUserInfo={true}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* 戻るボタン */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>

        {/* ページタイトル */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            学習を始めましょう
          </h1>
          <p className="text-lg text-muted-foreground">
            カテゴリーと学習モードを選択して、効率的な学習を開始してください
          </p>
        </div>

        {/* 学習モード選択 */}
        <div className="mb-12">
          <LearningModeSection />
        </div>

        {/* カテゴリー選択 - Suspense対応 */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
      </main>
    </AuthWrapper>
  );
} 