'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { CategoryCardSkeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StaticData } from '@/lib/static-data';
import { 
  getAllCategories, 
  encodeCategoryName
} from '@/lib/categories';



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

    loadData();
  }, [router]);

  const handleCategorySelect = (categoryName: string) => {
    console.log('カテゴリー選択:', categoryName, '選択されたモード:', selectedMode);
    
    if (!selectedMode) {
      alert('学習モードが選択されていません');
      return;
    }
    
    // 選択されたモードに基づいて適切なページに遷移
    const encodedCategory = encodeCategoryName(categoryName);
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
        <div className="min-h-screen bg-background">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <CategoriesSkeleton />
            </div>
          </main>
        </div>
      </AuthWrapper>
    );
  }

  if (!staticData) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  データの読み込みに失敗しました
                </h3>
                <p className="text-muted-foreground mb-4">
                  ページを再読み込みしてください
                </p>
                <button
                  onClick={() => {
                    setLoading(true);
                    loadData();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md"
                >
                  再読み込み
                </button>
              </div>
            </div>
          </main>
        </div>
      </AuthWrapper>
    );
  }

  // 新しいカテゴリー設定を使用
  const allCategories = getAllCategories();

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* ヘッダー */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={handleBackToModeSelection}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                学習モード選択に戻る
              </button>
              
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
                {allCategories.map((categoryConfig) => {
                  const staticCategory = staticData.categories.find(cat => cat.name === categoryConfig.name);
                  
                  return (
                    <Card 
                      key={categoryConfig.id}
                      className="group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-primary/20 touch-friendly"
                      onClick={() => handleCategorySelect(categoryConfig.name)}
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {categoryConfig.name}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {categoryConfig.englishName}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                            {categoryConfig.pos}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                          {categoryConfig.description}
                        </p>
                        
                        {/* 単語数表示（実際のデータがある場合） */}
                        {staticCategory && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>単語数</span>
                            <span>{staticCategory.count}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
} 