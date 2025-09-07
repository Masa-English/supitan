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
import { 
  RotateCcw, 
  Clock, 
  Target, 
  BookOpen,
  Brain,
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
    const [userProgress, allWords, categories] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords(),
      dataProvider.getCategories()
    ]);

    // 復習が必要な単語を特定
    const now = new Date();
    const reviewWords = userProgress.filter(progress => {
      if (!progress.updated_at) return false;
      const lastReview = new Date(progress.updated_at);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      
      // 習得レベルに応じた復習間隔
      const reviewInterval = {
        1: 1,  // 1日
        2: 3,  // 3日
        3: 7,  // 1週間
        4: 14, // 2週間
        5: 30  // 1ヶ月
      }[progress.mastery_level || 1] || 1;
      
      return daysSinceReview >= reviewInterval;
    });

    // 習得レベル別の復習単語
    const reviewByLevel = [1, 2, 3, 4, 5].map(level => {
      const wordsAtLevel = reviewWords.filter(p => p.mastery_level === level);
      return {
        level,
        count: wordsAtLevel.length,
        words: wordsAtLevel.map(p => {
          const word = allWords.find(w => w.id === p.word_id);
          return word ? { ...word, progress: p } : null;
        }).filter(Boolean)
      };
    });

    // カテゴリー別の復習単語
    const reviewByCategory = categories.map(category => {
      const categoryWords = allWords.filter(w => w.category === category.category);
      const categoryReviewWords = reviewWords.filter(p => 
        categoryWords.some(w => w.id === p.word_id)
      );
      
      return {
        category: category.category,
        count: categoryReviewWords.length,
        totalInCategory: categoryWords.length,
        percentage: categoryWords.length > 0 ? 
          Math.round((categoryReviewWords.length / categoryWords.length) * 100) : 0
      };
    }).filter(c => c.count > 0);

    // 緊急度別分類
    const urgentReview = reviewWords.filter(p => {
      if (!p.updated_at) return false;
      const daysSinceReview = Math.floor((now.getTime() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const reviewInterval = {
        1: 1, 2: 3, 3: 7, 4: 14, 5: 30
      }[p.mastery_level || 1] || 1;
      return daysSinceReview >= reviewInterval * 2; // 予定の2倍経過
    });

    return {
      totalReviewWords: reviewWords.length,
      urgentReviewWords: urgentReview.length,
      reviewByLevel,
      reviewByCategory,
      totalStudiedWords: userProgress.length,
      reviewPercentage: userProgress.length > 0 ? 
        Math.round((reviewWords.length / userProgress.length) * 100) : 0
    };
  } catch (error) {
    console.error('復習データ取得エラー:', error);
    return {
      totalReviewWords: 0,
      urgentReviewWords: 0,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {reviewData.totalReviewWords === 0 ? (
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
            {/* 緊急復習がある場合の警告 */}
            {reviewData.urgentReviewWords > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-bold text-red-900 dark:text-red-100">
                        緊急復習が必要です
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {reviewData.urgentReviewWords}語が予定より大幅に遅れています。忘却を防ぐため、優先的に復習しましょう。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 習得レベル別復習 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    習得レベル別復習
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.reviewByLevel.map((level, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">レベル {level.level}</span>
                            {level.level >= 3 && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                          <Badge variant={level.count > 0 ? 'default' : 'secondary'}>
                            {level.count}語
                          </Badge>
                        </div>
                        {level.count > 0 && (
                          <Link href={`/learning?reviewLevel=${level.level}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                            >
                              レベル{level.level}を復習
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                        <Link href={`/learning/${encodeURIComponent(category.category)}?mode=review`}>
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
              <Link href="/learning?mode=review">
                <Button size="lg" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  すべて復習開始
                </Button>
              </Link>
              {reviewData.urgentReviewWords > 0 && (
                <Link href="/learning?mode=urgent-review">
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