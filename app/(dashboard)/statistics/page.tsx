import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/navigation/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { dataProvider } from '@/lib/api/services/data-provider';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  BookOpen, 
  Award,
  Zap,
  Brain,
  CheckCircle
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

async function getDetailedStats(userId: string) {
  try {
    const [userProgress, allWords, categories] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords(),
      dataProvider.getCategories()
    ]);

    // カテゴリー別統計
    const categoryStats = categories.map(category => {
      const categoryWords = allWords.filter(w => w.category === category.category);
      const studiedInCategory = userProgress.filter(p => 
        categoryWords.some(w => w.id === p.word_id)
      );
      const masteredInCategory = studiedInCategory.filter(p => p.mastery_level && p.mastery_level >= 3);
      
      return {
        name: category.category,
        total: categoryWords.length,
        studied: studiedInCategory.length,
        mastered: masteredInCategory.length,
        completionRate: categoryWords.length > 0 ? Math.round((studiedInCategory.length / categoryWords.length) * 100) : 0,
        masteryRate: studiedInCategory.length > 0 ? Math.round((masteredInCategory.length / studiedInCategory.length) * 100) : 0
      };
    });

    // 習得レベル別統計
    const masteryLevelStats = [1, 2, 3, 4, 5].map(level => ({
      level,
      count: userProgress.filter(p => p.mastery_level === level).length,
      percentage: userProgress.length > 0 ? Math.round((userProgress.filter(p => p.mastery_level === level).length / userProgress.length) * 100) : 0
    }));

    // 学習傾向分析
    const recentProgress = userProgress
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 30);

    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayProgress = recentProgress.filter(p => {
        if (!p.updated_at) return false;
        const progressDate = new Date(p.updated_at);
        return progressDate.toDateString() === date.toDateString();
      });
      return {
        day: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        count: dayProgress.length
      };
    }).reverse();

    return {
      categoryStats,
      masteryLevelStats,
      weeklyProgress,
      totalWords: allWords.length,
      studiedWords: userProgress.length,
      masteredWords: userProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length,
      averageMastery: userProgress.length > 0 ? 
        Math.round((userProgress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / userProgress.length) * 10) / 10 : 0
    };
  } catch (error) {
    console.error('詳細統計取得エラー:', error);
    return {
      categoryStats: [],
      masteryLevelStats: [],
      weeklyProgress: [],
      totalWords: 0,
      studiedWords: 0,
      masteredWords: 0,
      averageMastery: 0
    };
  }
}

export default async function StatisticsPage() {
  const user = await getAuthenticatedUser();
  const stats = await getDetailedStats(user.id);

  const completionRate = stats.totalWords > 0 ? Math.round((stats.studiedWords / stats.totalWords) * 100) : 0;
  const masteryRate = stats.studiedWords > 0 ? Math.round((stats.masteredWords / stats.studiedWords) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            学習統計
          </h1>
          <p className="text-muted-foreground">詳細な学習進捗と分析データを確認できます</p>
        </div>

        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">学習済み単語</p>
                  <p className="text-2xl font-bold text-foreground">{stats.studiedWords}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">全体の {completionRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">習得済み単語</p>
                  <p className="text-2xl font-bold text-foreground">{stats.masteredWords}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Progress value={masteryRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">学習済みの {masteryRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">平均習得レベル</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageMastery}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress value={(stats.averageMastery / 5) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">最大 5.0</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">総単語数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalWords}</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">データベース全体</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* カテゴリー別進捗 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                カテゴリー別進捗
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoryStats.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {category.studied}/{category.total}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {category.completionRate}%
                        </span>
                      </div>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>習得済み: {category.mastered}</span>
                      <span>習得率: {category.masteryRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 習得レベル分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                習得レベル分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.masteryLevelStats.map((level, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">レベル {level.level}</span>
                        {level.level >= 3 && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{level.count}語</span>
                        <span className="text-sm text-muted-foreground">
                          {level.percentage}%
                        </span>
                      </div>
                    </div>
                    <Progress value={level.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 週間学習活動 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              週間学習活動
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {stats.weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{day.day}</p>
                  <div className="bg-muted rounded-lg p-4 h-20 flex items-center justify-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{day.count}</p>
                      <p className="text-xs text-muted-foreground">単語</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 学習のヒント */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                学習のヒント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">継続的な学習</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    毎日少しずつでも学習を続けることで、長期記憶に定着しやすくなります。
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">復習の重要性</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    習得レベル3以上の単語も定期的に復習することで、忘却を防げます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}