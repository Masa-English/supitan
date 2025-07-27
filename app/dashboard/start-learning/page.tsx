'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { CategoryCardSkeleton } from '@/components/ui/skeleton';
import { BookOpen, Brain, Play, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StaticData } from '@/lib/static-data';

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



// 学習モード選択セクション
function LearningModeSection({ onModeSelect, selectedMode }: { 
  onModeSelect: (modeId: string) => void;
  selectedMode: string | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          学習モードを選択
        </h2>
        <p className="text-muted-foreground">
          学習方法を選んでください（必須）
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningModes.map((mode) => {
          const IconComponent = mode.icon;
          const colorClass = mode.color === 'primary' ? 'primary' : 'secondary';
          const isSelected = selectedMode === mode.id;
          
          return (
            <Card 
              key={mode.id}
              className={`group bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-border touch-friendly min-h-[120px] ${
                isSelected 
                  ? `border-${colorClass} ring-2 ring-${colorClass}/20` 
                  : `hover:border-${colorClass}/20`
              }`}
              onClick={() => onModeSelect(mode.id)}
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
      
      {selectedMode && (
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">
            選択されたモード: <span className="font-semibold text-primary">
              {learningModes.find(m => m.id === selectedMode)?.name}
            </span>
          </p>
          <p className="text-sm text-primary">
            下のカテゴリーを選択して学習を開始してください
          </p>
        </div>
      )}
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

// カテゴリー選択コンポーネント（学習モードを考慮）
function CategoriesSectionWithMode({ selectedMode }: { selectedMode: string | null }) {
  const router = useRouter();
  const [staticData, setStaticData] = useState<StaticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleCategorySelect = (categoryName: string) => {
    console.log('カテゴリー選択:', categoryName, '選択されたモード:', selectedMode);
    
    if (!selectedMode) {
      // 学習モードが選択されていない場合は警告
      alert('先に学習モードを選択してください');
      return;
    }
    
    // 選択されたモードに基づいて適切なページに遷移
    const encodedCategory = encodeURIComponent(categoryName);
    const targetUrl = `/dashboard/category/${encodedCategory}/${selectedMode}`;
    console.log('遷移先URL:', targetUrl);
    router.push(targetUrl);
  };

  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (!staticData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">データの読み込みに失敗しました</p>
      </div>
    );
  }

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
          <Card 
            key={category.name}
            className="group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-primary/20 touch-friendly min-h-[100px]"
            onClick={() => handleCategorySelect(category.name)}
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
        ))}
      </div>
    </div>
  );
}

export default function StartLearningPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // ページ読み込み時にセッションストレージから学習モードを復元
  useEffect(() => {
    const savedMode = sessionStorage.getItem('selectedLearningMode');
    if (savedMode) {
      setSelectedMode(savedMode);
      console.log('セッションストレージから復元されたモード:', savedMode);
    }
  }, []);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    // 選択されたモードをセッションストレージに保存
    sessionStorage.setItem('selectedLearningMode', modeId);
    console.log('学習モードが選択されました:', modeId);
  };

  return (
    <AuthWrapper>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
          <LearningModeSection 
            onModeSelect={handleModeSelect}
            selectedMode={selectedMode}
          />
        </div>

        {/* カテゴリー選択 - 学習モードを考慮 */}
        <CategoriesSectionWithMode selectedMode={selectedMode} />
      </main>
    </AuthWrapper>
  );
} 