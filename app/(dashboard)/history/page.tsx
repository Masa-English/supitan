import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Badge } from '@/components/ui/navigation/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { dataProvider } from '@/lib/api/services/data-provider';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  Award,
  BookOpen,
  Target,
  BarChart3
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

async function getLearningHistory(userId: string) {
  try {
    const [userProgress, allWords, categories] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords(),
      dataProvider.getCategories()
    ]);

    // 日別学習履歴（過去30日）
    const dailyHistory = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayProgress = userProgress.filter(p => {
        if (!p.updated_at) return false;
        const progressDate = new Date(p.updated_at);
        return progressDate >= date && progressDate < nextDate;
      });
      
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        count: dayProgress.length,
        masteredCount: dayProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length
      };
    }).reverse();

    // 週別統計（過去12週）
    const weeklyHistory = Array.from({ length: 12 }, (_, i) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const weekProgress = userProgress.filter(p => {
        if (!p.updated_at) return false;
        const progressDate = new Date(p.updated_at);
        return progressDate >= startDate && progressDate <= endDate;
      });
      
      return {
        week: `${startDate.getMonth() + 1}/${startDate.getDate()}`,
        count: weekProgress.length,
        masteredCount: weekProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length
      };
    }).reverse();

    // カテゴリー別進捗履歴
    const categoryHistory = categories.map(category => {
      const categoryWords = allWords.filter(w => w.category === category.category);
      const categoryProgress = userProgress.filter(p => 
        categoryWords.some(w => w.id === p.word_id)
      );
      
      // 習得レベル別分布
      const levelDistribution = [1, 2, 3, 4, 5].map(level => ({
        level,
        count: categoryProgress.filter(p => p.mastery_level === level).length
      }));
      
      return {
        category: category.category,
        totalWords: categoryWords.length,
        studiedWords: categoryProgress.length,
        masteredWords: categoryProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length,
        completionRate: categoryWords.length > 0 ? 
          Math.round((categoryProgress.length / categoryWords.length) * 100) : 0,
        masteryRate: categoryProgress.length > 0 ? 
          Math.round((categoryProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length / categoryProgress.length) * 100) : 0,
        levelDistribution,
        lastStudied: categoryProgress.length > 0 ? 
          Math.max(...categoryProgress.map(p => p.updated_at ? new Date(p.updated_at).getTime() : 0)) : null
      };
    }).filter(c => c.studiedWords > 0);

    // 学習マイルストーン
    const milestones = [
      { threshold: 10, label: '初心者', icon: '🌱' },
      { threshold: 50, label: '学習者', icon: '📚' },
      { threshold: 100, label: '継続者', icon: '🔥' },
      { threshold: 250, label: '努力家', icon: '💪' },
      { threshold: 500, label: '達人', icon: '🏆' },
      { threshold: 1000, label: 'マスター', icon: '👑' }
    ];

    const currentMilestone = milestones
      .filter(m => userProgress.length >= m.threshold)
      .pop() || milestones[0];

    const nextMilestone = milestones
      .find(m => userProgress.length < m.threshold);

    // 学習統計
    const stats = {
      totalStudied: userProgress.length,
      totalMastered: userProgress.filter(p => p.mastery_level && p.mastery_level >= 3).length,
      averageMastery: userProgress.length > 0 ? 
        Math.round((userProgress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / userProgress.length) * 10) / 10 : 0,
      studyStreak: calculateStudyStreak(userProgress),
      categoriesStarted: categoryHistory.length,
      categoriesCompleted: categoryHistory.filter(c => c.completionRate >= 80).length
    };

    return {
      dailyHistory,
      weeklyHistory,
      categoryHistory,
      currentMilestone,
      nextMilestone,
      stats
    };
  } catch (error) {
    console.error('学習履歴取得エラー:', error);
    return {
      dailyHistory: [],
      weeklyHistory: [],
      categoryHistory: [],
      currentMilestone: null,
      nextMilestone: null,
      stats: {
        totalStudied: 0,
        totalMastered: 0,
        averageMastery: 0,
        studyStreak: 0,
        categoriesStarted: 0,
        categoriesCompleted: 0
      }
    };
  }
}

function calculateStudyStreak(userProgress: Array<{ updated_at: string | null }>): number {
  if (userProgress.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const currentDate = new Date(today);
  
  while (true) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const hasStudyOnDate = userProgress.some(p => {
      if (!p.updated_at) return false;
      const progressDate = new Date(p.updated_at);
      progressDate.setHours(0, 0, 0, 0);
      return progressDate.getTime() === currentDate.getTime();
    });
    
    if (hasStudyOnDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    
    // 無限ループ防止
    if (streak > 365) break;
  }
  
  return streak;
}

export default async function HistoryPage() {
  const user = await getAuthenticatedUser();
  const history = await getLearningHistory(user.id);

  const maxDailyCount = Math.max(...history.dailyHistory.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <History className="w-8 h-8" />
            学習履歴
          </h1>
          <p className="text-muted-foreground">
            これまでの学習の軌跡と成長を確認できます
          </p>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">学習済み単語</p>
                  <p className="text-2xl font-bold text-foreground">{history.stats.totalStudied}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">習得済み単語</p>
                  <p className="text-2xl font-bold text-foreground">{history.stats.totalMastered}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">連続学習日数</p>
                  <p className="text-2xl font-bold text-foreground">{history.stats.studyStreak}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">平均習得レベル</p>
                  <p className="text-2xl font-bold text-foreground">{history.stats.averageMastery}</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* マイルストーン */}
        {history.currentMilestone && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                学習マイルストーン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{history.currentMilestone.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{history.currentMilestone.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {history.currentMilestone.threshold}語達成
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  現在のレベル
                </Badge>
              </div>
              
              {history.nextMilestone && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">次のマイルストーン: {history.nextMilestone.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {history.stats.totalStudied} / {history.nextMilestone.threshold}
                    </span>
                  </div>
                  <Progress 
                    value={(history.stats.totalStudied / history.nextMilestone.threshold) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    あと {history.nextMilestone.threshold - history.stats.totalStudied}語
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 日別学習履歴 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                日別学習履歴（過去30日）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.dailyHistory.slice(-14).map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">{day.displayDate}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 relative">
                      <div 
                        className="bg-primary rounded-full h-4 transition-all duration-300"
                        style={{ width: `${(day.count / maxDailyCount) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-20">
                      <span className="text-sm font-bold">{day.count}</span>
                      {day.masteredCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{day.masteredCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 週別統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                週別統計（過去12週）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.weeklyHistory.slice(-8).map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{week.week}週</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{week.count}語</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${Math.min((week.count / 50) * 100, 100)}%` }}
                        />
                      </div>
                      {week.masteredCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          習得{week.masteredCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カテゴリー別進捗 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              カテゴリー別学習履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.categoryHistory.map((category, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">{category.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {category.studiedWords}/{category.totalWords}
                      </Badge>
                      <Badge variant={category.completionRate >= 80 ? 'default' : 'secondary'}>
                        {category.completionRate}%
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress value={category.completionRate} className="h-2 mb-3" />
                  
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {category.levelDistribution.map((level, levelIndex) => (
                      <div key={levelIndex} className="text-center">
                        <div className="text-xs text-muted-foreground">L{level.level}</div>
                        <div className="text-sm font-bold">{level.count}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>習得率: {category.masteryRate}%</span>
                    {category.lastStudied && (
                      <span>
                        最終学習: {new Date(category.lastStudied).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}