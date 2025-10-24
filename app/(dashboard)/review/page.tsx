import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/navigation/badge';
import { Button } from '@/components/ui/button/button';
import { Progress } from '@/components/ui/feedback/progress';
import { dataProvider } from '@/lib/api/services/data-provider';
import type { Word, UserProgress } from '@/lib/types/database';
import {
  RotateCcw,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap
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

    // 緊急度別分類（復習間隔の単語のみ）
    const urgentReview = intervalReviewWords.filter(p => {
      if (!p.last_studied) return false;
      const daysSinceReview = Math.floor((now.getTime() - new Date(p.last_studied).getTime()) / (1000 * 60 * 60 * 24));
      const masteryLevel = Math.floor((p.mastery_level || 0) * 5) + 1;
      const reviewInterval = {
        1: 1, 2: 3, 3: 7, 4: 14, 5: 30
      }[masteryLevel] || 1;
      return daysSinceReview >= reviewInterval * 2; // 予定の2倍経過
    });

    // 復習リストの単語数
    const reviewListWords = allReviewWords.filter(item => item.isFromReviewList);

    return {
      totalReviewWords: allReviewWords.length,
      urgentReviewWords: urgentReview.length,
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
      urgentReviewWords: 0,
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <RotateCcw className="w-8 h-8" />
            復習
          </h1>
          <p className="text-muted-foreground">
            学習した単語を復習して、記憶を定着させましょう
          </p>
        </div>

        {/* 復習概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">復習対象</p>
                  <p className="text-2xl font-bold text-foreground">{reviewData.totalReviewWords}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={reviewData.reviewPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  学習済みの {reviewData.reviewPercentage}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">復習リスト</p>
                  <p className="text-2xl font-bold text-foreground">{reviewData.reviewListWords}</p>
                </div>
                <RotateCcw className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  間違えた単語（復習間隔無関係）
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">緊急復習</p>
                  <p className="text-2xl font-bold text-foreground">{reviewData.urgentReviewWords}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  予定より大幅に遅れている単語
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">学習済み総数</p>
                  <p className="text-2xl font-bold text-foreground">{reviewData.totalStudiedWords}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  これまでに学習した単語数
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Link href="/statistics">
                  <Button variant="outline">学習統計を見る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 復習リストの単語がある場合の通知 */}
            {reviewData.reviewListWords > 0 && (
              <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="font-bold text-orange-900 dark:text-orange-100">
                        復習リストに単語があります
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {reviewData.reviewListWords}語が復習リストに追加されています。間違えた単語を復習して記憶を定着させましょう。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* カテゴリー別復習 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    カテゴリー別復習
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.reviewByCategory.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {category.count}/{category.totalInCategory}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <Link href={`/learning/${category.category}/review?mode=interval`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {category.category}を復習
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* アクションボタン */}
            <div className="flex flex-wrap gap-4 justify-center">
              {reviewData.reviewListWords > 0 && (
                <Link href="/review/review-list">
                  <Button size="lg" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                    <RotateCcw className="w-5 h-5" />
                    復習リストを復習
                  </Button>
                </Link>
              )}
              <Link href="/review/all">
                <Button size="lg" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  すべて復習開始
                </Button>
              </Link>
              {reviewData.urgentReviewWords > 0 && (
                <Link href="/review/urgent">
                  <Button variant="destructive" size="lg" className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    緊急復習開始
                  </Button>
                </Link>
              )}
              <Link href="/statistics">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  学習履歴を見る
                </Button>
              </Link>
            </div>

            {/* 復習のコツ */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    効果的な復習のコツ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">間隔反復</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        習得レベルに応じて復習間隔が自動調整されます。定期的な復習で長期記憶に定着させましょう。
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">優先順位</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        緊急復習の単語から始めて、忘却を防ぎましょう。レベルの低い単語ほど頻繁な復習が必要です。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}