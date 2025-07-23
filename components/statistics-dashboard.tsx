'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface StatisticsProps {
  userId: string;
}

export function StatisticsDashboard({ userId }: StatisticsProps) {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [reviewSessions, setReviewSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  const db = useMemo(() => new DatabaseService(), []);
  const supabase = createClient();

  const getRecentStudySessions = useCallback(async (): Promise<StudySession[]> => {
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
    loadStatistics();
  }, [loadStatistics]);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-amber-700 dark:text-amber-300">統計データを読み込めませんでした</p>
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
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              総単語数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {stats.total_words}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              学習済み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {stats.studied_words}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {progressPercentage}% 完了
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              習得済み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {stats.mastered_words}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {masteryPercentage}% 習得率
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              学習時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {Math.round(stats.study_time_minutes / 60)}h
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              {stats.study_time_minutes}分
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200 dark:border-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              復習待ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {stats.review_count}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              単語
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 進捗バー */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <TrendingUp className="h-5 w-5" />
            学習進捗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  全体の学習進捗
                </span>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  {stats.studied_words} / {stats.total_words} ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  習得進捗
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  {stats.mastered_words} / {stats.studied_words} ({masteryPercentage}%)
                </span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近の学習セッション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Calendar className="h-5 w-5" />
              最近の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        {getModeIcon(session.mode)}
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          {session.category}
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          {getModeLabel(session.mode)} • {session.completed_words}語
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        {Math.round((session.correct_answers / session.total_words) * 100)}%
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-amber-600 dark:text-amber-400 text-center py-4">
                まだ学習セッションがありません
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <RotateCcw className="h-5 w-5" />
              最近の復習
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewSessions.length > 0 ? (
              <div className="space-y-3">
                {reviewSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          復習セッション
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {session.completed_words}語復習
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        {Math.round((session.correct_answers / session.total_words) * 100)}%
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-orange-600 dark:text-orange-400 text-center py-4">
                まだ復習セッションがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 