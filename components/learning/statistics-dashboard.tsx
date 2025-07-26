'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCardSkeleton, ProgressBarSkeleton, SessionHistorySkeleton } from '@/components/ui/skeleton';

import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  RotateCcw, 
  TrendingUp,
  Calendar,
  Brain,
  CheckCircle
} from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';
import { AppStats, StudySession, ReviewSession } from '@/lib/types';

export function StatisticsDashboard() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [reviewSessions, setReviewSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const db = useMemo(() => new DatabaseService(), []);
  const supabase = createClient();

  // ユーザーIDを取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase.auth]);

  const getRecentStudySessions = useCallback(async (): Promise<StudySession[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  }, [supabase, userId]);

  const getRecentReviewSessions = useCallback(async (): Promise<ReviewSession[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  }, [supabase, userId]);

  const loadStatistics = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [appStats, studySessions, reviewSessionsData] = await Promise.all([
        db.getAppStats(userId),
        getRecentStudySessions(),
        getRecentReviewSessions()
      ]);

      setStats(appStats);
      setRecentSessions(studySessions);
      setReviewSessions(reviewSessionsData);
    } catch (error) {
      console.error('統計データの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, db, getRecentStudySessions, getRecentReviewSessions]);

  useEffect(() => {
    if (userId) {
      loadStatistics();
    }
  }, [loadStatistics, userId]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!isClient) {
      // サーバーサイドでは固定フォーマットを使用
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${month}/${day} ${hour}:${minute}`;
    }
    
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

  if (loading || !userId) {
    return (
      <div className="space-y-6">
        {/* メイン統計カードのスケルトン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* 進捗バーのスケルトン */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" />
              学習進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBarSkeleton />
          </CardContent>
        </Card>

        {/* セッション履歴のスケルトン */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                最近の学習
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionHistorySkeleton />
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <RotateCcw className="h-5 w-5" />
                最近の復習
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionHistorySkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">統計データを読み込めませんでした</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = stats.total_words > 0 ? Math.round((stats.studied_words / stats.total_words) * 100) : 0;
  const masteryPercentage = stats.studied_words > 0 ? Math.round((stats.mastered_words / stats.studied_words) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* メイン統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              総単語数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.total_words}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Target className="h-4 w-4" />
              学習済み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.studied_words}
            </div>
            <div className="text-xs text-muted-foreground">
              {progressPercentage}% 完了
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              習得済み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.mastered_words}
            </div>
            <div className="text-xs text-muted-foreground">
              {masteryPercentage}% 習得率
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Clock className="h-4 w-4" />
              学習時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round(stats.study_time_minutes / 60)}h
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.study_time_minutes}分
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              復習待ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.review_count}
            </div>
            <div className="text-xs text-muted-foreground">
              単語
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 進捗バー */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            学習進捗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                  className="bg-primary h-3 rounded-full transition-all duration-500"
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
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近の学習セッション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5" />
              最近の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getModeIcon(session.mode)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getModeLabel(session.mode)} • {session.completed_words}語
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
                まだ学習セッションがありません
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <RotateCcw className="h-5 w-5" />
              最近の復習
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewSessions.length > 0 ? (
              <div className="space-y-3">
                {reviewSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          復習セッション
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.completed_words}語復習
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
                まだ復習セッションがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 