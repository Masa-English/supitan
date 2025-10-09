'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CategoryWithStats } from '@/lib/types';
import { CategoryCardSkeleton } from '@/components/ui/feedback';

interface Props {
  categories: CategoryWithStats[];
}

export default function CategoriesClient({ categories }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewListMode, setIsReviewListMode] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsReviewMode(mode === 'review');
    setIsReviewListMode(mode === 'review-list');
  }, [searchParams]);

  const handleCategorySelect = async (category: string) => {
    setLoading(true);
    try {
      if (isReviewMode) {
        // 復習モードの場合は直接クイズモードで開始
        router.push(`/learning/${encodeURIComponent(category)}/quiz?mode=review`);
      } else if (isReviewListMode) {
        // 復習リストモードの場合は直接クイズモードで開始
        router.push(`/learning/${encodeURIComponent(category)}/quiz?mode=review-list`);
      } else {
        // 通常の学習モード選択ページに遷移
        router.push(`/learning/${encodeURIComponent(category)}/options?mode=flashcard`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {isReviewMode ? '復習カテゴリー選択' : isReviewListMode ? '復習リストカテゴリー選択' : 'カテゴリー選択'}
              </h1>
              <p className="text-muted-foreground">
                {isReviewMode ? '復習したいカテゴリーを選択してください' : 
                 isReviewListMode ? '復習リストの単語があるカテゴリーを選択してください' : 
                 '学習したいカテゴリーを選択してください'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isReviewMode ? '復習カテゴリー選択' : isReviewListMode ? '復習リストカテゴリー選択' : 'カテゴリー選択'}
            </h1>
            <p className="text-muted-foreground">
              {isReviewMode 
                ? '復習したいカテゴリーを選択してください' 
                : isReviewListMode
                ? '復習リストの単語があるカテゴリーを選択してください'
                : '学習したいカテゴリーを選択してください'
              }
            </p>
          </div>
          
          {categories.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                利用可能なカテゴリーがありません。
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Card
                  key={category.category}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-border bg-card"
                  onClick={() => handleCategorySelect(category.category)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {category.count}個
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {category.category}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {category.englishName}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                      {category.pos}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}