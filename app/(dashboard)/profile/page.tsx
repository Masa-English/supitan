import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/navigation/badge';
import { Button } from '@/components/ui/button/button';
import { dataProvider } from '@/lib/api/services/data-provider';
import { User, Calendar, Trophy, BookOpen, Target, TrendingUp, Clock, Award } from 'lucide-react';

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

async function getUserStats(userId: string) {
  try {
    const [userProgress, allWords] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords()
    ]);

    const totalWords = allWords.length;
    const studiedWords = userProgress.length;
    const masteredWords = userProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length;
    const categories = [...new Set(allWords.map(w => w.category))];
    const studiedCategories = [...new Set(userProgress.map(p => 
      allWords.find(w => w.id === p.word_id)?.category
    ).filter(Boolean))];

    return {
      totalWords,
      studiedWords,
      masteredWords,
      totalCategories: categories.length,
      studiedCategories: studiedCategories.length,
      completionRate: totalWords > 0 ? Math.round((studiedWords / totalWords) * 100) : 0,
      masteryRate: studiedWords > 0 ? Math.round((masteredWords / studiedWords) * 100) : 0,
      recentActivity: userProgress
        .sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
    };
  } catch (error) {
    console.error('統計データ取得エラー:', error);
    return {
      totalWords: 0,
      studiedWords: 0,
      masteredWords: 0,
      totalCategories: 0,
      studiedCategories: 0,
      completionRate: 0,
      masteryRate: 0,
      recentActivity: []
    };
  }
}

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  const stats = await getUserStats(user.id);

  const joinDate = new Date(user.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">プロフィール</h1>
          <p className="text-muted-foreground">学習の進捗と統計を確認できます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ユーザー情報 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  ユーザー情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">メールアドレス</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">登録日</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {joinDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">学習レベル</p>
                  <Badge variant={stats.masteryRate >= 80 ? 'default' : stats.masteryRate >= 50 ? 'secondary' : 'outline'}>
                    {stats.masteryRate >= 80 ? '上級者' : stats.masteryRate >= 50 ? '中級者' : '初心者'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 学習統計 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  学習統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground">{stats.studiedWords}</p>
                    <p className="text-sm text-muted-foreground">学習済み単語</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-foreground">{stats.masteredWords}</p>
                    <p className="text-sm text-muted-foreground">習得済み単語</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">完了率</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-foreground">{stats.masteryRate}%</p>
                    <p className="text-sm text-muted-foreground">習得率</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* カテゴリー進捗 */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">学習中のカテゴリー</p>
                    <p className="text-sm text-muted-foreground">現在進行中</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{stats.studiedCategories}</p>
                    <p className="text-sm text-muted-foreground">/ {stats.totalCategories}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">総単語数</p>
                    <p className="text-sm text-muted-foreground">データベース全体</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{stats.totalWords}</p>
                    <p className="text-sm text-muted-foreground">単語</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近の活動 */}
        {stats.recentActivity.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  最近の学習活動
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">単語学習</p>
                        <p className="text-sm text-muted-foreground">
                          習得レベル: {activity.mastery_level}/5
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {activity.updated_at ? new Date(activity.updated_at).toLocaleDateString('ja-JP') : '不明'}
                        </p>
                        <Badge variant={activity.mastery_level && activity.mastery_level >= 3 ? 'default' : 'secondary'}>
                          {activity.mastery_level && activity.mastery_level >= 3 ? '習得済み' : '学習中'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/learning">
            <Button>学習を続ける</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}