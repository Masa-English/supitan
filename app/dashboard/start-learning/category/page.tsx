'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { CategoryCardSkeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, BookOpen, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StaticData } from '@/lib/static-data';

// 学習モードの定義（前のページと同じ）
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

// カテゴリーセクションのスケルトン
function CategoriesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="h-6 sm:h-8 w-32 sm:w-48 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-3 sm:h-4 w-48 sm:w-64 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function CategorySelectionPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [staticData, setStaticData] = useState<StaticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッションストレージから学習モードを取得
    const savedMode = sessionStorage.getItem('selectedLearningMode');
    if (!savedMode) {
      // 学習モードが選択されていない場合は学習モード選択ページにリダイレクト
      router.push('/dashboard/start-learning');
      return;
    }
    
    setSelectedMode(savedMode);
    console.log('復元された学習モード:', savedMode);

    // カテゴリーデータを読み込み
    const loadData = async () => {
      try {
        const { getStaticData } = await import('@/lib/static-data');
        const data = await getStaticData();
        setStaticData(data);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleCategorySelect = (categoryName: string) => {
    console.log('カテゴリー選択:', categoryName, '選択されたモード:', selectedMode);
    
    if (!selectedMode) {
      alert('学習モードが選択されていません');
      return;
    }
    
    // 選択されたモードに基づいて適切なページに遷移
    const encodedCategory = encodeURIComponent(categoryName);
    const targetUrl = `/dashboard/category/${encodedCategory}/${selectedMode}`;
    console.log('遷移先URL:', targetUrl);
    router.push(targetUrl);
  };

  const handleBackToModeSelection = () => {
    router.push('/dashboard/start-learning');
  };

  if (loading) {
    return (
      <AuthWrapper>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <CategoriesSkeleton />
        </main>
      </AuthWrapper>
    );
  }

  if (!staticData) {
    return (
      <AuthWrapper>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center p-6 sm:p-8">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">データの読み込みに失敗しました</p>
          </div>
        </main>
      </AuthWrapper>
    );
  }

  const selectedModeData = learningModes.find(m => m.id === selectedMode);
  const IconComponent = selectedModeData?.icon || BookOpen;

  return (
    <AuthWrapper>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* 固定ナビゲーション */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border mb-4 sm:mb-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <button
              onClick={handleBackToModeSelection}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">学習モード選択に戻る</span>
              <span className="sm:hidden">戻る</span>
            </button>
            
            {selectedModeData && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/15 rounded-lg">
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">選択された学習モード</p>
                  <p className="text-sm font-semibold text-foreground">{selectedModeData.name}</p>
                </div>
                <div className="sm:hidden">
                  <p className="text-xs font-semibold text-foreground">{selectedModeData.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ページタイトル - 高さ削減 */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-4">
            カテゴリーを選択
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            学習したい単語の種類を選んでください
          </p>
        </div>
        
        {/* カテゴリー選択 - グリッド最適化 */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {staticData.categories.map((category) => (
              <Card 
                key={category.name}
                className="group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-primary/20 touch-friendly"
                onClick={() => handleCategorySelect(category.name)}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
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
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {category.count}個の単語
                    </p>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/30 rounded-full group-hover:bg-primary transition-colors"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
} 