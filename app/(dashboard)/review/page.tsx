import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { dataProvider } from '@/lib/api/services/data-provider';
import type { Word, UserProgress } from '@/lib/types/database';
import {
  RotateCcw,
  CheckCircle,
  Zap,
  BookOpen
} from 'lucide-react';

async function getAuthenticatedUser() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/auth/login');
    }
    
    return user;
  } catch (error) {
    console.error('認証確認エラー:', error);
    redirect('/auth/login');
  }
}

async function getReviewData(userId: string) {
  try {
    const [userProgress, allWords, categories, reviewWords] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords(),
      dataProvider.getCategories(),
      dataProvider.getReviewWords(userId) // 復習リストの単語を取得
    ]);

    // 復習間隔に基づく復習が必要な単語を特定
    const now = new Date();
    const intervalReviewWords = userProgress.filter(progress => {
      if (!progress.last_studied) return false;
      const lastReview = new Date(progress.last_studied);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      
      // 習得レベルに応じた復習間隔（mastery_levelは0-1の範囲）
      const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1; // 0-1を1-5に変換
      const reviewInterval = {
        1: 1,  // 1日
        2: 3,  // 3日
        3: 7,  // 1週間
        4: 14, // 2週間
        5: 30  // 1ヶ月
      }[masteryLevel] || 1;
      
      return daysSinceReview >= reviewInterval;
    });

    // 復習リストの単語と復習間隔の単語を結合（重複を除く）
    const reviewWordsSet = new Set<string>();
    const allReviewWords: Array<{
      word_id: string;
      word: Word;
      progress: UserProgress;
      isFromReviewList: boolean;
    }> = [];
    
    // 復習リストの単語を追加
    reviewWords.forEach(reviewWord => {
      const word = allWords.find(w => w.id === reviewWord.word_id);
      if (word && reviewWord.word_id) {
        reviewWordsSet.add(reviewWord.word_id);
        const progress = userProgress.find(p => p.word_id === reviewWord.word_id);
        allReviewWords.push({
          word_id: reviewWord.word_id,
          word: word,
          progress: progress || {
            id: '',
            user_id: null,
            word_id: reviewWord.word_id,
            mastery_level: 0,
            study_count: 0,
            correct_count: 0,
            incorrect_count: 0,
            last_studied: null,
            is_favorite: null,
            created_at: null,
            updated_at: null
          },
          isFromReviewList: true
        });
      }
    });
    
    // 復習間隔の単語を追加（重複を除く）
    intervalReviewWords.forEach(progress => {
      if (progress.word_id && !reviewWordsSet.has(progress.word_id)) {
        const word = allWords.find(w => w.id === progress.word_id);
        if (word) {
          allReviewWords.push({
            word_id: progress.word_id,
            word: word,
            progress: progress,
            isFromReviewList: false
          });
        }
      }
    });

    // 習得レベル別の復習単語
    const reviewByLevel = [1, 2, 3, 4, 5].map(level => {
      const wordsAtLevel = allReviewWords.filter(item => {
        if (!item.progress) return false;
        const masteryLevel = Math.floor((item.progress.mastery_level || 0) * 5) + 1;
        return masteryLevel === level;
      });
      return {
        level,
        count: wordsAtLevel.length,
        words: wordsAtLevel.map(item => ({
          ...item.word,
          progress: item.progress,
          isFromReviewList: item.isFromReviewList
        }))
      };
    });

    // カテゴリー別の復習単語
    const reviewByCategory = categories.map(category => {
      const categoryWords = allWords.filter(w => w.category === category.category);
      const categoryReviewWords = allReviewWords.filter(item => 
        categoryWords.some(w => w.id === item.word_id)
      );
      
      return {
        category: category.category,
        count: categoryReviewWords.length,
        totalInCategory: categoryWords.length,
        percentage: categoryWords.length > 0 ? 
          Math.round((categoryReviewWords.length / categoryWords.length) * 100) : 0
      };
    }).filter(c => c.count > 0);

    // 復習リストの単語数
    const reviewListWords = allReviewWords.filter(item => item.isFromReviewList);

    return {
      totalReviewWords: allReviewWords.length,
      reviewListWords: reviewListWords.length,
      reviewByLevel,
      reviewByCategory,
      totalStudiedWords: userProgress.length,
      reviewPercentage: userProgress.length > 0 ? 
        Math.round((allReviewWords.length / userProgress.length) * 100) : 0
    };
  } catch (error) {
    console.error('復習データ取得エラー:', error);
    return {
      totalReviewWords: 0,
      reviewListWords: 0,
      reviewByLevel: [],
      reviewByCategory: [],
      totalStudiedWords: 0,
      reviewPercentage: 0
    };
  }
}

export default async function ReviewPage() {
  const user = await getAuthenticatedUser();
  const reviewData = await getReviewData(user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <RotateCcw className="w-6 h-6" />
            復習
          </h1>
          <p className="text-sm text-muted-foreground">
            学習した単語を復習して、記憶を定着させましょう
          </p>
        </header>

        {reviewData.totalReviewWords === 0 && reviewData.reviewListWords === 0 ? (
          /* 復習対象がない場合 */
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                素晴らしい！復習対象の単語はありません
              </h3>
              <p className="text-muted-foreground mb-6">
                すべての単語が適切な間隔で復習されています。新しい単語を学習するか、より高いレベルを目指しましょう。
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/learning">
                  <Button>新しい単語を学習</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">ダッシュボードに戻る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 復習リストの単語がある場合の通知 */}
            {reviewData.reviewListWords > 0 && (
              <Card className="border border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">復習リストに単語があります</h3>
                      <p className="text-sm text-muted-foreground">
                        復習リストを確認して復習を始めましょう。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {/* カテゴリー別復習 */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <BookOpen className="w-4 h-4" />
                    カテゴリー別復習
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviewData.reviewByCategory.map((category, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg px-3 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                    >
                      <span className="font-medium text-foreground break-words">{category.category}</span>
                      <Link
                        className="w-full sm:w-auto"
                        href={`/learning/${category.category}/review?mode=interval`}
                      >
                        <Button variant="outline" size="sm" className="w-full sm:min-w-[140px]">
                          {category.category}を復習
                        </Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* アクションボタン */}
              <div className="grid grid-cols-1 gap-3">
                <Link className="w-full" href="/review/all">
                  <Button size="lg" className="w-full flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    すべて復習開始
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}