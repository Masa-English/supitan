'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  RotateCcw, 
  TrendingUp,
  Calendar,
  Brain,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';
import { AppStats, StudySession, ReviewSession } from '@/lib/types';

// 統計カードコンポーネント
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'amber' 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color?: string; 
}) {
  const colorClasses = {
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// セッション履歴コンポーネント
function SessionHistory({ sessions, type }: { sessions: (StudySession | ReviewSession)[]; type: 'study' | 'review' }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flashcard':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <Brain className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'flashcard':
        return 'フラッシュカード';
      case 'quiz':
        return 'クイズ';
      default:
        return '学習';
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          {type === 'study' ? <BookOpen className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          {type === 'study' ? '学習セッション履歴' : '復習セッション履歴'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {type === 'study' ? getModeIcon((session as StudySession).mode) : <RotateCcw className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {type === 'study' ? (session as StudySession).category : '復習セッション'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {type === 'study' ? getModeLabel((session as StudySession).mode) : '復習'} • {session.completed_words}語
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    {Math.round((session.correct_answers / session.total_words) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.created_at || new Date().toISOString())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            {type === 'study' ? 'まだ学習セッションがありません' : 'まだ復習セッションがありません'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [reviewSessions, setReviewSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = useMemo(() => new DatabaseService(), []);
  const supabase = createClient();

  // 統計データの読み込み
  const loadStatistics = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // 統計データを取得
      const [appStats, studySessionsData, reviewSessionsData] = await Promise.all([
        db.getAppStats(user.id),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
          .then(result => result.data || []),
        supabase
          .from('review_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
          .then(result => result.data || [])
      ]);

      setStats(appStats);
      setStudySessions(studySessionsData);
      setReviewSessions(reviewSessionsData);
    } catch (err) {
      console.error('Statistics page error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [db, supabase, user]);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [loadStatistics, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-amber-700 dark:text-amber-300">統計データを読み込み中...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadStatistics} className="bg-amber-600 hover:bg-amber-700">
              再試行
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">統計データを読み込めませんでした</p>
          </div>
        </main>
      </div>
    );
  }

  const progressPercentage = stats.total_words > 0 ? Math.round((stats.studied_words / stats.total_words) * 100) : 0;
  const masteryPercentage = stats.studied_words > 0 ? Math.round((stats.mastered_words / stats.studied_words) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <RefreshCw className="h-8 w-8 text-amber-600" />
              詳細学習統計
            </h1>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
            </span>
          </div>
        </div>

        {/* メイン統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総単語数"
            value={stats.total_words}
            subtitle="学習可能な単語"
            icon={BookOpen}
            color="amber"
          />
          <StatCard
            title="学習済み"
            value={stats.studied_words}
            subtitle={`${progressPercentage}% 完了`}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="習得済み"
            value={stats.mastered_words}
            subtitle={`${masteryPercentage}% 習得率`}
            icon={Trophy}
            color="green"
          />
          <StatCard
            title="学習時間"
            value={`${Math.round(stats.study_time_minutes / 60)}h`}
            subtitle={`${stats.study_time_minutes}分`}
            icon={Clock}
            color="purple"
          />
        </div>

        {/* 進捗バー */}
        <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="h-5 w-5" />
              学習進捗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  全体の学習進捗
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.studied_words} / {stats.total_words} ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-amber-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  習得進捗
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.mastered_words} / {stats.studied_words} ({masteryPercentage}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* セッション履歴 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SessionHistory sessions={studySessions} type="study" />
          <SessionHistory sessions={reviewSessions} type="review" />
        </div>

        {/* 追加統計情報 */}
        <div className="mt-8">
          <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Calendar className="h-5 w-5" />
                学習活動サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {studySessions.length}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    学習セッション数
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {reviewSessions.length}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    復習セッション数
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.review_count}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    復習待ち単語数
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(stats.study_time_minutes / Math.max(studySessions.length + reviewSessions.length, 1))}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    平均セッション時間（分）
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 